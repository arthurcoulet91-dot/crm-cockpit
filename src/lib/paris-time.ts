const parisDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const parisTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export function parisTodayISO(now = new Date()) {
  return parisDateFormatter.format(now)
}

export function parisNowHHMM(now = new Date()) {
  return parisTimeFormatter.format(now)
}
