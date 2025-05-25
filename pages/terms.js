import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/**
 * Simply eBay Terms of Service
 * Privacy-first, transparent terms for our open source app
 */
export default function TermsOfService() {
  const router = useRouter();
  const [showAIChat, setShowAIChat] = useState(false);
  const [animatedSections, setAnimatedSections] = useState({});
  
  // Intersection Observer setup for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setAnimatedSections(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(section => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Head>
        <title>Terms of Service - Simply eBay</title>
        <meta name="description" content="Terms of Service for Simply eBay - AI-powered mobile selling app" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        {/* Floating shapes background */}
        <div className="fixed inset-0 overflow-hidden z-0 opacity-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-2xl"
              style={{
                width: `${100 + (i * 40)}px`,
                height: `${100 + (i * 40)}px`,
                top: `${(i * 17) % 90}%`,
                left: `${(i * 13) % 85}%`,
                background: i % 2 === 0 ? 'linear-gradient(135deg, #d97706 0%, #0369a1 100%)' : 'linear-gradient(135deg, #0891b2 0%, #f59e0b 100%)',
                opacity: 0.2 + (i % 10) * 0.03,
                animation: `float${1 + (i % 3)} ${15 + (i % 15)}s infinite ease-in-out`
              }}
            ></div>
          ))}
        </div>

        {/* Header with glass effect */}
        <div className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all duration-300 text-amber-600 hover:text-amber-800"
                  aria-label="Go back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-blue-600 bg-clip-text text-transparent">Terms of Service</h1>
                  <p className="text-gray-600 text-sm">Simply eBay v1.0.0</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowAIChat(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 hover:bg-amber-200 transition-all duration-300 text-amber-600"
                  aria-label="Open legal assistant"
                >
                  <span className="text-lg">🧠</span>
                </button>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 px-6 max-w-4xl mx-auto pb-20 relative z-10">
          {/* Introduction with animation */}
          <div
            id="intro-section"
            className="animate-on-scroll p-8 mb-8 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-xl transform transition-all duration-700 ease-out"
            style={{
              opacity: animatedSections['intro-section'] ? 1 : 0,
              transform: animatedSections['intro-section'] ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <div className="text-center mb-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 border-4 border-amber-300">
                <span className="text-3xl transform -rotate-12">📱</span>
              </div>
              <div className="mt-10">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome to Simply eBay</h2>
                <p className="text-amber-100">Last updated: May 24, 2025</p>
              </div>
            </div>

            <div className="text-white space-y-4">
              <p className="leading-relaxed">
                Simply eBay is an open-source, privacy-first mobile application that helps you sell items on eBay
                using AI-powered recognition and pricing.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <h3 className="font-bold text-xl mb-2 flex items-center">
                  <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2 shadow-inner">🔒</span>
                  Privacy First Promise
                </h3>
                <p className="leading-relaxed">
                  All AI processing happens locally on your device. Your photos, data, and conversations
                  never leave your phone unless you explicitly choose to list an item on eBay.
                </p>
              </div>
            </div>
          </div>

          {/* Key Terms Sections */}
          <div className="space-y-8">
            {/* AI & Local Processing Section */}
            <div
              id="section-1"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-blue-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-1'] ? 1 : 0,
                transform: animatedSections['section-1'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-blue-600 text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  AI & Local Processing
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "All AI recognition runs locally using your device's processing power",
                  "No photos or data are sent to external servers for AI analysis",
                  "LlamaFile and SmolVLM models run entirely on your device",
                  "You maintain full control over your data at all times"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 bg-blue-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 mr-3 flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-blue-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Usage Section */}
            <div
              id="section-2"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-emerald-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-2'] ? 1 : 0,
                transform: animatedSections['section-2'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-emerald-600 text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                  Data Usage
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Account data stored locally using Gun.js peer-to-peer database",
                  "No centralized servers collecting your personal information",
                  "eBay integration only activates when you choose to create a listing",
                  "You can delete all local data at any time"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 bg-emerald-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 mr-3 flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-emerald-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* eBay Integration Section */}
            <div
              id="section-3"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-amber-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-3'] ? 1 : 0,
                transform: animatedSections['section-3'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-amber-600 text-2xl">🔗</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                  eBay Integration
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "eBay listings created only when you explicitly choose to do so",
                  "You maintain full control over what gets listed and when",
                  "eBay's terms and policies apply to any listings you create",
                  "Simply eBay acts as a tool to help format and submit listings"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 bg-amber-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 mr-3 flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-amber-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Source Section */}
            <div
              id="section-4"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-indigo-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-4'] ? 1 : 0,
                transform: animatedSections['section-4'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-indigo-600 text-2xl">⚖️</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
                  Open Source
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Complete source code available under MIT License",
                  "Community contributions welcome and encouraged",
                  "Transparent development with no hidden functionality",
                  "Built with love by Claude Sonnet 3.5, Alan Helmick, and Maximus"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 bg-indigo-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 mr-3 flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-indigo-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimers Section */}
            <div
              id="section-5"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-rose-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-5'] ? 1 : 0,
                transform: animatedSections['section-5'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-rose-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-rose-700 to-rose-500 bg-clip-text text-transparent">
                  Disclaimers
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "AI suggestions are estimates - verify pricing before listing",
                  "Users responsible for compliance with eBay policies",
                  'App provided "as-is" without warranties',
                  "Use at your own risk for commercial activities"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 bg-rose-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center text-rose-700 mr-3 flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                    <span className="text-rose-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact & GitHub Section */}
          <div
            id="section-6"
            className="animate-on-scroll p-8 mt-8 rounded-2xl bg-gradient-to-br from-blue-500 to-amber-600 shadow-xl text-white transition-all duration-700 ease-out"
            style={{
              opacity: animatedSections['section-6'] ? 1 : 0,
              transform: animatedSections['section-6'] ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/40">
              <span className="text-white text-2xl">❓</span>
            </div>
            <h3 className="text-2xl font-bold text-center mb-3">Questions?</h3>
            <p className="mb-6 leading-relaxed text-center max-w-md mx-auto text-white/90">
              This is an open-source project. For issues, feature requests, or contributions,
              visit our GitHub repository.
            </p>
            <div className="flex justify-center">
              <button
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/40 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                <span>View on GitHub</span>
              </button>
            </div>
          </div>
        </div>

        {/* Improved AI Chat Popup */}
        {showAIChat && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[500px] overflow-hidden transform animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-amber-600 to-blue-600 p-5 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🧠</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">AI Legal Assistant</h3>
                      <p className="text-xs text-amber-100">Powered by local LlamaFile</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIChat(false)}
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
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex space-x-3">
                      <div className="w-9 h-9 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-700">📜</span>
                      </div>
                      <div>
                        <p className="text-amber-800 leading-relaxed">
                          I can explain our terms in simple language. Ask me anything about privacy, data usage, or eBay integration!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-blue-800 leading-relaxed">
                      <strong>Common questions:</strong>
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-xs">?</span>
                        <span className="text-blue-700 text-sm">What warranties are provided?</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-xs">?</span>
                        <span className="text-blue-700 text-sm">Do eBay's terms apply to my listings?</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-xs">?</span>
                        <span className="text-blue-700 text-sm">What's covered by the MIT license?</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowAIChat(false)}
                    className="w-full bg-gradient-to-r from-amber-600 to-blue-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Start Legal Chat</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced animations */}
        <style jsx>{`
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

// Prevent the default layout with header from being applied
TermsOfService.getLayout = function getLayout(page) {
  return page;
};
