import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { addCredits } from "./credits.server";

const INIT_URL = "https://securepay.sslcommerz.com/gwprocess/v4/api.php";
const VALIDATION_URL =
  "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";

export function getStoreCredentials() {
  const storeId = process.env["SSLCOMMERZ_STORE_ID"];
  const storePassword = process.env["SSLCOMMERZ_STORE_PASSWORD"];
  if (!storeId || !storePassword) {
    throw new Error("Payments are not configured yet.");
  }
  return { storeId, storePassword };
}

export async function initSession(params: {
  tranId: string;
  amount: number;
  productName: string;
  origin: string;
  customerPhone: string;
}): Promise<string> {
  const { storeId, storePassword } = getStoreCredentials();
  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: params.amount.toFixed(2),
    currency: "BDT",
    tran_id: params.tranId,
    success_url: `${params.origin}/api/public/sslcommerz/success`,
    fail_url: `${params.origin}/api/public/sslcommerz/fail`,
    cancel_url: `${params.origin}/api/public/sslcommerz/cancel`,
    ipn_url: `${params.origin}/api/public/sslcommerz/ipn`,
    shipping_method: "NO",
    product_name: params.productName,
    product_category: "Digital",
    product_profile: "digital-goods",
    cus_name: "Toiri customer",
    cus_email: "billing@toiri.app",
    cus_phone: params.customerPhone || "01700000000",
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
  });

  const res = await fetch(INIT_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as {
    status?: string;
    GatewayPageURL?: string;
    failedreason?: string;
  };
  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    throw new Error(data.failedreason || "Could not start the payment.");
  }
  return data.GatewayPageURL;
}

/**
 * Confirms a transaction with SSLCommerz directly (never trusting the posted
 * form values) and credits the device exactly once.
 */
export async function validateAndCredit(tranId: string, valId: string) {
  const { storeId, storePassword } = getStoreCredentials();

  const { data: order, error } = await supabaseAdmin
    .from("credit_orders")
    .select("*")
    .eq("tran_id", tranId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!order) return { ok: false as const, reason: "unknown-order" };
  if (order.status === "paid") return { ok: true as const, alreadyPaid: true };

  const url = new URL(VALIDATION_URL);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePassword);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  const v = (await res.json()) as {
    status?: string;
    amount?: string;
    currency?: string;
    tran_id?: string;
    bank_tran_id?: string;
    card_type?: string;
  };

  const amountMatches = Number(v.amount) === Number(order.amount_bdt);
  const valid =
    (v.status === "VALID" || v.status === "VALIDATED") &&
    v.tran_id === tranId &&
    v.currency === "BDT" &&
    amountMatches;

  if (!valid) {
    await supabaseAdmin
      .from("credit_orders")
      .update({ status: "failed", val_id: valId, updated_at: new Date().toISOString() })
      .eq("tran_id", tranId);
    return { ok: false as const, reason: "invalid" };
  }

  // Mark paid first, guarded on the pending status, so concurrent IPN and
  // success callbacks can never credit the same order twice.
  const { data: claimed } = await supabaseAdmin
    .from("credit_orders")
    .update({
      status: "paid",
      val_id: valId,
      bank_tran_id: v.bank_tran_id ?? null,
      card_type: v.card_type ?? null,
      credited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("tran_id", tranId)
    .neq("status", "paid")
    .select("device_id, credits")
    .maybeSingle();

  if (!claimed) return { ok: true as const, alreadyPaid: true };

  await addCredits(claimed.device_id, claimed.credits);
  return { ok: true as const, credits: claimed.credits };
}

/** SSLCommerz posts callbacks as form data; accept query params as a fallback. */
export async function readCallbackFields(request: Request) {
  const fields = new Map<string, string>();
  new URL(request.url).searchParams.forEach((v, k) => fields.set(k, v));
  if (request.method === "POST") {
    try {
      const form = await request.formData();
      form.forEach((v, k) => typeof v === "string" && fields.set(k, v));
    } catch {
      /* ignore non-form bodies */
    }
  }
  return fields;
}
