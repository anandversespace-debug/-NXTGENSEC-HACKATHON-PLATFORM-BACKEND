const getBaseTemplate = (content, headerTitle) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${headerTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
      color: #111827;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    .header {
      background-color: #050505;
      padding: 30px 40px;
      text-align: center;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      letter-spacing: -0.5px;
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 40px 50px;
    }
    .content h2 {
      margin-top: 0;
      font-size: 20px;
      color: #111827;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 15px;
      color: #4b5563;
      margin-bottom: 24px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    .muted-text {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 0;
    }
    .footer {
      padding: 30px 40px;
      background-color: #f3f4f6;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
    }
    .link {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>NxtGenSec</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated security message from NxtGenSec.</p>
      <p>&copy; ${new Date().getFullYear()} NxtGenSec Framework. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  getVerificationTemplate: (actionLink, name) => getBaseTemplate(`
    <h2>Verify Your Identity</h2>
    <p>Hi ${name || 'Developer'},</p>
    <p>Welcome to NxtGenSec. We are excited to have you join our decentralized security ecosystem.</p>
    <p>Before you can fully access the platform and submit projects, we need to quickly verify your email address to secure your account node.</p>
    <div class="button-container">
      <a href="${actionLink}" class="btn">Verify Email Address</a>
    </div>
    <p class="muted-text">If you did not create an account on NxtGenSec, please ignore this email. The authorization link will securely expire in 24 hours.</p>
  `, 'Email Verification'),

  getForgotPasswordTemplate: (actionLink, name) => getBaseTemplate(`
    <h2>Reset Your Credentials</h2>
    <p>Hi ${name || 'Developer'},</p>
    <p>We received a secure request to reset the password for your NxtGenSec platform account.</p>
    <p>Click the button below to authenticate your request and securely establish your new password.</p>
    <div class="button-container">
      <a href="${actionLink}" class="btn">Reset Password</a>
    </div>
    <p class="muted-text">If you didn't initiate this request, you do not need to take any action and your credentials remain safe.</p>
  `, 'Password Reset Request'),

  getInvitationTemplate: (actionLink, role) => getBaseTemplate(`
    <h2>Admin Invitation - NxtGenSec</h2>
    <p>Hello,</p>
    <p>An administrator has formally invited you to join the NxtGenSec network with the authorization role of: <strong>${(role || 'Developer').toUpperCase()}</strong>.</p>
    <p>By accepting this invitation, you will gain immediate access to the internal ecosystem suited to your security clearance level.</p>
    <div class="button-container">
      <a href="${actionLink}" class="btn">Accept Secure Invitation</a>
    </div>
    <p class="muted-text">This invitation token is cryptographically bound to you. Do not share this email or its contents with anyone.</p>
  `, 'Platform Invitation')
};
