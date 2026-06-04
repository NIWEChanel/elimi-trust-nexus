import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Props {
  product: {
    id: string;
    title: string;
    price: number;
    currency: string;
    featured_image: string | null;
    location: string | null;
    status: string;
    like_count: number;
  };
}

export function ProductCard({ product }: Props) {
  const { t } = useI18n();
  const statusKey = `status_${product.status}`;
  return (
    <Link
      to={`/products/${product.id}`}
      className="group block rounded-xl overflow-hidden bg-card hairline hover:shadow-luxury transition-all hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] bg-muted overflow-hidden relative">
        {product.featured_image ? (
          <img
            src={product.featured_image}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium bg-background/80 backdrop-blur">
          {t(statusKey)}
        </div>
        {product.like_count > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium bg-background/80 backdrop-blur flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current text-gold" /> {product.like_count}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-1 group-hover:text-gold transition">{product.title}</h3>
        <div className="mt-1 text-lg font-bold text-gold">
          {Intl.NumberFormat().format(product.price)} {product.currency}
        </div>
        {product.location && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" /> {product.location}
          </div>
        )}
      </div>
    </Link>
  );
}
