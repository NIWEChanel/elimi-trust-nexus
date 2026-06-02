import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, Tag, LogOut, Users, FileText, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCurrentRole, todayISO } from "@/lib/use-role";
import { DailyReportDialog } from "@/components/DailyReportDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { userId, email, role, loading } = useCurrentRole();
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function attemptLogout() {
    if (role === "employee" && userId) {
      const { data, error } = await supabase
        .from("employee_reports")
        .select("id")
        .eq("user_id", userId)
        .eq("report_date", todayISO())
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data) {
        setReportOpen(true);
        toast.warning("Submit today's report before logging out.");
        return;
      }
    }
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  async function onReportSubmitted() {
    setReportOpen(false);
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  const superLinks = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package, exact: false },
    { to: "/admin/categories", label: "Categories", icon: Tag, exact: false },
    { to: "/admin/employees", label: "Employees", icon: Users, exact: false },
    { to: "/admin/reports", label: "Reports", icon: FileText, exact: false },
  ] as const;

  const employeeLinks = [
    { to: "/admin", label: "My Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package, exact: false },
    { to: "/admin/report", label: "Daily Report", icon: ClipboardList, exact: false },
  ] as const;

  const links = role === "super_admin" ? superLinks : employeeLinks;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center font-bold text-primary-foreground">E</div>
            <div>
              <div className="font-bold leading-tight">Elimi Admin</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {loading ? "…" : role === "super_admin" ? "Super Admin" : "Employee"}
              </div>
            </div>
          </Link>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              activeProps={{ className: "flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-accent text-gold" }}
            >
              <l.icon className="w-4 h-4" /> {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground px-3 py-2 truncate">{email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={attemptLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
      {userId && (
        <DailyReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          userId={userId}
          onSubmitted={onReportSubmitted}
        />
      )}
    </div>
  );
}
