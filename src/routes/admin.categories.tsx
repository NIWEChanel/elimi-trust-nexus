import { useAsyncAction, useAsyncData } from "@/lib/use-async";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const TYPES = ["real_estate","land","vehicle","car","motorcycle","truck","computer","laptop","smartphone","tablet","electronics","tv","camera","furniture","fashion","accessories","rental","service","home_equipment","office_equipment","other"] as const;

export function AdminCategories() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", slug: "", product_type: "other", icon: "" });

  const { data, reload } = useAsyncData(async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    return data ?? [];
  }, []);

  const save = useAsyncAction(async (f: typeof form) => {
      const payload = { name: f.name, slug: f.slug, product_type: f.product_type as "other", icon: f.icon || null };
      if (f.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    }, {
    onSuccess: () => {
      toast.success("Saved");
      setOpen(false);
      setForm({ id: "", name: "", slug: "", product_type: "other", icon: "" });
      reload();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useAsyncAction(async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    }, {
    onSuccess: () => {
      toast.success("Deleted");
      reload();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => { setForm({ id: "", name: "", slug: "", product_type: "other", icon: "" }); setOpen(true); }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data?.map((c) => (
          <div key={c.id} className="rounded-xl bg-card hairline p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.product_type} · /{c.slug}</div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => { setForm({ id: c.id, name: c.name, slug: c.slug, product_type: c.product_type, icon: c.icon ?? "" }); setOpen(true); }}>Edit</Button>
              <Button size="icon" variant="ghost" onClick={() => confirm("Delete?") && del.mutate(c.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} category</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, "-") })} required />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div>
              <Label>Product type</Label>
              <Select value={form.product_type} onValueChange={(v) => setForm({ ...form, product_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-gold text-primary-foreground">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
