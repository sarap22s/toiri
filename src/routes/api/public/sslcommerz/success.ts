import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const { readCallbackFields, validateAndCredit } = await import(
    "@/lib/sslcommerz.server"
  );
  const origin = new URL(request.url).origin;
  const fields = await readCallbackFields(request);
  const tranId = fields.get("tran_id");
  const valId = fields.get("val_id");

  if (!tranId || !valId) {
    return Response.redirect(`${origin}/?payment=failed`, 303);
  }

  try {
    const result = await validateAndCredit(tranId, valId);
    return Response.redirect(
      `${origin}/?payment=${result.ok ? "success" : "failed"}`,
      303,
    );
  } catch (err) {
    console.error("sslcommerz success callback failed", err);
    return Response.redirect(`${origin}/?payment=failed`, 303);
  }
}

export const Route = createFileRoute("/api/public/sslcommerz/success")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});
