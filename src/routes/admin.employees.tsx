import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Trash2, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createEmployee,
  listEmployees,
  deleteEmployee,
  resetEmployeePassword,
} from "@/lib/employees.functions";

export const Route = createFileRoute("/admin/employees")({
  component: AdminEmployees,
});

function AdminEmployees() {
  const qc = useQueryClient();
  const listFn = useServerFn(listEmployees);
  const createFn = useServerFn(createEmployee);
  const deleteFn = useServerFn(deleteEmployee);
  const resetFn = useServerFn(resetEmployeePassword);

  const { data, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => listFn(),
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "" });
  const [resetFor, setResetFor] = useState<{ id: string; name: string } | null>(null);
  const [newPwd, setNewPwd] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone || null,
        },
      }),
    onSuccess: () => {
      toast.success("Employee created");
      setOpenCreate(false);
      setForm({ email: "", password: "", fullName: "", phone: "" });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (userId: string) => deleteFn({ data: { userId } }),
    onSuccess: () => {
      toast.success("Employee deleted");
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reset = useMutation({
    mutationFn: () => resetFn({ data: { userId: resetFor!.id, newPassword: newPwd } }),
    onSuccess: () => {
      toast.success("Password reset");
      setResetFor(null);
      setNewPwd("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage employee accounts and access.</p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="bg-gradient-gold text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> New employee
        </Button>
      </div>

      <div className="rounded-xl bg-card hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left">
            <tr className="border-b border-border">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Today's report</th>
              <th className="p-3">Last sign-in</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="p-6 text-center text-muted-foreground" colSpan={6}>Loading…</td></tr>
            )}
            {!isLoading && (data?.employees ?? []).length === 0 && (
              <tr><td className="p-6 text-center text-muted-foreground" colSpan={6}>No employees yet.</td></tr>
            )}
            {data?.employees.map((e) => (
              <tr key={e.id} className="border-b border-border/60">
                <td className="p-3 font-medium">{e.full_name || "—"}</td>
                <td className="p-3">{e.email}</td>
                <td className="p-3">{e.phone ?? "—"}</td>
                <td className="p-3">
                  {e.submitted_today ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Submitted</Badge>
                  ) : (
                    <Badge className="bg-red-500/15 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" /> Missing</Badge>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">
                  {e.last_sign_in_at ? new Date(e.last_sign_in_at).toLocaleString() : "Never"}
                </td>
                <td className="p-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setResetFor({ id: e.id, name: e.full_name || e.email }); setNewPwd(""); }}>
                    <KeyRound className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (confirm(`Delete ${e.full_name || e.email}? This cannot be undone.`)) del.mutate(e.id);
                  }}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create employee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full name</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone (optional)</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Temporary password (min 8 chars)</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={() => create.mutate()} disabled={create.isPending} className="bg-gradient-gold text-primary-foreground">
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetFor} onOpenChange={(v) => !v && setResetFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset password — {resetFor?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>New temporary password</Label>
            <Input value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={() => reset.mutate()} disabled={reset.isPending || newPwd.length < 8} className="bg-gradient-gold text-primary-foreground">
              {reset.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
