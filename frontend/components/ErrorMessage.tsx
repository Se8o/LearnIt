interface ErrorMessageProps {
  title?: string;
  message: string;
  showBackendHint?: boolean;
}

export function ErrorMessage({ 
  title = 'Chyba načítání', 
  message, 
  showBackendHint = false 
}: ErrorMessageProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-red-800 font-semibold mb-2">{title}</h2>
        <p className="text-red-600">{message}</p>
        {showBackendHint && (
          <p className="text-sm text-red-500 mt-2">
            Ujistěte se, že backend běží na http://localhost:3001
          </p>
        )}
      </div>
    </div>
  );
}
