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
        <Link href="/" className="text-xl font-bold hover:text-gray-300 flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white p-2 rounded-lg shadow-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              {/* eBay-style shopping/listing icon */}
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
              <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
              {/* Camera/scan indicator */}
              <circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.8"/>
              <path d="M18 4.5L18.5 5.5L19.5 6L18.5 6.5L18 7.5L17.5 6.5L16.5 6L17.5 5.5L18 4.5Z" fill="white"/>
            </svg>
          </div>
          <span>Simply eBay</span>
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