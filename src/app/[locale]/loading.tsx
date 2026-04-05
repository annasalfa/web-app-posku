export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({length: 6}).map((_, index) => (
        <div
          key={index}
          className="surface-grid overflow-hidden rounded-[var(--radius-card)] border border-border/80 bg-card shadow-sm"
        >
          <div className="space-y-4 p-5 md:p-6">
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-2/3 animate-pulse rounded-full bg-muted/90" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded-full bg-muted/80" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-muted/70" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-[var(--radius-large)] bg-muted/60" />
              <div className="h-24 animate-pulse rounded-[var(--radius-large)] bg-muted/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
