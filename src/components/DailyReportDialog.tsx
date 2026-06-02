import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/use-role";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onSubmitted: () => void;
  title?: string;
  description?: string;
};

export function DailyReportDialog({ open, onOpenChange, userId, onSubmitted, title, description }: Props) {
  const [tasks, setTasks] = useState("");
  const [problems, setProblems] = useState("");
  const [notes, setNotes] = useState("");
  const [uploaded, setUploaded] = useState("0");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (tasks.trim().length < 5) {
      toast.error("Please describe the tasks you completed (min 5 chars).");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("employee_reports").insert({
      user_id: userId,
      report_date: todayISO(),
      tasks_completed: tasks.trim(),
      problems: problems.trim() || null,
      notes: notes.trim() || null,
      uploaded_count: Math.max(0, parseInt(uploaded || "0", 10) || 0),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Daily report submitted");
    setTasks(""); setProblems(""); setNotes(""); setUploaded("0");
    onSubmitted();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title ?? "Submit your daily report"}</DialogTitle>
          <DialogDescription>
            {description ?? "You must submit today's report before you can log out."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Tasks completed today *</Label>
            <Textarea rows={4} value={tasks} onChange={(e) => setTasks(e.target.value)} placeholder="What did you accomplish today?" />
          </div>
          <div>
            <Label>Challenges encountered</Label>
            <Textarea rows={3} value={problems} onChange={(e) => setProblems(e.target.value)} placeholder="Any issues or blockers?" />
          </div>
          <div>
            <Label>Progress notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional updates" />
          </div>
          <div>
            <Label>Items uploaded today</Label>
            <Input type="number" min={0} value={uploaded} onChange={(e) => setUploaded(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy} className="bg-gradient-gold text-primary-foreground">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
