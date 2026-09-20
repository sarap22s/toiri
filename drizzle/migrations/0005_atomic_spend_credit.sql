-- Atomic decrement-if-positive: one statement checks and spends in a single
-- row lock, so concurrent requests cannot both pass the balance check.
CREATE OR REPLACE FUNCTION public.spend_credit(_device_id text)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.credit_balances
  SET credits = credits - 1,
      updated_at = now()
  WHERE device_id = _device_id
    AND credits > 0
  RETURNING credits;
$$;

REVOKE ALL ON FUNCTION public.spend_credit(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.spend_credit(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.spend_credit(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credit(text) TO service_role;