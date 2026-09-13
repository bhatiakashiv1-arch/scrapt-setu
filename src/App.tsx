import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { TopBar, BottomNav, SideNav } from '@/components/Navigation';
import { Landing } from '@/pages/Landing';
import { Auth } from '@/pages/Auth';
import { CollectorHome } from '@/pages/collector/CollectorHome';
import { SellScrap } from '@/pages/collector/SellScrap';
import { MyLots } from '@/pages/collector/MyLots';
import { Earnings } from '@/pages/collector/Earnings';
import { Profile } from '@/pages/collector/Profile';
import { SafetyCenter } from '@/pages/collector/SafetyCenter';
import { PriceBoard } from '@/pages/collector/PriceBoard';
import { Traceability } from '@/pages/collector/Traceability';
import { ClusterPickup } from '@/pages/collector/ClusterPickup';
import { RecyclerDashboard } from '@/pages/recycler/RecyclerDashboard';
import { IncomingLots } from '@/pages/recycler/IncomingLots';
import { RecyclerQuotes } from '@/pages/recycler/RecyclerQuotes';
import { Pickups } from '@/pages/recycler/Pickups';
import { RecyclerTransactions } from '@/pages/recycler/RecyclerTransactions';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminMaterials } from '@/pages/admin/AdminMaterials';
import { AdminPrices } from '@/pages/admin/AdminPrices';
import { AdminRecyclers } from '@/pages/admin/AdminRecyclers';
import { AdminTransactions } from '@/pages/admin/AdminTransactions';
import { AdminTraceability } from '@/pages/admin/AdminTraceability';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { DatasetExplorer } from '@/pages/admin/DatasetExplorer';
import { UnitEconomics } from '@/pages/admin/UnitEconomics';
import { FieldResearch } from '@/pages/admin/FieldResearch';
import type { Role } from '@/types';

export type Page = string;

function AppContent() {
  const { role, lang, setRole, setLang, isOnline, pendingSync, lastSynced, syncNow, loadDemoScenario, authUser, authReady, logout } = useApp();
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);

  // Restore session on refresh
  useEffect(() => {
    if (authReady && authUser && !entered) {
      setEntered(true);
      setPage(authUser.role === 'collector' ? 'home' : 'dashboard');
    }
  }, [authReady, authUser, entered]);

  const handleEnter = (r: Role) => {
    // If user is already authenticated, go straight in
    if (authUser) {
      setRole(r);
      setEntered(true);
      setPage(r === 'collector' ? 'home' : 'dashboard');
      return;
    }
    // Otherwise show auth screen
    setRole(r);
    setShowAuth(true);
  };

  const handleAuthed = (r: Role) => {
    setShowAuth(false);
    setRole(r);
    setEntered(true);
    setPage(r === 'collector' ? 'home' : 'dashboard');
  };

  const handleLoadDemo = async () => {
    await loadDemoScenario();
    setRole('collector');
    setEntered(true);
    setPage('home');
  };

  const handleRoleChange = (r: Role) => {
    setRole(r);
    setPage(r === 'collector' ? 'home' : 'dashboard');
  };

  const handleLogout = async () => {
    await logout();
    setEntered(false);
    setShowAuth(false);
    setPage('home');
  };

  const renderPage = () => {
    if (role === 'collector') {
      switch (page) {
        case 'home': return <CollectorHome onNavigate={setPage} />;
        case 'sell': return <SellScrap onNavigate={setPage} />;
        case 'myLots': return <MyLots onNavigate={setPage} />;
        case 'earnings': return <Earnings />;
        case 'profile': return <Profile />;
        case 'safety': return <SafetyCenter />;
        case 'priceBoard': return <PriceBoard />;
        case 'traceability': return <Traceability />;
        case 'cluster': return <ClusterPickup />;
        case 'unitEconomics': return <UnitEconomics />;
        default: return <CollectorHome onNavigate={setPage} />;
      }
    }
    if (role === 'recycler') {
      switch (page) {
        case 'dashboard': return <RecyclerDashboard onNavigate={setPage} />;
        case 'incomingLots': return <IncomingLots onNavigate={setPage} />;
        case 'quotes': return <RecyclerQuotes onNavigate={setPage} />;
        case 'pickups': return <Pickups onNavigate={setPage} />;
        case 'transactions': return <RecyclerTransactions />;
        case 'profile': return <Profile />;
        default: return <RecyclerDashboard onNavigate={setPage} />;
      }
    }
    // admin
    switch (page) {
      case 'dashboard': return <AdminDashboard onNavigate={setPage} />;
      case 'materials': return <AdminMaterials />;
      case 'prices': return <AdminPrices />;
      case 'recyclers': return <AdminRecyclers />;
      case 'transactions': return <AdminTransactions onNavigate={setPage} />;
      case 'traceability': return <AdminTraceability />;
      case 'analytics': return <AdminAnalytics />;
      case 'datasetExplorer': return <DatasetExplorer />;
      case 'unitEconomics': return <UnitEconomics />;
      case 'fieldResearch': return <FieldResearch />;
      default: return <AdminDashboard onNavigate={setPage} />;
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#C65D3B] border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
      </div>
    );
  }

  if (showAuth) {
    return <Auth onAuthed={handleAuthed} />;
  }

  if (!entered) {
    return <Landing onEnter={handleEnter} onLoadDemo={handleLoadDemo} />;
  }

  const pageTitle = page.charAt(0).toUpperCase() + page.slice(1).replace(/([A-Z])/g, ' $1');

  return (
    <div className="min-h-screen bg-[#F8F3EA]">
      <TopBar
        role={role}
        lang={lang}
        onRoleChange={handleRoleChange}
        onLangChange={setLang}
        isOnline={isOnline}
        pendingSync={pendingSync}
        onSync={syncNow}
        lastSynced={lastSynced}
        onLoadDemo={handleLoadDemo}
        title={pageTitle}
        onLogout={handleLogout}
        userName={authUser?.name}
      />
      <div className="flex">
        <SideNav activePage={page} onPageChange={setPage} role={role} lang={lang} />
        <main className="flex-1 min-h-screen">
          {renderPage()}
        </main>
      </div>
      <BottomNav activePage={page} onPageChange={setPage} role={role} lang={lang} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
