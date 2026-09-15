import { createFileRoute } from "@tanstack/react-router";

// SSLCommerz server-to-server notification. Nothing posted here is trusted:
// the transaction is re-checked against SSLCommerz's validation API before
// any credits are granted.
export const Route = createFileRoute("/api/public/sslcommerz/ipn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { readCallbackFields, validateAndCredit } = await import(
          "@/lib/sslcommerz.server"
        );
        const fields = await readCallbackFields(request);
        const tranId = fields.get("tran_id");
        const valId = fields.get("val_id");
        if (!tranId || !valId) return new Response("missing fields", { status: 400 });

        try {
          const result = await validateAndCredit(tranId, valId);
          return new Response(result.ok ? "ok" : "rejected", {
            status: result.ok ? 200 : 400,
          });
        } catch (err) {
          console.error("sslcommerz ipn failed", err);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});
