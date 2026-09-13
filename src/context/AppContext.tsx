import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Role, Language, Collector, Lot, Quote, Transaction, TraceabilityEvent, Earning, Material, Price, Recycler } from '@/types';
import { getCurrentRole, setCurrentRole, getCurrentLanguage, setCurrentLanguage, getCurrentAuthUser, onAuthStateChange, signOut, type AuthUser } from '@/services/authService';
import { fetchCollector, updateCollector } from '@/services/collectorService';
import { fetchMaterials } from '@/services/materialService';
import { fetchPrices } from '@/services/priceService';
import { fetchRecyclers } from '@/services/recyclerService';
import { fetchLots, createLot, updateLotStatus } from '@/services/lotService';
import { fetchQuotes, createQuote, updateQuoteStatus } from '@/services/quoteService';
import { fetchTransactions, createTransaction, updateTransaction } from '@/services/transactionService';
import { fetchTraceabilityByLot, addTraceabilityEvent } from '@/services/traceabilityService';
import { fetchEarnings, addEarning } from '@/services/earningsService';
import { getPendingSyncCount, processSyncQueue, getSyncStatus, setSyncStatus } from '@/services/syncService';
import { DEMO_LOT, DEMO_QUOTE, DEMO_TRANSACTION, DEMO_TRACEABILITY, DEMO_EARNINGS } from '@/services/demoData';
import { setItem } from '@/services/storage';

