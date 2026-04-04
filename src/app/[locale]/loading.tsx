export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({length: 6}).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-[2rem] bg-[var(--color-surface-container-low)]"
        />
      ))}
    </div>
  );
}
