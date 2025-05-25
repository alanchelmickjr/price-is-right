import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const { register } = useAuth();

  const steps = [
    {
      title: "Welcome to Simply eBay",
      subtitle: "AI-powered mobile selling made simple",
      component: WelcomeStep
    },
    {
      title: "Join Simply eBay",
      subtitle: "Create your account or sign in",
      component: AuthStep
    },
    {
      title: "You're all set!",
      subtitle: "Start scanning and selling",
      component: SuccessStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOAuthSignIn = (provider) => {
    // OAuth implementation would go here
    console.log(`Signing in with ${provider}`);
    // For demo purposes, let's just proceed to success
    handleNext();
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    setShowRetryButton(false);

    // Client-side validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long. Please choose a stronger password.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords don\'t match. Please check and try again.');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRetryCount(0);
      handleNext();
      
    } catch (error) {
      console.error('Sign up error:', error);
      setRetryCount(prev => prev + 1);
      
      if (error.message.includes('timeout') || error.message.includes('network')) {
        setError('Connection timeout. Please check your internet connection and try again.');
        setShowRetryButton(true);
      } else if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        setError('An account with this email already exists. Please try signing in instead.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
        if (retryCount < 2) {
          setShowRetryButton(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowRetryButton(false);
    handleSignUp();
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate password strength
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (password.length >= 12) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      return strength;
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  // Real-time form validation
  const validateForm = () => {
    const errors = {};
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const formErrors = validateForm();
  const isFormValid = formData.email && formData.password && formData.confirmPassword && 
                     formData.agreeToTerms && Object.keys(formErrors).length === 0;

  // Welcome Step Component
  function WelcomeStep() {
    return (
      <div className="centered-layout">
        <div className="form-container animate-fade-in">
          <div className="glass-card p-8 text-center animate-slide-up">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto rounded-full shadow-lg flex items-center justify-center" 
                   style={{background: "linear-gradient(135deg, var(--primary-light), var(--primary))"}}>
                <div className="text-4xl">📱</div>
              </div>
              {/* Modern design accent - replaced robot icon */}
              <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br from-secondary-light to-secondary">
                <div className="text-lg">✨</div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2" style={{color: "var(--neutral-800)"}}>
              Simply eBay
            </h1>
            <div className="badge badge-primary mb-6">AI-Powered</div>
            
            <p className="mb-8 leading-relaxed" style={{color: "var(--neutral-700)"}}>
              Point your camera at any item and get instant AI-powered price suggestions. 
              Create eBay listings with one tap.
            </p>
            
            <div className="space-y-4 mb-8 feature-cards-container">
              <div className="flex items-center space-x-3 icon-card">
                <div className="w-6 h-6 neumorphic-mini-circle flex-shrink-0">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
                <span className="text-gray-700 text-sm">AI-powered item recognition</span>
              </div>
              <div className="flex items-center space-x-3 icon-card">
                <div className="w-6 h-6 neumorphic-mini-circle flex-shrink-0">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
                <span className="text-gray-700 text-sm">Real-time price suggestions</span>
              </div>
              <div className="flex items-center space-x-3 icon-card">
                <div className="w-6 h-6 neumorphic-mini-circle flex-shrink-0">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
                <span className="text-gray-700 text-sm">One-tap eBay listing</span>
              </div>
              <div className="flex items-center space-x-3 icon-card">
                <div className="w-6 h-6 neumorphic-mini-circle flex-shrink-0">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
                <span className="text-gray-700 text-sm">Local AI processing</span>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={handleNext}
                className="neumorphic-button-primary px-8 py-4 text-white font-semibold"
              >
                Get Started
              </button>
              <p className="text-xs mt-4" style={{color: "var(--neutral-500)"}}>
                No credit card required • Free to use
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth Step Component
  function AuthStep() {
    return (
      <div className="centered-layout">
        <div className="form-container">
          <div className="glass-card p-8 animate-slide-up">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{color: "var(--neutral-800)"}}>
                Join Simply eBay
              </h2>
              <p style={{color: "var(--neutral-600)"}}>
                Choose your preferred sign-in method
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-4 mb-8">
              <button
                onClick={() => handleOAuthSignIn('google')}
                className="neumorphic-button-oauth w-full py-3 px-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => handleOAuthSignIn('github')}
                className="neumorphic-button-oauth w-full py-3 px-6"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{borderColor: 'var(--neutral-200)'}}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 rounded-lg" style={{backgroundColor: 'var(--neu-bg-secondary)', color: 'var(--neutral-500)', backdropFilter: 'blur(5px)'}}>
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-red-800 text-sm">{error}</div>
                {showRetryButton && (
                  <button
                    onClick={handleRetry}
                    className="text-sm text-red-600 underline hover:text-red-800 mt-2"
                    disabled={isLoading}
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            {/* Email Form */}
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className="neumorphic-input"
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="neumorphic-input"
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="neumorphic-input pr-12"
                    placeholder="Choose a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="neumorphic-progress-track h-2">
                      <div 
                        className="neumorphic-progress-fill"
                        style={{ 
                          width: `${passwordStrength}%`,
                          background: passwordStrength < 50 ? 
                            'linear-gradient(90deg, #ef4444, #dc2626)' : 
                            passwordStrength < 75 ? 
                            'linear-gradient(90deg, #f59e0b, #d97706)' : 
                            'linear-gradient(90deg, #10b981, #059669)'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password strength: {
                        passwordStrength < 50 ? 'Weak' : 
                        passwordStrength < 75 ? 'Fair' : 'Strong'
                      }
                    </p>
                  </div>
                )}
                
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className="neumorphic-input"
                  placeholder="Confirm your password"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex items-start space-x-3 mt-2">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                    className="mobile-checkbox"
                  />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <button 
                    type="button"
                    onClick={() => window.open('/terms', '_blank')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button 
                    type="button"
                    onClick={() => window.open('/privacy', '_blank')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>
          </div>

          <div className="button-container mt-8">
            <button
              onClick={handleBack}
              className="neumorphic-button"
            >
              Back
            </button>
            <button
              onClick={handleSignUp}
              disabled={!isFormValid || isLoading}
              className={`neumorphic-button-primary text-white font-semibold ${
                (!isFormValid || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Success Step Component
  function SuccessStep() {
    return (
      <div className="centered-layout">
        <div className="form-container">
          <div className="neumorphic-card p-8 text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto neumorphic-circle">
                <div className="text-3xl">🎉</div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome aboard!
            </h2>
            
            <p className="text-gray-600 mb-8">
              Your account has been created successfully. You're ready to start scanning items and creating eBay listings with AI assistance.
            </p>
            
            <div className="space-y-4 mb-8 feature-cards-container">
              <div className="flex items-center space-x-3 icon-card">
                <div className="w-6 h-6 neumorphic-mini-circle flex-shrink-0">
                  <span className="text-blue-500 text-sm">📷</span>
                </div>
                <span className="text-gray-700 text-sm">Scan items with your camera</span>
              </div>
              <div className="flex items-center space-x-3 icon-card">
                <div className="w-6 h-6 neumorphic-mini-circle flex-shrink-0">
                  <span className="text-blue-500 text-sm">🤖</span>
                </div>
                <span className="text-gray-700 text-sm">Get AI-powered insights</span>
              </div>
              <div className="flex items-center space-x-3 icon-card">
                <div className="w-6 h-6 neumorphic-mini-circle flex-shrink-0">
                  <span className="text-blue-500 text-sm">🏷️</span>
                </div>
                <span className="text-gray-700 text-sm">Create listings instantly</span>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="neumorphic-button-primary px-8 py-4 text-white font-semibold rounded-2xl"
              >
                Start Selling
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{steps[currentStep].title}</title>
        <meta name="description" content={steps[currentStep].subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
      </Head>

      <div className="min-h-screen app-container">
        {/* Beautiful Header with Simply eBay */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white/95 to-gray-50/95 backdrop-blur-md border-b border-gray-200/50">
          <div className="onboarding-header px-6 py-6">
            <div className="text-center mb-4">
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Simply eBay
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-medium">AI-Powered Mobile Selling</p>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-xs font-medium text-gray-500">
                {Math.round((currentStep / (steps.length - 1)) * 100)}%
              </span>
            </div>
            <div className="neumorphic-progress-track h-2 progress-container">
              <div 
                className="neumorphic-progress-fill"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="pt-32">
          {steps[currentStep].component()}
        </div>
      </div>
    </>
  );
}

// Prevent the default layout with header from being applied
Onboarding.getLayout = function getLayout(page) {
  return page;
};
