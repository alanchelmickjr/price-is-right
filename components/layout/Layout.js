import React from 'react';

/**
 * A simple layout component that wraps page content.
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The page content to be rendered.
 * @returns {JSX.Element} The Layout component.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      {/* You can add a Footer component here if needed */}
      {/* <footer className="bg-gray-200 text-center p-4">
        &copy; {new Date().getFullYear()} eBay Helper
      </footer> */}
    </div>
  );
}