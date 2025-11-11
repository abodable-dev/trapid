export default function TrapidLogo({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Geometric T mark with construction theme */}
      {/* Vertical beam (like a construction pillar) */}
      <rect
        x="13"
        y="8"
        width="6"
        height="20"
        fill="currentColor"
        rx="1"
      />

      {/* Horizontal beam (top of T, like a construction beam) */}
      <rect
        x="6"
        y="4"
        width="20"
        height="6"
        fill="currentColor"
        rx="1"
      />

      {/* Small accent triangle at bottom (foundation/stability) */}
      <path
        d="M 16 28 L 12 24 L 20 24 Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  )
}
