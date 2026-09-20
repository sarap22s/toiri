-- Explicitly deny all client-side writes to published_apps.
-- All publish/update operations go through the trusted server (service role), which bypasses RLS.
CREATE POLICY "No client inserts to published apps"
  ON public.published_apps FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "No client updates to published apps"
  ON public.published_apps FOR UPDATE
  TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes from published apps"
  ON public.published_apps FOR DELETE
  TO anon, authenticated
  USING (false);