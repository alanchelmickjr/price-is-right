import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/auth/AuthForm';
import StatusIndicators from '../components/layout/StatusIndicators';
import Head from 'next/head';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('login'); // "login" or "register"
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  let ebay

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    ebay = new Image();
    ebay.src = '../public/assets/svgs/ebay.svg';

    if (mounted && isAuthenticated && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router, mounted]);

  const handleAuthSuccess = () => {
    router.push('/dashboard');
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Sign In' : 'Register'} - Simply eBay</title>
        <meta name="description" content={mode === 'login' ? "Sign in to Simply eBay" : "Register for Simply eBay"} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="login-section">
        {/* Animated background elements */}
        {/* <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-200 dark:bg-violet-900/50 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div> */}

        {/* Main content */}
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <div className="login-wrapper">
            {/* Header */}
            <div className="text-center mb-2">
              {/* <div className="w-16 h-16 mx-auto neumorphic-card rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl mb-4">
                <div className="text-white text-2xl">📱</div>
              </div> */}
              <div className='welcome-text-wrapper'>
                <h1 className="Heading1">
                  {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                </h1>
                <p className="input-label">
                  {mode === 'login' ? 'Sign in to Simply eBay' : 'Register for Simply eBay'}
                </p>
              </div>
            </div>

             {/*wrapper to contain all Oauth buttons */}
            <div className = "sign-up-wrapper">
            {/* eBay OAuth Login */}
            <div className="w-full">
              <button
                className="ebay-sign side-list"
                style={{ marginBottom: 4 }}
                onClick={() => window.location.href = '/api/auth/login?provider=ebay'}
              >
                <img src="/assets/svgs/ebay.svg" alt="eBay" width={"24px"} height = {"24px"} />
                Sign in with eBay
              </button>
              <AuthForm
                mode={mode}
                onSuccess={handleAuthSuccess}
                showOAuth={true}
              />
            </div>
              {/* Auth Form */}
            </div>
            {/* Toggle login/register link */}
            <div className="mt-6 text-center">
              <p className="input-label">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="ghost-button"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with status indicators */}
        <StatusIndicators />
      </div>
    </>
  );
}

// Prevent the default layout with header from being applied
LoginPage.getLayout = function getLayout(page) {
  return page;
};
