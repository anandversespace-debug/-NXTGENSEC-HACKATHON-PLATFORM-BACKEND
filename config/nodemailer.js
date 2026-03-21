const nodemailer = require('nodemailer');

// @ts-ignore - Nodemailer types can be tricky for IDEs on version 8.x
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // Port 465 uses SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'NxtGenSec'}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log('[SYS] Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('[ERR] Email failed:', error);
    throw error;
  }
};

module.exports = { transporter, sendEmail };
