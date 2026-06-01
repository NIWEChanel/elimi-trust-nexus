import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { Instagram, Facebook, Mail, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Elimi Trust Ltd" }, { name: "description", content: "About Elimi Trust Ltd, Rwanda's premium classified marketplace." }] }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold">{t("about_title")}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{t("about_mission")}</p>

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {[
            { icon: Phone, label: "Phone", value: "0740 7992 / 0786 520 082" },
            { icon: MessageCircle, label: "WhatsApp", value: "0740 7992 / 0786 520 082" },
            { icon: Mail, label: "Email", value: "elimitrustltd1996@gmail.com" },
            { icon: Instagram, label: "Instagram", value: "elimitrusteltd" },
            { icon: Facebook, label: "Facebook", value: "Elimi Trust" },
            { icon: MessageCircle, label: "TikTok", value: "elimi trust" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl bg-card hairline p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className="font-medium">{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
