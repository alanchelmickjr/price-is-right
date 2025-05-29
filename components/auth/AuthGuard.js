import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

/**
 * A Higher-Order Component or wrapper to protect routes that require authentication.
 * If the user is not authenticated, they are redirected to the login page.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The component/page to render if authenticated.
 * @param {React.ReactNode} [props.fallback] - Optional component to render while loading auth state.
 * @returns {JSX.Element | null} The protected component or null/fallback during redirect/loading.
 */
export default function AuthGuard({ children, fallback = null }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const willRedirect = !loading && !isAuthenticated;
    // Detailed log includes user object for diagnostics
    console.log('[AuthGuard] useEffect:', {
      loading,
      isAuthenticated,
      user,
      pathname: router.pathname,
      willRedirect
    });

    if (willRedirect) {
      // Store the attempted path to redirect back after login
      // Avoid storing if the current path is already an auth page
      if (!router.pathname.startsWith('/auth')) {
        sessionStorage.setItem('redirectAfterLogin', router.asPath);
      }
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router, user]);

  if (loading) {
    console.log('[AuthGuard] Render: loading', { loading, isAuthenticated, user, pathname: router.pathname });
    return fallback || <div className="flex justify-center items-center min-h-screen">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    // Should be redirecting, but return null to prevent flash of content
    console.log('[AuthGuard] Render: redirecting', { loading, isAuthenticated, user, pathname: router.pathname });
    return null;
  }

  // If authenticated, render the children components
  console.log('[AuthGuard] Render: children', { loading, isAuthenticated, user, pathname: router.pathname });
  return <>{children}</>;
}

/**
 * HOC version to wrap a page component.
 * Example usage: export default withAuthGuard(MyProtectedPage);
 */
export const withAuthGuard = (WrappedComponent) => {
  const Wrapper = (props) => (
    <AuthGuard>
      <WrappedComponent {...props} />
    </AuthGuard>
  );

  // Copy static properties like getInitialProps if they exist
  if (WrappedComponent.getInitialProps) {
    Wrapper.getInitialProps = WrappedComponent.getInitialProps;
  }
  
  // Set a display name for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  Wrapper.displayName = `withAuthGuard(${displayName})`;

  return Wrapper;
};