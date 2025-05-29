/**
 * Password Reset API Endpoint
 * Handles reset token generation and storage in Gun.js
 */

import gunDataService from '../../../lib/gunDataService';
import notificationService from '../../../lib/notificationService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      suggestion: 'Use POST request'
    });
  }

  const { email } = req.body;

  // Validate input
  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Email is required',
      suggestion: 'Please provide a valid email address'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
      suggestion: 'Please enter a valid email address'
    });
  }

  try {
    console.log('[Password Reset API] Processing reset request for:', email);

    // Check if user exists in Gun.js
    const userExists = await gunDataService.checkUserExists(email);
    
    if (!userExists) {
      // Security: Don't reveal if user exists or not
      console.log('[Password Reset API] User not found, but sending success response for security');
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.',
        note: 'Check your email and spam folder'
      });
    }

    // Generate secure reset token
    const resetToken = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

    // Store reset token in Gun.js
    const tokenStored = await gunDataService.storePasswordResetToken(email, resetToken, expiresAt);
    
    if (!tokenStored) {
      console.error('[Password Reset API] Failed to store reset token');
      return res.status(500).json({
        success: false,
        error: 'Failed to generate reset token',
        suggestion: 'Please try again in a moment'
      });
    }

    // Send reset email
    const emailResult = await notificationService.sendPasswordReset(email, resetToken, {
      name: 'eBay Seller'
    });

    console.log('[Password Reset API] Email result:', emailResult);

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to your email',
        method: emailResult.method,
        resetUrl: emailResult.resetUrl, // Include for console mode
        instructions: emailResult.instructions
      });
    } else {
      return res.status(500).json({
        success: false,
        error: emailResult.error || 'Failed to send reset email',
        suggestion: emailResult.suggestion || 'Please try again',
        retryable: emailResult.retryable,
        fallbackUrl: emailResult.fallbackUrl
      });
    }

  } catch (error) {
    console.error('[Password Reset API] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      suggestion: 'Please try again later'
    });
  }
}
