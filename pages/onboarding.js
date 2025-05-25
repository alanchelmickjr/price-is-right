import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/auth/AuthForm';
import Head from 'next/head';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && user) {
      router.push('/dashboard');
    }
  }, [user, router, mounted]);

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

  // Auth Step Component using unified AuthForm
  function AuthStep() {
    const handleAuthSuccess = (result) => {
      console.log('Authentication successful:', result);
      handleNext(); // Move to success step
    };

    const handleAuthError = (errorMessage) => {
      setError(errorMessage);
    };

    return (
      <div className="centered-layout">
        <div className="form-container">
          <div className="neumorphic-card p-8 animate-slide-up max-w-md mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                Join Simply eBay
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create your account to start selling
              </p>
            </div>

            <AuthForm 
              mode="register"
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
              showOAuth={true}
            />

            <div className="button-container mt-6 flex justify-between">
              <button
                onClick={handleBack}
                className="neumorphic-button px-6 py-3"
              >
                Back
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
        <meta name="theme-color" content="#8b5cf6" />
      </Head>

      {/* Prevent hydration mismatch */}
      {!mounted ? null : (
        <div className="centered-layout relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>
        
        <div className="app-container relative z-10">
          <div className="neumorphic-card p-8 max-w-md mx-auto animate-slide-up">
            {/* Modern Header */}
            <div className="text-center mb-6">
              <h1 className="text-gradient text-2xl font-bold mb-2">
                Simply eBay
              </h1>
              <p className="text-sm" style={{color: "var(--text-tertiary)"}}>
                AI-Powered Mobile Selling
              </p>
            </div>

            {/* Progress Bar */}
            <div className="progress-container mb-8">
              <div className="flex justify-center text-xs mb-2" style={{color: "var(--text-tertiary)"}}>
                <span>Step {currentStep + 1} of {steps.length}</span>
              </div>
              <div className="neumorphic-progress-track h-3">
                <div 
                  className="neumorphic-progress-fill"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="step-content animate-fade-in">
              {steps[currentStep].component()}
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
}

// Prevent the default layout with header from being applied
Onboarding.getLayout = function getLayout(page) {
  return page;
};
