import gunDataService from '../../../lib/gunDataService';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
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

  // Validate required fields
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Validate password length (Gun.js requires at least 6 characters)
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long',
      code: 'PASSWORD_TOO_SHORT',
      suggestion: 'Please choose a stronger password with at least 6 characters'
    });
  }

  try {
    // Delegate Gun.js user creation to service layer
    const sessionData = await gunDataService.createUserWithSession(email, password);
    return res.status(201).json(sessionData);

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