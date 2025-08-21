import type { WelcomeEmailData, PasswordResetEmailData, EmailTemplate } from '../types/userManagement'

export class EmailService {
  private readonly companyName = 'Kanban Project Manager'
  private readonly supportEmail = 'support@kanbanpm.com'
  private readonly fromEmail = 'noreply@kanbanpm.com'

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const template = this.getWelcomeEmailTemplate(data)
      console.log('📧 Welcome Email Preview:')
      console.log('To:', data.user_email)
      console.log('Subject:', template.subject)
      console.log('─'.repeat(50))
      console.log(template.text_body)
      console.log('─'.repeat(50))
      
      // In production, this would integrate with email service (SendGrid, SES, etc.)
      // await this.sendEmail(data.user_email, template.subject, template.html_body, template.text_body)
      
      return true
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      return false
    }
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    try {
      const template = this.getPasswordResetEmailTemplate(data)
      console.log('📧 Password Reset Email Preview:')
      console.log('To:', data.user_name)
      console.log('Subject:', template.subject)
      console.log('─'.repeat(50))
      console.log(template.text_body)
      console.log('─'.repeat(50))
      
      // In production, this would integrate with email service
      return true
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      return false
    }
  }

  private getWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
    const subject = `Welcome to ${data.company_name}!`
    
    const text_body = `
Welcome to ${data.company_name}, ${data.user_name}!

Your account has been created successfully. Here are your login details:

Email: ${data.user_email}
Temporary Password: ${data.temp_password}

For your security, you will be required to change this password when you first log in.

Login here: ${data.login_url}

Important Security Notes:
• Your temporary password will expire in 7 days
• Please change your password immediately after logging in
• Do not share your login credentials with anyone
• If you have any issues accessing your account, contact support

Get Started:
1. Click the login link above
2. Enter your email and temporary password
3. Follow the prompts to set your new password
4. Complete your profile setup

If you need help getting started, our support team is here to assist you.

Best regards,
The ${data.company_name} Team

Support: ${this.supportEmail}
Login: ${data.login_url}

This email was sent to ${data.user_email}. If you did not expect this email, please contact support immediately.
    `.trim()

    const html_body = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .credentials { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .security-note { background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .steps { background-color: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ${data.company_name}!</h1>
        </div>
        
        <div class="content">
            <p>Hello ${data.user_name},</p>
            
            <p>Your account has been created successfully! We're excited to have you join our team.</p>
            
            <div class="credentials">
                <h3>Your Login Credentials</h3>
                <p><strong>Email:</strong> ${data.user_email}</p>
                <p><strong>Temporary Password:</strong> <code>${data.temp_password}</code></p>
            </div>
            
            <div class="security-note">
                <h4>🔒 Important Security Information</h4>
                <ul>
                    <li>You will be required to change this password when you first log in</li>
                    <li>Your temporary password will expire in 7 days</li>
                    <li>Never share your login credentials with anyone</li>
                </ul>
            </div>
            
            <p style="text-align: center;">
                <a href="${data.login_url}" class="button">Login to Your Account</a>
            </p>
            
            <div class="steps">
                <h4>Getting Started:</h4>
                <ol>
                    <li>Click the login button above</li>
                    <li>Enter your email and temporary password</li>
                    <li>Follow the prompts to set your new password</li>
                    <li>Complete your profile setup</li>
                </ol>
            </div>
            
            <p>If you need any assistance getting started, our support team is here to help.</p>
            
            <p>Best regards,<br>The ${data.company_name} Team</p>
        </div>
        
        <div class="footer">
            <p>Support: <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
            <p>This email was sent to ${data.user_email}</p>
            <p>If you did not expect this email, please contact support immediately.</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    return {
      subject,
      html_body,
      text_body,
      variables: {
        user_name: data.user_name,
        user_email: data.user_email,
        temp_password: data.temp_password,
        login_url: data.login_url,
        company_name: data.company_name
      }
    }
  }

  private getPasswordResetEmailTemplate(data: PasswordResetEmailData): EmailTemplate {
    const subject = 'Reset Your Password'
    
    const text_body = `
Password Reset Request

Hello ${data.user_name},

We received a request to reset your password for your ${data.company_name} account.

If you made this request, click the link below to reset your password:
${data.reset_url}

This link will expire in ${data.expires_in_hours} hour${data.expires_in_hours !== 1 ? 's' : ''}.

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

For security reasons:
• This link can only be used once
• The link will expire after ${data.expires_in_hours} hour${data.expires_in_hours !== 1 ? 's' : ''}
• If you need a new reset link, you can request one from the login page

If you continue to have problems, please contact our support team.

Best regards,
The ${data.company_name} Team

Support: ${this.supportEmail}

This email was sent because a password reset was requested for your account. If you did not make this request, please contact support immediately.
    `.trim()

    const html_body = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .security-note { background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .warning { background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        
        <div class="content">
            <p>Hello ${data.user_name},</p>
            
            <p>We received a request to reset your password for your ${data.company_name} account.</p>
            
            <p>If you made this request, click the button below to reset your password:</p>
            
            <p style="text-align: center;">
                <a href="${data.reset_url}" class="button">Reset Your Password</a>
            </p>
            
            <div class="security-note">
                <h4>🔒 Security Information</h4>
                <ul>
                    <li>This link will expire in ${data.expires_in_hours} hour${data.expires_in_hours !== 1 ? 's' : ''}</li>
                    <li>The link can only be used once</li>
                    <li>If you need a new reset link, request one from the login page</li>
                </ul>
            </div>
            
            <div class="warning">
                <h4>⚠️ Didn't Request This?</h4>
                <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>If you're concerned about unauthorized access, please contact our support team immediately.</p>
            </div>
            
            <p>If you continue to have problems, please contact our support team.</p>
            
            <p>Best regards,<br>The ${data.company_name} Team</p>
        </div>
        
        <div class="footer">
            <p>Support: <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
            <p>This email was sent because a password reset was requested for your account.</p>
            <p>If you did not make this request, please contact support immediately.</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    return {
      subject,
      html_body,
      text_body,
      variables: {
        user_name: data.user_name,
        reset_url: data.reset_url,
        expires_in_hours: data.expires_in_hours.toString(),
        company_name: data.company_name
      }
    }
  }

  // Additional email templates can be added here
  async sendRoleChangeNotification(userEmail: string, userName: string, oldRole: string, newRole: string): Promise<boolean> {
    try {
      console.log('📧 Role Change Notification:')
      console.log(`To: ${userEmail}`)
      console.log(`Subject: Your Role Has Been Updated`)
      console.log('─'.repeat(50))
      console.log(`Hello ${userName},`)
      console.log(`Your role has been changed from "${oldRole}" to "${newRole}".`)
      console.log(`This change will take effect immediately.`)
      console.log(`If you have questions about this change, please contact your administrator.`)
      console.log('─'.repeat(50))
      
      return true
    } catch (error) {
      console.error('Failed to send role change notification:', error)
      return false
    }
  }

  async sendAccountActivationNotification(userEmail: string, userName: string): Promise<boolean> {
    try {
      console.log('📧 Account Activation Notification:')
      console.log(`To: ${userEmail}`)
      console.log(`Subject: Your Account Has Been Activated`)
      console.log('─'.repeat(50))
      console.log(`Hello ${userName},`)
      console.log(`Your account has been activated and you can now access the system.`)
      console.log(`If you have any questions, please contact support.`)
      console.log('─'.repeat(50))
      
      return true
    } catch (error) {
      console.error('Failed to send activation notification:', error)
      return false
    }
  }

  async sendAccountDeactivationNotification(userEmail: string, userName: string): Promise<boolean> {
    try {
      console.log('📧 Account Deactivation Notification:')
      console.log(`To: ${userEmail}`)
      console.log(`Subject: Your Account Has Been Deactivated`)
      console.log('─'.repeat(50))
      console.log(`Hello ${userName},`)
      console.log(`Your account has been deactivated.`)
      console.log(`If you believe this is an error, please contact your administrator.`)
      console.log('─'.repeat(50))
      
      return true
    } catch (error) {
      console.error('Failed to send deactivation notification:', error)
      return false
    }
  }

  // For testing purposes - preview email in browser
  previewEmail(template: EmailTemplate): void {
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(template.html_body)
      previewWindow.document.close()
    }
  }
}

export const emailService = new EmailService()