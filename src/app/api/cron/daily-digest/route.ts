import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { isAuthorizedCronRequest } from "@/lib/cron-auth"
import { sendEmail } from "@/lib/email"
import { parisTodayISO } from "@/lib/paris-time"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ownerId = process.env.OWNER_USER_ID
  if (!ownerId) {
    return NextResponse.json({ error: "OWNER_USER_ID manquant" }, { status: 500 })
  }

  const supabase = createAdminClient()
  const today = parisTodayISO()

  const { data: existingLog } = await supabase
    .from("daily_digest_log")
    .select("sent_date")
    .eq("user_id", ownerId)
    .eq("sent_date", today)
    .maybeSingle()

  if (existingLog) {
    return NextResponse.json({ skipped: "already sent today" })
  }

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("title, notes, remind_time, clients(name)")
    .eq("user_id", ownerId)
    .eq("remind_date", today)
    .eq("status", "pending")
    .order("remind_time", { ascending: true, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (reminders ?? []) as unknown as {
    title: string
    notes: string | null
    remind_time: string | null
    clients: { name: string } | null
  }[]

  const calls = rows.filter((r) => r.remind_time)
  const tasks = rows.filter((r) => !r.remind_time)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://crm-cockpit-gules.vercel.app"

  const section = (title: string, items: typeof rows) =>
    items.length === 0
      ? ""
      : `<h2 style="font-size:14px;color:#666;margin:20px 0 8px">${title}</h2>
         <ul style="padding-left:18px;margin:0">
           ${items
             .map(
               (r) =>
                 `<li style="margin-bottom:6px">${r.remind_time ? `<strong>${r.remind_time.slice(0, 5)}</strong> — ` : ""}${r.title}${
                   r.clients ? ` (${r.clients.name})` : ""
                 }${r.notes ? `<br><span style="color:#888;font-size:13px">${r.notes}</span>` : ""}</li>`
             )
             .join("")}
         </ul>`

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h1 style="font-size:18px">Ta journée</h1>
      ${
        rows.length === 0
          ? `<p style="color:#666">Rien de prévu aujourd'hui dans Cockpit.</p>`
          : section("Appels à passer", calls) + section("Tâches", tasks)
      }
      <p style="margin-top:24px">
        <a href="${appUrl}/reminders" style="color:#2563eb">Voir dans Cockpit →</a>
      </p>
    </div>
  `

  await sendEmail({ subject: `Ta journée — ${rows.length} à faire`, html })

  await supabase.from("daily_digest_log").insert({ user_id: ownerId, sent_date: today })

  return NextResponse.json({ sent: true, count: rows.length })
}
