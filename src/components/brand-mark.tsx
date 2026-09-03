export function OtterMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className ?? "size-4"}>
      <path
        d="M4 11.5c2-2.5 4.2-2.5 6 0s3.8 2.5 6 0 4.2-2.5 6-0.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M4 17c2-2.5 4.2-2.5 6 0s3.8 2.5 6 0 4.2-2.5 6-0.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
