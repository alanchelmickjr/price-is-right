import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Animation sequence
    const timers = [
      setTimeout(() => setAnimationPhase(1), 300),
      setTimeout(() => setAnimationPhase(2), 800),
      setTimeout(() => setAnimationPhase(3), 1500),
    ];

    // Main redirect timer
    const redirectTimer = setTimeout(() => {
      setShowSplash(false);
      if (!loading) {
        if (isAuthenticated) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    }, 3000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(redirectTimer);
    };
  }, [isAuthenticated, loading, router]);

  if (!showSplash && !loading) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Simply eBay - AI-Powered Selling</title>
        <meta name="description" content="Simply eBay - The AI-powered tool to quickly scan, identify, and list items on eBay with 100% private local processing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-200 dark:bg-violet-900/50 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 dark:bg-pink-900/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 dark:bg-gray-400/30 rounded-full animate-float"
              style={{
                top: `${10 + (i * 23) % 80}%`,
                left: `${5 + (i * 17) % 90}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${8 + (i % 4) * 2}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Main splash content */}
        <div className="relative z-10 text-center px-6 max-w-md mx-auto">
          {/* Logo/Icon */}
          <div className={`mb-8 transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="w-24 h-24 mx-auto neumorphic-card rounded-3xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-2xl hover:shadow-violet-300/50 transform hover:scale-105 transition-all duration-300">
              <div className="text-white text-4xl">📱</div>
            </div>
          </div>

          {/* App Name */}
          <div className={`transition-all duration-1000 delay-300 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent mb-3">
              Simply eBay
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 font-medium">
              Point. Scan. Sell. <span className="text-violet-600 dark:text-violet-400">Profit.</span>
            </p>
          </div>

          {/* Features */}
          <div className={`transition-all duration-1000 delay-500 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-white/20 dark:border-gray-700/50">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 dark:text-violet-400">🔍</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">AI-powered item recognition</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-white/20 dark:border-gray-700/50">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 dark:text-emerald-400">🔒</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">100% local processing</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-white/20 dark:border-gray-700/50">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 dark:text-amber-400">⚡</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">One-tap eBay listing</span>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className={`transition-all duration-1000 delay-700 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-48 mx-auto mb-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 rounded-full animate-progress"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
              Initializing AI models...
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 1; }
          }
          .animate-progress {
            animation: progress 2.5s ease-out forwards;
          }
          .animate-float {
            animation: float infinite ease-in-out;
          }
        `}</style>
      </div>
    </>
  );
}
