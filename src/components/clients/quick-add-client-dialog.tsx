"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"

import { createQuickClient } from "@/lib/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function QuickAddClientDialog({
  onCreated,
}: {
  onCreated: (client: { id: string; name: string }) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Dialog is a portal but still bubbles as a React synthetic event through
    // the component tree — stop it so it doesn't also submit the contract form.
    e.stopPropagation()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const client = await createQuickClient(formData)
        toast.success("Client créé")
        onCreated(client)
        setOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="icon-sm" aria-label="Nouveau client" />}>
        <UserPlus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
          <DialogDescription>
            Création rapide — tu pourras compléter la fiche plus tard.
          </DialogDescription>
        </DialogHeader>
        <form id="quick-client-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="quick-client-name">Nom</Label>
            <Input id="quick-client-name" name="name" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quick-client-type">Type</Label>
            <Select name="type" defaultValue="particulier">
              <SelectTrigger id="quick-client-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="particulier">Particulier</SelectItem>
                <SelectItem value="pro">Professionnel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quick-client-email">Email</Label>
              <Input id="quick-client-email" name="email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quick-client-phone">Téléphone</Label>
              <Input id="quick-client-phone" name="phone" />
            </div>
          </div>
        </form>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Annuler</DialogClose>
          <Button type="submit" form="quick-client-form" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
