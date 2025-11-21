'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnIt
            </span>
          </Link>

          <div className="flex gap-6 items-center">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Domů
            </Link>
            <Link
              href="/topics"
              className={`font-medium transition-colors ${
                isActive('/topics')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Témata
            </Link>
            <Link
              href="/progress"
              className={`font-medium transition-colors ${
                isActive('/progress')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Můj pokrok
            </Link>

            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                <span className="text-sm text-gray-700">
                  Ahoj, <span className="font-semibold">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Odhlásit se
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Přihlásit se
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Registrovat se
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
