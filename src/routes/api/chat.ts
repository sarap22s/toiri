import { createFileRoute } from "@tanstack/react-router";
import { generateText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, SYSTEM_PROMPT } from "@/lib/ai-gateway.server";

type Incoming = { messages?: { role: "user" | "assistant"; content: string }[] };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Incoming;
        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return Response.json({ error: "Messages are required" }, { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "AI is not configured" }, { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = await generateText({
            model: gateway("google/gemini-3.8-flash"),
            system: SYSTEM_PROMPT,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            stopWhen: stepCountIs(2),
            tools: {
              write_file: tool({
                description:
                  "Write the complete contents of a file in the live preview sandbox. Use /App.js for the app entry.",
                inputSchema: z.object({
                  path: z.string(),
                  content: z.string(),
                }),
              }),
            },
          });

          const fileWrites = result.toolCalls
            .filter((c) => c.toolName === "write_file")
            .map((c) => c.input as { path: string; content: string })
            .filter((i) => typeof i?.path === "string" && typeof i?.content === "string");

          return Response.json({ text: result.text, fileWrites });
        } catch (err) {
          const e = err as { statusCode?: number; message?: string };
          const status = e?.statusCode ?? 500;
          const message =
            status === 429
              ? "Too many requests right now — please try again in a moment."
              : status === 402
                ? "The workspace is out of AI credits."
                : e?.message || "AI request failed";
          return Response.json({ error: message }, { status: status >= 400 ? status : 500 });
        }
      },
    },
  },
});
