import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Banknote,
  Compass,
  MapPin,
  Package,
  Plus,
  Radio,
  Route as RouteIcon,
  Signal,
  Sparkles,
  Landmark,
} from 'lucide-react';
import './LandingPage.css';
import stationImg from '../assets/station.jpg';

/* ---------- data ---------- */
const STOPS = [
  'Circle', 'Madina', 'Kaneshie', 'Tema Station', 'Lapaz', 'Osu', 'Kasoa', 'Accra Mall',
  'Achimota', 'Legon', 'Spintex', 'Mallam', 'Dansoman', 'Ashaiman', 'Teshie', 'Adenta',
];

const FEATURES = [
  {
    icon: Radio,
    title: 'Live trotro routes',
    text: 'See the real corridors vehicles run today, not a printed guess. Pick a stop and watch the line light up.',
    span: 'wide',
    tone: 'ink',
  },
  {
    icon: Banknote,
    title: 'Fares in cedis',
    text: 'Know the GH₵ before you board and never overpay again.',
    tone: 'clay',
  },
  {
    icon: Landmark,
    title: 'Landmark cues',
    text: 'Directions the way Ghana gives them: "after the big tree, before the chop bar".',
    tone: 'sand',
  },
  {
    icon: BellRing,
    title: 'Sleep alarm',
    text: 'Doze off on the long ride. We wake you two stops before yours.',
    tone: 'sand',
  },
  {
    icon: Package,
    title: 'Send a package',
    text: 'Hand parcels to a driver already headed your way, tracked end to end.',
    tone: 'ochre',
  },
];

const STEPS = [
  { n: '01', title: 'Say where', text: 'Type your stop or drop a pin. We know more than 20,000 of them.' },
  { n: '02', title: 'Pick your line', text: 'Compare routes, transfers and fares, then choose the smartest one.' },
  { n: '03', title: 'Ride in confidence', text: 'Follow the live route, get landmark cues and an alarm for your stop.' },
];

const CORRIDORS = [
  { name: 'Circle → Madina', fare: '8.50', time: '42 min', stops: 14, note: 'Busiest line in Accra at rush hour.' },
  { name: 'Kaneshie → Tema', fare: '12.00', time: '58 min', stops: 19, note: 'Long haul, best with the sleep alarm.' },
  { name: 'Lapaz → Kasoa', fare: '10.00', time: '65 min', stops: 17, note: 'Fills fast. Leave 15 minutes earlier.' },
  { name: 'Osu → Spintex', fare: '9.00', time: '38 min', stops: 12, note: 'Smoother after 9 am.' },
];

const FAQ = [
  { q: 'Is Spark Motion free?', a: 'Yes. Planning routes, fares and landmark cues is free, with no account needed to start moving.' },
  { q: 'Where does the route data come from?', a: 'From riders, drivers and mates on the ground, checked against real stops across Ghana.' },
  { q: 'Does it work on a weak connection?', a: 'The core route finder is light on data so it keeps working when the network is patchy.' },
  { q: 'Can I send a package?', a: 'Yes. Choose Send package, add pickup and drop-off, and a driver on that corridor carries it.' },
];

