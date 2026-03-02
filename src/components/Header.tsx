import { Link } from 'react-router-dom';
import { Bot, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const { user, handleSignIn, handleSignOut } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight text-neutral-900">CodeHeal</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-indigo-600 transition-colors">Home</Link>
          <a href="/#features" className="text-sm font-medium text-neutral-600 hover:text-indigo-600 transition-colors">Features</a>
          <a href="/#pricing" className="text-sm font-medium text-neutral-600 hover:text-indigo-600 transition-colors">Pricing</a>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-indigo-600 transition-colors">Dashboard</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border border-neutral-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="hidden sm:inline">{user.user_name || user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className="text-sm font-medium text-neutral-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={handleSignIn}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
