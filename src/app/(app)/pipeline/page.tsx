import { PageHeader } from "@/components/page-header"
import { OpportunityFormSheet } from "@/components/pipeline/opportunity-form-sheet"
import { PipelineBoard } from "@/components/pipeline/pipeline-board"
import { createClient } from "@/lib/supabase/server"

export default async function PipelinePage() {
  const supabase = await createClient()
  const [{ data: opportunities }, { data: clients }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*, clients(id, name)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
  ])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Pipeline"
        description="Suivi de gestion et de livraison — de la proposition envoyée au renouvellement."
        actions={<OpportunityFormSheet clients={clients ?? []} />}
      />
      <PipelineBoard opportunities={opportunities ?? []} clients={clients ?? []} />
    </div>
  )
}
