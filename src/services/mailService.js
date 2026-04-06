import nodemailer from 'nodemailer';

const DEFAULT_TO = 'buildnexdev@gmail.com';

/** Prefer EMAIL_* (see .env); fall back to SMTP_* */
function mailUser() {
  return String(process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
}

function mailPass() {
  const raw = String(process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
  // Gmail shows app passwords as four groups; pasted spaces break login
  return raw.replace(/\s/g, '');
}

function mailHost() {
  return String(process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
}

function mailPort() {
  return Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
}

function mailSecure() {
  return process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true';
}

function fromHeader() {
  const address = String(
    process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_FROM || mailUser() || ''
  ).trim();
  const name = String(process.env.EMAIL_FROM_NAME || 'QR Order').trim();
  if (!address) return null;
  return `"${name.replace(/"/g, '')}" <${address}>`;
}

function isConfigured() {
  return Boolean(mailUser() && mailPass());
}

export function mailConfigured() {
  return isConfigured();
}

/**
 * Sends registration request email.
 * Configure EMAIL_USER + EMAIL_PASS (or SMTP_*) and optional EMAIL_FROM_* in .env.
 */
export async function sendRegistrationEmail({ restaurantName, contactName, email, phone, message }) {
  const to = process.env.REGISTRATION_EMAIL_TO || DEFAULT_TO;

  if (!isConfigured()) {
    const err = new Error(
      'Email is not configured. Set EMAIL_USER and EMAIL_PASS in qr-backend/.env (see .env.example).'
    );
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }

  const user = mailUser();
  const pass = mailPass();
  const host = mailHost();
  const port = mailPort();
  const from = fromHeader() || `"QR Order" <${user}>`;

  const useGmailService =
    host === 'smtp.gmail.com' && (user.endsWith('@gmail.com') || user.endsWith('@googlemail.com'));

  const transporter = useGmailService
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      })
    : nodemailer.createTransport({
        host,
        port,
        secure: mailSecure(),
        requireTLS: port === 587 && !mailSecure(),
        auth: { user, pass },
      });

  const lines = [
    'New QR Order admin registration request',
    '',
    `Restaurant / business: ${restaurantName}`,
    `Contact name: ${contactName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    '',
    message ? `Notes:\n${message}` : 'Notes: (none)',
    '',
    `— Sent from QR Order registration form`,
  ];

  const html = `
    <h2 style="font-family:system-ui,sans-serif;">New QR Order registration</h2>
    <table style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;">
      <tr><td><strong>Restaurant</strong></td><td>${escapeHtml(restaurantName)}</td></tr>
      <tr><td><strong>Contact</strong></td><td>${escapeHtml(contactName)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
    </table>
    ${message ? `<p><strong>Notes</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>` : ''}
  `;

  await transporter.sendMail({
    from,
    to,
    replyTo: email,
    subject: `[QR Order] Registration: ${restaurantName}`,
    text: lines.join('\n'),
    html,
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
