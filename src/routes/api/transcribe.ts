import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 12_000_000;

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "Voice is not configured" }, { status: 500 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Invalid upload" }, { status: 400 });
        }

        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0) {
          return Response.json({ error: "No audio received" }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
          return Response.json({ error: "Recording is too long" }, { status: 413 });
        }

        const upstream = new FormData();
        upstream.append("model", "google/gemini-3.5-transcribe");
        upstream.append("file", file, "recording.wav");

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.error("transcription failed", res.status, detail);
          const message =
            res.status === 429
              ? "Too many requests right now — please try again in a moment."
              : res.status === 402
                ? "The workspace is out of AI credits."
                : "Could not transcribe that recording.";
          return Response.json({ error: message }, { status: res.status });
        }

        const data = (await res.json().catch(() => ({}))) as { text?: string };
        return Response.json({ text: (data.text ?? "").trim() });
      },
    },
  },
});
