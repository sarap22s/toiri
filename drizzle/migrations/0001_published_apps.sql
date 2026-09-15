CREATE TABLE public.published_apps (
  slug text PRIMARY KEY,
  device_id text NOT NULL,
  title text NOT NULL DEFAULT 'Toiri app',
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX published_apps_device_idx ON public.published_apps (device_id);

GRANT SELECT ON public.published_apps TO anon;
GRANT SELECT ON public.published_apps TO authenticated;
GRANT ALL ON public.published_apps TO service_role;

ALTER TABLE public.published_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published apps are publicly readable"
ON public.published_apps
FOR SELECT
TO anon, authenticated
USING (true);
