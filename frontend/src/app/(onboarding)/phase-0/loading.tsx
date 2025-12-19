/**
 * @file Phase 0 Loading State
 * @description Loading skeleton for Phase 0 page.
 *
 * @see {@link _docs/ui-rules.md} Loading States
 */

/**
 * Loading skeleton for Phase 0
 */
export default function Phase0Loading() {
  return (
    <div className="flex flex-col items-center animate-pulse">
      {/* Hero section skeleton */}
      <div className="text-center mb-10 max-w-xl">
        <div className="h-10 bg-muted rounded-lg w-3/4 mx-auto mb-4" />
        <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto" />
      </div>

      {/* Cards skeleton */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-border bg-card p-6"
            >
              <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
              <div className="h-6 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className="mt-8 flex justify-center">
          <div className="h-12 bg-muted rounded-md w-[200px]" />
        </div>
      </div>
    </div>
  );
}

