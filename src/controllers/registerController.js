import { sendRegistrationEmail, mailConfigured } from '../services/mailService.js';
import RegistrationModel from '../models/registrationModel.js';

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class RegisterController {
  static async submit(req, res) {
    try {
      const { restaurantName, contactName, email, phone, message } = req.body || {};

      if (!restaurantName || !String(restaurantName).trim()) {
        return res.status(400).json({ error: 'Restaurant name is required' });
      }
      if (!contactName || !String(contactName).trim()) {
        return res.status(400).json({ error: 'Contact name is required' });
      }
      if (!email || !String(email).trim()) {
        return res.status(400).json({ error: 'Email is required' });
      }
      if (!emailRx.test(String(email).trim())) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      if (!phone || !String(phone).trim()) {
        return res.status(400).json({ error: 'Phone is required' });
      }
      const phoneDigits = String(phone).replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
      }

      const payload = {
        restaurantName: String(restaurantName).trim(),
        contactName: String(contactName).trim(),
        email: String(email).trim(),
        phone: phoneDigits,
        message: message != null ? String(message).trim() : '',
      };

      let insertId;
      try {
        insertId = await RegistrationModel.create(payload);
      } catch (dbErr) {
        console.error('Registration DB error:', dbErr);
        return res.status(500).json({
          error:
            'Could not save registration. Create table registration_requests (run: node scripts/ensure-registration-table.js) or check database connection.',
        });
      }

      let emailSent = false;
      let emailError = null;
      if (mailConfigured()) {
        try {
          await sendRegistrationEmail(payload);
          emailSent = true;
          await RegistrationModel.setEmailResult(insertId, true, null);
        } catch (mailErr) {
          const detail = mailErr.message || String(mailErr);
          emailError = detail.slice(0, 400);
          console.error('Registration email error:', mailErr);
          try {
            await RegistrationModel.setEmailResult(insertId, false, detail);
          } catch (uErr) {
            console.error('Failed to update email status on registration:', uErr);
          }
        }
      } else {
        console.warn('[register] SMTP not set; saved registration id:', insertId);
      }

      const messageText = emailSent
        ? 'Registration request sent successfully'
        : mailConfigured()
          ? 'Registration saved. The notification email failed—details are stored in the database.'
          : 'Registration saved. Add SMTP_USER and SMTP_PASS to send email notifications.';

      res.status(201).json({
        message: messageText,
        id: insertId,
        emailSent,
        ...(emailError ? { emailError } : {}),
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
}

export default RegisterController;
