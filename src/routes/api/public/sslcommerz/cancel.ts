import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const origin = new URL(request.url).origin;
  const { readCallbackFields } = await import("@/lib/sslcommerz.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const fields = await readCallbackFields(request);
  const tranId = fields.get("tran_id");
  if (tranId) {
    await supabaseAdmin
      .from("credit_orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("tran_id", tranId)
      .eq("status", "pending");
  }
  return Response.redirect(`${origin}/?payment=cancelled`, 303);
}

export const Route = createFileRoute("/api/public/sslcommerz/cancel")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});
