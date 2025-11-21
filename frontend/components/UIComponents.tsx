'use client';

import { useState } from 'react';

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

/**
 * Komponenta pro zobrazení chybových hlášek
 */
export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-xl">⚠️</span>
        <div>
          <p className="text-sm font-medium text-red-800">Chyba</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="Zavřít chybovou hlášku"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Hook pro error state management
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === 'string') {
      setError(err);
    } else if (err && typeof err === 'object' && 'error' in err) {
      setError(String(err.error));
    } else {
      setError('Něco se pokazilo. Zkuste to prosím znovu.');
    }

    // Auto-dismiss po 5 sekundách
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

/**
 * Komponenta pro zobrazení loading stavu
 */
export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ text = 'Načítání...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * Empty state komponenta
 */
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
