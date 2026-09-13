import type { Earning } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_EARNINGS } from './demoData';
import { getItem, setItem } from './storage';

const CACHE_KEY = 'earnings';

export async function fetchEarnings(collectorId?: string): Promise<Earning[]> {
  if (supabase) {
    let query = supabase.from('earnings').select('*').order('created_at', { ascending: false });
    if (collectorId) query = query.eq('collector_id', collectorId);
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data as Earning[];
  }
  const cached = getItem<Earning[]>(CACHE_KEY);
  const earnings = cached && cached.length > 0 ? cached : DEMO_EARNINGS;
  if (!cached) setItem(CACHE_KEY, DEMO_EARNINGS);
  return collectorId ? earnings.filter((e) => e.collector_id === collectorId) : earnings;
}

export async function addEarning(earning: Omit<Earning, 'id' | 'created_at'>): Promise<Earning | null> {
  const newEarning: Earning = { ...earning, id: crypto.randomUUID(), created_at: new Date().toISOString() };

  if (supabase) {
    const { data, error } = await supabase.from('earnings').insert(newEarning).select().maybeSingle();
    if (!error && data) {
      const cached = getItem<Earning[]>(CACHE_KEY) ?? [];
      setItem(CACHE_KEY, [data as Earning, ...cached]);
      return data as Earning;
    }
  }
  const cached = getItem<Earning[]>(CACHE_KEY) ?? DEMO_EARNINGS;
  setItem(CACHE_KEY, [newEarning, ...cached]);
  return newEarning;
}

export function calculateEarningsSummary(earnings: Earning[]) {
  const total = earnings.reduce((sum, e) => sum + e.net_amount, 0);
  const now = new Date();
  const thisMonth = earnings
    .filter((e) => new Date(e.created_at).getMonth() === now.getMonth() && new Date(e.created_at).getFullYear() === now.getFullYear())
    .reduce((sum, e) => sum + e.net_amount, 0);
  const today = earnings
    .filter((e) => new Date(e.created_at).toDateString() === now.toDateString())
    .reduce((sum, e) => sum + e.net_amount, 0);
  const pending = earnings.filter((e) => !e.transaction_id).reduce((sum, e) => sum + e.net_amount, 0);
  const completed = total;
  return { total, thisMonth, today, pending, completed };
}
