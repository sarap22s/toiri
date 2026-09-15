import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/credits")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isValidDeviceId, getBalance } = await import("@/lib/credits.server");
        const body = (await request.json().catch(() => ({}))) as { deviceId?: string };
        if (!isValidDeviceId(body.deviceId)) {
          return Response.json({ error: "Invalid device id" }, { status: 400 });
        }
        try {
          const credits = await getBalance(body.deviceId);
          return Response.json({ credits });
        } catch (err) {
          console.error("credits lookup failed", err);
          return Response.json({ error: "Could not load credits" }, { status: 500 });
        }
      },
    },
  },
});
