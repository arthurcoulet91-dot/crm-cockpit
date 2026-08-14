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
