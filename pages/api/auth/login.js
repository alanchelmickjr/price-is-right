import gunDataService from '../../../lib/gunDataService';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     description: Authenticates a user with their email and password using Gun.js P2P authentication.
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *     responses:
 *       200:
 *         description: User logged in successfully. Returns session and user info.
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
 *                     # other user properties from Supabase
 *                 session:
 *                   type: object
 *                   # Supabase session object structure
 *       400:
 *         description: Bad request (e.g., missing fields).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized (e.g., invalid email or password).
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

  const { email, password } = req.body;

  // Enhanced validation 
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      code: 'MISSING_FIELDS',
      details: {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
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

  // Validate password
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid password',
      code: 'INVALID_PASSWORD',
      suggestion: 'Password cannot be empty'
    });
  }

  try {
    // Delegate Gun.js authentication to service layer
    const sessionData = await gunDataService.loginUserWithSession(email, password);
    return res.status(200).json(sessionData);
  } catch (err) {
    console.error('Gun.js authentication error:', err.message);
    
    // Handle specific Gun.js authentication errors with user-friendly messages
    if (err.message.includes('Wrong user or password') || err.message.includes('not found')) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        suggestion: 'Please check your email and password, or try registering if you don\'t have an account'
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
    
    return res.status(500).json({ 
      error: 'Login temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
      suggestion: 'Please try again in a moment. If the problem persists, contact support.',
      retryable: true
    });
  }
}