import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { bootstrapSuperAdmin } from "@/lib/admin-bootstrap.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Staff Login — Elimi Trust Ltd" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@elimitrust.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    bootstrapSuperAdmin()
      .catch((e) => console.error("bootstrap", e))
      .finally(() => setSeeding(false));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-20 max-w-md">
        <div className="glass rounded-2xl p-8 shadow-luxury">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-lg bg-gradient-gold items-center justify-center font-bold text-primary-foreground mb-3">E</div>
            <h1 className="text-2xl font-bold">{t("login_title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("login_sub")}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" disabled={busy || seeding} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90">
              {busy || seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : t("sign_in")}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Default super admin: <code className="text-gold">admin@elimitrust.com</code> / <code className="text-gold">Admin@2026</code>
          </p>
          <p className="text-xs text-center mt-4">
            <Link to="/" className="text-muted-foreground hover:text-gold">← Back to home</Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
