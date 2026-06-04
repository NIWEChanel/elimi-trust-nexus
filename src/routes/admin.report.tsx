import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Plus, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentRole, todayISO } from "@/lib/use-role";
import { DailyReportDialog } from "@/components/DailyReportDialog";

export function EmployeeReportPage() {
  const { userId } = useCurrentRole();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: history } = useQuery({
    queryKey: ["my-reports", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_reports")
        .select("*")
        .eq("user_id", userId!)
        .order("report_date", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });

  const submittedToday = history?.some((r) => r.report_date === todayISO());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Daily Report</h1>
          <p className="text-muted-foreground">Submit and review your daily progress.</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={submittedToday}
          className="bg-gradient-gold text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          {submittedToday ? "Today submitted" : "Submit today's report"}
        </Button>
      </div>

      {submittedToday && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-sm">You've submitted today's report. You're free to log out.</div>
        </div>
      )}

      <h2 className="font-semibold mb-3">Submission history</h2>
      <div className="space-y-3">
        {(history ?? []).length === 0 && (
          <div className="rounded-xl bg-card hairline p-8 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /> No reports yet.
          </div>
        )}
        {history?.map((r) => (
          <div key={r.id} className="rounded-xl bg-card hairline p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{r.report_date}</div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Submitted</Badge>
            </div>
            <div className="text-sm space-y-2">
              <div><span className="text-gold text-xs uppercase tracking-wider">Tasks: </span>{r.tasks_completed}</div>
              {r.problems && <div><span className="text-gold text-xs uppercase tracking-wider">Challenges: </span>{r.problems}</div>}
              {r.notes && <div><span className="text-gold text-xs uppercase tracking-wider">Notes: </span>{r.notes}</div>}
              <div className="text-xs text-muted-foreground">{r.uploaded_count} items uploaded</div>
            </div>
          </div>
        ))}
      </div>

      {userId && (
        <DailyReportDialog
          open={open}
          onOpenChange={setOpen}
          userId={userId}
          onSubmitted={() => {
            setOpen(false);
            qc.invalidateQueries({ queryKey: ["my-reports", userId] });
          }}
          title="Submit today's daily report"
          description="Your report will be sent immediately to the Super Admin."
        />
      )}
    </div>
  );
}
