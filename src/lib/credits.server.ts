import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const FREE_CREDITS = 10;

/** Device ids come from the browser; keep them to a safe, bounded shape. */
export function isValidDeviceId(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(id);
}

/** Balance for a device, seeding the free-credit allowance on first sight. */
export async function getBalance(deviceId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("credit_balances")
    .select("credits")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return data.credits;

  const { data: created, error: insertError } = await supabaseAdmin
    .from("credit_balances")
    .insert({ device_id: deviceId, credits: FREE_CREDITS })
    .select("credits")
    .single();

  if (insertError) {
    // Another request may have seeded it first.
    const { data: again } = await supabaseAdmin
      .from("credit_balances")
      .select("credits")
      .eq("device_id", deviceId)
      .maybeSingle();
    return again?.credits ?? FREE_CREDITS;
  }
  return created.credits;
}

/** Spend one credit. Returns null when the device has none left. */
export async function spendCredit(deviceId: string): Promise<number | null> {
  const balance = await getBalance(deviceId);
  if (balance <= 0) return null;
  const { data, error } = await supabaseAdmin.rpc("add_credits", {
    _device_id: deviceId,
    _amount: -1,
  });
  if (error) throw new Error(error.message);
  return data as number;
}

export async function addCredits(deviceId: string, amount: number): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("add_credits", {
    _device_id: deviceId,
    _amount: amount,
  });
  if (error) throw new Error(error.message);
  return data as number;
}
