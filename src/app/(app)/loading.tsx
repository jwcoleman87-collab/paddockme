export default function AppLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-4 motion-reduce:animate-none">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-2/3 rounded-[8px] bg-sage-mist" aria-hidden />
      <div className="h-4 w-1/2 rounded-[8px] bg-sage-mist/70" aria-hidden />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-[8px] bg-sage-mist/60" aria-hidden />
        <div className="h-40 rounded-[8px] bg-sage-mist/60" aria-hidden />
      </div>
    </div>
  );
}
