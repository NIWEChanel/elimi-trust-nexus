import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/whatsapp";
import { MessageCircle, Mail, Phone } from "lucide-react";

export function ContactPage() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold">{t("contact_title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("contact_intro")}</p>

        <div className="mt-10 grid gap-3">
          <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <a href={whatsappLink({})} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp: 0740 7992
            </a>
          </Button>
          <Button asChild size="lg" variant="outline"><a href="tel:+250740007992"><Phone className="w-5 h-5 mr-2" /> 0740 7992</a></Button>
          <Button asChild size="lg" variant="outline"><a href="mailto:elimitrustltd1996@gmail.com"><Mail className="w-5 h-5 mr-2" /> elimitrustltd1996@gmail.com</a></Button>
        </div>
      </div>
    </SiteLayout>
  );
}
