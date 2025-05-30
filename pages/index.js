import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Index page - Immediately redirects to splash (client-side only)
 */
export default function IndexPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      router.replace('/splash');
    }
  }, [router, mounted]);

  // Always render null to prevent hydration issues
  return null;
}

// Prevent the default layout from being applied to avoid hydration issues
IndexPage.getLayout = function getLayout(page) {
  return page;
};

