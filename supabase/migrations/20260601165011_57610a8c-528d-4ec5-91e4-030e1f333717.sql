
-- Enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'employee');
CREATE TYPE public.product_status AS ENUM ('available', 'sold', 'pending', 'reserved');
CREATE TYPE public.product_type AS ENUM (
  'real_estate','land','vehicle','car','motorcycle','truck',
  'computer','laptop','smartphone','tablet','electronics','tv','camera',
  'furniture','fashion','accessories','rental','service',
  'home_equipment','office_equipment','other'
);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  image_url TEXT,
  product_type public.product_type NOT NULL DEFAULT 'other',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RWF',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  product_type public.product_type NOT NULL DEFAULT 'other',
  condition TEXT,
  brand TEXT,
  quantity INT NOT NULL DEFAULT 1,
  status public.product_status NOT NULL DEFAULT 'available',
  tags TEXT[] DEFAULT '{}',
  district TEXT,
  sector TEXT,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  featured_image TEXT,
  video_url TEXT,
  whatsapp_number TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_type ON public.products(product_type);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_created ON public.products(created_at DESC);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Product images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Favorites (anonymous fingerprint-based)
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, fingerprint)
);
CREATE INDEX idx_favorites_product ON public.favorites(product_id);
GRANT SELECT, INSERT, DELETE ON public.favorites TO anon, authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Employee reports
CREATE TABLE public.employee_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tasks_completed TEXT NOT NULL,
  uploaded_count INT NOT NULL DEFAULT 0,
  problems TEXT,
  notes TEXT,
  report_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_user ON public.employee_reports(user_id);
CREATE INDEX idx_reports_date ON public.employee_reports(report_date DESC);
GRANT SELECT, INSERT ON public.employee_reports TO authenticated;
GRANT ALL ON public.employee_reports TO service_role;
ALTER TABLE public.employee_reports ENABLE ROW LEVEL SECURITY;

-- Like counter trigger
CREATE OR REPLACE FUNCTION public.bump_like_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
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
CREATE TRIGGER trg_fav_count AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.bump_like_count();

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "super admin manages profiles" ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- user_roles
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin manages roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- categories
CREATE POLICY "anyone reads categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super admin manages categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- products
CREATE POLICY "anyone reads products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "staff insert products" ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "staff update own products" ON public.products FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super admin deletes products" ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- product_images
CREATE POLICY "anyone reads product images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "staff manages product images" ON public.product_images FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- favorites
CREATE POLICY "anyone reads favorites" ON public.favorites FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone creates favorites" ON public.favorites FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone deletes favorites" ON public.favorites FOR DELETE TO anon, authenticated USING (true);

-- employee_reports
CREATE POLICY "users read own reports" ON public.employee_reports FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "users insert own reports" ON public.employee_reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Seed default categories
INSERT INTO public.categories (name, slug, product_type, icon, sort_order) VALUES
  ('Real Estate','real-estate','real_estate','home',1),
  ('Land','land','land','map',2),
  ('Cars','cars','car','car',3),
  ('Motorcycles','motorcycles','motorcycle','bike',4),
  ('Trucks','trucks','truck','truck',5),
  ('Smartphones','smartphones','smartphone','smartphone',6),
  ('Laptops','laptops','laptop','laptop',7),
  ('Computers','computers','computer','monitor',8),
  ('Tablets','tablets','tablet','tablet',9),
  ('TVs','tvs','tv','tv',10),
  ('Cameras','cameras','camera','camera',11),
  ('Electronics','electronics','electronics','zap',12),
  ('Furniture','furniture','furniture','sofa',13),
  ('Fashion','fashion','fashion','shirt',14),
  ('Accessories','accessories','accessories','watch',15),
  ('Rentals','rentals','rental','key',16),
  ('Services','services','service','briefcase',17),
  ('Home Equipment','home-equipment','home_equipment','wrench',18),
  ('Office Equipment','office-equipment','office_equipment','printer',19),
  ('Other','other','other','package',20);
