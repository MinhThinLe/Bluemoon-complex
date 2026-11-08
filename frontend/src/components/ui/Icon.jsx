const iconShapes = {
  moon: <><path d="M20.7 14.2A8.6 8.6 0 0 1 9.8 3.3 8.7 8.7 0 1 0 20.7 14.2Z" /><path d="M16.5 3.5v4M14.5 5.5h4" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="2.5" /><path d="M3 8h18M16 14h2" /><path d="M6 5V4a1.5 1.5 0 0 1 1.5-1.5H19" /></>,
  message: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3.5 2v-6A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11h8M8 14h5" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
  chevron: <path d="m7 10 5 5 5-5" />,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 9h17" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  check: <path d="m5 12 4.2 4.2L19 6.5" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m7.5 12 3 3 6-6" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5M12 16h.01" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h2M14 7h2M9 11h2M14 11h2M9 15h2M14 15h2M10 21v-3h4v3" /></>,
  arrowUpRight: <><path d="M7 17 17 7M7 7h10v10" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <><path d="M4 6h16M7 12h10m-7 6h4" /><circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M8 13h8M8 17h6" /></>,
  send: <><path d="m21 3-7.5 18-3.5-7-7-3.5L21 3Z" /><path d="M10 14 21 3" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1Z" /></>,
  receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2Z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
  car: <><path d="m5 11 1.5-5h11L19 11l2 2v5h-2M3 18v-5l2-2" /><path d="M5 11h14M7 18h10M6 18v2M18 18v2" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></>,
  droplet: <><path d="M12 3S5.5 10.2 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10.2 12 3 12 3Z" /><path d="M9 15a3 3 0 0 0 3 3" /></>,
  leaf: <><path d="M20.5 3.5C11 3.5 5 6.5 5 13a5.5 5.5 0 0 0 5.5 5.5c6.5 0 9.5-6 10-15Z" /><path d="M3.5 21c3-6 7-9 12-12" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
  dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
}

export default function Icon({ name, size = 20, strokeWidth = 1.8, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {iconShapes[name] || iconShapes.sparkle}
    </svg>
  )
}
