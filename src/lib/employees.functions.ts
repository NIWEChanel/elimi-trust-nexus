import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertSuperAdmin(ctx: { userId: string }) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  if (!data?.some((r) => r.role === "super_admin")) {
    throw new Error("Only super admin can perform this action");
  }
}

const createSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  fullName: z.string().min(1).max(120),
  phone: z.string().max(40).optional().nullable(),
});

export const createEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => createSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin({ userId: context.userId });

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error) throw new Error(error.message);
    const uid = created.user?.id;
    if (!uid) throw new Error("Failed to create user");

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: uid, role: "employee" as const }, { onConflict: "user_id,role" });
    await supabaseAdmin.from("profiles").upsert(
      { id: uid, full_name: data.fullName, phone: data.phone ?? null, must_change_password: true },
      { onConflict: "id" },
    );

    return { ok: true, userId: uid };
  });

export const listEmployees = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin({ userId: context.userId });

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "employee");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) return { employees: [] as Array<EmployeeRow> };

    const [{ data: profiles }, { data: users }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, phone, created_at").in("id", ids),
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const { data: reports } = await supabaseAdmin
      .from("employee_reports")
      .select("user_id")
      .eq("report_date", today)
      .in("user_id", ids);
    const submitted = new Set((reports ?? []).map((r) => r.user_id));

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const userMap = new Map(users?.users.map((u) => [u.id, u]) ?? []);

    const employees = ids.map((id) => {
      const p = profileMap.get(id);
      const u = userMap.get(id);
      return {
        id,
        email: u?.email ?? "",
        full_name: p?.full_name ?? "",
        phone: p?.phone ?? null,
        created_at: p?.created_at ?? u?.created_at ?? null,
        last_sign_in_at: u?.last_sign_in_at ?? null,
        submitted_today: submitted.has(id),
      };
    });

    return { employees };
  });

export type EmployeeRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  submitted_today: boolean;
};

const idSchema = z.object({ userId: z.string().uuid() });

export const deleteEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => idSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin({ userId: context.userId });
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const resetSchema = z.object({
  userId: z.string().uuid(),
  newPassword: z.string().min(8).max(72),
});

export const resetEmployeePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => resetSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin({ userId: context.userId });
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", data.userId);
    return { ok: true };
  });
