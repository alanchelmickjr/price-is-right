/**
 * Simply eBay - Email Verification API
 * Verifies email tokens and marks accounts as verified
 */

import gunDataService from '../../../lib/gunDataService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  const { token } = req.body;

  // Input validation
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return res.status(400).json({
      error: 'Verification token is required',
      code: 'MISSING_TOKEN',
      suggestion: 'Please provide a valid verification token'
    });
  }

  try {
    // Verify the token using Gun.js
    const result = await gunDataService.verifyEmailVerificationToken(token.trim());
    
    if (result.success && result.verified) {
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        email: result.email,
        verified: true
      });
    } else {
      return res.status(400).json({
        error: 'Invalid or expired verification token',
        code: 'INVALID_TOKEN',
        suggestion: 'Please request a new verification email'
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    
    // Map common Gun.js errors to user-friendly messages
    const errorMessage = error.message;
    let responseCode = 'VERIFICATION_FAILED';
    let suggestion = 'Please try again or contact support';
    
    if (errorMessage.includes('timeout')) {
      responseCode = 'VERIFICATION_TIMEOUT';
      suggestion = 'Please try again in a moment';
    } else if (errorMessage.includes('expired')) {
      responseCode = 'TOKEN_EXPIRED';
      suggestion = 'Please request a new verification email';
    } else if (errorMessage.includes('invalid') || errorMessage.includes('not found')) {
      responseCode = 'INVALID_TOKEN';
      suggestion = 'Please check your verification link or request a new one';
    }
    
    return res.status(400).json({
      error: errorMessage,
      code: responseCode,
      suggestion: suggestion,
      timestamp: new Date().toISOString()
    });
  }
}
