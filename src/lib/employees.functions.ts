import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const createEmployeeSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  fullName: z.string().min(1).max(120),
});

export const createEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createEmployeeSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Verify caller is super_admin
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isSuper = roles?.some((r) => r.role === "super_admin");
    if (!isSuper) throw new Error("Only super admin can create employees");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error) throw new Error(error.message);
    const uid = created.user?.id;
    if (!uid) throw new Error("Failed to create user");

    await supabaseAdmin.from("user_roles").upsert(
      { user_id: uid, role: "employee" as const },
      { onConflict: "user_id,role" }
    );
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: uid, full_name: data.fullName, must_change_password: true }, { onConflict: "id" });

    return { ok: true, userId: uid };
  });
