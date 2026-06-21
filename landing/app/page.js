import { Icon, Phone, StoreBadge, Wordmark } from './components';

const GITHUB = 'https://github.com/Shan-Joel/CoinInsight';

const FEATURES = [
  { icon: 'scan', title: 'AI identification', text: 'Point your camera at a coin and Claude reads the strike — name, country, year, metal, value range, rarity and confidence.' },
  { icon: 'book', title: 'Every coin’s story', text: 'A short, specific history is written for each coin — and you can chat with an on-demand numismatic expert about it.' },
  { icon: 'search', title: 'A vault that scales', text: 'Search, filter by metal or rarity, sort by value or year, and star your favorites across the whole collection.' },
  { icon: 'chart', title: 'Portfolio dashboard', text: 'Total value front-and-center, allocation by country, your top metal, and the five most valuable pieces you own.' },
  { icon: 'lock', title: 'Private by default', text: 'A 4-digit vault passcode guards the app, and your entire collection lives only on your device.' },
  { icon: 'share', title: 'Share collectible cards', text: 'Export any coin as a beautifully composed card — fonts, gold leaf and all — ready to post anywhere.' },
  { icon: 'shield', title: 'Key-safe AI', text: 'Claude runs behind a serverless proxy, so API keys never ship inside the app. Secure by design.' },
  { icon: 'gem', title: 'Crafted to feel premium', text: 'A warm “collector’s vault” aesthetic with glass panels, gold accents, haptics and fluid motion throughout.' },
];

const SHOWCASE = [
  {
    img: '/screenshots/scan.png',
    eyebrow: 'SCAN',
    title: 'Identify any coin — instantly',
    text: 'Center a coin in the viewfinder and tap once. Vision-grade AI returns a confident identification with an estimated value range in seconds. No reference books, no guesswork.',
    side: 'right',
  },
  {
    img: '/screenshots/detail.png',
    eyebrow: 'KNOWLEDGE',
    title: 'The history behind every piece',
    text: 'Each coin gets an auto-written backstory, then opens a chat with an expert that already knows what you’re holding — rarity, value drivers, authenticity and care.',
    side: 'left',
  },
  {
    img: '/screenshots/dashboard.png',
    eyebrow: 'DASHBOARD',
    title: 'Your portfolio, at a glance',
    text: 'Watch your collection’s worth grow with a live total, an allocation donut by country, your headline stats, and a ranked list of your most valuable coins.',
    side: 'right',
  },
];

const STEPS = [
  { n: '01', title: 'Snap', text: 'Point the in-app camera at a coin, or pick a photo from your library.' },
  { n: '02', title: 'Identify', text: 'Claude reads the design and mintmark and returns the details and value.' },
  { n: '03', title: 'Collect', text: 'One tap drops it into your private vault — analytics update instantly.' },
];

export default function Page() {
  return (
    <main>
      <div className="bg-glow" aria-hidden />

      {/* ---------- Nav ---------- */}
      <header className="nav">
        <div className="container nav-inner">
          <a href="#top" className="nav-brand"><Wordmark /></a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#showcase">Inside</a>
            <a href="#download">Download</a>
            <a className="gh" href={GITHUB} target="_blank" rel="noreferrer" aria-label="View on GitHub">
              <Icon name="github" size={20} />
            </a>
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero container" id="top">
        <div className="hero-copy reveal">
          <span className="eyebrow">AI&nbsp;COIN&nbsp;IDENTIFIER</span>
          <h1 className="hero-title">
            Know what’s in<br />
            <em>your pocket.</em>
          </h1>
          <p className="hero-sub">
            CoinInsight identifies coins from a single photo, writes their history, and curates them
            into a premium, private collector’s vault — powered by Claude.
          </p>

          <div className="store-row">
            <StoreBadge store="apple" />
            <StoreBadge store="google" />
          </div>
          <p className="hero-note">Coming soon to iOS &amp; Android · open-source on GitHub</p>
        </div>

        <div className="hero-art reveal delay-2" aria-hidden>
          <div className="hero-phones">
            <Phone src="/screenshots/dashboard.png" alt="Dashboard" className="ph-back" />
            <Phone src="/screenshots/collection.png" alt="Collection" className="ph-front" />
          </div>
        </div>
      </section>

      {/* ---------- Trust strip ---------- */}
      <section className="container strip">
        <div className="strip-item"><Icon name="sparkle" size={18} /> Claude Haiku vision</div>
        <div className="strip-item"><Icon name="lock" size={18} /> Local-first &amp; private</div>
        <div className="strip-item"><Icon name="gem" size={18} /> Built with React Native + Expo</div>
        <div className="strip-item"><Icon name="shield" size={18} /> Key-safe serverless AI</div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="section container" id="features">
        <div className="section-head">
          <span className="eyebrow">FEATURES</span>
          <h2>Everything a modern collector needs</h2>
          <p>From instant identification to a portfolio that updates the moment you add a coin.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-ico"><Icon name={f.icon} /></div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Showcase ---------- */}
      <section className="section container" id="showcase">
        <div className="section-head">
          <span className="eyebrow">INSIDE THE VAULT</span>
          <h2>A closer look</h2>
        </div>
        {SHOWCASE.map((s) => (
          <div className={`showcase ${s.side === 'left' ? 'flip' : ''}`} key={s.title}>
            <div className="showcase-copy">
              <span className="eyebrow">{s.eyebrow}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
            <div className="showcase-art">
              <Phone src={s.img} alt={s.title} />
            </div>
          </div>
        ))}
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section container">
        <div className="section-head">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>Three taps from curiosity to collection</h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Security band ---------- */}
      <section className="section container">
        <div className="security">
          <div className="security-copy">
            <span className="eyebrow">PRIVACY</span>
            <h2>Yours alone.</h2>
            <p>
              Your collection and profile never leave your device. The vault is gated by a passcode,
              and every AI request flows through a serverless proxy — so your keys stay server-side,
              never bundled in the app.
            </p>
            <div className="security-tags">
              <span><Icon name="lock" size={16} /> Passcode vault</span>
              <span><Icon name="shield" size={16} /> Server-side keys</span>
              <span><Icon name="gem" size={16} /> On-device storage</span>
            </div>
          </div>
          <div className="security-art">
            <Phone src="/screenshots/lock.png" alt="Passcode lock" />
            <Phone src="/screenshots/settings.png" alt="Settings" className="security-secondary" />
          </div>
        </div>
      </section>

      {/* ---------- Download CTA ---------- */}
      <section className="section container" id="download">
        <div className="cta">
          <span className="eyebrow">GET THE APP</span>
          <h2>Start your vault</h2>
          <p>CoinInsight is launching on the App Store and Google Play. Stars on GitHub welcome in the meantime.</p>
          <div className="store-row center">
            <StoreBadge store="apple" />
            <StoreBadge store="google" />
          </div>
          <a className="gh-cta" href={GITHUB} target="_blank" rel="noreferrer">
            <Icon name="github" size={18} /> View the source on GitHub
          </a>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <Wordmark />
            <p className="footer-tag">Your private collector’s vault.</p>
          </div>
          <a href={GITHUB} target="_blank" rel="noreferrer" className="footer-gh" aria-label="GitHub">
            <Icon name="github" size={18} /> GitHub
          </a>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} CoinInsight - All Rights Reserved!</p>
      </footer>
    </main>
  );
}
