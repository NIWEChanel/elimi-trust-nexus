import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/use-role";

export type EmployeeRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  submitted_today: boolean;
  local_only?: boolean;
};

type LocalEmployee = EmployeeRow & { password?: string };

const STORAGE_KEY = "elimi-local-employees";

function readLocalEmployees(): LocalEmployee[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as LocalEmployee[];
  } catch {
    return [];
  }
}

function writeLocalEmployees(rows: LocalEmployee[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export async function listEmployees(): Promise<{ employees: EmployeeRow[] }> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "employee");

  const ids = (roles ?? []).map((r) => r.user_id).filter(Boolean);
  const today = todayISO();

  if (ids.length === 0) {
    return { employees: readLocalEmployees() };
  }

  const [{ data: profiles }, { data: reports }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone, created_at").in("id", ids),
    supabase.from("employee_reports").select("user_id").eq("report_date", today).in("user_id", ids),
  ]);

  const submitted = new Set((reports ?? []).map((r) => r.user_id));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const employees = ids.map((id) => {
    const profile = profileMap.get(id);
    return {
      id,
      email: "Managed in backend auth",
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? null,
      created_at: profile?.created_at ?? null,
      last_sign_in_at: null,
      submitted_today: submitted.has(id),
    };
  });

  return { employees: [...employees, ...readLocalEmployees()] };
}

export async function createEmployee(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
}) {
  const rows = readLocalEmployees();
  rows.unshift({
    id: crypto.randomUUID(),
    email: input.email,
    full_name: input.fullName,
    phone: input.phone ?? null,
    created_at: new Date().toISOString(),
    last_sign_in_at: null,
    submitted_today: false,
    local_only: true,
    password: input.password,
  });
  writeLocalEmployees(rows);
  return { ok: true };
}

export async function deleteEmployee(input: { userId: string }) {
  writeLocalEmployees(readLocalEmployees().filter((row) => row.id !== input.userId));
  return { ok: true };
}

export async function resetEmployeePassword(input: { userId: string; newPassword: string }) {
  writeLocalEmployees(
    readLocalEmployees().map((row) =>
      row.id === input.userId ? { ...row, password: input.newPassword } : row,
    ),
  );
  return { ok: true };
}
