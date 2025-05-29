import gunDataService from '../../../lib/gunDataService';
import serverEmailService from '../../../lib/serverEmailService';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary:  // Validate password confirmation
  if (password !== confirmPassword) {
    return res.status(400).json({ 
      error: 'Passwords do not match',
      code: 'PASSWORD_MISMATCH',
      suggestion: 'Please make sure both password fields match'
    });
  }

  // Validate password length
  if (password.length < 6) {er
 *     description: Creates a new user account using Gun.js P2P authentication with email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's chosen password (min 6 characters).
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the chosen password.
 *     responses:
 *       201:
 *         description: User registered successfully. Returns session and user info.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                 session:
 *                   type: object
 *                   # Supabase session object structure
 *       400:
 *         description: Bad request (e.g., missing fields, passwords don't match, invalid email, weak password).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       409:
 *         description: Conflict (e.g., user with this email already exists).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password, confirmPassword } = req.body;

  // Enhanced validation 
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      code: 'MISSING_FIELDS',
      details: {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null,
        confirmPassword: !confirmPassword ? 'Password confirmation is required' : null
      }
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ 
      error: 'Invalid email format',
      code: 'INVALID_EMAIL_FORMAT',
      suggestion: 'Please enter a valid email address'
    });
  }

  // Validate password strength
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters',
      code: 'WEAK_PASSWORD',
      suggestion: 'Choose a stronger password with at least 6 characters'
    });
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    return res.status(400).json({ 
      error: 'Passwords do not match',
      code: 'PASSWORD_MISMATCH',
      suggestion: 'Please make sure both password fields match'
    });
  }

  try {
    // Check if email verification is required
    const emailVerificationRequired = process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED === 'true';
    
    // Delegate Gun.js user creation to service layer
    const sessionData = await gunDataService.createUserWithSession(email, password);
    
    // If email verification is required, generate token and send verification email
    if (emailVerificationRequired) {
      try {
        // Generate verification token
        const verificationToken = serverEmailService.generateVerificationToken();
        
        // Store verification token in Gun.js
        await gunDataService.storeEmailVerificationToken(email, verificationToken);
        
        // Send verification email
        const emailResult = await serverEmailService.sendEmailVerification(
          email, 
          verificationToken,
          { name: sessionData.user.email.split('@')[0] }
        );
        
        if (emailResult.success) {
          return res.status(201).json({
            ...sessionData,
            emailVerificationRequired: true,
            emailVerificationSent: true,
            message: 'Account created successfully. Please check your email to verify your account.',
            verificationInstructions: emailResult.instructions || 'Check your email for verification link',
            fallbackMode: emailResult.fallback || false
          });
        } else {
          // Registration succeeded but email failed - still return success
          console.warn('Email verification failed to send:', emailResult.error);
          return res.status(201).json({
            ...sessionData,
            emailVerificationRequired: true,
            emailVerificationSent: false,
            message: 'Account created successfully. Email verification could not be sent - please contact support.',
            warning: 'Verification email delivery failed'
          });
        }
      } catch (verificationError) {
        console.error('Email verification setup error:', verificationError);
        console.error('Error details:', verificationError.message, verificationError.stack);
        // Registration succeeded but verification setup failed
        return res.status(201).json({
          ...sessionData,
          emailVerificationRequired: true,
          emailVerificationSent: false,
          message: 'Account created successfully. Email verification setup failed - please contact support.',
          warning: 'Verification system error',
          debugError: verificationError.message
        });
      }
    } else {
      // No email verification required
      return res.status(201).json({
        ...sessionData,
        emailVerificationRequired: false,
        message: 'Account created successfully!'
      });
    }

  } catch (err) {
    console.error('Gun.js registration error:', err.message);
    
    // Handle specific Gun.js registration errors with detailed user feedback
    if (err.message.includes('Password too short') || err.message.toLowerCase().includes('password') && err.message.toLowerCase().includes('short')) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long for security',
        code: 'PASSWORD_TOO_SHORT',
        suggestion: 'Please choose a stronger password with at least 8 characters including letters and numbers',
        retryable: true
      });
    }
    
    if (err.message.includes('User already created') || err.message.includes('already taken')) {
      return res.status(409).json({ 
        error: 'User with this email already exists',
        code: 'USER_EXISTS',
        suggestion: 'Try logging in instead, or use a different email address'
      });
    }
    
    if (err.message.includes('Invalid email')) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address',
        code: 'INVALID_EMAIL',
        suggestion: 'Make sure your email is in the correct format (example@domain.com)'
      });
    }
    
    if (err.message.includes('Network') || err.message.includes('timeout')) {
      return res.status(503).json({ 
        error: 'Connection problem - please try again',
        code: 'NETWORK_ERROR',
        suggestion: 'Check your internet connection and try again in a moment',
        retryable: true
      });
    }
    
    // Generic fallback with retry option
    return res.status(500).json({ 
      error: 'Registration temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
      suggestion: 'Please try again in a moment. If the problem persists, contact support.',
      retryable: true
    });
  }
}