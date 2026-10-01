// A thin arrow that steps forward when its link (marked `group`) is hovered.
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 12"
      className={`h-3 w-6 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M0 6h22M17 1l5 5-5 5" />
    </svg>
  );
}
