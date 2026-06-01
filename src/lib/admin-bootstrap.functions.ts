import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SUPER_EMAIL = "admin@elimitrust.com";
const SUPER_PASS = "Admin@2026";

export const bootstrapSuperAdmin = createServerFn({ method: "POST" }).handler(async () => {
  // Check if a super_admin already exists
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin")
    .limit(1);

  if (roles && roles.length > 0) return { ok: true, created: false };

  // Look up by email via admin list
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email?.toLowerCase() === SUPER_EMAIL);

  let userId: string | undefined = existing?.id;

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: SUPER_EMAIL,
      password: SUPER_PASS,
      email_confirm: true,
      user_metadata: { full_name: "Super Admin" },
    });
    if (error) throw new Error(error.message);
    userId = data.user?.id;
  }

  if (!userId) throw new Error("Failed to resolve super admin user id");

  await supabaseAdmin.from("user_roles").upsert(
    { user_id: userId, role: "super_admin" as const },
    { onConflict: "user_id,role" }
  );

  await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, full_name: "Super Admin", must_change_password: true }, { onConflict: "id" });

  return { ok: true, created: true };
});
