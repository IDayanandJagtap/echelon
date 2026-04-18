export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-violet-400" />
    </div>
  );
}