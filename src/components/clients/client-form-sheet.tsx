"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { createClientRecord, updateClientRecord } from "@/lib/actions/clients"
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
import type { Database } from "@/lib/supabase/types"

type ClientRow = Database["public"]["Tables"]["clients"]["Row"]

export function ClientFormSheet({ client }: { client?: ClientRow }) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const isEdit = Boolean(client)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (client) {
          await updateClientRecord(client.id, formData)
          toast.success("Client mis à jour")
        } else {
          await createClientRecord(formData)
          toast.success("Client créé")
        }
        setOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          isEdit ? (
            <Button variant="outline" size="sm" />
          ) : (
            <Button />
          )
        }
      >
        {!isEdit && <Plus />}
        {isEdit ? "Modifier" : "Nouveau client"}
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier le client" : "Nouveau client"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Mets à jour les informations de ce client."
              : "Ajoute un client professionnel ou particulier."}
          </SheetDescription>
        </SheetHeader>
        <form
          id="client-form"
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" required defaultValue={client?.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue={client?.type ?? "pro"}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">Professionnel</SelectItem>
                <SelectItem value="particulier">Particulier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Société</Label>
            <Input id="company" name="company" defaultValue={client?.company ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" defaultValue={client?.address ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={4} defaultValue={client?.notes ?? ""} />
          </div>
        </form>
        <SheetFooter className="flex-row justify-end">
          <SheetClose render={<Button variant="outline" />}>Annuler</SheetClose>
          <Button type="submit" form="client-form" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le client"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
