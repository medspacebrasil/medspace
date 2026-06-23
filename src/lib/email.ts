import "server-only"
import nodemailer from "nodemailer"

/**
 * Envio de e-mail transacional via SMTP (Hostinger).
 *
 * Configuração por variáveis de ambiente:
 *   SMTP_HOST   — ex.: smtp.hostinger.com
 *   SMTP_PORT   — ex.: 465 (SSL) ou 587 (STARTTLS)
 *   SMTP_USER   — ex.: contato@medspacebrasil.com.br
 *   SMTP_PASS   — senha da caixa
 *   EMAIL_FROM  — opcional; padrão: "MedSpace <SMTP_USER>"
 *
 * Se as variáveis não estiverem configuradas, o envio é ignorado de forma
 * graciosa (fora de produção, o conteúdo é logado para facilitar o teste).
 */

function getTransport() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null

  const port = Number(process.env.SMTP_PORT) || 465
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL; 587 = STARTTLS
    auth: { user, pass },
  })
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || `MedSpace <${process.env.SMTP_USER}>`
}

export type SendResult = { sent: boolean }

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<SendResult> {
  const transport = getTransport()
  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] SMTP não configurado. E-mail NÃO enviado para ${options.to}.\n` +
          `Assunto: ${options.subject}\n${options.text}`
      )
    } else {
      console.warn("[email] SMTP não configurado — e-mail não enviado.")
    }
    return { sent: false }
  }

  await transport.sendMail({
    from: fromAddress(),
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  })
  return { sent: true }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<SendResult> {
  const subject = "Redefinição de senha — MedSpace"
  const text =
    `Recebemos um pedido para redefinir a senha da sua conta MedSpace.\n\n` +
    `Acesse o link abaixo para criar uma nova senha (válido por 1 hora):\n${resetUrl}\n\n` +
    `Se você não solicitou, ignore este e-mail — sua senha continua a mesma.`
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#1a1a18">
      <div style="background:#0e1c36;padding:24px;border-radius:8px 8px 0 0;text-align:center">
        <span style="color:#c9a84c;font-size:20px;font-weight:700;letter-spacing:.5px">MedSpace</span>
      </div>
      <div style="border:1px solid #e5e1d3;border-top:none;padding:24px;border-radius:0 0 8px 8px">
        <h1 style="font-size:18px;margin:0 0 12px">Redefinição de senha</h1>
        <p style="font-size:14px;line-height:1.6;color:#444">
          Recebemos um pedido para redefinir a senha da sua conta. Clique no botão
          abaixo para criar uma nova senha. O link é válido por 1 hora.
        </p>
        <p style="text-align:center;margin:24px 0">
          <a href="${resetUrl}" style="background:#c9a84c;color:#0e1c36;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:6px;display:inline-block">
            Criar nova senha
          </a>
        </p>
        <p style="font-size:12px;line-height:1.6;color:#888">
          Se o botão não funcionar, copie e cole este endereço no navegador:<br/>
          <a href="${resetUrl}" style="color:#0c447c;word-break:break-all">${resetUrl}</a>
        </p>
        <p style="font-size:12px;line-height:1.6;color:#888;border-top:1px solid #e5e1d3;padding-top:12px;margin-top:16px">
          Se você não solicitou esta redefinição, ignore este e-mail — sua senha
          continua a mesma.
        </p>
      </div>
    </div>`
  return sendEmail({ to, subject, html, text })
}
