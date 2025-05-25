import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/auth/AuthForm';
import StatusIndicators from '../components/layout/StatusIndicators';
import Head from 'next/head';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
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
        <title>Sign In - Simply eBay</title>
        <meta name="description" content="Sign in to Simply eBay" />
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
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sign in to Simply eBay
              </p>
            </div>

            {/* Auth Form */}
            <AuthForm 
              mode="login"
              onSuccess={handleAuthSuccess}
              showOAuth={true}
            />

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button 
                  onClick={() => router.push('/')}
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  Sign up
                </button>
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
