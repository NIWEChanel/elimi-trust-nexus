import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export function CategoriesPage() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{t("nav_categories")}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {data?.map((c) => (
            <Link
              key={c.id}
              to="/products"
              className="rounded-xl bg-card hairline p-6 hover:border-gold hover:shadow-luxury transition group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center mb-3 text-primary-foreground font-bold">
                {c.name.charAt(0)}
              </div>
              <h3 className="font-semibold group-hover:text-gold transition">{c.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
