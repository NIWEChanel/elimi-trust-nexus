import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const OPTIONS: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "rw", label: "Kinyarwanda", native: "Kinyarwanda", flag: "🇷🇼" },
];

export function LanguageGate() {
  const { lang, setLang, t } = useI18n();
  if (lang) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-dark px-4">
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 20%, oklch(0.85 0.13 85 / 0.15), transparent 60%), radial-gradient(circle at 70% 80%, oklch(0.85 0.13 85 / 0.1), transparent 60%)" }} />
      <div className="relative w-full max-w-lg glass rounded-2xl p-8 shadow-luxury">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-gold mb-4 shadow-glow">
            <span className="text-2xl font-bold text-primary-foreground">E</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Elimi Trust Ltd</h1>
          <p className="mt-3 text-lg text-gold">{t("select_language")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("select_language_sub")}</p>
        </div>
        <div className="grid gap-3">
          {OPTIONS.map((o) => (
            <Button
              key={o.code}
              variant="outline"
              size="lg"
              onClick={() => setLang(o.code)}
              className="h-16 justify-between bg-card hover:bg-accent hairline text-foreground"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{o.flag}</span>
                <span className="text-left">
                  <span className="block font-semibold">{o.native}</span>
                  <span className="block text-xs text-muted-foreground">{o.label}</span>
                </span>
              </span>
              <span className="text-gold">→</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
