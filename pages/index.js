import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Index page - Immediately redirects to splash (client-side only)
 */
export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/splash');
  }, [router]);

  // Prevent SSR/hydration mismatch: render nothing
  return null;
}

// Prevent the default layout from being applied to avoid hydration issues
IndexPage.getLayout = function getLayout(page) {
  return page;
};

