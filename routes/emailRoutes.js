const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/nodemailer');
const { User } = require('../models');

// 1. Contact Form Handler (Public)
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    // Send email to admin
    await sendEmail(
      process.env.EMAIL_FROM || 'admin@nxtgensec.com', 
      `New Contact Message from ${name} (${email})`, 
      `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563EB;">New Incoming Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message}</p>
      </div>
      `
    );

    // Optional: Send auto-reply to the user
    await sendEmail(
      email,
      'We received your message - NxtGenSec',
      `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563EB;">Hello ${name},</h2>
        <p>We have successfully received your message and will get back to you shortly.</p>
        <p>For urgent security matters, please check our documentation or security guidelines.</p>
        <br/>
        <p>Best Regards,</p>
        <p>The NxtGenSec Team</p>
      </div>
      `
    );

    res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact Email Error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// 2. Broadcast Notifications Handler (Admin Only)
router.post('/broadcast', async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    const { target, type, message } = req.body;

    if (!message || !target) {
      return res.status(400).json({ error: 'Target and message are required.' });
    }

    // Determine target users from MongoDB
    let filter = {};
    if (target === 'developers') {
       filter = { role: 'developer' };
    } else if (target === 'judges') {
       filter = { role: 'judge' };
    }

    const users = await User.find(filter).select('email role name');

    if (!users || users.length === 0) {
       return res.status(404).json({ error: 'No users found in the selected target group.' });
    }

    // Batch send emails (In a prod environment you'd use a queue system)
    const emailPromises = users.map(u => {
       if(!u.email) return Promise.resolve(null);
       
       const severityColor = type === 'urgent' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#2563EB';

       return sendEmail(
         u.email,
         `[${type.toUpperCase()}] NxtGenSec System Broadcast`,
         `
         <div style="font-family: monospace, Arial, sans-serif; padding: 30px; background-color: #050505; color: #fff; border: 1px solid #333; border-radius: 8px;">
            <div style="margin-bottom: 20px;">
               <span style="background-color: ${severityColor}22; border: 1px solid ${severityColor}55; color: ${severityColor}; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
                 ${type} Broadcast
               </span>
            </div>
            
            <h2 style="margin-bottom: 5px;">Hello ${u.name},</h2>
            <p style="color: #aaa; font-size: 12px; text-transform: uppercase;">System notification for your role: ${u.role}</p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #0c0c0c; border: 1px solid #1a1a1a; border-radius: 6px; color: #ddd; font-size: 14px; line-height: 1.6;">
               ${message.replace(/\n/g, '<br/>')}
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #222; text-align: center; color: #666; font-size: 10px; text-transform: uppercase;">
               <p>This is an automated system broadcast from the NxtGenSec Network.</p>
               <p>&copy; ${new Date().getFullYear()} NxtGenSec Security Framework.</p>
            </div>
         </div>
         `
       ).catch(err => {
          console.error(`Failed to send email to ${u.email}:`, err);
       });
    });

    await Promise.all(emailPromises);

    res.status(200).json({ success: true, count: users.length, message: 'Broadcast transmission completed successfully.' });
  } catch (error) {
    console.error('Broadcast Email Error:', error);
    res.status(500).json({ error: 'Failed to complete broadcast.' });
  }
});

const { getVerificationTemplate, getForgotPasswordTemplate, getInvitationTemplate } = require('../utils/emailTemplates');

// 3. User Verification Email Generator (Triggers Welcome)
router.post('/verify', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Without the SUPABASE_SERVICE_ROLE_KEY, we cannot use auth.admin methods.
    // Instead, we dispatch the functional Node-mailer template linking directly to our application.
    const actionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=true`;
    
    await sendEmail(email, 'Email Verification - NxtGenSec', getVerificationTemplate(actionLink, name));

    res.status(200).json({ success: true, message: 'Verification email dispatched via Nodemailer.' });
  } catch (error) {
    console.error('Verification Email Error:', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch verification email.' });
  }
});

// 4. Forgot Password Recovery Link Generator
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Direct user to a reset page on the frontend
    const actionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?email=${encodeURIComponent(email)}`;
    
    await sendEmail(email, 'Password Reset Request - NxtGenSec', getForgotPasswordTemplate(actionLink, ''));

    res.status(200).json({ success: true, message: 'Password recovery email dispatched via Nodemailer.' });
  } catch (error) {
    console.error('Forgot Password Email Error:', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch recovery email.' });
  }
});

// 5. Admin User Invitation System
router.post('/invite', async (req, res) => {
  try {
    // Only allow admins
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Redirect the invited user directly to sign up with their assigned role
    const actionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup?invite=${encodeURIComponent(email)}&role=${role || 'developer'}`;
    
    await sendEmail(email, 'Platform Invitation - NxtGenSec', getInvitationTemplate(actionLink, role));

    res.status(200).json({ success: true, message: 'Admin invitation dispatched via Nodemailer successfully.' });
  } catch (error) {
    console.error('Invitation Email Error:', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch invitation email.' });
  }
});

module.exports = router;
