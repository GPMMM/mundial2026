import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.EMAIL_FROM ?? 'Mundial 2026 <noreply@resend.dev>'

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!resend) {
    console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`)
    return
  }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your password — Mundial 2026',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your Mundial 2026 account.</p>
        <p><a href="${resetUrl}" style="background:#f59e0b;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Reset password</a></p>
        <p style="color:#999;font-size:12px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  })
}
