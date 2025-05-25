import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Sequence animation phases
    const phaseTimer = setTimeout(() => {
      setAnimationPhase(1);
    }, 600);

    // Show splash for 3 seconds, then redirect based on auth status
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
      clearTimeout(phaseTimer);
      clearTimeout(redirectTimer);
    };
  }, [isAuthenticated, loading, router]);

  if (!showSplash && !loading) {
    return null; // Let the redirect happen
  }

  return (
    <>
      <Head>
        <title>Simply eBay - AI-Powered Selling</title>
        <meta name="description" content="Simply eBay - The AI-powered tool to quickly scan, identify, and list items on eBay with 100% private local processing" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-violet-400 blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-40 h-40 rounded-full bg-amber-400 blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-32 w-36 h-36 rounded-full bg-emerald-400 blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-32 right-16 w-44 h-44 rounded-full bg-fuchsia-400 blur-xl animate-pulse delay-500"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-${1 + (i % 3)} h-${1 + (i % 3)} rounded-full bg-white opacity-${30 + (i % 7) * 10}`}
              style={{
                top: `${10 + (i * 23) % 80}%`,
                left: `${5 + (i * 17) % 90}%`,
                animation: `float${1 + (i % 3)} ${10 + (i % 10)}s infinite ease-in-out`,
              }}
            ></div>
          ))}
        </div>

        {/* Main splash content with staggered entrance */}
        <div className="text-center z-10 px-8 w-full max-w-md mx-auto">
          {/* Logo/Icon with hover effects */}
          <div
            className={`mb-8 relative transition-all duration-700 transform ${
              animationPhase === 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
            }`}
          >
            <div className="w-36 h-36 mx-auto bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-violet-200/50 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
              <div className="relative text-white text-5xl z-10">📱</div>
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-amber-500/30 rounded-full blur-xl"></div>
            </div>
            {/* Robot icon removed as requested */}
          </div>

          {/* Brand name with animated gradient */}
          <h1
            className={`text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent mb-3 transition-all duration-700 transform ${
              animationPhase === 0 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            Simply eBay
          </h1>

          {/* Tagline with smooth entrance */}
          <p
            className={`text-xl md:text-2xl text-gray-600 mb-6 font-medium transition-all duration-700 delay-100 transform ${
              animationPhase === 0 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            Point. Scan. Sell. <span className="text-violet-600">Profit.</span>
          </p>

          {/* Features with modern styling */}
          <div
            className={`space-y-3 mb-8 max-w-md mx-auto transition-all duration-700 delay-200 transform ${
              animationPhase === 0 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm p-2 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-violet-600 text-lg">🔍</span>
              </div>
              <span className="text-gray-700">AI-powered item recognition</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm p-2 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-lg">🔒</span>
              </div>
              <span className="text-gray-700">100% local processing - complete privacy</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm p-2 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-lg">⚡</span>
              </div>
              <span className="text-gray-700">One-tap eBay listing creation</span>
            </div>
          </div>

          {/* Enhanced loading indicator */}
          <div
            className={`transition-all duration-700 delay-300 transform ${
              animationPhase === 0 ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className="w-36 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 rounded-full animate-progress"></div>
              </div>
            </div>

            {/* Loading text with shimmer effect */}
            <p className="text-gray-600 text-sm font-medium animate-pulse">
              Initializing AI models...
            </p>
          </div>
        </div>

        {/* AI Chat Button with improved styling */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-violet-300/50 transition-all duration-300 hover:scale-110 z-20"
          aria-label="Open AI Chat"
        >
          <div className="text-white text-xl">🧠</div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping"></div>
        </button>

        {/* Improved AI Chat Popup */}
        {chatOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-fadeIn">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[500px] overflow-hidden transform animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🧠</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">AI Assistant</h3>
                      <p className="text-xs text-violet-100">Powered by local SmolVLM</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
                    aria-label="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <iframe
                  src="/api/chat-test"
                  className="w-full h-[350px] border-0 rounded-lg bg-gray-50"
                  title="AI Chat Test"
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced animations */}
        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .animate-progress {
            animation: progress 3s ease-out forwards;
          }
          @keyframes float1 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          @keyframes float2 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(15px) translateX(-15px); }
          }
          @keyframes float3 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-25px) translateX(-10px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
}
