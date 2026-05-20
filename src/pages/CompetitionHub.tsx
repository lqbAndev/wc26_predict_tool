import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Trophy, BarChart3 } from 'lucide-react';
import wc26Logo from '../img/tournaments_fifa-world-cup-2026--white_128x128.football-logos.cc.png';

/* ─────────────────────────────────────────────
   Competition Card
   ───────────────────────────────────────────── */
interface CompetitionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  onClick?: () => void;
  locked?: boolean;
}

function CompetitionCard({
  title,
  subtitle,
  icon,
  gradient,
  borderColor,
  onClick,
  locked = false,
}: CompetitionCardProps) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className="hub-card group"
      style={
        {
          '--card-gradient': gradient,
          '--card-border': borderColor,
        } as React.CSSProperties
      }
    >
      {/* glow ring */}
      <div className="hub-card__glow" />

      <div className="hub-card__inner">
        {/* icon */}
        <div className="hub-card__icon">{icon}</div>

        {/* text */}
        <div className="hub-card__text">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        {/* status badge */}
        {locked ? (
          <span className="hub-card__badge hub-card__badge--locked">
            <Lock size={13} />
            Coming Soon
          </span>
        ) : (
          <span className="hub-card__badge hub-card__badge--active">
            Open
          </span>
        )}
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════
   COMPETITION HUB
   ══════════════════════════════════════════════ */
export default function CompetitionHub() {
  const navigate = useNavigate();

  return (
    <div className="hub-root">
      {/* ── ambient BG ── */}
      <div className="hub-bg" />

      {/* ── Header ── */}
      <header className="hub-header">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hub-back-btn"
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>

        <h1 className="hub-title">
          <span className="hub-title__icon">⚽</span>
          Competition Hub
        </h1>

        <div className="hub-header__spacer" />
      </header>

      {/* ── Main content ── */}
      <main className="hub-main">
        {/* CUP COMPETITIONS */}
        <section className="hub-section">
          <div className="hub-section__header">
            <Trophy size={20} className="hub-section__icon hub-section__icon--gold" />
            <h2>CUP COMPETITIONS</h2>
          </div>

          <div className="hub-grid">
            <CompetitionCard
              title="FIFA World Cup 2026"
              subtitle="PREDICT THE FIFA WORLD CUP 2026"
              icon={<img src={wc26Logo} alt="WC26" style={{ width: 48, height: 48, objectFit: 'contain' }} />}
              gradient="linear-gradient(135deg, rgba(34,79,151,0.35), rgba(24,115,91,0.25), rgba(165,52,72,0.2))"
              borderColor="rgba(248,214,109,0.3)"
              onClick={() => navigate('/competition/wc26')}
            />

            {/* Test Cup (dev-only) */}
            {import.meta.env.DEV && (
              <CompetitionCard
                title="Vibe Test Cup"
                subtitle="8 Teams • 2 Groups • Dev Mode"
                icon={
                  <div style={{ fontSize: 32, lineHeight: 1 }}>🧪</div>
                }
                gradient="linear-gradient(135deg, rgba(168,85,247,0.3), rgba(139,92,246,0.2))"
                borderColor="rgba(168,85,247,0.25)"
                onClick={() => navigate('/competition/test-cup')}
              />
            )}

            <CompetitionCard
              title="UEFA Champions League"
              subtitle="Europe's Premier Club Competition"
              icon={
                <div style={{ fontSize: 32, lineHeight: 1 }}>🏆</div>
              }
              gradient="linear-gradient(135deg, rgba(30,64,175,0.3), rgba(99,102,241,0.2))"
              borderColor="rgba(99,102,241,0.25)"
              locked
            />

            <CompetitionCard
              title="Copa America 2028"
              subtitle="South American Championship"
              icon={
                <div style={{ fontSize: 32, lineHeight: 1 }}>🌎</div>
              }
              gradient="linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))"
              borderColor="rgba(16,185,129,0.25)"
              locked
            />
          </div>
        </section>

        {/* LEAGUE COMPETITIONS */}
        <section className="hub-section">
          <div className="hub-section__header">
            <BarChart3 size={20} className="hub-section__icon hub-section__icon--blue" />
            <h2>LEAGUE COMPETITIONS</h2>
          </div>

          <div className="hub-grid">
            <CompetitionCard
              title="Premier League"
              subtitle="English Premier League"
              icon={
                <div style={{ fontSize: 32, lineHeight: 1 }}>🦁</div>
              }
              gradient="linear-gradient(135deg, rgba(147,51,234,0.3), rgba(79,70,229,0.2))"
              borderColor="rgba(147,51,234,0.25)"
              locked
            />

            <CompetitionCard
              title="La Liga"
              subtitle="Spanish First Division"
              icon={
                <div style={{ fontSize: 32, lineHeight: 1 }}>🇪🇸</div>
              }
              gradient="linear-gradient(135deg, rgba(239,68,68,0.3), rgba(249,115,22,0.2))"
              borderColor="rgba(239,68,68,0.25)"
              locked
            />

            <CompetitionCard
              title="V.League"
              subtitle="Vietnamese First Division"
              icon={
                <div style={{ fontSize: 32, lineHeight: 1 }}>🇻🇳</div>
              }
              gradient="linear-gradient(135deg, rgba(239,68,68,0.3), rgba(250,204,21,0.2))"
              borderColor="rgba(250,204,21,0.25)"
              locked
            />

            {/* Test League (dev-only) */}
            {import.meta.env.DEV && (
              <CompetitionCard
                title="Vibe Test League"
                subtitle="8 Teams • Round-Robin • Dev Mode"
                icon={
                  <div style={{ fontSize: 32, lineHeight: 1 }}>🧪</div>
                }
                gradient="linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.2))"
                borderColor="rgba(168,85,247,0.25)"
                onClick={() => navigate('/competition/test-league')}
              />
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="hub-footer">
        <p>Football Prediction Tool v2.2 — Multi-tournament simulation platform</p>
      </footer>
    </div>
  );
}
