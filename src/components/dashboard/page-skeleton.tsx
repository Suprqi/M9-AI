import { Skeleton } from "@/components/ui/misc";

/**
 * Route-level fallback.
 *
 * Only safe in segments that always return 200. A `loading.tsx` opens a
 * streaming boundary, which locks the HTTP status before `notFound()` or a
 * `redirect()` can run — so never add one to a segment with dynamic children
 * or an authorization gate. See the note in README.
 */
export function PageSkeleton({
  rows = 5,
  stats = false,
}: {
  rows?: number;
  stats?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80" />

      {stats ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
