import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  ContractStatus,
  OpportunityStage,
  TaskStatus,
  TaskPriority,
} from "@/lib/supabase/types"

const contractStatusLabels: Record<ContractStatus, string> = {
  draft: "Brouillon",
  active: "Actif",
  completed: "Terminé",
  cancelled: "Annulé",
}

const contractStatusClasses: Record<ContractStatus, string> = {
  draft: "border-border text-muted-foreground",
  active: "border-transparent bg-success/15 text-success",
  completed: "border-transparent bg-muted text-foreground",
  cancelled: "border-transparent bg-destructive/10 text-destructive",
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return (
    <Badge variant="outline" className={cn(contractStatusClasses[status])}>
      {contractStatusLabels[status]}
    </Badge>
  )
}

const stageLabels: Record<OpportunityStage, string> = {
  proposal_sent: "Proposition envoyée",
  negotiation: "Négociation",
  contract_signed: "Contrat signé",
  in_progress: "En cours",
  renewal: "Renouvellement",
  lost: "Perdu",
}

export function stageLabel(stage: OpportunityStage) {
  return stageLabels[stage]
}

const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminé",
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const classes: Record<TaskStatus, string> = {
    todo: "border-border text-muted-foreground",
    in_progress: "border-transparent bg-warning/15 text-warning",
    done: "border-transparent bg-success/15 text-success",
  }
  return (
    <Badge variant="outline" className={cn(classes[status])}>
      {taskStatusLabels[status]}
    </Badge>
  )
}

const priorityLabels: Record<TaskPriority, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const classes: Record<TaskPriority, string> = {
    low: "border-border text-muted-foreground",
    medium: "border-transparent bg-warning/15 text-warning",
    high: "border-transparent bg-destructive/10 text-destructive",
  }
  return (
    <Badge variant="outline" className={cn(classes[priority])}>
      {priorityLabels[priority]}
    </Badge>
  )
}
