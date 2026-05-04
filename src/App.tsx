import { useState } from 'react';
import { Header } from './components/Header';
import { MovieQuotes } from './components/MovieQuotes';
import { Leaderboard } from './components/Leaderboard';
import { PromoBanner } from './components/PromoBanner';
import { Footer } from './components/Footer';
import { RulesModal } from './components/RulesModal';
import { AuthModal } from './components/AuthModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { MarketModal } from './components/MarketModal';
import { MarketPreview } from './components/MarketPreview';
import { PortfolioModal } from './components/PortfolioModal';
import { PrizesModal } from './components/PrizesModal';
import { AdminShell } from './components/AdminShell';
import { AuthProvider } from './hooks/useAuth';

function HomePage({ onEnterAdmin }: { onEnterAdmin: () => void }) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [prizesOpen, setPrizesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <Header
        onOpenRules={() => setRulesOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onOpenMarket={() => setMarketOpen(true)}
        onOpenPrizes={() => setPrizesOpen(true)}
        onOpenPortfolio={() => setPortfolioOpen(true)}
        onEnterAdmin={onEnterAdmin}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 lg:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:w-[64%] lg:flex-none flex flex-col gap-6">
            <PromoBanner />
            <MovieQuotes />
          </div>
          <div className="lg:w-[36%] flex flex-col gap-6">
            <MarketPreview onOpenFull={() => setMarketOpen(true)} />
            <Leaderboard onOpenFull={() => setLeaderboardOpen(true)} />
          </div>
        </div>
      </main>

      <Footer />

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onForgotPassword={() => { setAuthOpen(false); setForgotOpen(true); }}
      />
      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBackToLogin={() => { setForgotOpen(false); setAuthOpen(true); }}
        onGoToReset={(token) => { setForgotOpen(false); setResetToken(token); setResetOpen(true); }}
      />
      <ResetPasswordModal
        open={resetOpen}
        onClose={() => { setResetOpen(false); setResetToken(""); }}
        onBackToLogin={() => { setResetOpen(false); setResetToken(""); setAuthOpen(true); }}
        token={resetToken}
      />
      <LeaderboardModal open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      <MarketModal open={marketOpen} onClose={() => setMarketOpen(false)} />
      <PortfolioModal open={portfolioOpen} onClose={() => setPortfolioOpen(false)} />
      <PrizesModal open={prizesOpen} onClose={() => setPrizesOpen(false)} />
    </div>
  );
}

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <AuthProvider>
      {showAdmin ? (
        <AdminShell onExit={() => setShowAdmin(false)} />
      ) : (
        <HomePage onEnterAdmin={() => setShowAdmin(true)} />
      )}
    </AuthProvider>
  );
}

export default App;
