import nodemailer from "nodemailer"

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function sendEmail({
  subject,
  html,
}: {
  subject: string
  html: string
}) {
  const to = process.env.REMINDER_EMAIL_TO
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !to) {
    throw new Error("Configuration email manquante (GMAIL_USER / GMAIL_APP_PASSWORD / REMINDER_EMAIL_TO)")
  }

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `Cockpit <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  })
}
