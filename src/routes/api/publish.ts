import { createFileRoute } from "@tanstack/react-router";

type Incoming = { deviceId?: string; code?: string; title?: string; slug?: string };

const randomSlug = () =>
  Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);

export const Route = createFileRoute("/api/publish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isValidDeviceId } = await import("@/lib/credits.server");
        const body = (await request.json()) as Incoming;

        if (!isValidDeviceId(body.deviceId)) {
          return Response.json({ error: "Invalid device id" }, { status: 400 });
        }
        const code = typeof body.code === "string" ? body.code : "";
        if (code.trim().length < 20 || code.length > 200_000) {
          return Response.json({ error: "Nothing to publish yet." }, { status: 400 });
        }
        const title = (body.title || "Toiri app").toString().slice(0, 80);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Republishing an existing link keeps the same address.
        const existing =
          typeof body.slug === "string" && /^[a-z0-9]{6,16}$/.test(body.slug)
            ? body.slug
            : null;

        if (existing) {
          const { data, error } = await supabaseAdmin
            .from("published_apps")
            .update({ code, title, updated_at: new Date().toISOString() })
            .eq("slug", existing)
            .eq("device_id", body.deviceId)
            .select("slug")
            .maybeSingle();
          if (error) return Response.json({ error: error.message }, { status: 500 });
          if (data) return Response.json({ slug: data.slug });
        }

        for (let attempt = 0; attempt < 5; attempt++) {
          const slug = randomSlug();
          const { error } = await supabaseAdmin
            .from("published_apps")
            .insert({ slug, device_id: body.deviceId, code, title });
          if (!error) return Response.json({ slug });
          if (!error.message.includes("duplicate")) {
            return Response.json({ error: error.message }, { status: 500 });
          }
        }
        return Response.json({ error: "Could not publish. Try again." }, { status: 500 });
      },
    },
  },
});
