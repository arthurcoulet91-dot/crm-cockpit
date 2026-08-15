const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const currencyFormatterPrecise = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

export function formatCurrency(amount: number, precise = false) {
  return (precise ? currencyFormatterPrecise : currencyFormatter).format(amount)
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatDate(date: string | null | undefined) {
  if (!date) return "—"
  return dateFormatter.format(new Date(date))
}

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatDateTime(date: string | null | undefined) {
  if (!date) return "—"
  return dateTimeFormatter.format(new Date(date))
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function daysFromNowISO(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function formatRecurrence(months: number | null | undefined) {
  if (!months) return "Ponctuel"
  if (months === 1) return "Tous les mois"
  if (months === 12) return "Tous les ans"
  return `Tous les ${months} mois`
}
