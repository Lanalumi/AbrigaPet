export function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 19 19"
      className={`size-[19px] shrink-0 ${className}`.trim()}
      fill="none"
    >
      <path
        d="M5 7L9.5 12L14 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
