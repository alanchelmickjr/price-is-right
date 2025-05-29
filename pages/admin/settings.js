import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';

export default function AdminSettings() {
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [welcomeEmailEnabled, setWelcomeEmailEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load current settings from environment
    setEmailVerificationRequired(process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED === 'true');
    setWelcomeEmailEnabled(process.env.NEXT_PUBLIC_WELCOME_EMAIL_ENABLED === 'true');
  }, []);

  const updateSettings = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Note: In a real app, you'd save these to a database
      // For now, we'll just show the current values and instructions
      setMessage(`Settings Updated! 
        Email Verification: ${emailVerificationRequired ? 'Required' : 'Optional'}
        Welcome Emails: ${welcomeEmailEnabled ? 'Enabled' : 'Disabled'}
        
        To persist these changes, update your .env.local file:
        NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED=${emailVerificationRequired}
        NEXT_PUBLIC_WELCOME_EMAIL_ENABLED=${welcomeEmailEnabled}
      `);
    } catch (error) {
      setMessage('Error updating settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Admin Settings - Simply eBay">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
              Admin Settings
            </h1>
            
            {/* Email Settings */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Email Configuration
                </h2>
                
                <div className="space-y-4">
                  {/* Email Verification Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Email Verification Required
                      </h3>
                      <p className="text-sm text-gray-600">
                        Require users to verify their email address before accessing the app
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        emailVerificationRequired ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      role="switch"
                      aria-checked={emailVerificationRequired}
                      onClick={() => setEmailVerificationRequired(!emailVerificationRequired)}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          emailVerificationRequired ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Welcome Email Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Welcome Emails
                      </h3>
                      <p className="text-sm text-gray-600">
                        Send welcome emails to new users after registration
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        welcomeEmailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      role="switch"
                      aria-checked={welcomeEmailEnabled}
                      onClick={() => setWelcomeEmailEnabled(!welcomeEmailEnabled)}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          welcomeEmailEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  Current Configuration
                </h2>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Email Verification:</span>{' '}
                    <span className={emailVerificationRequired ? 'text-green-600' : 'text-orange-600'}>
                      {emailVerificationRequired ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Welcome Emails:</span>{' '}
                    <span className={welcomeEmailEnabled ? 'text-green-600' : 'text-gray-600'}>
                      {welcomeEmailEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">EmailJS Service:</span>{' '}
                    <span className="text-orange-600">
                      Console Fallback (Configure EmailJS for live emails)
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <button
                onClick={updateSettings}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Updating...' : 'Update Settings'}
              </button>

              {/* Message */}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <pre className="text-sm text-green-800 whitespace-pre-wrap">
                    {message}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
