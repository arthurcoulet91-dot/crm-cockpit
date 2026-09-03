"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getEffectiveOwnerId } from "@/lib/actions/team"
import type { ReminderStatus } from "@/lib/supabase/types"

function str(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

export async function createReminder(formData: FormData) {
  const supabase = await createClient()
  const ownerId = await getEffectiveOwnerId()

  const remindDate = str(formData, "remind_date")
  if (!remindDate) throw new Error("Date requise")

  const { error } = await supabase.from("reminders").insert({
    user_id: ownerId,
    title: str(formData, "title") ?? "",
    notes: str(formData, "notes"),
    client_id: str(formData, "client_id"),
    remind_date: remindDate,
    remind_time: str(formData, "remind_time"),
  })

  if (error) throw new Error(error.message)
  revalidatePath("/reminders")
  revalidatePath("/")
}

export async function updateReminder(id: string, formData: FormData) {
  const supabase = await createClient()

  const remindDate = str(formData, "remind_date")
  if (!remindDate) throw new Error("Date requise")

  const { error } = await supabase
    .from("reminders")
    .update({
      title: str(formData, "title") ?? "",
      notes: str(formData, "notes"),
      client_id: str(formData, "client_id"),
      remind_date: remindDate,
      remind_time: str(formData, "remind_time"),
      // L'heure a changé : on doit pouvoir renvoyer l'email au bon moment.
      reminder_email_sent_at: null,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/reminders")
  revalidatePath("/")
}

export async function toggleReminderStatus(id: string, status: ReminderStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from("reminders").update({ status }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/reminders")
  revalidatePath("/")
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("reminders").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/reminders")
  revalidatePath("/")
}
