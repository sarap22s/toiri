-- Hide the internal device identifier from public readers of published apps.
REVOKE SELECT ON public.published_apps FROM anon, authenticated;
GRANT SELECT (slug, title, code, created_at, updated_at) ON public.published_apps TO anon, authenticated;

-- Throttle how many brand-new free-credit devices a single network can mint per day.
CREATE TABLE IF NOT EXISTS public.device_grants (
  ip_hash text NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  devices integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ip_hash, day)
);

GRANT ALL ON public.device_grants TO service_role;

ALTER TABLE public.device_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to device grants"
  ON public.device_grants FOR ALL
  TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.claim_new_device(_ip_hash text, _limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  used integer;
BEGIN
  INSERT INTO public.device_grants (ip_hash, day, devices)
  VALUES (_ip_hash, (now() AT TIME ZONE 'utc')::date, 1)
  ON CONFLICT (ip_hash, day) DO UPDATE
    SET devices = public.device_grants.devices + 1,
        updated_at = now()
  RETURNING devices INTO used;
  RETURN used <= _limit;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_new_device(text, integer) FROM PUBLIC, anon, authenticated;
