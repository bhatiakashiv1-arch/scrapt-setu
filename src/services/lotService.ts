import type { Lot, LotStatus } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_LOTS } from './demoData';
import { getItem, setItem, generateReferenceId } from './storage';

const CACHE_KEY = 'lots';

export async function fetchLots(userId?: string): Promise<Lot[]> {
  if (supabase) {
    let query = supabase.from('lots').select('*').order('created_at', { ascending: false });
    // Don't filter by user — recycler/buyer needs to see all lots
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data as Lot[];
  }
  const cached = getItem<Lot[]>(CACHE_KEY);
  if (cached && cached.length > 0) return cached;
  setItem(CACHE_KEY, DEMO_LOTS);
  return DEMO_LOTS;
}

export async function fetchLotById(id: string): Promise<Lot | null> {
  const lots = await fetchLots();
  return lots.find((l) => l.id === id || l.reference_id === id) ?? null;
}

export async function fetchLotsByCollector(collectorId: string): Promise<Lot[]> {
  const lots = await fetchLots();
  return lots.filter((l) => l.collector_id === collectorId);
}

export async function createLot(lot: Omit<Lot, 'id' | 'reference_id' | 'created_at' | 'updated_at' | 'status'> & { status?: LotStatus }, userId?: string): Promise<Lot | null> {
  const newLot: Lot = {
    ...lot,
    id: crypto.randomUUID(),
    reference_id: generateReferenceId(),
    status: lot.status ?? 'Open for Recycler Quotes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Lot;

  // Add user_id if available
  const insertData: Record<string, unknown> = { ...newLot };
  if (userId) insertData.user_id = userId;

  if (supabase) {
    const { data, error } = await supabase.from('lots').insert(insertData).select().maybeSingle();
    if (!error && data) {
      const lots = await fetchLots();
      setItem(CACHE_KEY, [data as Lot, ...lots]);
      return data as Lot;
    }
  }

  const lots = await fetchLots();
  setItem(CACHE_KEY, [newLot, ...lots]);
  return newLot;
}

export async function updateLotStatus(lotId: string, status: LotStatus): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('lots').update({ status, updated_at: new Date().toISOString() }).eq('id', lotId);
    if (!error) {
      const lots = await fetchLots();
      setItem(CACHE_KEY, lots.map((l) => (l.id === lotId ? { ...l, status, updated_at: new Date().toISOString() } : l)));
      return;
    }
  }
  const lots = await fetchLots();
  setItem(CACHE_KEY, lots.map((l) => (l.id === lotId ? { ...l, status, updated_at: new Date().toISOString() } : l)));
}
