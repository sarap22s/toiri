import { createFileRoute } from "@tanstack/react-router";
import { findPack } from "@/lib/packs";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isValidDeviceId } = await import("@/lib/credits.server");
        const { initSession } = await import("@/lib/sslcommerz.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const body = (await request.json().catch(() => ({}))) as {
          deviceId?: string;
          packId?: string;
          phone?: string;
        };

        if (!isValidDeviceId(body.deviceId)) {
          return Response.json({ error: "Invalid device id" }, { status: 400 });
        }
        const pack = findPack(String(body.packId ?? ""));
        if (!pack) {
          return Response.json({ error: "Unknown pack" }, { status: 400 });
        }

        const phone = String(body.phone ?? "").replace(/[^0-9+]/g, "").slice(0, 20);
        const tranId = `toiri-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        try {
          const { error } = await supabaseAdmin.from("credit_orders").insert({
            tran_id: tranId,
            device_id: body.deviceId,
            pack_id: pack.id,
            credits: pack.credits,
            amount_bdt: pack.amountBDT,
            status: "pending",
          });
          if (error) throw new Error(error.message);

          const origin = new URL(request.url).origin;
          const gatewayUrl = await initSession({
            tranId,
            amount: pack.amountBDT,
            productName: `Toiri ${pack.name} — ${pack.credits} credits`,
            origin,
            customerPhone: phone,
          });

          return Response.json({ gatewayUrl, tranId });
        } catch (err) {
          console.error("checkout failed", err);
          const message =
            err instanceof Error ? err.message : "Could not start the payment.";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
