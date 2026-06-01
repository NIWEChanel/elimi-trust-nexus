import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Products — Elimi Trust Ltd" }, { name: "description", content: "Browse all products on Elimi Trust marketplace." }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name,slug").order("sort_order");
      return data ?? [];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search, category],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id,title,price,currency,featured_image,location,status,like_count,category_id")
        .order("created_at", { ascending: false })
        .limit(60);
      if (category !== "all") q = q.eq("category_id", category);
      if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);
      const { data } = await q;
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("nav_products")}</h1>
        <p className="text-muted-foreground mb-6">{t("tagline")}</p>

        <div className="grid sm:grid-cols-[1fr_220px] gap-3 mb-8">
          <Input placeholder={t("search_placeholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder={t("filter_category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter_all")}</SelectItem>
              {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-xl bg-card animate-pulse" />)}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">{t("no_products")}</div>
        )}
      </div>
    </SiteLayout>
  );
}
