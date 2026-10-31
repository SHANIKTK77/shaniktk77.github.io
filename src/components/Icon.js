// Small line icons drawn on a 16px grid with a 1.5px stroke. Decorative only:
// every icon sits next to text that already says what the control does.

const paths = {
  arrow: <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />,
  down: <path d="M8 3v10M3.5 8.5L8 13l4.5-4.5" />,
  copy: (
    <>
      <rect x="5.5" y="5.5" width="8" height="8" />
      <path d="M10.5 5.5v-3h-8v8h3" />
    </>
  ),
  check: <path d="M3 8.5l3.2 3L13 4.5" />,
  sun: (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7L13 13M3 13l1.3-1.3M11.7 4.3L13 3" />
    </>
  ),
  moon: <path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1z" />,
};

export default function Icon({ name, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
