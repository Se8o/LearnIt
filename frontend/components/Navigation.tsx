'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnIt
            </span>
            <span className="text-2xl">🎓</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-6">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
