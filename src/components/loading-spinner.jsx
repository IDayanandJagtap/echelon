export function LoadingSpinner({ overlay = false }) {
  const spinner = <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-violet-400" />;

  if (overlay) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-black/30">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-10">{spinner}</div>;
}