
-- 1) Fix is_staff to only allow super_admin and employee
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin'::app_role, 'employee'::app_role)
  )
$$;

-- 2) Set search_path on remaining functions
CREATE OR REPLACE FUNCTION public.bump_like_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products SET like_count = like_count + 1 WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 3) Revoke EXECUTE on SECURITY DEFINER helpers from anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- 4) Tighten favorites policies: require fingerprint to match request header
DROP POLICY IF EXISTS "anyone deletes favorites" ON public.favorites;
DROP POLICY IF EXISTS "anyone creates favorites" ON public.favorites;

CREATE POLICY "favorites insert own fingerprint"
ON public.favorites FOR INSERT TO anon, authenticated
WITH CHECK (
  fingerprint = current_setting('request.headers', true)::json->>'x-fingerprint'
);

CREATE POLICY "favorites delete own fingerprint"
ON public.favorites FOR DELETE TO anon, authenticated
USING (
  fingerprint = current_setting('request.headers', true)::json->>'x-fingerprint'
);
