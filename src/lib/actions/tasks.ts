"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { TaskPriority, TaskStatus } from "@/lib/supabase/types"

function str(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title: str(formData, "title") ?? "",
    description: str(formData, "description"),
    due_date: str(formData, "due_date"),
    priority: (str(formData, "priority") ?? "medium") as TaskPriority,
    client_id: str(formData, "client_id"),
  })

  if (error) throw new Error(error.message)
  revalidatePath("/tasks")
  revalidatePath("/")
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tasks")
    .update({
      title: str(formData, "title") ?? "",
      description: str(formData, "description"),
      due_date: str(formData, "due_date"),
      priority: (str(formData, "priority") ?? "medium") as TaskPriority,
      client_id: str(formData, "client_id"),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/tasks")
  revalidatePath("/")
}

export async function toggleTaskStatus(id: string, status: TaskStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/tasks")
  revalidatePath("/")
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/tasks")
  revalidatePath("/")
}
