import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

/**
 * Unified authentication form component for both login and registration using Gun.js
 * @param {Object} props - Component props
 * @param {string} props.mode - "login" or "register"
 * @param {Function} props.onSuccess - Function to call on successful auth
 * @param {Function} props.onError - Function to call on auth error
 * @param {boolean} props.showOAuth - Whether to show OAuth buttons
 * @returns {JSX.Element} The AuthForm component
 */
export default function AuthForm({ mode = 'login', onSuccess, onError, showOAuth = false }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const router = useRouter();
  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('[AuthForm] handleInputChange', { name, value });
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log('[AuthForm] formData after change', updated);
      return updated;
    });
    // Clear error when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
    if (verificationStatus) setVerificationStatus(null);
  };

  const handleSubmit = async (e) => {
    console.log('[AuthForm] handleSubmit called', { event: e, formData, mode });
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setVerificationStatus(null);

    // Client-side validation first
    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        console.log('[AuthForm] Passwords do not match', { formData });
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        console.log('[AuthForm] Password too short', { formData });
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      let result;
      if (mode === 'register') {
        console.log('[AuthForm] Calling register', { email: formData.email });
        result = await register(formData.email, formData.password, formData.confirmPassword);
      } else {
        console.log('[AuthForm] Calling login', { email: formData.email });
        result = await login(formData.email, formData.password);
      }
      
      console.log('[AuthForm] Auth result', { result });
      
      if (result.success) {
        console.log('[AuthForm] Auth successful');
        
        // Handle email verification status for registration
        if (mode === 'register' && result.emailVerificationRequired) {
          setVerificationStatus({
            required: true,
            sent: result.emailVerificationSent,
            message: result.message,
            instructions: result.verificationInstructions,
            warning: result.warning
          });
          setSuccess(result.message || 'Account created successfully!');
        } else {
          setSuccess(mode === 'register' ? 'Account created successfully!' : 'Login successful!');
        }
        
        if (onSuccess) onSuccess(result);
      } else {
        console.log('[AuthForm] Auth failed', result.error);
        setError(result.error);
        if (onError) onError(result.error);
      }
    } catch (err) {
      // This should only catch network errors now
      const errorMessage = err.message || 'Authentication failed';
      console.log('[AuthForm] Caught unexpected error', errorMessage, err);
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isRegistering = mode === 'register';

  return (
    <div className="authform">
      {/* OAuth Section */}
      {showOAuth && (
        <div className="space-y-4">
          {/* OAuth buttons in a row */}
          <div className="sign-up-button-wrapper">
            <button
              type="button"
              className="sign-up-button"
              disabled={loading}
            >
              
              Sign in with Google
            </button>
            
            <button
              type="button"
              className="sign-up-button"
              disabled={loading}
            >
              Sign in with GitHub
            </button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="input-label bg-red-500">or continue with email</span>
            </div>
          </div>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {isRegistering && (
          <div className="input-group">
            <label htmlFor="firstName" className="input-label">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className="neumorphic-input"
              placeholder="Enter your first name"
              disabled={loading}
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your email address"
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <div className="form-input">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              required
              className='password-input'
              value={formData.password}
              onChange={handleInputChange}
              placeholder={isRegistering ? "Choose a strong password" : "Enter your password"}
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-visible"
              onClick={() => {
                console.log('[AuthForm] Show password toggled', !showPassword);
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isRegistering && (
          <div className="input-group">
            <label htmlFor="confirmPassword" className="input label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="neumorphic-input"
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {verificationStatus && (
          <div className={`border rounded-md p-4 ${
            verificationStatus.sent ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {verificationStatus.sent ? (
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  verificationStatus.sent ? 'text-blue-800' : 'text-yellow-800'
                }`}>
                  Email Verification {verificationStatus.sent ? 'Required' : 'Setup Issue'}
                </h3>
                <div className={`mt-2 text-sm ${
                  verificationStatus.sent ? 'text-blue-700' : 'text-yellow-700'
                }`}>
                  {verificationStatus.sent ? (
                    <div>
                      <p>We've sent a verification email to your account.</p>
                      {verificationStatus.instructions && (
                        <p className="mt-1 text-xs">{verificationStatus.instructions}</p>
                      )}
                      <p className="mt-2 text-xs">
                        Check your email and click the verification link to complete your registration.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p>Your account was created but email verification couldn't be sent.</p>
                      {verificationStatus.warning && (
                        <p className="mt-1 text-xs font-medium">{verificationStatus.warning}</p>
                      )}
                      <p className="mt-2 text-xs">
                        Please contact support to verify your email manually.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forgot Password Link for Login Mode */}
        {!isRegistering && (
          <div className="ghost-button">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              Forgot your password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="primary-button"
          onClick={e => { console.log('[AuthForm] Submit button clicked', e); }}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isRegistering ? 'Creating Account...' : 'Signing In...'}
            </div>
          ) : (
            <div className="flex items-center">
              <span className="mr-2">{isRegistering ? 'Create Account' : 'Sign In'}</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}