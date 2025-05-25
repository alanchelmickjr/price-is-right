import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/**
 * Simply eBay Privacy Policy
 * Transparent privacy policy emphasizing local processing and data ownership
 */
export default function PrivacyPolicy() {
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
        <title>Privacy Policy - Simply eBay</title>
        <meta name="description" content="Privacy Policy for Simply eBay - Your data stays private and local" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50">
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
                background: i % 2 === 0 ? 'linear-gradient(135deg, #4338ca 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #047857 0%, #0ea5e9 100%)',
                opacity: 0.2 + (i % 10) * 0.03,
                animation: `float${1 + (i % 3)} ${15 + (i % 15)}s infinite ease-in-out`
              }}
            ></div>
          ))}
        </div>

        {/* Header with glass effect */}
        <div className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-violet-200/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all duration-300 text-violet-600 hover:text-violet-800"
                  aria-label="Go back"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-violet-700 to-emerald-600 bg-clip-text text-transparent">Privacy Policy</h1>
                  <p className="text-gray-600 text-sm">Your data, your device, your choice</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowAIChat(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-100 hover:bg-violet-200 transition-all duration-300 text-violet-600"
                  aria-label="Open privacy assistant"
                >
                  <span className="text-lg">🔒</span>
                </button>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 px-6 max-w-4xl mx-auto pb-20 relative z-10">
          {/* Hero Privacy Statement */}
          <div
            id="hero-section"
            className="animate-on-scroll p-8 mb-8 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-xl transform transition-all duration-700 ease-out"
            style={{
              opacity: animatedSections['hero-section'] ? 1 : 0,
              transform: animatedSections['hero-section'] ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <div className="text-center mb-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 border-4 border-violet-300">
                <span className="text-3xl transform -rotate-12">🔒</span>
              </div>
              <div className="mt-10">
                <h2 className="text-3xl font-bold text-white mb-2">100% Private by Design</h2>
                <p className="text-violet-100">Last updated: May 24, 2025</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 text-white">
              <h3 className="font-bold text-xl mb-2 flex items-center">
                <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2 shadow-inner">🎯</span>
                Our Privacy Promise
              </h3>
              <p className="leading-relaxed">
                Simply eBay is built with privacy as the foundation. Your photos, data, and AI conversations
                never leave your device unless you explicitly choose to create an eBay listing.
                No tracking, no data collection, no corporate surveillance.
              </p>
            </div>
          </div>

          {/* Privacy Sections with enhanced visual design */}
          <div className="space-y-8">
            <div
              id="section-1"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-violet-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-1'] ? 1 : 0,
                transform: animatedSections['section-1'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-violet-600 text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent">
                  Local-First Architecture
                </h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-violet-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-200 flex items-center justify-center mr-3">
                      <span className="text-violet-700">🤖</span>
                    </div>
                    <h4 className="font-semibold text-violet-800">AI Processing</h4>
                  </div>
                  <p className="text-violet-700 pl-11">All AI recognition happens on your device using LlamaFile and SmolVLM. Your photos are processed locally and never uploaded anywhere.</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-violet-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-200 flex items-center justify-center mr-3">
                      <span className="text-violet-700">💾</span>
                    </div>
                    <h4 className="font-semibold text-violet-800">Data Storage</h4>
                  </div>
                  <p className="text-violet-700 pl-11">Account data stored locally using Gun.js peer-to-peer database. No centralized servers collecting your information.</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-violet-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-200 flex items-center justify-center mr-3">
                      <span className="text-violet-700">🔐</span>
                    </div>
                    <h4 className="font-semibold text-violet-800">Encryption</h4>
                  </div>
                  <p className="text-violet-700 pl-11">All local data is encrypted and only accessible through your device authentication.</p>
                </div>
              </div>
            </div>

            <div
              id="section-2"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-rose-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-2'] ? 1 : 0,
                transform: animatedSections['section-2'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-rose-600 text-2xl">🚫</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-rose-700 to-rose-500 bg-clip-text text-transparent">
                  What We DON'T Collect
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Your photos or camera data",
                  "Your location or device identifiers",
                  "Your browsing habits or usage analytics",
                  "Your personal conversations with AI",
                  "Any marketing or advertising data"
                ].map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-rose-50 rounded-xl hover:shadow-md transition-all duration-300">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-rose-600 mr-3 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </div>
                    <span className="text-rose-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              id="section-3"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-emerald-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-3'] ? 1 : 0,
                transform: animatedSections['section-3'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-emerald-600 text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                  What We DO Handle
                </h3>
              </div>
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm mr-3">
                      <span className="text-emerald-600 text-xl">📧</span>
                    </div>
                    <h4 className="font-semibold text-emerald-800 text-lg">Account Creation</h4>
                  </div>
                  <p className="text-emerald-700 pl-13">
                    Email and encrypted password stored locally for authentication.
                    No email verification or marketing communications.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm mr-3">
                      <span className="text-emerald-600 text-xl">🔗</span>
                    </div>
                    <h4 className="font-semibold text-emerald-800 text-lg">eBay Integration</h4>
                  </div>
                  <p className="text-emerald-700 pl-13">
                    Only when you choose to create a listing, minimal data (item title, description, price)
                    is sent to eBay through their official API.
                  </p>
                </div>
              </div>
            </div>

            <div
              id="section-4"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-blue-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-4'] ? 1 : 0,
                transform: animatedSections['section-4'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-blue-600 text-2xl">🛠️</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  Technical Implementation
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl flex items-start hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shadow-sm mr-3 flex-shrink-0 mt-1">
                    <span className="text-blue-700 font-bold">T</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">TensorFlow.js</h4>
                    <p className="text-blue-700 text-sm">Runs AI models in your browser without sending data externally</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl flex items-start hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shadow-sm mr-3 flex-shrink-0 mt-1">
                    <span className="text-blue-700 font-bold">G</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Gun.js</h4>
                    <p className="text-blue-700 text-sm">Peer-to-peer database eliminates centralized data collection</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl flex items-start hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shadow-sm mr-3 flex-shrink-0 mt-1">
                    <span className="text-blue-700 font-bold">L</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">LlamaFile</h4>
                    <p className="text-blue-700 text-sm">Local AI server runs entirely on your device</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl flex items-start hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shadow-sm mr-3 flex-shrink-0 mt-1">
                    <span className="text-blue-700 font-bold">N</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Next.js</h4>
                    <p className="text-blue-700 text-sm">Progressive web app that works offline</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="section-5"
              className="animate-on-scroll p-6 rounded-2xl bg-white shadow-lg border border-amber-100 transition-all duration-700 ease-out"
              style={{
                opacity: animatedSections['section-5'] ? 1 : 0,
                transform: animatedSections['section-5'] ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-amber-600 text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                  Your Controls
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Delete all local data anytime through settings",
                  "Control which photos get processed by AI",
                  "Choose when and what to list on eBay",
                  "Use app completely offline if desired"
                ].map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-amber-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-600 mr-3 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-amber-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact & Open Source */}
          <div
            id="section-6"
            className="animate-on-scroll p-8 mt-8 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-xl text-white transition-all duration-700 ease-out"
            style={{
              opacity: animatedSections['section-6'] ? 1 : 0,
              transform: animatedSections['section-6'] ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/40">
              <span className="text-white text-2xl">🌟</span>
            </div>
            <h3 className="text-2xl font-bold text-center mb-3">Open Source Transparency</h3>
            <p className="mb-6 leading-relaxed text-center max-w-md mx-auto text-white/90">
              Complete source code available on GitHub. Verify our privacy practices yourself,
              contribute improvements, or fork the project. Built with transparency and community in mind.
            </p>
            <div className="flex justify-center">
              <button
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/40 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                <span>View Source Code</span>
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
              <div className="bg-gradient-to-r from-violet-600 to-emerald-600 p-5 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🔒</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Privacy Assistant</h3>
                      <p className="text-xs text-violet-100">Powered by local LlamaFile</p>
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
                  <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                    <div className="flex space-x-3">
                      <div className="w-9 h-9 bg-violet-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-700">🛡️</span>
                      </div>
                      <div>
                        <p className="text-violet-800 leading-relaxed">
                          I can explain how your data stays private and secure. Ask me about local AI processing, data storage, or eBay integration!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-emerald-800 leading-relaxed">
                      <strong>Common questions:</strong>
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-xs">?</span>
                        <span className="text-emerald-700 text-sm">How is my data kept private?</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-xs">?</span>
                        <span className="text-emerald-700 text-sm">Can I use the app offline?</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-xs">?</span>
                        <span className="text-emerald-700 text-sm">What happens when I list on eBay?</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowAIChat(false)}
                    className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Start Privacy Chat</span>
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
PrivacyPolicy.getLayout = function getLayout(page) {
  return page;
};
