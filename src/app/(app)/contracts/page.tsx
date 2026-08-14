import { PageHeader } from "@/components/page-header"
import { ContractFormSheet } from "@/components/contracts/contract-form-sheet"
import { ContractsTable } from "@/components/contracts/contracts-table"
import { createClient } from "@/lib/supabase/server"

export default async function ContractsPage() {
  const supabase = await createClient()
  const [{ data: contracts }, { data: clients }] = await Promise.all([
    supabase
      .from("contracts")
      .select("*, clients(id, name)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
  ])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Contrats"
        description="Tous les contrats en cours, à venir et terminés."
        actions={<ContractFormSheet clients={clients ?? []} />}
      />
      <ContractsTable contracts={contracts ?? []} clients={clients ?? []} />
    </div>
  )
}
