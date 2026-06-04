import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle2, Clock, Tag, Users, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentRole, todayISO } from "@/lib/use-role";
import { Button } from "@/components/ui/button";

export function AdminOverview() {
  const { role, userId } = useCurrentRole();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: role === "super_admin",
    queryFn: async () => {
      const [all, sold, pending, cats, emps, reportsToday] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "sold"),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "employee"),
        supabase.from("employee_reports").select("id", { count: "exact", head: true }).eq("report_date", todayISO()),
      ]);
      return {
        total: all.count ?? 0,
        sold: sold.count ?? 0,
        pending: pending.count ?? 0,
        categories: cats.count ?? 0,
        employees: emps.count ?? 0,
        reportsToday: reportsToday.count ?? 0,
      };
    },
  });

  const { data: myToday } = useQuery({
    queryKey: ["my-today", userId],
    enabled: !!userId && role === "employee",
    queryFn: async () => {
      const { data } = await supabase
        .from("employee_reports")
        .select("id")
        .eq("user_id", userId!)
        .eq("report_date", todayISO())
        .maybeSingle();
      return !!data;
    },
  });

  const { data: myUploads } = useQuery({
    queryKey: ["my-uploads", userId],
    enabled: !!userId && role === "employee",
    queryFn: async () => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("created_by", userId!);
      return count ?? 0;
    },
  });

  if (role === "employee") {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground mb-6">Welcome back. Here's your day at a glance.</p>

        {myToday === false && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div className="text-sm">You haven't submitted today's report. You'll need it before logout.</div>
            </div>
            <Link to="/admin/report"><Button size="sm" className="bg-gradient-gold text-primary-foreground">Submit now</Button></Link>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card label="Today's report" value={myToday ? "Submitted" : "Pending"} icon={FileText} />
          <Card label="Products I uploaded" value={myUploads ?? 0} icon={Package} />
          <Card label="Date" value={todayISO()} icon={Clock} />
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total products", value: stats?.total ?? 0, icon: Package },
    { label: "Sold", value: stats?.sold ?? 0, icon: CheckCircle2 },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock },
    { label: "Categories", value: stats?.categories ?? 0, icon: Tag },
    { label: "Employees", value: stats?.employees ?? 0, icon: Users },
    { label: "Reports today", value: stats?.reportsToday ?? 0, icon: FileText },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome back to Elimi Trust Admin.</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => <Card key={c.label} {...c} />)}
      </div>
    </div>
  );
}

function Card({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl bg-card hairline p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="w-4 h-4 text-gold" />
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}
