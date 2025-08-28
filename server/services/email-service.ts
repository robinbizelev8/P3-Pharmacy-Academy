import nodemailer from 'nodemailer';

export interface EmailConfig {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface ResetPasswordEmailData {
  email: string;
  token: string;
  userName?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter() {
    try {
      // Check for email configuration
      const emailConfig = this.getEmailConfig();
      
      if (!emailConfig) {
        console.log('Email service: No configuration found, using console logging instead');
        return;
      }

      this.transporter = nodemailer.createTransporter(emailConfig);
      this.isConfigured = true;
      
      console.log('Email service: Configured successfully');
    } catch (error) {
      console.error('Email service setup failed:', error);
      console.log('Email service: Falling back to console logging');
    }
  }

  private getEmailConfig(): EmailConfig | null {
    // Check for environment variables
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
    
    if (!user || !pass) {
      return null;
    }

    // Default to Gmail configuration
    const config: EmailConfig = {
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user,
        pass
      }
    };

    // Allow custom SMTP configuration
    if (process.env.SMTP_HOST) {
      config.host = process.env.SMTP_HOST;
      config.port = parseInt(process.env.SMTP_PORT || '587');
      config.secure = process.env.SMTP_SECURE === 'true';
      delete config.service; // Use custom SMTP instead of service
    }

    return config;
  }

  async sendPasswordResetEmail(data: ResetPasswordEmailData): Promise<boolean> {
    const { email, token, userName } = data;
    
    // Generate reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/reset-password?token=${token}`;
    
    const emailContent = {
      from: process.env.EMAIL_FROM || 'noreply@p3pharmacy.sg',
      to: email,
      subject: 'P³ Pharmacy Academy - Password Reset Request',
      html: this.generatePasswordResetHTML(resetUrl, userName || email),
      text: this.generatePasswordResetText(resetUrl, userName || email)
    };

    if (this.isConfigured && this.transporter) {
      try {
        const result = await this.transporter.sendMail(emailContent);
        console.log(`Password reset email sent to ${email}:`, result.messageId);
        return true;
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        this.logEmailToConsole(emailContent);
        return false;
      }
    } else {
      // Fallback: log to console for development
      this.logEmailToConsole(emailContent);
      return true;
    }
  }

  private logEmailToConsole(emailContent: any) {
    console.log('\n=== EMAIL WOULD BE SENT ===');
    console.log('From:', emailContent.from);
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('\n--- TEXT CONTENT ---');
    console.log(emailContent.text);
    console.log('\n--- HTML CONTENT ---');
    console.log(emailContent.html);
    console.log('=========================\n');
  }

  private generatePasswordResetHTML(resetUrl: string, userName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - P³ Pharmacy Academy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>P³ Pharmacy Academy</h1>
        <p>Singapore Pre-registration Training</p>
    </div>
    
    <div class="content">
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        
        <p>We received a request to reset your password for your P³ Pharmacy Academy account.</p>
        
        <p><a href="${resetUrl}" class="button">Reset Your Password</a></p>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
        
        <div class="warning">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons.
        </div>
        
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
    
    <div class="footer">
        <p>Best regards,<br>The P³ Pharmacy Academy Team</p>
        <p><em>This is an automated email. Please do not reply to this message.</em></p>
    </div>
</body>
</html>`;
  }

  private generatePasswordResetText(resetUrl: string, userName: string): string {
    return `
P³ Pharmacy Academy - Password Reset Request

Hello ${userName},

We received a request to reset your password for your P³ Pharmacy Academy account.

To reset your password, click the following link:
${resetUrl}

IMPORTANT: This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The P³ Pharmacy Academy Team

This is an automated email. Please do not reply to this message.
`;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log('Email service: Not configured, cannot test connection');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email service: Connection test successful');
      return true;
    } catch (error) {
      console.error('Email service: Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();