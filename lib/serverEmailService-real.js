/**
 * Simply eBay - Server-Side Email Service
 * Real EmailJS integration using REST API (no browser required)
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
      },
      apiUrl: 'https://api.emailjs.com/api/v1.0/email/send'
    };
  }

  /**
   * Send email via EmailJS REST API (server-side)
   */
  async sendEmailViaAPI(templateId, templateParams, userEmail) {
    try {
      const payload = {
        service_id: this.config.serviceId,
        template_id: templateId,
        user_id: this.config.publicKey,
        template_params: {
          ...templateParams,
          to_email: userEmail,
        }
      };

      console.log('🔵 Sending email via EmailJS API...');
      console.log('Service ID:', this.config.serviceId);
      console.log('Template ID:', templateId);
      console.log('To:', userEmail);

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log('📧 EmailJS Response:', response.status, responseText);

      if (response.ok) {
        return {
          success: true,
          messageId: responseText || `emailjs_${Date.now()}`,
          method: 'emailjs_api',
          service: 'emailjs'
        };
      } else {
        throw new Error(`EmailJS API error: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('❌ EmailJS API Error:', error);
      throw error;
    }
  }

  /**
   * Send email verification (server-side)
   */
  async sendEmailVerification(email, verificationToken, user = {}) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    
    // Check if we have proper EmailJS config
    if (!this.config.serviceId || this.config.serviceId === 'your_emailjs_service_id' || !this.config.publicKey) {
      // Console fallback for development
      console.log('📧 EMAIL VERIFICATION REQUEST (Fallback)');
      console.log('To:', email);
      console.log('Subject: Verify Your Simply eBay Account');
      console.log('Verification URL:', verificationUrl);
      console.log('Token:', verificationToken);
      console.log('---');
      
      return {
        success: true,
        messageId: `console_verification_${Date.now()}`,
        method: 'console',
        contact: email,
        message: 'Verification email logged to console (configure EmailJS for real emails)',
        verificationUrl: verificationUrl,
        instructions: 'Check server console for verification link',
        fallback: true
      };
    }

    try {
      // Send real email via EmailJS API
      const templateParams = {
        to_name: user.name || email.split('@')[0],
        verification_url: verificationUrl,
        app_name: 'Simply eBay',
        support_email: 'support@socialring.ai',
        year: new Date().getFullYear()
      };

      const result = await this.sendEmailViaAPI(
        this.config.templates.emailVerification,
        templateParams,
        email
      );

      return {
        ...result,
        contact: email,
        message: 'Email verification sent successfully',
        verificationUrl: verificationUrl,
        fallback: false
      };

    } catch (error) {
      console.error('Email verification sending failed:', error);
      
      // Fallback to console logging
      console.log('📧 EMAIL VERIFICATION REQUEST (API Failed - Fallback)');
      console.log('To:', email);
      console.log('Verification URL:', verificationUrl);
      console.log('Error:', error.message);
      
      return {
        success: true,
        messageId: `fallback_verification_${Date.now()}`,
        method: 'console_fallback',
        contact: email,
        message: 'Email API failed - verification logged to console',
        verificationUrl: verificationUrl,
        instructions: 'Check server console for verification link',
        fallback: true,
        error: error.message
      };
    }
  }

  /**
   * Send password reset email (server-side)
   */
  async sendPasswordReset(email, resetToken, user = {}) {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    // Check if we have proper EmailJS config
    if (!this.config.serviceId || this.config.serviceId === 'your_emailjs_service_id' || !this.config.publicKey) {
      console.log('📧 PASSWORD RESET REQUEST (Fallback)');
      console.log('To:', email);
      console.log('Subject: Reset Your Simply eBay Password');
      console.log('Reset URL:', resetUrl);
      console.log('Token:', resetToken);
      console.log('---');
      
      return {
        success: true,
        messageId: `console_reset_${Date.now()}`,
        method: 'console',
        contact: email,
        message: 'Password reset logged to console (configure EmailJS for real emails)',
        resetUrl: resetUrl,
        instructions: 'Check server console for reset details',
        fallback: true
      };
    }

    try {
      // Send real email via EmailJS API
      const templateParams = {
        to_name: user.name || email.split('@')[0],
        reset_url: resetUrl,
        app_name: 'Simply eBay',
        support_email: 'support@socialring.ai',
        year: new Date().getFullYear(),
        expiry_time: '1 hour'
      };

      const result = await this.sendEmailViaAPI(
        this.config.templates.passwordReset,
        templateParams,
        email
      );

      return {
        ...result,
        contact: email,
        message: 'Password reset email sent successfully',
        resetUrl: resetUrl,
        fallback: false
      };

    } catch (error) {
      console.error('Password reset email sending failed:', error);
      
      // Fallback to console logging
      console.log('📧 PASSWORD RESET REQUEST (API Failed - Fallback)');
      console.log('To:', email);
      console.log('Reset URL:', resetUrl);
      console.log('Error:', error.message);
      
      return {
        success: true,
        messageId: `fallback_reset_${Date.now()}`,
        method: 'console_fallback',
        contact: email,
        message: 'Email API failed - reset logged to console',
        resetUrl: resetUrl,
        instructions: 'Check server console for reset link',
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