interface AppContextType {
  role: Role;
  lang: Language;
  setRole: (r: Role) => void;
  setLang: (l: Language) => void;
  isOnline: boolean;
  pendingSync: number;
  lastSynced?: string;
  syncNow: () => Promise<void>;
  loadDemoScenario: () => Promise<void>;
  collector: Collector | null;
  materials: Material[];
  prices: Price[];
  recyclers: Recycler[];
  lots: Lot[];
  quotes: Quote[];
  transactions: Transaction[];
  earnings: Earning[];
  refreshData: () => Promise<void>;
  addLot: (lot: Omit<Lot, 'id' | 'reference_id' | 'created_at' | 'updated_at' | 'status'> & { status?: Lot['status'] }) => Promise<Lot | null>;
  setLotStatus: (lotId: string, status: Lot['status']) => Promise<void>;
  addQuote: (quote: Omit<Quote, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: Quote['status'] }) => Promise<Quote | null>;
  setQuoteStatus: (quoteId: string, status: Quote['status'], counterRate?: number) => Promise<void>;
  completeTransaction: (lotId: string, collectorId: string, recyclerId: string, materialName: string, finalWeight: number, finalPrice: number, paymentMethod: string) => Promise<Transaction | null>;
  getTraceability: (lotId: string) => Promise<TraceabilityEvent[]>;
  addTraceability: (lotId: string, eventType: TraceabilityEvent['event_type'], description: string, actorType?: string, actorId?: string, location?: string, referenceId?: string) => Promise<void>;
  updateCollectorProfile: (updates: Partial<Collector>) => Promise<void>;
  authUser: AuthUser | null;
  authReady: boolean;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(getCurrentRole());
  const [lang, setLangState] = useState<Language>(getCurrentLanguage());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(getPendingSyncCount());
  const [lastSynced, setLastSynced] = useState<string | undefined>(getSyncStatus().lastSync);

  const [collector, setCollector] = useState<Collector | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const setRole = useCallback((r: Role) => { setCurrentRole(r); setRoleState(r); }, []);
  const setLang = useCallback((l: Language) => { setCurrentLanguage(l); setLangState(l); }, []);

  const refreshData = useCallback(async () => {
    const userId = authUser?.id;
    const [c, mats, prs, recs, lts, qts, txns, ens] = await Promise.all([
      fetchCollector(userId),
      fetchMaterials(),
      fetchPrices(),
      fetchRecyclers(),
      fetchLots(userId),
      fetchQuotes(),
      fetchTransactions(),
      fetchEarnings(),
    ]);
    setCollector(c);
    setMaterials(mats);
    setPrices(prs);
    setRecyclers(recs);
    setLots(lts);
    setQuotes(qts);
    setTransactions(txns);
    setEarnings(ens);
  }, [authUser?.id]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const initialUser = await getCurrentAuthUser();
      setAuthUser(initialUser);
      setAuthReady(true);
      unsub = onAuthStateChange((user) => {
        setAuthUser(user);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    if (authReady) refreshData();
  }, [authReady, refreshData]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('online');
      if (pendingSync > 0) {
        processSyncQueue().then(() => {
          setPendingSync(0);
          setLastSynced(new Date().toISOString());
        });
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync]);

  const syncNow = useCallback(async () => {
    setSyncStatus('syncing');
    await processSyncQueue();
    setPendingSync(0);
    setLastSynced(new Date().toISOString());
    setSyncStatus('synced');
    await refreshData();
  }, [refreshData]);

  const loadDemoScenario = useCallback(async () => {
    setItem('lots', [DEMO_LOT]);
    setItem('quotes', [DEMO_QUOTE]);
    setItem('transactions', [DEMO_TRANSACTION]);
    setItem('traceability', DEMO_TRACEABILITY);
    setItem('earnings', DEMO_EARNINGS);
    await refreshData();
  }, [refreshData]);

  const addLot = useCallback(async (lot: Omit<Lot, 'id' | 'reference_id' | 'created_at' | 'updated_at' | 'status'> & { status?: Lot['status'] }) => {
    const newLot = await createLot(lot, authUser?.id);
    if (newLot) {
      setLots((prev) => [newLot, ...prev]);
      await addTraceabilityEvent(newLot.id, 'Lot Created', `Digital lot created with reference ${newLot.reference_id}`, 'Collector', lot.collector_id, lot.location, newLot.reference_id);
    }
    return newLot;
  }, [authUser?.id]);

  const setLotStatus = useCallback(async (lotId: string, status: Lot['status']) => {
    await updateLotStatus(lotId, status);
    setLots((prev) => prev.map((l) => (l.id === lotId ? { ...l, status } : l)));
  }, []);

  const addQuote = useCallback(async (quote: Omit<Quote, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: Quote['status'] }) => {
    const newQuote = await createQuote(quote);
    if (newQuote) {
      setQuotes((prev) => [newQuote, ...prev]);
    }
    return newQuote;
  }, []);

  const setQuoteStatus = useCallback(async (quoteId: string, status: Quote['status'], counterRate?: number) => {
    await updateQuoteStatus(quoteId, status, counterRate);
    setQuotes((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status, counter_rate: counterRate ?? q.counter_rate } : q)));
  }, []);

  const completeTransaction = useCallback(async (
    lotId: string,
    collectorId: string,
    recyclerId: string,
    materialName: string,
    finalWeight: number,
    finalPrice: number,
    paymentMethod: string
  ) => {
    const finalAmount = Math.round(finalWeight * finalPrice);
    const txn = await createTransaction({
      lot_id: lotId,
      collector_id: collectorId,
      recycler_id: recyclerId,
      material_name: materialName,
      final_weight: finalWeight,
      final_price: finalPrice,
      final_amount: finalAmount,
      payment_method: paymentMethod,
      payment_status: 'Paid',
      transaction_status: 'Completed',
      collection_date: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
    if (txn) {
      setTransactions((prev) => [txn, ...prev]);
      await updateLotStatus(lotId, 'Transaction Completed');
      setLots((prev) => prev.map((l) => (l.id === lotId ? { ...l, status: 'Transaction Completed' as Lot['status'] } : l)));

      const earning = await addEarning({
        collector_id: collectorId,
        transaction_id: txn.id,
        transaction_ref: txn.transaction_id,
        gross_amount: finalAmount,
        transport_cost: 0,
        platform_cost: 50,
        net_amount: finalAmount - 50,
        payment_method: paymentMethod,
        material_name: materialName,
      });
      if (earning) {
        setEarnings((prev) => [earning, ...prev]);
      }

      await addTraceabilityEvent(lotId, 'Handover Initiated', 'Handover initiated at collection point', 'Recycler', recyclerId, undefined, txn.handover_id);
      await addTraceabilityEvent(lotId, 'Final Weight Confirmed', `Final weight confirmed: ${finalWeight} kg`, 'Recycler', recyclerId, undefined, txn.handover_id);
      await addTraceabilityEvent(lotId, 'Recycler Confirmed', 'Recycler confirmed handover', 'Recycler', recyclerId, undefined, txn.handover_id);
      await addTraceabilityEvent(lotId, 'Payment Completed', `Payment completed via ${paymentMethod}: ₹${finalAmount.toLocaleString('en-IN')}`, 'Recycler', recyclerId, undefined, txn.transaction_id);
      await addTraceabilityEvent(lotId, 'Transaction Completed', 'Transaction completed successfully', 'System', undefined, undefined, txn.transaction_id);
    }
    return txn;
  }, []);

  const getTraceability = useCallback(async (lotId: string) => {
    return fetchTraceabilityByLot(lotId);
  }, []);

  const addTraceability = useCallback(async (
    lotId: string,
    eventType: TraceabilityEvent['event_type'],
    description: string,
    actorType?: string,
    actorId?: string,
    location?: string,
    referenceId?: string
  ) => {
    await addTraceabilityEvent(lotId, eventType, description, actorType, actorId, location, referenceId);
  }, []);

  const updateCollectorProfile = useCallback(async (updates: Partial<Collector>) => {
    const updated = await updateCollector(updates, authUser?.id);
    if (updated) setCollector(updated);
  }, [authUser?.id]);

  const logout = useCallback(async () => {
    await signOut();
    setAuthUser(null);
  }, []);

  return (
    <AppContext.Provider value={{
      role, lang, setRole, setLang,
      isOnline, pendingSync, lastSynced, syncNow, loadDemoScenario,
      collector, materials, prices, recyclers, lots, quotes, transactions, earnings,
      refreshData, addLot, setLotStatus, addQuote, setQuoteStatus,
      completeTransaction, getTraceability, addTraceability, updateCollectorProfile,
      authUser, authReady, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}
