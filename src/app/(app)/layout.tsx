import { AppShell } from "@/components/app-shell"
import { createClient } from "@/lib/supabase/server"

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <AppShell userEmail={user?.email ?? null}>{children}</AppShell>
}
