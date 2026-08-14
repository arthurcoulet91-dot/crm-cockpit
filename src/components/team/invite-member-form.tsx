"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"

import { inviteTeamMember } from "@/lib/actions/team"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function InviteMemberForm() {
  const [pending, startTransition] = React.useTransition()
  const formRef = React.useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await inviteTeamMember(formData)
        toast.success("Collaborateur ajouté")
        formRef.current?.reset()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="invite-email" className="text-sm font-medium">
          Email du collaborateur
        </label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="associe@exemple.com"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        Inviter
      </Button>
    </form>
  )
}
