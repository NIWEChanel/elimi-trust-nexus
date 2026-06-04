import { useAsyncData } from "@/lib/use-async";
import { useMemo, useState } from "react";
import { Download, FileText, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { listEmployees } from "@/lib/employees.client";

type Report = {
  id: string;
  user_id: string;
  report_date: string;
  tasks_completed: string;
  problems: string | null;
  notes: string | null;
  uploaded_count: number;
  created_at: string;
};

export function AdminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const ago = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(ago);
  const [to, setTo] = useState(today);
  const [employee, setEmployee] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "submitted" | "missing">("all");

  const { data: empData } = useAsyncData(() => listEmployees(), []);
  const employees = empData?.employees ?? [];

  const { data: reports } = useAsyncData(async () => {
      let q = supabase
        .from("employee_reports")
        .select("*")
        .gte("report_date", from)
        .lte("report_date", to)
        .order("report_date", { ascending: false });
      if (employee !== "all") q = q.eq("user_id", employee);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Report[];
    };
  }, [from, to, employee]);

  const empMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);

  const missingToday = employees.filter((e) => !e.submitted_today);

  const filteredReports = useMemo(() => {
    if (status === "missing") return [];
    return reports ?? [];
  }, [reports, status]);

  function exportCsv() {
    const rows = [
      ["Date", "Employee", "Email", "Tasks", "Challenges", "Notes", "Uploaded"],
      ...(filteredReports.map((r) => {
        const e = empMap.get(r.user_id);
        return [
          r.report_date,
          e?.full_name ?? "",
          e?.email ?? "",
          r.tasks_completed.replace(/\n/g, " "),
          (r.problems ?? "").replace(/\n/g, " "),
          (r.notes ?? "").replace(/\n/g, " "),
          String(r.uploaded_count),
        ];
      })),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elimi-reports-${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Daily reports from your team.</p>
        </div>
        <Button onClick={exportCsv} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div>
          <Label>Employee</Label>
          <Select value={employee} onValueChange={setEmployee}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.full_name || e.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>View</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "all" | "submitted" | "missing")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All submitted reports</SelectItem>
              <SelectItem value="submitted">Submitted reports</SelectItem>
              <SelectItem value="missing">Missing today's report</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {status === "missing" ? (
        <div className="rounded-xl bg-card hairline p-4">
          <h2 className="font-semibold mb-3">Employees missing today's report</h2>
          {missingToday.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everyone has submitted today. </p>
          ) : (
            <ul className="space-y-2">
              {missingToday.map((e) => (
                <li key={e.id} className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span>{e.full_name || e.email}</span>
                  <Badge className="bg-red-500/15 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" /> Missing</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.length === 0 && (
            <div className="rounded-xl bg-card hairline p-8 text-center text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /> No reports in this range.
            </div>
          )}
          {filteredReports.map((r) => {
            const e = empMap.get(r.user_id);
            return (
              <div key={r.id} className="rounded-xl bg-card hairline p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{e?.full_name || e?.email || r.user_id}</div>
                    <div className="text-xs text-muted-foreground">{r.report_date} · {r.uploaded_count} items uploaded</div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Submitted</Badge>
                </div>
                <div className="text-sm space-y-2">
                  <div><span className="text-gold text-xs uppercase tracking-wider">Tasks: </span>{r.tasks_completed}</div>
                  {r.problems && <div><span className="text-gold text-xs uppercase tracking-wider">Challenges: </span>{r.problems}</div>}
                  {r.notes && <div><span className="text-gold text-xs uppercase tracking-wider">Notes: </span>{r.notes}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
