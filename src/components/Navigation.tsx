import { Home, Tag, Package, Wallet, User, LayoutDashboard, Inbox, FileText, Truck, Receipt, Boxes, DollarSign, Building2, Activity, Database, Mic, Wifi, WifiOff, RefreshCw, Check, Globe, LogOut } from 'lucide-react';
import type { Role, Language } from '@/types';
import { t } from '@/services/i18n';
import { Button } from './ui';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export function getNavItems(role: Role, lang: Language): NavItem[] {
  if (role === 'collector') {
    return [
      { key: 'home', label: t(lang, 'home'), icon: <Home size={20} /> },
      { key: 'sell', label: t(lang, 'sell'), icon: <Tag size={20} /> },
      { key: 'myLots', label: t(lang, 'myLots'), icon: <Package size={20} /> },
      { key: 'earnings', label: t(lang, 'earnings'), icon: <Wallet size={20} /> },
      { key: 'profile', label: t(lang, 'profile'), icon: <User size={20} /> },
    ];
  }
  if (role === 'recycler') {
    return [
      { key: 'dashboard', label: t(lang, 'dashboard'), icon: <LayoutDashboard size={20} /> },
      { key: 'incomingLots', label: t(lang, 'incomingLots'), icon: <Inbox size={20} /> },
      { key: 'quotes', label: t(lang, 'quotes'), icon: <FileText size={20} /> },
      { key: 'pickups', label: t(lang, 'pickups'), icon: <Truck size={20} /> },
      { key: 'transactions', label: t(lang, 'transactions'), icon: <Receipt size={20} /> },
      { key: 'profile', label: t(lang, 'profile'), icon: <User size={20} /> },
    ];
  }
  return [
    { key: 'dashboard', label: t(lang, 'dashboard'), icon: <LayoutDashboard size={20} /> },
    { key: 'materials', label: t(lang, 'materials'), icon: <Boxes size={20} /> },
    { key: 'prices', label: t(lang, 'prices'), icon: <DollarSign size={20} /> },
    { key: 'recyclers', label: t(lang, 'recyclers'), icon: <Building2 size={20} /> },
    { key: 'transactions', label: t(lang, 'transactions'), icon: <Receipt size={20} /> },
    { key: 'traceability', label: t(lang, 'traceability'), icon: <Activity size={20} /> },
    { key: 'analytics', label: t(lang, 'analytics'), icon: <Activity size={20} /> },
    { key: 'datasetExplorer', label: t(lang, 'datasetExplorer'), icon: <Database size={20} /> },
  ];
}

export function BottomNav({ activePage, onPageChange, role, lang }: { activePage: string; onPageChange: (page: string) => void; role: Role; lang: Language }) {
  const items = getNavItems(role, lang);
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40 md:hidden">
      <div className="flex justify-around items-center h-16 px-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onPageChange(item.key)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
              activePage === item.key ? 'text-[#C65D3B]' : 'text-stone-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export function SideNav({ activePage, onPageChange, role, lang }: { activePage: string; onPageChange: (page: string) => void; role: Role; lang: Language }) {
  const items = getNavItems(role, lang);
  return (
    <nav className="hidden md:flex flex-col w-60 bg-white border-r border-stone-200 h-screen sticky top-0 overflow-y-auto">
      <div className="px-5 py-5 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C65D3B] flex items-center justify-center">
            <RecycleIcon />
          </div>
          <div>
            <p className="font-bold text-stone-800 text-sm">ScrapSetu</p>
            <p className="text-[10px] text-stone-400">{role === 'collector' ? 'Collector' : role === 'recycler' ? 'Recycler' : 'Admin'} Portal</p>
          </div>
        </div>
      </div>
      <div className="flex-1 py-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onPageChange(item.key)}
            className={`flex items-center gap-3 px-5 py-2.5 w-full text-left text-sm font-medium transition-colors ${
              activePage === item.key
                ? 'bg-[#C65D3B]/10 text-[#C65D3B] border-r-2 border-[#C65D3B]'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function RecycleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
      <path d="m14 16-3 3 3 3" />
      <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
      <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
      <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
    </svg>
  );
}

export function TopBar({
  role,
  lang,
  onRoleChange,
  onLangChange,
  isOnline,
  pendingSync,
  onSync,
  lastSynced,
  onLoadDemo,
  title,
  onLogout,
  userName,
}: {
  role: Role;
  lang: Language;
  onRoleChange: (role: Role) => void;
  onLangChange: (lang: Language) => void;
  isOnline: boolean;
  pendingSync: number;
  onSync: () => void;
  lastSynced?: string;
  onLoadDemo: () => void;
  title?: string;
  onLogout?: () => void;
  userName?: string;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#C65D3B] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
              <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
              <path d="m14 16-3 3 3 3" />
              <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
              <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
              <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
            </svg>
          </div>
          {title && <h1 className="font-bold text-stone-800 text-sm md:text-base truncate">{title}</h1>}
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Sync status */}
          <div className="flex items-center gap-1">
            {isOnline ? (
              pendingSync > 0 ? (
                <button onClick={onSync} className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                  <RefreshCw size={14} className="animate-spin" />
                  <span className="hidden sm:inline">{pendingSync}</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Wifi size={14} />
                  {lastSynced && <span className="hidden lg:inline text-stone-400">Synced</span>}
                </span>
              )
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                <WifiOff size={14} />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}
          </div>

          {/* Language */}
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value as Language)}
            className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white text-stone-600"
          >
            <option value="en">EN</option>
            <option value="hi">हिं</option>
            <option value="mr">मरा</option>
          </select>

          {/* Demo role switcher */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
            {(['collector', 'recycler', 'admin'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  role === r ? 'bg-[#C65D3B] text-white' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {r === 'collector' ? 'Collector' : r === 'recycler' ? 'Recycler' : 'Admin'}
              </button>
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={onLoadDemo} className="hidden md:flex">
            Demo
          </Button>

          {userName && (
            <span className="text-xs text-stone-600 font-medium hidden sm:inline max-w-[120px] truncate">{userName}</span>
          )}
          {onLogout && (
            <button onClick={onLogout} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50" title="Logout">
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">DEMO MODE</span>
        {!isOnline && <span className="text-[10px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">OFFLINE MODE</span>}
        {pendingSync > 0 && <span className="text-[10px] text-amber-600 font-medium">Pending Sync: {pendingSync}</span>}
      </div>
    </header>
  );
}
