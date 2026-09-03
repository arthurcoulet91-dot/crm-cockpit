import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { isAuthorizedCronRequest } from "@/lib/cron-auth"
import { sendEmail } from "@/lib/email"
import { parisNowHHMM, parisTodayISO } from "@/lib/paris-time"

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
  const nowHHMM = parisNowHHMM()

  const { data: due, error } = await supabase
    .from("reminders")
    .select("id, title, notes, remind_time, clients(name)")
    .eq("user_id", ownerId)
    .eq("remind_date", today)
    .eq("status", "pending")
    .not("remind_time", "is", null)
    .is("reminder_email_sent_at", null)
    .lte("remind_time", `${nowHHMM}:59`)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (due ?? []) as unknown as {
    id: string
    title: string
    notes: string | null
    remind_time: string | null
    clients: { name: string } | null
  }[]

  for (const r of rows) {
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h1 style="font-size:18px">Rappel : ${r.title}${r.clients ? ` — ${r.clients.name}` : ""}</h1>
        <p style="color:#666">Prévu à ${r.remind_time?.slice(0, 5)}</p>
        ${r.notes ? `<p>${r.notes}</p>` : ""}
      </div>
    `
    await sendEmail({ subject: `Rappel : ${r.title}`, html })
    await supabase
      .from("reminders")
      .update({ reminder_email_sent_at: new Date().toISOString() })
      .eq("id", r.id)
  }

  return NextResponse.json({ sent: rows.length })
}
