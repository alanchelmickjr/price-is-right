import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Router redirection is handled within the logout function in AuthContext
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          eBay Helper
        </Link>
        <div className="space-x-4 flex items-center">
          {loading ? (
            <span>Loading...</span>
          ) : isAuthenticated && user ? (
            <>
              <span className="text-sm">Welcome, {user.email}</span>
              <Link href="/items/scan" className="hover:text-gray-300 bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm font-medium">
                📷 Scan
              </Link>
              <Link href="/items" className="hover:text-gray-300">
                Items
              </Link>
              <Link href="/items/new" className="hover:text-gray-300">
                New Item
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link href="/onboarding" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}