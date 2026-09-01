export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };
  return (
    <div className={`${sizes[size]} border-gray-200 border-t-primary-700 rounded-full animate-spin ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-red-gradient rounded-2xl flex items-center justify-center shadow-red-md animate-pulse">
          <span className="text-white font-display font-bold text-xl">TF</span>
        </div>
        <LoadingSpinner size="md" />
        <p className="text-sm text-gray-500 font-medium">TECH FEST '26</p>
      </div>
    </div>
  );
}
