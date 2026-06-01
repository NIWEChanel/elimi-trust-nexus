import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elimi Trust Ltd — Premium Classified Marketplace" },
      { name: "description", content: "Trusted Rwandan marketplace for real estate, vehicles, electronics and more." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const { data: featured } = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,title,price,currency,featured_image,location,status,like_count")
        .eq("status", "available")
        .order("like_count", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });
  const { data: recent } = useQuery({
    queryKey: ["home-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,title,price,currency,featured_image,location,status,like_count")
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 20% 30%, oklch(0.85 0.13 85 / 0.18), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.85 0.13 85 / 0.12), transparent 50%)" }}
        />
        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-block px-3 py-1 rounded-full glass text-xs font-medium text-gold mb-6">
            ✦ Elimi Trust Ltd — Premium Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto">
            {t("hero_title")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("hero_sub")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-glow">
              <Link to="/products">{t("cta_browse")} <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">{t("cta_contact")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: Shield, title: "Verified listings", desc: "Every product reviewed by Elimi Trust staff." },
          { icon: Zap, title: "Instant WhatsApp", desc: "Reach sellers in one tap." },
          { icon: Globe, title: "3 Languages", desc: "English, Français, Kinyarwanda." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl bg-card hairline p-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center mb-3">
              <f.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      {featured && featured.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">{t("trending")}</h2>
            <Link to="/products" className="text-sm text-gold hover:underline">{t("view_all")} →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {recent && recent.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">{t("recent")}</h2>
            <Link to="/products" className="text-sm text-gold hover:underline">{t("view_all")} →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recent.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {(!featured?.length && !recent?.length) && (
        <section className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">{t("no_products")}. Staff can sign in and start adding products.</p>
        </section>
      )}
    </SiteLayout>
  );
}
