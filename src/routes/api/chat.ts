import { createFileRoute } from "@tanstack/react-router";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, SYSTEM_PROMPT } from "@/lib/ai-gateway.server";

type Incoming = {
  messages?: { role: "user" | "assistant"; content: string }[];
  deviceId?: string;
};

const encoder = new TextEncoder();
const line = (obj: unknown) => encoder.encode(`${JSON.stringify(obj)}\n`);

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isValidDeviceId, getBalance, spendCredit } = await import(
          "@/lib/credits.server"
        );
        const body = (await request.json()) as Incoming;
        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return Response.json({ error: "Messages are required" }, { status: 400 });
        }
        if (!isValidDeviceId(body.deviceId)) {
          return Response.json({ error: "Invalid device id" }, { status: 400 });
        }
        const deviceId = body.deviceId;

        // The balance lives server-side, so the browser can never grant itself credits.
        const balance = await getBalance(deviceId);
        if (balance <= 0) {
          return Response.json(
            { error: "You are out of credits.", credits: 0 },
            { status: 402 },
          );
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "AI is not configured" }, { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              const result = streamText({
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

              for await (const delta of result.textStream) {
                controller.enqueue(line({ type: "text", delta }));
              }

              const toolCalls = await result.toolCalls;
              const fileWrites = toolCalls
                .filter((c) => c.toolName === "write_file")
                .map((c) => c.input as { path: string; content: string })
                .filter(
                  (i) => typeof i?.path === "string" && typeof i?.content === "string",
                );

              // Charge only after a successful generation.
              const remaining = await spendCredit(deviceId);
              controller.enqueue(
                line({ type: "done", fileWrites, credits: remaining ?? 0 }),
              );
            } catch (err) {
              const e = err as { statusCode?: number; message?: string };
              const status = e?.statusCode ?? 500;
              const message =
                status === 429
                  ? "Too many requests right now — please try again in a moment."
                  : status === 402
                    ? "The workspace is out of AI credits."
                    : e?.message || "AI request failed";
              controller.enqueue(line({ type: "error", error: message, status }));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "application/x-ndjson; charset=utf-8",
            "cache-control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});
