import type { Transaction } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_TRANSACTION, DEMO_EARNINGS } from './demoData';
import { getItem, setItem, generateTransactionId, generateHandoverId } from './storage';

const CACHE_KEY = 'transactions';

export async function fetchTransactions(): Promise<Transaction[]> {
  if (supabase) {
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as Transaction[];
  }
  const cached = getItem<Transaction[]>(CACHE_KEY);
  if (cached && cached.length > 0) return cached;
  setItem(CACHE_KEY, [DEMO_TRANSACTION]);
  return [DEMO_TRANSACTION];
}

export async function fetchTransactionByLotId(lotId: string): Promise<Transaction | null> {
  const txns = await fetchTransactions();
  return txns.find((t) => t.lot_id === lotId) ?? null;
}

export async function createTransaction(txn: Omit<Transaction, 'id' | 'transaction_id' | 'handover_id' | 'created_at'>): Promise<Transaction | null> {
  const newTxn: Transaction = {
    ...txn,
    id: crypto.randomUUID(),
    transaction_id: generateTransactionId(),
    handover_id: generateHandoverId(),
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase.from('transactions').insert(newTxn).select().maybeSingle();
    if (!error && data) {
      const txns = await fetchTransactions();
      setItem(CACHE_KEY, [data as Transaction, ...txns]);
      return data as Transaction;
    }
  }

  const txns = await fetchTransactions();
  setItem(CACHE_KEY, [newTxn, ...txns]);
  return newTxn;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('transactions').update(updates).eq('id', id);
    if (!error) {
      const txns = await fetchTransactions();
      setItem(CACHE_KEY, txns.map((t) => (t.id === id ? { ...t, ...updates } as Transaction : t)));
      return;
    }
  }
  const txns = await fetchTransactions();
  setItem(CACHE_KEY, txns.map((t) => (t.id === id ? { ...t, ...updates } as Transaction : t)));
}
