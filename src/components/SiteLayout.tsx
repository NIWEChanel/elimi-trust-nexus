import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { Menu, X, Globe, Instagram, Facebook, Mail, Phone } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setIsAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const navItems = [
    { to: "/", label: t("nav_home") },
    { to: "/products", label: t("nav_products") },
    { to: "/categories", label: t("nav_categories") },
    { to: "/about", label: t("nav_about") },
    { to: "/contact", label: t("nav_contact") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center font-bold text-primary-foreground">E</div>
            <span className="font-bold tracking-tight hidden sm:inline">Elimi Trust</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
                activeProps={{ className: "px-3 py-2 text-sm rounded-md text-gold bg-accent" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Language">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["en", "fr", "rw"] as Lang[]).map((l) => (
                  <DropdownMenuItem key={l} onClick={() => setLang(l)} className={lang === l ? "text-gold" : ""}>
                    {l === "en" ? "🇬🇧 English" : l === "fr" ? "🇫🇷 Français" : "🇷🇼 Kinyarwanda"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthed ? (
              <Button asChild size="sm" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Link to="/admin">{t("nav_dashboard")}</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">{t("nav_login")}</Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((s) => !s)} aria-label="Menu">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-foreground hover:bg-accent"
                >
                  {n.label}
                </Link>
              ))}
              {!isAuthed && (
                <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-gold">
                  {t("nav_login")}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center font-bold text-primary-foreground">E</div>
              <span className="font-bold">Elimi Trust Ltd</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-gold">{t("nav_contact")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 0740 7992 / 0786 520 082</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> elimitrustltd1996@gmail.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-gold">{t("follow_us")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Instagram className="w-4 h-4" /> elimitrusteltd</li>
              <li className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Elimi Trust</li>
              <li className="flex items-center gap-2">TikTok: elimi trust</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Elimi Trust Ltd. {t("footer_rights")}
        </div>
      </footer>
    </div>
  );
}
