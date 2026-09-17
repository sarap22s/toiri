import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const FREE_CREDITS = 10;

/** How many brand-new free-credit devices one network may create per day. */
export const NEW_DEVICES_PER_IP_PER_DAY = 5;

/** Thrown when a network has already claimed its daily free-credit allowance. */
export class FreeCreditLimitError extends Error {
  constructor() {
    super("Free credits for this network have been used up for today.");
    this.name = "FreeCreditLimitError";
  }
}

/** Device ids come from the browser; keep them to a safe, bounded shape. */
export function isValidDeviceId(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(id);
}

/** Stable, non-reversible key for the caller's network. */
export function clientIpHash(request: Request): string {
  const header =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return createHash("sha256").update(header.trim()).digest("hex").slice(0, 32);
}

/** Balance for a device, seeding the free-credit allowance on first sight. */
export async function getBalance(
  deviceId: string,
  options?: { ipHash?: string; allowSeed?: boolean },
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("credit_balances")
    .select("credits")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return data.credits;

  // Unknown device: only hand out free credits when this network still has
  // room in its daily allowance, so nobody can mint endless identities.
  if (options?.allowSeed === false) return 0;
  if (options?.ipHash) {
    const { data: allowed, error: claimError } = await supabaseAdmin.rpc(
      "claim_new_device",
      { _ip_hash: options.ipHash, _limit: NEW_DEVICES_PER_IP_PER_DAY },
    );
    if (claimError) throw new Error(claimError.message);
    if (allowed === false) throw new FreeCreditLimitError();
  }

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