/* ---------- hooks ---------- */
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`sm-reveal ${shown ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Counter({ to, suffix = '', decimals = 0 }) {
  const [ref, shown] = useReveal();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!shown) return undefined;
    let raf;
    const start = performance.now();
    const dur = 1800;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, to]);
  return (
    <span ref={ref}>
      {val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* ---------- brand stage ---------- */
function BrandStage() {
  const [ref, shown] = useReveal();
  const logoRef = useRef(null);

  const onMove = (e) => {
    const el = logoRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--tx', `${(-y * 14).toFixed(2)}deg`);
    el.style.setProperty('--ty', `${(x * 14).toFixed(2)}deg`);
  };
  const onLeave = () => {
    const el = logoRef.current;
    if (!el) return;
    el.style.setProperty('--tx', '0deg');
    el.style.setProperty('--ty', '0deg');
  };

  return (
    <section className={`sm-brand-stage ${shown ? 'is-in' : ''}`} ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="sm-grain" aria-hidden="true" />
      <div className="sm-brand-word" aria-hidden="true">SPARK MOTION</div>
      <div className="sm-brand-orbit">
        <i className="ring r1" /><i className="ring r2" /><i className="ring r3" />
        <div className="sm-orbit-path o1"><b /></div>
        <div className="sm-orbit-path o2"><b /></div>
        <div className="sm-brand-logo" ref={logoRef}>
          <div className="sm-brand-logo-inner">
            <img src="/logo.png" alt="Spark Motion logo" />
            <span className="sm-shine" aria-hidden="true" />
          </div>
        </div>
      </div>
      <p className="sm-brand-tag">
        <span>Spark</span> <em>Motion</em>
      </p>
      <p className="sm-brand-sub sm-mono">Every stop. Every ride. Every Ghana.</p>
    </section>
  );
}

/* ---------- component ---------- */
export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [corridor, setCorridor] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [eta, setEta] = useState(4);

  /* nav state + parallax + cursor glow */
  useEffect(() => {
    const root = rootRef.current;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (root) root.style.setProperty('--sm-scroll', String(y));
    };
    const onMove = (e) => {
      if (!root) return;
      root.style.setProperty('--sm-mx', `${e.clientX}px`);
      root.style.setProperty('--sm-my', `${e.clientY}px`);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  /* live ETA ticker */
  useEffect(() => {
    const id = setInterval(() => setEta((e) => (e <= 1 ? 6 : e - 1)), 2600);
    return () => clearInterval(id);
  }, []);

  const goMap = () => navigate('/');
  const c = CORRIDORS[corridor];
  const headline = ['Know', 'every', 'stop.'];

  return (
    <div className="sm-root" ref={rootRef}>
      <div className="sm-cursor-glow" aria-hidden="true" />

      {/* NAV */}
      <header className={`sm-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="sm-brand" href="#top" aria-label="Spark Motion home">
          <img src="/logo.png" alt="" />
          <span>Spark Motion</span>
        </a>
        <nav className="sm-nav-links" aria-label="Sections">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#lines">Routes</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="sm-btn sm-btn-clay sm-btn-sm" onClick={goMap} id="nav-open-map">
          Open map <ArrowUpRight size={16} />
        </button>
      </header>

      {/* HERO */}
      <section className="sm-hero" id="top">
        <div className="sm-grain" aria-hidden="true" />
        <div className="sm-blob sm-blob-a" aria-hidden="true" />
        <div className="sm-blob sm-blob-b" aria-hidden="true" />

        <div className="sm-hero-inner">
          <div className="sm-hero-copy">
            <p className="sm-eyebrow sm-fade" style={{ animationDelay: '0.1s' }}>
              <span className="sm-live-dot" /> Ghana&apos;s trotro, finally mapped
            </p>
            <h1 className="sm-h1">
              <span className="sm-line">
                <span style={{ animationDelay: '0.2s' }}>Ride</span>{' '}
                <em style={{ animationDelay: '0.3s' }}>Ghana.</em>
              </span>
              <span className="sm-line">
                {headline.map((w, i) => (
                  <span key={w} style={{ animationDelay: `${0.45 + i * 0.12}s` }}>
                    {w}{' '}
                  </span>
                ))}
              </span>
            </h1>
            <p className="sm-lede sm-fade" style={{ animationDelay: '0.9s' }}>
              Real routes, honest fares and landmark directions for every trotro corridor,
              built by the people who ride them.
            </p>
            <div className="sm-cta-row sm-fade" style={{ animationDelay: '1.05s' }}>
              <button className="sm-btn sm-btn-clay" onClick={goMap} id="hero-start">
                Start exploring <ArrowRight size={18} />
              </button>
              <a className="sm-btn sm-btn-ghost" href="#how">See how it works</a>
            </div>
          </div>

          {/* phone with animated route */}
          <div className="sm-hero-visual sm-fade" style={{ animationDelay: '0.5s' }}>
            <div className="sm-phone">
              <div className="sm-phone-notch" />
              <div className="sm-phone-screen">
                <svg viewBox="0 0 300 540" className="sm-map" aria-hidden="true">
                  <defs>
                    <pattern id="smgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M30 0H0V30" fill="none" stroke="rgba(250,246,240,0.06)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="300" height="540" fill="url(#smgrid)" />
                  <path className="sm-road" d="M-10 420 C 80 400, 90 300, 150 280 S 230 170, 310 110" />
                  <path className="sm-road sm-road-2" d="M40 -10 C 70 120, 190 150, 160 280 S 120 440, 170 560" />
                  <path
                    id="smroute"
                    className="sm-route-draw"
                    d="M30 470 C 90 430, 90 320, 150 290 S 220 190, 270 120"
                    pathLength="100"
                  />
                  <circle cx="30" cy="470" r="7" className="sm-stop" />
                  <circle cx="150" cy="290" r="6" className="sm-stop sm-stop-mid" />
                  <circle cx="270" cy="120" r="9" className="sm-stop sm-stop-end" />
                  <g>
                    <circle r="16" className="sm-bus-pulse" />
                    <circle r="8" className="sm-bus" />
                    <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
                      <mpath href="#smroute" />
                    </animateMotion>
                  </g>
                </svg>
                <div className="sm-sheet">
                  <div className="sm-sheet-row">
                    <span className="sm-mono">CIRCLE → MADINA</span>
                    <span className="sm-pill">GH₵ 8.50</span>
                  </div>
                  <div className="sm-sheet-eta">
                    <strong>{eta}</strong> min
                    <span>to your trotro</span>
                  </div>
                  <div className="sm-sheet-bar"><i /></div>
                </div>
              </div>
            </div>

            <div className="sm-chip sm-chip-a">
              <MapPin size={14} /> After Legon Gate
            </div>
            <div className="sm-chip sm-chip-b">
              <BellRing size={14} /> Wake me at Madina
            </div>
          </div>
        </div>

        <div className="sm-scroll-cue" aria-hidden="true"><i /> Scroll</div>
      </section>

      {/* MARQUEE */}
      <div className="sm-marquee" aria-hidden="true">
        <div className="sm-marquee-track">
          {[...STOPS, ...STOPS].map((s, i) => (
            <span key={`${s}-${i}`}>
              {s}
              <b>✺</b>
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="sm-stats">
        <Reveal className="sm-stat">
          <strong><Counter to={20000} suffix="+" /></strong>
          <span>stops mapped</span>
        </Reveal>
        <Reveal className="sm-stat" delay={100}>
          <strong><Counter to={1200} suffix="+" /></strong>
          <span>trotro routes</span>
        </Reveal>
        <Reveal className="sm-stat" delay={200}>
          <strong><Counter to={16} /></strong>
          <span>regions covered</span>
        </Reveal>
        <Reveal className="sm-stat" delay={300}>
          <strong>GH₵<Counter to={0} /></strong>
          <span>to get started</span>
        </Reveal>
      </section>

      <BrandStage />

      {/* FEATURES */}
      <section className="sm-section sm-sand" id="features">
        <Reveal className="sm-head">
          <p className="sm-eyebrow sm-eyebrow-dark">What you get</p>
          <h2 className="sm-h2">
            Everything the <em>mate</em> shouts, in your pocket.
          </h2>
        </Reveal>
        <div className="sm-bento">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal
                key={f.title}
                delay={i * 90}
                className={`sm-card tone-${f.tone} ${f.span === 'wide' ? 'is-wide' : ''}`}
              >
                <div className="sm-card-icon"><Icon size={22} strokeWidth={2} /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <ArrowUpRight className="sm-card-arrow" size={22} />
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sm-section sm-ink" id="how">
        <div className="sm-grain" aria-hidden="true" />
        <Reveal className="sm-head">
          <p className="sm-eyebrow">How it works</p>
          <h2 className="sm-h2">
            From <em>&ldquo;wey dey go?&rdquo;</em> to seated.
          </h2>
        </Reveal>
        <div className="sm-steps">
          <span className="sm-steps-line" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 140} className="sm-step">
              <span className="sm-step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PHOTO BAND */}
      <section className="sm-photo">
        <div
          className="sm-photo-img"
          style={{ backgroundImage: `url(${stationImg})` }}
          aria-hidden="true"
        />
        <div className="sm-photo-shade" />
        <Reveal className="sm-photo-copy">
          <Sparkles size={28} />
          <blockquote>
            &ldquo;I stopped asking three people which trotro to take. Now I just look.&rdquo;
          </blockquote>
          <cite>Daily commuter, Madina to Circle</cite>
        </Reveal>
      </section>

      {/* CORRIDORS */}
      <section className="sm-section sm-paper" id="lines">
        <Reveal className="sm-head">
          <p className="sm-eyebrow sm-eyebrow-dark">Popular lines</p>
          <h2 className="sm-h2">Pick a corridor, <em>feel</em> the ride.</h2>
        </Reveal>
        <div className="sm-lines">
          <div className="sm-tabs" role="tablist">
            {CORRIDORS.map((x, i) => (
              <button
                key={x.name}
                role="tab"
                aria-selected={i === corridor}
                className={`sm-tab ${i === corridor ? 'is-active' : ''}`}
                onClick={() => setCorridor(i)}
              >
                <RouteIcon size={16} /> {x.name}
              </button>
            ))}
          </div>
          <div className="sm-line-card" key={c.name}>
            <div className="sm-line-meta">
              <div><span className="sm-mono">FARE</span><strong>GH₵ {c.fare}</strong></div>
              <div><span className="sm-mono">TIME</span><strong>{c.time}</strong></div>
              <div><span className="sm-mono">STOPS</span><strong>{c.stops}</strong></div>
            </div>
            <div className="sm-dots" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => (
                <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
              <span className="sm-dots-bus"><Signal size={14} /></span>
            </div>
            <p className="sm-line-note">{c.note}</p>
            <button className="sm-btn sm-btn-ink" onClick={goMap}>
              Plan this ride <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sm-section sm-sand" id="faq">
        <Reveal className="sm-head">
          <p className="sm-eyebrow sm-eyebrow-dark">Questions</p>
          <h2 className="sm-h2">Good to <em>know.</em></h2>
        </Reveal>
        <div className="sm-faq">
          {FAQ.map((f, i) => (
            <div key={f.q} className={`sm-faq-item ${openFaq === i ? 'is-open' : ''}`}>
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                {f.q}
                <Plus size={22} />
              </button>
              <div className="sm-faq-body"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="sm-cta">
        <div className="sm-grain sm-grain-light" aria-hidden="true" />
        <div className="sm-cta-big" aria-hidden="true">LET&apos;S GO</div>
        <Reveal className="sm-cta-inner">
          <h2 className="sm-h2">Your next ride <em>starts here.</em></h2>
          <button className="sm-btn sm-btn-ink sm-btn-lg" onClick={goMap} id="cta-open-map">
            <Compass size={20} /> Open the map
          </button>
        </Reveal>
      </section>

      <footer className="sm-footer">
        <div className="sm-brand sm-brand-foot">
          <img src="/logo.png" alt="" />
          <span>Spark Motion</span>
        </div>
        <p>Made in Ghana for every trotro rider.</p>
        <span className="sm-mono">© {new Date().getFullYear()} Spark Motion</span>
      </footer>
    </div>
  );
}
