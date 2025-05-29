import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import notificationService from '../../lib/notificationService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Generate a reset token (in real app, this would be server-side)
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Send reset notification via our extensible service
      const result = await notificationService.sendPasswordReset(email, resetToken, {
        name: 'eBay Seller'
      });

      if (result.success) {
        if (result.demo) {
          setMessage(`🎭 DEMO MODE: Reset email simulated for ${email}. In production, you would receive an email with reset instructions.`);
          console.log('🔗 Reset URL that would be sent:', `${window.location.origin}/reset-password?token=${resetToken}`);
        } else {
          setMessage(`Reset instructions sent to ${email}. Check your email (and spam folder).`);
        }
        // In a real app, you'd call your API to store the reset token
        console.log('Password reset requested for:', email, 'Token:', resetToken);
      } else {
        setError(result.error || 'Failed to send reset instructions');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Reset Your Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>
          
          <div className="neumorphic-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="neumorphic-input"
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="neumorphic-button-primary w-full py-4 px-6 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Reset Email...
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>

              <div className="text-center space-y-2">
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Back to Login
                </Link>
                <div className="text-sm text-gray-500">
                  Don't have an account? {' '}
                  <Link href="/onboarding" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
