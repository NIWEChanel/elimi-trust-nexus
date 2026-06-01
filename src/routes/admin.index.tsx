import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle2, Clock, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [all, sold, pending, cats] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "sold"),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);
      return {
        total: all.count ?? 0,
        sold: sold.count ?? 0,
        pending: pending.count ?? 0,
        categories: cats.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Total products", value: stats?.total ?? 0, icon: Package },
    { label: "Sold", value: stats?.sold ?? 0, icon: CheckCircle2 },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock },
    { label: "Categories", value: stats?.categories ?? 0, icon: Tag },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome back to Elimi Trust Admin.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-card hairline p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <c.icon className="w-4 h-4 text-gold" />
            </div>
            <div className="mt-3 text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
