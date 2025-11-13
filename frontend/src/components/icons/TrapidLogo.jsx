export default function TrapidLogo({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Abstract interlocking circles - suggests collaboration, precision, and flow */}

      {/* Top circle */}
      <circle
        cx="16"
        cy="10"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Bottom-left circle */}
      <circle
        cx="10.5"
        cy="20"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Bottom-right circle */}
      <circle
        cx="21.5"
        cy="20"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Central dot accent (where all circles overlap conceptually) */}
      <circle
        cx="16"
        cy="16"
        r="2"
        fill="currentColor"
      />
    </svg>
  )
}
