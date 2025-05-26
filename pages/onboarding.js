import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Onboarding() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated (optional: add logic if needed)

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Simply eBay</title>
        <meta name="description" content="AI-powered mobile selling made simple. Point, scan, sell. 100% local processing. One-tap eBay listing creation." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#8b5cf6" />
      </Head>
      <div className="centered-layout min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="neumorphic-card p-10 max-w-lg w-full text-center animate-fade-in">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600">
              <span className="text-5xl">📱</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{color: "var(--neutral-800)"}}>
            Simply eBay
          </h1>
          <div className="badge badge-primary mb-4">AI-Powered</div>
          <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
            Point your camera at any item and get instant AI-powered price suggestions.<br />
            Create eBay listings with one tap.<br />
            100% local processing - privacy first.
          </p>
          <div className="space-y-2 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>AI-powered item recognition</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Real-time price suggestions</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>One-tap eBay listing</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Local AI processing</span>
            </div>
          </div>
          <button
            className="neumorphic-button-primary px-8 py-4 text-white font-semibold text-lg"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <p className="text-xs mt-4 text-gray-500">
            No credit card required • Free to use
          </p>
        </div>
      </div>
    </>
  );
}

// Prevent the default layout with header from being applied
Onboarding.getLayout = function getLayout(page) {
  return page;
};
