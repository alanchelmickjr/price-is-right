import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      setVerificationStatus('verifying');
      setMessage('Verifying your email...');
      setError('');

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        setEmail(data.email);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setError(data.error || 'Verification failed');
        setMessage(data.suggestion || 'Please try again or contact support');
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setVerificationStatus('error');
      setError('Network error');
      setMessage('Please check your connection and try again');
    }
  };

  const resendVerification = async () => {
    // TODO: Implement resend verification endpoint
    setMessage('Resend verification email feature coming soon. Please contact support.');
  };

  return (
    <Layout title="Verify Email - Simply eBay">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verification
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Confirming your email address
            </p>
          </div>

          {/* Verification Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Status Icon */}
            <div className="text-center mb-6">
              {verificationStatus === 'verifying' && (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
              )}
              {verificationStatus === 'success' && (
                <div className="rounded-full h-16 w-16 bg-green-100 mx-auto flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
              {verificationStatus === 'error' && (
                <div className="rounded-full h-16 w-16 bg-red-100 mx-auto flex items-center justify-center">
                  <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="text-center mb-6">
              <h3 className={`text-lg font-medium ${
                verificationStatus === 'success' ? 'text-green-800' :
                verificationStatus === 'error' ? 'text-red-800' :
                'text-gray-800'
              }`}>
                {verificationStatus === 'verifying' && 'Verifying Email...'}
                {verificationStatus === 'success' && 'Email Verified!'}
                {verificationStatus === 'error' && 'Verification Failed'}
              </h3>
              
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              
              {email && (
                <p className="mt-1 text-sm font-medium text-blue-600">
                  {email}
                </p>
              )}
              
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {verificationStatus === 'success' && (
                <Link
                  href="/login?verified=true"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Continue to Login
                </Link>
              )}
              
              {verificationStatus === 'error' && (
                <div className="space-y-3">
                  <button
                    onClick={resendVerification}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Resend Verification Email
                  </button>
                  
                  <Link
                    href="/login"
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact{' '}
              <a href="mailto:support@socialring.ai" className="text-blue-600 hover:text-blue-500">
                support@socialring.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
