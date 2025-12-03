interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Načítám...' }: LoadingSpinnerProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
