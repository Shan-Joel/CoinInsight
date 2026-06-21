// Inline SVG icons + small presentational components for the landing page.

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function Icon({ name, size = 22 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', ...S, 'aria-hidden': true };
  switch (name) {
    case 'scan':
      return (
        <svg {...p}>
          <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...p}>
          <path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3Z" />
          <path d="M18.5 14.5l.7 2 .8.6-.8.5-.7 2-.7-2-.8-.5.8-.6.7-2Z" />
        </svg>
      );
    case 'book':
      return (
        <svg {...p}>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H18a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 17.5V5.5Z" />
          <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
        </svg>
      );
    case 'search':
      return (
        <svg {...p}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-3.6-3.6" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...p}>
          <path d="M4 20h16" />
          <path d="M7 20v-6M12 20V8M17 20v-9" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...p}>
          <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
          <circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'share':
      return (
        <svg {...p}>
          <circle cx="6" cy="12" r="2.4" />
          <circle cx="18" cy="6" r="2.4" />
          <circle cx="18" cy="18" r="2.4" />
          <path d="m8.1 10.9 7.8-3.8M8.1 13.1l7.8 3.8" />
        </svg>
      );
    case 'gem':
      return (
        <svg {...p}>
          <path d="M6 4h12l3 5-9 11L3 9l3-5Z" />
          <path d="M3 9h18M9 4l3 16M15 4l-3 16" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...p}>
          <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'github':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.34 9.34 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
        </svg>
      );
    case 'apple':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M16.36 12.84c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.95 1.16 9.22.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75 1.39 0 1.79.75 3.01.72 1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.45-3.68ZM14.13 6.1c.64-.78 1.07-1.85.95-2.93-.92.04-2.03.61-2.69 1.39-.59.69-1.11 1.79-.97 2.85 1.02.08 2.07-.52 2.71-1.31Z" />
        </svg>
      );
    case 'play':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path d="M4 3.6 14.2 12 4 20.4c-.35.18-.7-.08-.7-.5V4.1c0-.42.35-.68.7-.5Z" fill="#34d39955" stroke="#34d399" strokeWidth="1.1" />
          <path d="M14.2 12 4 20.4 17 13.2 14.2 12Z" fill="#f8dd8755" stroke="#f8dd87" strokeWidth="1.1" />
          <path d="M14.2 12 4 3.6 17 10.8 14.2 12Z" fill="#e08a2e55" stroke="#e08a2e" strokeWidth="1.1" />
          <path d="m14.2 12 4-2.2c.6.34.6 1.06 0 1.4L14.2 12Z" fill="#5b92d655" stroke="#5b92d6" strokeWidth="1.1" />
        </svg>
      );
    default:
      return null;
  }
}

export function Phone({ src, alt, className = '' }) {
  return (
    <div className={`phone ${className}`}>
      <div className="phone-screen">
        <div className="phone-statusbar" />
        <img src={src} alt={alt} loading="lazy" />
        <div className="phone-home">
          <span />
        </div>
      </div>
    </div>
  );
}

export function StoreBadge({ store }) {
  const label = store === 'apple' ? 'App Store' : 'Google Play';
  return (
    <div className="store-badge" role="button" aria-disabled="true" title="Coming soon">
      <span className="store-ico">
        <Icon name={store === 'apple' ? 'apple' : 'play'} size={22} />
      </span>
      <span className="store-text">
        <small>Coming soon on</small>
        <strong>{label}</strong>
      </span>
      <span className="store-soon">SOON</span>
    </div>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark-mark">✦</span> CoinInsight
    </span>
  );
}
