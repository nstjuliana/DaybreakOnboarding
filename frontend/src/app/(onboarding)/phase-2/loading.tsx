/**
 * @file Phase 2 Loading State
 * @description Loading skeleton for Phase 2 screener page.
 *
 * @see {@link _docs/ui-rules.md} Loading States
 */

/**
 * Loading skeleton for Phase 2
 */
export default function Phase2Loading() {
  return (
    <div className="flex flex-col items-center animate-pulse">
      {/* Header skeleton */}
      <div className="text-center mb-8 max-w-xl">
        <div className="h-8 bg-muted rounded-lg w-48 mx-auto mb-3" />
        <div className="h-5 bg-muted rounded-lg w-72 mx-auto" />
      </div>

      {/* Progress bar skeleton */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between mb-2">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
        <div className="h-2 bg-muted rounded-full" />
      </div>

      {/* Questions skeleton */}
      <div className="w-full max-w-2xl space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex gap-3 mb-3">
              <div className="h-6 w-6 bg-muted rounded-full flex-shrink-0" />
              <div className="h-5 bg-muted rounded w-3/4" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-12 bg-muted rounded-lg" />
              <div className="flex-1 h-12 bg-muted rounded-lg" />
              <div className="flex-1 h-12 bg-muted rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

