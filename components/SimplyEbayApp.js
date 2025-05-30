import { useState, useEffect } from 'react'
import AuthForm from './auth/AuthForm'
import LiveCamera from './camera/LiveCamera'

export default function SimplyEbayApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  return (
    <div className="min-h-screen flex flex-col">

      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Simply eBay</h1>
          {currentUser && (
            <span className="text-sm">Welcome, {currentUser.alias}</span>
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        {!isAuthenticated ? (
          <AuthForm 
            onAuthSuccess={(user) => {
              setIsAuthenticated(true)
              setCurrentUser(user)
            }}
          />
        ) : (
          <LiveCamera />
        )}
      </main>
    </div>
  )
}