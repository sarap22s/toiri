import { createFileRoute } from "@tanstack/react-router";

type Incoming = { url?: string };

const CODE_EXT = /\.(jsx?|tsx?|css|html|json|md|txt)$/i;
const SKIP_DIR =
  /(^|\/)(node_modules|dist|build|\.next|\.git|coverage|vendor|public\/assets)(\/|$)/i;

const MAX_FILES = 40;
const MAX_FILE_BYTES = 80_000;
const MAX_TOTAL_BYTES = 400_000;

/** Accepts github.com/owner/repo, with optional /tree/branch or .git suffix. */
function parseRepo(raw: string): { owner: string; repo: string; ref?: string } | null {
  const cleaned = raw.trim().replace(/\.git$/, "");
  const m = cleaned.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)(?:\/tree\/([\w.\-/]+))?\/?$/i,
  );
  if (m && m[1] && m[2]) {
    const out: { owner: string; repo: string; ref?: string } = {
      owner: m[1],
      repo: m[2],
    };
    if (m[3]) out.ref = m[3];
    return out;
  }
  const short = cleaned.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (short && short[1] && short[2]) return { owner: short[1], repo: short[2] };
  return null;
}

const gh = (path: string) =>
  fetch(`https://api.github.com${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "toiri-import",
    },
  });

export const Route = createFileRoute("/api/github-import")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Incoming;
        const parsed = parseRepo(String(body.url ?? ""));
        if (!parsed) {
          return Response.json(
            { error: "That does not look like a GitHub repository link." },
            { status: 400 },
          );
        }
        const { owner, repo } = parsed;

        try {
          let ref = parsed.ref;
          if (!ref) {
            const info = await gh(`/repos/${owner}/${repo}`);
            if (info.status === 404) {
              return Response.json(
                { error: "Repository not found. Only public repositories work." },
                { status: 404 },
              );
            }
            if (info.status === 403) {
              return Response.json(
                { error: "GitHub is rate limiting us right now. Try again in a while." },
                { status: 429 },
              );
            }
            if (!info.ok) throw new Error(`repo lookup ${info.status}`);
            const meta = (await info.json()) as { default_branch?: string };
            ref = meta.default_branch || "main";
          }

          const treeRes = await gh(
            `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
          );
          if (treeRes.status === 403) {
            return Response.json(
              { error: "GitHub is rate limiting us right now. Try again in a while." },
              { status: 429 },
            );
          }
          if (!treeRes.ok) {
            return Response.json(
              { error: "Could not read that repository or branch." },
              { status: 404 },
            );
          }
          const tree = (await treeRes.json()) as {
            tree?: { path: string; type: string; size?: number }[];
          };

          const candidates = (tree.tree ?? [])
            .filter(
              (n) =>
                n.type === "blob" &&
                CODE_EXT.test(n.path) &&
                !SKIP_DIR.test(n.path) &&
                (n.size ?? 0) <= MAX_FILE_BYTES,
            )
            // Source files first, then shallow paths.
            .sort((a, b) => {
              const score = (p: string) => (/^(src|app|components|lib)\//i.test(p) ? 0 : 1);
              return score(a.path) - score(b.path) || a.path.length - b.path.length;
            })
            .slice(0, MAX_FILES);

          const files: { path: string; content: string }[] = [];
          let total = 0;
          for (const node of candidates) {
            const raw = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${node.path}`,
              { headers: { "user-agent": "toiri-import" } },
            );
            if (!raw.ok) continue;
            const text = await raw.text();
            if (text.length > MAX_FILE_BYTES) continue;
            if (total + text.length > MAX_TOTAL_BYTES) break;
            total += text.length;
            files.push({ path: `/${node.path}`, content: text });
          }

          if (!files.length) {
            return Response.json(
              { error: "No readable code files were found in that repository." },
              { status: 422 },
            );
          }

          return Response.json({
            repo: `${owner}/${repo}`,
            ref,
            files,
            truncated: (tree.tree ?? []).length > candidates.length,
          });
        } catch (err) {
          console.error("github import failed", err);
          return Response.json(
            { error: "Could not import that repository. Try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});
