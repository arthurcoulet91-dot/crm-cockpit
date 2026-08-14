"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteConfirmButton({
  itemLabel,
  onDelete,
  redirectTo,
}: {
  itemLabel: string
  onDelete: () => Promise<void>
  redirectTo?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await onDelete()
        toast.success("Supprimé")
        setOpen(false)
        if (redirectTo) window.location.href = redirectTo
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label="Supprimer"
          />
        }
      >
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer {itemLabel} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
