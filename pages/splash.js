import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Fix hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // 3-second splash timer - then redirect
    const redirectTimer = setTimeout(() => {
      if (isAuthenticated && !loading) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }, 3000);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [isAuthenticated, loading, router, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Simply eBay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Simply eBay Splash" />
      </Head>
      
      <div className="h-screen w-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        {/* Just the title - nothing else */}
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold animate-pulse" style={{color: '#2563eb'}}>
            Simply eBay
          </h1>
        </div>
      </div>
    </>
  );
}

// Prevent the default layout from being applied to avoid hydration issues
SplashScreen.getLayout = function getLayout(page) {
  return page;
};
