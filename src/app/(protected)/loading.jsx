export default function Loading() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/35 backdrop-blur-[2px]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-cyan-400" />
    </div>
  );
}
