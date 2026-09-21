import JSZip from "jszip";

/** Builds a ready-to-deploy Vite + React project from the in-browser files. */
export async function downloadProjectZip(
  files: Record<string, string>,
  name = "toiri-app",
) {
  const zip = new JSZip();

  for (const [path, content] of Object.entries(files)) {
    const clean = path.replace(/^\/+/, "");
    zip.file(`src/${clean}`, content);
  }

  const entry = Object.keys(files).find((p) => /App\.(jsx?|tsx?)$/i.test(p)) ?? "/App.js";
  const entryImport = `./${entry.replace(/^\/+/, "").replace(/\.(jsx?|tsx?)$/i, "")}`;

  zip.file(
    "package.json",
    JSON.stringify(
      {
        name,
        private: true,
        type: "module",
        scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
        dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
        devDependencies: { "@vitejs/plugin-react": "^4.3.1", vite: "^5.4.0" },
      },
      null,
      2,
    ),
  );

  zip.file(
    "vite.config.js",
    `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({ plugins: [react()] });\n`,
  );

  zip.file(
    "index.html",
    `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${name}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`,
  );

  zip.file(
    "src/main.jsx",
    `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "${entryImport}";\n\ncreateRoot(document.getElementById("root")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);\n`,
  );

  zip.file("public/_redirects", "/*    /index.html   200\n");
  zip.file(
    "netlify.toml",
    `[build]\n  command = "npm run build"\n  publish = "dist"\n`,
  );
  zip.file(
    "README.md",
    `# ${name}\n\nBuilt with Toiri.\n\n## Run locally\n\n    npm install\n    npm run dev\n\n## Deploy\n\n- **Netlify Drop** — run \`npm install && npm run build\`, then drag the \`dist\` folder to https://app.netlify.com/drop\n- **Vercel** — push this folder to GitHub, then import it at https://vercel.com/new\n- **Cloudflare Pages** — push to GitHub, then create a Pages project with build command \`npm run build\` and output directory \`dist\`\n`,
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
