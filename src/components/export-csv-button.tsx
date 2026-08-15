"use client"

import * as React from "react"
import { toast } from "sonner"
import { Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ExportCsvButton({
  action,
  filename,
}: {
  action: () => Promise<string>
  filename: string
}) {
  const [pending, startTransition] = React.useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        const csv = await action()
        const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Export téléchargé")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Download />}
      Exporter CSV
    </Button>
  )
}
