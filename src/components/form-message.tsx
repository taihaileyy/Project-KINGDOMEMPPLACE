export function FormMessage({ error, notice }: { error?: string; notice?: string }) {
  if (error)
    return (
      <p role="alert" className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
        {error}
      </p>
    );
  if (notice)
    return (
      <p role="status" className="rounded-[var(--radius-control)] border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
        {notice}
      </p>
    );
  return null;
}
