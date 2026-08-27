export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-navy-900/20 border-t-navy-900 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-2xl bg-navy-900/5" />
      <div className="mt-3.5 h-3 w-16 rounded bg-navy-900/5" />
      <div className="mt-2 h-4 w-3/4 rounded bg-navy-900/5" />
      <div className="mt-2 h-4 w-1/3 rounded bg-navy-900/5" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" data-testid="page-loader">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
