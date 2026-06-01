import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ImageUploader";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type FormState = {
  id?: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  category_id: string;
  product_type: string;
  condition: string;
  brand: string;
  quantity: string;
  status: string;
  district: string;
  sector: string;
  location: string;
  whatsapp_number: string;
  is_featured: boolean;
  images: string[];
  attributes: Record<string, string>;
};

const empty: FormState = {
  title: "", description: "", price: "0", currency: "RWF",
  category_id: "", product_type: "other", condition: "", brand: "",
  quantity: "1", status: "available", district: "", sector: "", location: "",
  whatsapp_number: "", is_featured: false, images: [], attributes: {},
};

function attrFieldsFor(type: string): string[] {
  if (["car", "motorcycle", "truck", "vehicle"].includes(type)) return ["model", "year", "mileage", "fuel_type", "transmission"];
  if (["real_estate", "land"].includes(type)) return ["bedrooms", "bathrooms", "area_size", "property_type"];
  if (["smartphone", "laptop", "computer", "tablet"].includes(type)) return ["ram", "storage", "processor", "operating_system", "battery_health"];
  return [];
}

function AdminProducts() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,title,price,currency,status,product_type,featured_image,created_at,attributes,description,category_id,condition,brand,quantity,district,sector,location,whatsapp_number,is_featured")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name,product_type").order("sort_order");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error("Not authenticated");

      const payload = {
        title: f.title,
        description: f.description || null,
        price: Number(f.price) || 0,
        currency: f.currency,
        category_id: f.category_id || null,
        product_type: f.product_type as "other",
        condition: f.condition || null,
        brand: f.brand || null,
        quantity: Number(f.quantity) || 1,
        status: f.status as "available",
        district: f.district || null,
        sector: f.sector || null,
        location: f.location || null,
        whatsapp_number: f.whatsapp_number || null,
        is_featured: f.is_featured,
        featured_image: f.images[0] || null,
        attributes: f.attributes,
        created_by: uid,
      };

      let productId = f.id;
      if (f.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      if (productId) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (f.images.length > 0) {
          await supabase.from("product_images").insert(
            f.images.map((url, i) => ({ product_id: productId!, url, sort_order: i }))
          );
        }
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      setOpen(false);
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setForm(empty);
    setOpen(true);
  }

  async function openEdit(id: string) {
    const p = products?.find((x) => x.id === id);
    if (!p) return;
    const { data: imgs } = await supabase.from("product_images").select("url").eq("product_id", id).order("sort_order");
    setForm({
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      price: String(p.price),
      currency: p.currency,
      category_id: p.category_id ?? "",
      product_type: p.product_type,
      condition: p.condition ?? "",
      brand: p.brand ?? "",
      quantity: String(p.quantity),
      status: p.status,
      district: p.district ?? "",
      sector: p.sector ?? "",
      location: p.location ?? "",
      whatsapp_number: p.whatsapp_number ?? "",
      is_featured: p.is_featured,
      images: [p.featured_image, ...(imgs?.map((i) => i.url) ?? [])].filter(Boolean) as string[],
      attributes: (p.attributes as Record<string, string>) ?? {},
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.images.length < 3) {
      toast.error("Please upload at least 3 images");
      return;
    }
    if (!form.title || !form.category_id) {
      toast.error("Title and category are required");
      return;
    }
    save.mutate(form);
  }

  const attrFields = attrFieldsFor(form.product_type);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={openNew} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> New Product
        </Button>
      </div>

      <div className="rounded-xl bg-card hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                <td className="p-3">
                  {p.featured_image ? <img src={p.featured_image} alt="" className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 bg-muted rounded" />}
                </td>
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-gold">{Intl.NumberFormat().format(Number(p.price))} {p.currency}</td>
                <td className="p-3"><span className="px-2 py-1 rounded text-xs bg-accent">{p.status}</span></td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p.id)}><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => confirm("Delete this product?") && del.mutate(p.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet. Create your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category_id} onValueChange={(v) => {
                  const cat = categories?.find((c) => c.id === v);
                  setForm({ ...form, category_id: v, product_type: cat?.product_type ?? form.product_type });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div>
                <Label>Condition</Label>
                <Input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="New / Used" />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div>
                <Label>WhatsApp number (override)</Label>
                <Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="250788..." />
              </div>
              <div>
                <Label>District</Label>
                <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
              </div>
              <div>
                <Label>Sector</Label>
                <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Location (address)</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            {attrFields.length > 0 && (
              <div>
                <Label className="text-gold">Type-specific details ({form.product_type.replace(/_/g, " ")})</Label>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {attrFields.map((f) => (
                    <div key={f}>
                      <Label className="text-xs capitalize">{f.replace(/_/g, " ")}</Label>
                      <Input
                        value={form.attributes[f] ?? ""}
                        onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, [f]: e.target.value } })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Images (minimum 3, first is featured)</Label>
              <ImageUploader value={form.images} onChange={(urls) => setForm({ ...form, images: urls })} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                {save.isPending ? "Saving..." : "Save product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
