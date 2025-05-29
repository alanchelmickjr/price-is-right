/**
 * Simply eBay - Extensible Notification Service
 * Supports EmailJS (immediate) + Twilio SMS (future)
 * Mobile-first, P2P-compatible architecture
 */

import emailjs from '@emailjs/browser';

class NotificationService {
  constructor() {
    this.emailConfig = {
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      templates: {
        passwordReset: process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID,
        welcome: process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID,
      }
    };

    this.smsConfig = {
      enabled: process.env.NEXT_PUBLIC_SMS_ENABLED === 'true',
      twilioSid: process.env.NEXT_PUBLIC_TWILIO_SID,
      twilioToken: process.env.NEXT_PUBLIC_TWILIO_TOKEN,
      twilioPhone: process.env.NEXT_PUBLIC_TWILIO_PHONE,
    };

    // Initialize EmailJS if configured (skip demo mode)
    if (this.emailConfig.publicKey && this.emailConfig.publicKey !== 'demo_key') {
      emailjs.init(this.emailConfig.publicKey);
    }
  }

  /**
   * Send password reset notification
   * @param {string} contact - Email or phone number
   * @param {string} resetToken - Generated reset token
   * @param {Object} user - User object with name, etc.
   * @returns {Promise<Object>} Result with success/error
   */
  async sendPasswordReset(contact, resetToken, user = {}) {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    // Determine if contact is email or phone
    const isEmail = contact.includes('@');
    
    if (isEmail) {
      return await this._sendEmailPasswordReset(contact, resetUrl, user);
    } else if (this.smsConfig.enabled) {
      return await this._sendSMSPasswordReset(contact, resetUrl, user);
    } else {
      return {
        success: false,
        error: 'SMS not configured. Please contact support.',
        fallback: 'email'
      };
    }
  }

  /**
   * Send welcome notification
   * @param {string} contact - Email or phone number
   * @param {Object} user - User object
   * @returns {Promise<Object>} Result with success/error
   */
  async sendWelcome(contact, user = {}) {
    const isEmail = contact.includes('@');
    
    if (isEmail) {
      return await this._sendEmailWelcome(contact, user);
    } else if (this.smsConfig.enabled) {
      return await this._sendSMSWelcome(contact, user);
    } else {
      // Graceful fallback - welcome via email if SMS not configured
      return { success: true, message: 'Welcome! SMS notifications will be available soon.' };
    }
  }

  // Private Methods - Email Implementation
  async _sendEmailPasswordReset(email, resetUrl, user) {
    // Demo mode - simulate email sending
    if (!this.emailConfig.serviceId || this.emailConfig.serviceId === 'demo_service') {
      console.log('🎭 DEMO MODE: Password reset email for', email);
      console.log('🔗 Reset URL:', resetUrl);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        messageId: `demo_${Date.now()}`,
        method: 'email',
        contact: email,
        demo: true,
        message: 'Demo mode: Email would be sent in production'
      };
    }

    if (!this.emailConfig.templates.passwordReset) {
      return {
        success: false,
        error: 'Email service not configured',
        suggestion: 'Please contact support for password reset assistance'
      };
    }

    try {
      const templateParams = {
        to_email: email,
        to_name: user.firstName || user.name || 'eBay Seller',
        reset_url: resetUrl,
        app_name: 'Simply eBay',
        expires_in: '1 hour',
        support_email: 'support@simplyebay.com'
      };

      const response = await emailjs.send(
        this.emailConfig.serviceId,
        this.emailConfig.templates.passwordReset,
        templateParams
      );

      return {
        success: true,
        messageId: response.text,
        method: 'email',
        contact: email
      };
    } catch (error) {
      console.error('Email password reset failed:', error);
      return {
        success: false,
        error: 'Failed to send reset email',
        suggestion: 'Please check your email address and try again',
        retryable: true
      };
    }
  }

  async _sendEmailWelcome(email, user) {
    if (!this.emailConfig.serviceId || !this.emailConfig.templates.welcome) {
      // Graceful degradation - welcome is not critical
      return { success: true, message: 'Welcome to Simply eBay!' };
    }

    try {
      const templateParams = {
        to_email: email,
        to_name: user.firstName || user.name || 'eBay Seller',
        app_name: 'Simply eBay',
        dashboard_url: `${window.location.origin}/dashboard`,
        support_email: 'support@simplyebay.com'
      };

      const response = await emailjs.send(
        this.emailConfig.serviceId,
        this.emailConfig.templates.welcome,
        templateParams
      );

      return {
        success: true,
        messageId: response.text,
        method: 'email',
        contact: email
      };
    } catch (error) {
      console.error('Welcome email failed:', error);
      // Non-critical failure
      return { success: true, message: 'Welcome to Simply eBay!' };
    }
  }

  // Private Methods - SMS Implementation (Future)
  async _sendSMSPasswordReset(phone, resetUrl, user) {
    // TODO: Implement when Twilio is configured
    const message = `Simply eBay: Reset your password: ${resetUrl} (expires in 1 hour)`;
    
    try {
      // Future Twilio implementation
      const response = await this._sendSMS(phone, message);
      return {
        success: true,
        messageId: response.sid,
        method: 'sms',
        contact: phone
      };
    } catch (error) {
      return {
        success: false,
        error: 'SMS service temporarily unavailable',
        suggestion: 'Please try email instead',
        fallback: 'email'
      };
    }
  }

  async _sendSMSWelcome(phone, user) {
    const message = `Welcome to Simply eBay, ${user.firstName || 'seller'}! Start scanning items to create instant listings. Reply STOP to opt out.`;
    
    try {
      const response = await this._sendSMS(phone, message);
      return {
        success: true,
        messageId: response.sid,
        method: 'sms',
        contact: phone
      };
    } catch (error) {
      return { success: true, message: 'Welcome to Simply eBay!' };
    }
  }

  async _sendSMS(phone, message) {
    if (!this.smsConfig.enabled) {
      throw new Error('SMS not configured');
    }

    // Future Twilio implementation
    // const twilio = require('twilio')(this.smsConfig.twilioSid, this.smsConfig.twilioToken);
    // return await twilio.messages.create({
    //   body: message,
    //   from: this.smsConfig.twilioPhone,
    //   to: phone
    // });
    
    throw new Error('SMS implementation pending');
  }

  // Utility Methods
  isEmailConfigured() {
    return !!(this.emailConfig.serviceId && this.emailConfig.publicKey);
  }

  isSMSConfigured() {
    return this.smsConfig.enabled && !!(this.smsConfig.twilioSid && this.smsConfig.twilioToken);
  }

  getAvailableMethods() {
    const methods = [];
    if (this.isEmailConfigured()) methods.push('email');
    if (this.isSMSConfigured()) methods.push('sms');
    return methods;
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
