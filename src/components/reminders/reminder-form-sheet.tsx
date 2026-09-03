"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { createReminder, updateReminder } from "@/lib/actions/reminders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { todayISO } from "@/lib/format"
import type { Database } from "@/lib/supabase/types"

type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"]

export function ReminderFormSheet({
  reminder,
  clients,
  trigger,
}: {
  reminder?: ReminderRow
  clients: { id: string; name: string }[]
  trigger?: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const isEdit = Boolean(reminder)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (reminder) {
          await updateReminder(reminder.id, formData)
          toast.success("Rappel mis à jour")
        } else {
          await createReminder(formData)
          toast.success("Rappel créé")
        }
        setOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger ?? <Button />}>
        {!trigger && (
          <>
            <Plus />
            Nouveau rappel
          </>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier le rappel" : "Nouveau rappel"}</SheetTitle>
          <SheetDescription>
            Une tâche du jour, ou un appel à passer à une heure précise.
          </SheetDescription>
        </SheetHeader>
        <form
          id={`reminder-form-${reminder?.id ?? "new"}`}
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Ex : Rappeler Mairie Saintry"
              defaultValue={reminder?.title}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={reminder?.notes ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="remind_date">Date</Label>
              <Input
                id="remind_date"
                name="remind_date"
                type="date"
                required
                defaultValue={reminder?.remind_date ?? todayISO()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="remind_time">Heure (appel)</Label>
              <Input
                id="remind_time"
                name="remind_time"
                type="time"
                defaultValue={reminder?.remind_time?.slice(0, 5) ?? ""}
              />
              <p className="text-xs text-muted-foreground">Laisser vide si c&apos;est juste une tâche</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_id">Client lié</Label>
            <Select name="client_id" defaultValue={reminder?.client_id ?? undefined}>
              <SelectTrigger id="client_id" className="w-full">
                <SelectValue placeholder="Aucun" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <SheetFooter className="flex-row justify-end">
          <SheetClose render={<Button variant="outline" />}>Annuler</SheetClose>
          <Button type="submit" form={`reminder-form-${reminder?.id ?? "new"}`} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le rappel"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
