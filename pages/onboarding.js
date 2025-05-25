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
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto rounded-full shadow-lg flex items-center justify-center" 
               style={{background: "linear-gradient(135deg, var(--primary-light), var(--primary))"}}>
            <div className="text-2xl">📱</div>
          </div>
        </div>
        
        <h2 className="text-lg font-bold mb-2" style={{color: "var(--neutral-800)"}}>
          Welcome to Simply eBay
        </h2>
        <div className="badge badge-primary mb-4 text-xs">AI-Powered</div>
        
        <p className="mb-4 text-sm leading-relaxed" style={{color: "var(--neutral-700)"}}>
          Point your camera at any item and get instant AI-powered price suggestions.
        </p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-4 h-4 neumorphic-mini-circle flex-shrink-0">
              <span className="text-green-500 text-xs">✓</span>
            </div>
            <span className="text-gray-700">AI item recognition</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-4 h-4 neumorphic-mini-circle flex-shrink-0">
              <span className="text-green-500 text-xs">✓</span>
            </div>
            <span className="text-gray-700">Real-time pricing</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-4 h-4 neumorphic-mini-circle flex-shrink-0">
              <span className="text-green-500 text-xs">✓</span>
            </div>
            <span className="text-gray-700">One-tap listing</span>
          </div>
        </div>
        
        <button
          onClick={handleNext}
          className="neumorphic-button-primary px-6 py-3 text-white font-semibold text-sm w-full"
        >
          Get Started
        </button>
        <p className="text-xs mt-2" style={{color: "var(--neutral-500)"}}>
          Free to use • No credit card required
        </p>
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
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">
          Join Simply eBay
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Create your account to start selling
        </p>

        <AuthForm 
          mode="register"
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
          showOAuth={true}
        />

        <div className="mt-4 flex justify-between">
          <button
            onClick={handleBack}
            className="neumorphic-button px-4 py-2 text-sm"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Success Step Component
  function SuccessStep() {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto neumorphic-circle">
            <div className="text-2xl">🎉</div>
          </div>
        </div>
        
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Welcome aboard!
        </h2>
        
        <p className="text-sm text-gray-600 mb-4">
          You're ready to start scanning items and creating eBay listings with AI assistance.
        </p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-4 h-4 neumorphic-mini-circle flex-shrink-0">
              <span className="text-blue-500 text-xs">📷</span>
            </div>
            <span className="text-gray-700">Scan items with camera</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-4 h-4 neumorphic-mini-circle flex-shrink-0">
              <span className="text-blue-500 text-xs">🤖</span>
            </div>
            <span className="text-gray-700">Get AI-powered insights</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-4 h-4 neumorphic-mini-circle flex-shrink-0">
              <span className="text-blue-500 text-xs">🏷️</span>
            </div>
            <span className="text-gray-700">Create listings instantly</span>
          </div>
        </div>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="neumorphic-button-primary px-6 py-3 text-white font-semibold text-sm w-full"
        >
          Start Selling
        </button>
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
        <div className="h-screen w-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 overflow-hidden">
        
        <div className="w-full max-w-md mx-auto">
          <div className="neumorphic-card p-6 animate-slide-up">
            {/* Modern Header */}
            <div className="text-center mb-4">
              <h1 className="text-gradient text-xl font-bold mb-1">
                Simply eBay
              </h1>
              <p className="text-xs" style={{color: "var(--text-tertiary)"}}>
                AI-Powered Mobile Selling
              </p>
            </div>

            {/* Progress Bar */}
            <div className="progress-container mb-6">
              <div className="flex justify-center text-xs mb-2" style={{color: "var(--text-tertiary)"}}>
                <span>Step {currentStep + 1} of {steps.length}</span>
              </div>
              <div className="neumorphic-progress-track h-2">
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
