import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Index page - Redirect to splash
 */
export default function IndexPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Immediate redirect to splash
    router.replace('/splash');
  }, [router]);

  // Return null during SSR and before mounting to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return null;
}

// Prevent the default layout from being applied to avoid hydration issues
IndexPage.getLayout = function getLayout(page) {
  return page;
};
