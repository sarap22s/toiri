-- Anonymous, device-scoped credit balances. All reads/writes happen through
-- server-side code using the service role; the browser never writes these.
CREATE TABLE public.credit_balances (
  device_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.credit_balances TO service_role;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (server code) may touch this table.

CREATE TABLE public.credit_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tran_id TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount_bdt NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  val_id TEXT,
  bank_tran_id TEXT,
  card_type TEXT,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX credit_orders_device_idx ON public.credit_orders (device_id, created_at DESC);

GRANT ALL ON public.credit_orders TO service_role;
ALTER TABLE public.credit_orders ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (server code) may touch this table.

-- Atomically add credits for a device, creating the row if needed.
CREATE OR REPLACE FUNCTION public.add_credits(_device_id TEXT, _amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  INSERT INTO public.credit_balances (device_id, credits)
  VALUES (_device_id, GREATEST(0, 10 + _amount))
  ON CONFLICT (device_id) DO UPDATE
    SET credits = GREATEST(0, public.credit_balances.credits + _amount),
        updated_at = now()
  RETURNING credits INTO new_total;
  RETURN new_total;
END;
$$;

REVOKE ALL ON FUNCTION public.add_credits(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(TEXT, INTEGER) TO service_role;