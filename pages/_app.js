import React, { useEffect } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import '../styles/globals.css'; // Assuming you have or will create this for global styles

function MyApp({ Component, pageProps }) {
  // Register service worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Pages like login/register might not need the full layout,
  // or might have a different layout. This can be handled by
  // adding a property to the page component, e.g., Component.getLayout
  // For now, we apply the main layout to all pages.
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <>
      <Head>
        <meta name="application-name" content="Simply eBay" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Simply eBay" />
        <meta name="description" content="AI-powered camera app to scan, identify, and list items on eBay instantly" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Prevent zoom on mobile forms */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <AuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </>
  );
}

export default MyApp;