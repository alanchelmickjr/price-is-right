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

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
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
      
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-200 dark:bg-violet-900/50 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <div className="neumorphic-card p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto neumorphic-card rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl mb-4">
                <div className="text-white text-2xl">📱</div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {mode === 'login' ? 'Sign in to Simply eBay' : 'Register for Simply eBay'}
              </p>
            </div>

            {/* eBay OAuth Login */}
            <div className="mb-4">
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#e53238] text-white font-semibold text-lg shadow hover:bg-[#b22222] transition"
                onClick={() => window.location.href = '/api/auth/login?provider=ebay'}
                style={{ marginBottom: '1rem' }}
              >
                <img src="/ebaygarage.png" alt="eBay" className="h-6 w-6" />
                Sign in with eBay
              </button>
            </div>
            {/* Auth Form */}
            <AuthForm
              mode={mode}
              onSuccess={handleAuthSuccess}
              showOAuth={true}
            />

            {/* Toggle login/register link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
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
      {/* Footer with legal links */}
      <footer className="w-full flex justify-center gap-8 py-4 absolute bottom-0 left-0 right-0 z-20">
        <a href="/terms" className="text-xs text-gray-400 no-underline font-medium hover:text-primary transition-colors">Terms of Service</a>
        <a href="/privacy" className="text-xs text-gray-400 no-underline font-medium hover:text-primary transition-colors">Privacy Policy</a>
      </footer>
    </>
  );
}

// Prevent the default layout with header from being applied
LoginPage.getLayout = function getLayout(page) {
  return page;
};
