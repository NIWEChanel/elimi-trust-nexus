export const WHATSAPP_NUMBERS = ["250788407992", "250786520082"];
export const PRIMARY_WA = WHATSAPP_NUMBERS[0];

export function whatsappLink(opts: { number?: string; productTitle?: string; productId?: string; productUrl?: string; customMessage?: string }) {
  const num = (opts.number ?? PRIMARY_WA).replace(/\D/g, "");
  let msg = opts.customMessage;
  if (!msg) {
    const parts = [`Hello Elimi Trust, I am interested in this product:`];
    if (opts.productTitle) parts.push(`${opts.productTitle}`);
    if (opts.productId) parts.push(`(Ref: ${opts.productId.slice(0, 8)})`);
    if (opts.productUrl) parts.push(opts.productUrl);
    msg = parts.join("\n");
  }
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
