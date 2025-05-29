/**
 * Simply eBay - Server-Side Email Service
 * Real EmailJS integration for server-side email sending
 */

import crypto from 'crypto';

class ServerEmailService {
  constructor() {
    this.config = {
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      templates: {
        emailVerification: process.env.NEXT_PUBLIC_EMAILJS_EMAIL_VERIFICATION_TEMPLATE_ID,
        passwordReset: process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID,
        welcome: process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID,
      }
    };
  }

  /**
   * Send email via EmailJS REST API (server-side compatible)
   */
  async sendEmailViaAPI(templateId, templateParams, userEmail) {
    const url = 'https://api.emailjs.com/api/v1.0/email/send';
    
    const data = {
      service_id: this.config.serviceId,
      template_id: templateId,
      user_id: this.config.publicKey,
      template_params: templateParams
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return {
          success: true,
          messageId: `emailjs_${Date.now()}`,
          method: 'emailjs_api',
          contact: userEmail,
          message: 'Email sent successfully via EmailJS'
        };
      } else {
        const errorText = await response.text();
        console.error('EmailJS API error:', response.status, errorText);
        throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('EmailJS API request failed:', error);
      throw error;
    }
  }

  /**
   * Send email verification (server-side real emails)
   */
  async sendEmailVerification(email, verificationToken, user = {}) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    
    // Always log to console for development
    console.log('📧 EMAIL VERIFICATION REQUEST');
    console.log('To:', email);
    console.log('Subject: Verify Your Simply eBay Account');
    console.log('Verification URL:', verificationUrl);
    console.log('Token:', verificationToken);
    console.log('---');
    
    // Check if we have proper EmailJS config
    if (!this.config.serviceId || this.config.serviceId === 'your_emailjs_service_id' || 
        !this.config.publicKey || this.config.publicKey === 'your_emailjs_public_key') {
      
      return {
        success: true,
        messageId: `console_verification_${Date.now()}`,
        method: 'console',
        contact: email,
        message: 'Verification email logged to console (configure EmailJS for real emails)',
        verificationUrl: verificationUrl,
        instructions: 'Check server console for verification link - Configure EmailJS public key to send real emails',
        fallback: true
      };
    }

    // Try to send real email via EmailJS API
    try {
      const templateParams = {
        to_email: email,
        to_name: user.name || email.split('@')[0],
        verification_url: verificationUrl,
        app_name: 'Simply eBay',
        support_email: 'support@socialring.ai',
        year: new Date().getFullYear(),
        user_email: email
      };

      const result = await this.sendEmailViaAPI(
        this.config.templates.emailVerification || 'template_email_verification',
        templateParams,
        email
      );

      console.log('✅ Email verification sent successfully via EmailJS!');
      return {
        ...result,
        verificationUrl: verificationUrl,
        instructions: 'Check your email for verification link',
        fallback: false
      };

    } catch (error) {
      console.error('❌ EmailJS sending failed, using console fallback:', error.message);
      
      return {
        success: true,
        messageId: `console_fallback_${Date.now()}`,
        method: 'console_fallback',
        contact: email,
        message: 'Email delivery failed - verification logged to console',
        verificationUrl: verificationUrl,
        instructions: 'Check server console for verification link (email delivery failed)',
        fallback: true,
        error: error.message
      };
    }
  }

  /**
   * Send password reset email (server-side real emails)
   */
  async sendPasswordReset(email, resetToken, user = {}) {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    console.log('📧 PASSWORD RESET REQUEST');
    console.log('To:', email);
    console.log('Subject: Reset Your Simply eBay Password');
    console.log('Reset URL:', resetUrl);
    console.log('Token:', resetToken);
    console.log('---');

    if (!this.config.serviceId || this.config.serviceId === 'your_emailjs_service_id' || 
        !this.config.publicKey || this.config.publicKey === 'your_emailjs_public_key') {
      
      return {
        success: true,
        messageId: `console_reset_${Date.now()}`,
        method: 'console',
        contact: email,
        message: 'Password reset logged to console (configure EmailJS for real emails)',
        resetUrl: resetUrl,
        instructions: 'Check server console for reset link',
        fallback: true
      };
    }

    try {
      const templateParams = {
        to_email: email,
        to_name: user.name || email.split('@')[0],
        reset_url: resetUrl,
        app_name: 'Simply eBay',
        support_email: 'support@socialring.ai',
        year: new Date().getFullYear(),
        user_email: email
      };

      const result = await this.sendEmailViaAPI(
        this.config.templates.passwordReset || 'template_password_reset',
        templateParams,
        email
      );

      console.log('✅ Password reset email sent successfully via EmailJS!');
      return {
        ...result,
        resetUrl: resetUrl,
        instructions: 'Check your email for reset instructions',
        fallback: false
      };

    } catch (error) {
      console.error('❌ EmailJS sending failed, using console fallback:', error.message);
      
      return {
        success: true,
        messageId: `console_fallback_${Date.now()}`,
        method: 'console_fallback',
        contact: email,
        message: 'Email delivery failed - reset instructions logged to console',
        resetUrl: resetUrl,
        instructions: 'Check server console for reset link (email delivery failed)',
        fallback: true,
        error: error.message
      };
    }
  }

  /**
   * Generate secure verification token
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate secure reset token
   */
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Export singleton instance
const serverEmailService = new ServerEmailService();
export default serverEmailService;
