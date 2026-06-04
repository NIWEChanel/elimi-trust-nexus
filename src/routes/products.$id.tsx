import { Link, useParams } from "react-router-dom";
import { MapPin, Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/lib/whatsapp";
import { getFingerprint, favoritesClient } from "@/lib/fingerprint";
import { toast } from "sonner";
import { useAsyncAction, useAsyncData } from "@/lib/use-async";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { data: product, isLoading, error, reload: reloadProduct } = useAsyncData(async () => {
    const { data, error } = await supabase.from("products").select("*, product_images(url,sort_order), categories(name)").eq("id", id!).maybeSingle();
    if (error) throw error;
    return data;
  }, [id], { enabled: !!id });
  const { data: liked, reload: reloadLiked } = useAsyncData(async () => {
    const fp = getFingerprint();
    const { data } = await supabase.from("favorites").select("id").eq("product_id", id!).eq("fingerprint", fp).maybeSingle();
    return !!data;
  }, [id], { enabled: !!id });
  const toggleLike = useAsyncAction(async () => {
    const fp = getFingerprint();
    const sb = favoritesClient();
    if (liked) await sb.from("favorites").delete().eq("product_id", id!).eq("fingerprint", fp);
    else await sb.from("favorites").insert({ product_id: id!, fingerprint: fp });
  }, { onSuccess: () => { reloadLiked(); reloadProduct(); } });

  if (isLoading) return <SiteLayout><div className="container mx-auto px-4 py-10"><div className="h-96 rounded-xl bg-card animate-pulse" /></div></SiteLayout>;
  if (error) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center"><p className="text-muted-foreground">{error instanceof Error ? error.message : "Product failed to load."}</p><Link to="/products" className="text-gold hover:underline mt-4 inline-block">← Back to products</Link></div></SiteLayout>;
  if (!product) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center"><p>Product not found.</p><Link to="/products" className="text-gold hover:underline mt-4 inline-block">← Back</Link></div></SiteLayout>;

  const images = [product.featured_image, ...(product.product_images?.map((i) => i.url) ?? [])].filter(Boolean) as string[];
  const waUrl = whatsappLink({ number: product.whatsapp_number ?? undefined, productTitle: product.title, productId: product.id, productUrl: window.location.href });
  return <SiteLayout><div className="container mx-auto px-4 py-8"><Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold mb-6"><ArrowLeft className="w-4 h-4 mr-1" /> {t("nav_products")}</Link><div className="grid md:grid-cols-2 gap-8"><div><div className="aspect-square rounded-xl overflow-hidden bg-card mb-3">{images[0] ? <img src={images[0]} alt={product.title} className="w-full h-full object-cover" /> : null}</div>{images.length > 1 && <div className="grid grid-cols-4 gap-2">{images.slice(1, 5).map((url) => <div key={url} className="aspect-square rounded-md overflow-hidden bg-card"><img src={url} alt="" className="w-full h-full object-cover" /></div>)}</div>}</div><div><span className="text-xs uppercase tracking-wider text-gold">{product.categories?.name}</span><h1 className="text-3xl md:text-4xl font-bold mt-2">{product.title}</h1><div className="mt-4 text-3xl font-bold text-gold">{Intl.NumberFormat().format(Number(product.price))} {product.currency}</div><div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">{product.location && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{product.location}</span>}<span className="px-2 py-1 rounded bg-accent">{t(`status_${product.status}`)}</span>{product.condition && <span>{t("condition")}: {product.condition}</span>}{product.brand && <span>{t("prod_brand")}: {product.brand}</span>}</div><div className="mt-6 flex gap-3"><Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 flex-1"><a href={waUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-5 h-5 mr-2" />{t("contact_whatsapp")}</a></Button><Button variant="outline" size="lg" onClick={() => { toggleLike.mutate(); toast.success(liked ? "Removed" : "Liked"); }}><Heart className={`w-5 h-5 ${liked ? "fill-current text-gold" : ""}`} /></Button></div>{product.description && <div className="mt-8"><h3 className="font-semibold mb-2">{t("description")}</h3><p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p></div>}{product.attributes && Object.keys(product.attributes as Record<string, unknown>).length > 0 && <div className="mt-6"><h3 className="font-semibold mb-2">{t("details")}</h3><dl className="grid grid-cols-2 gap-3 text-sm">{Object.entries(product.attributes as Record<string, unknown>).map(([k, v]) => <div key={k} className="bg-card rounded-md p-3 hairline"><dt className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt><dd className="font-medium">{String(v)}</dd></div>)}</dl></div>}</div></div></div></SiteLayout>;
}
