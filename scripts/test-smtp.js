/**
 * Prints SMTP verify errors. Run: npm run test:smtp
 * Reads EMAIL_* first, then SMTP_* (same as mailService).
 */
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const user = String(process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
const pass = String(process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
const host = String(process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
const secure = process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true';

if (!user || !pass) {
  console.error('Set EMAIL_USER and EMAIL_PASS (or SMTP_USER / SMTP_PASS) in .env');
  process.exit(1);
}

const useGmailService =
  host === 'smtp.gmail.com' && (user.endsWith('@gmail.com') || user.endsWith('@googlemail.com'));

const transporter = useGmailService
  ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  : nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: port === 587 && !secure,
      auth: { user, pass },
    });

try {
  await transporter.verify();
  console.log('SMTP verify: OK');
} catch (e) {
  console.error('SMTP verify failed:', e.message || e);
  console.error('\nGmail checklist:');
  console.error('  1. Google Account → Security → 2-Step Verification ON');
  console.error('  2. App passwords → 16-char password (no spaces in .env)');
  console.error('  3. EMAIL_USER must be the full Gmail that owns the app password');
  console.error(
    '\nIf From is a custom domain, add it under Gmail → Settings → Accounts → Send mail as (verified).'
  );
  process.exit(1);
}
