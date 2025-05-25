import React, { useState } from 'react';

/**
 * A reusable authentication form component for login and registration.
 * @param {object} props - The component's props.
 * @param {'login' | 'register'} props.formType - Type of form ('login' or 'register').
 * @param {function} props.onSubmit - Function to call when the form is submitted.
 *                                     It receives an object with email, password,
 *                                     and optionally confirmPassword.
 * @param {string | null} props.errorMessage - An error message to display, if any.
 * @param {boolean} props.isLoading - Whether the form is currently submitting.
 * @returns {JSX.Element} The AuthForm component.
 */
export default function AuthForm({ formType, onSubmit, errorMessage, isLoading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (formType === 'register' && password !== confirmPassword) {
      onSubmit({ email, password, confirmPassword }, 'Passwords do not match');
      return;
    }
    onSubmit({ email, password, confirmPassword: formType === 'register' ? confirmPassword : undefined });
  };

  const isRegister = formType === 'register';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md p-8 glass-card animate-slide-up">
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email address
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
          placeholder="your@email.com"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="neumorphic-input"
          placeholder={isRegister ? "Choose a strong password" : "Enter your password"}
          disabled={isLoading}
        />
      </div>

      {isRegister && (
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="neumorphic-input"
            placeholder="Confirm your password"
            disabled={isLoading}
          />
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="neumorphic-button-primary w-full py-3 px-4 flex justify-center items-center disabled:opacity-50"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            isRegister ? 'Register' : 'Sign in'
          )}
        </button>
      </div>
    </form>
  );
}