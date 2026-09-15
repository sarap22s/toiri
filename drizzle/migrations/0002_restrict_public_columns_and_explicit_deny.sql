-- 1. published_apps: stop exposing device_id publicly (column-level grants)
REVOKE SELECT ON public.published_apps FROM anon;
REVOKE SELECT ON public.published_apps FROM authenticated;

GRANT SELECT (slug, title, code, created_at, updated_at) ON public.published_apps TO anon;
GRANT SELECT (slug, title, code, created_at, updated_at) ON public.published_apps TO authenticated;

-- 2. credit_balances / credit_orders: make the "no client access" intent explicit.
-- All reads and writes go through server-side service-role code only.
CREATE POLICY "No client access to credit balances"
ON public.credit_balances
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No client access to credit orders"
ON public.credit_orders
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);