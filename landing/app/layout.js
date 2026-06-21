import './globals.css';

export const metadata = {
  title: 'CoinInsight — AI coin identifier & collector’s vault',
  description:
    'Snap a coin and let AI identify it — name, country, year, metal, value and rarity. CoinInsight writes every coin’s history, tracks your portfolio, and keeps it all in a private, on-device vault.',
  metadataBase: new URL('https://github.com/Shan-Joel/CoinInsight'),
  openGraph: {
    title: 'CoinInsight — AI coin identifier & collector’s vault',
    description:
      'Identify coins with AI, learn their history, and curate a premium private collection.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#0e0a07',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
