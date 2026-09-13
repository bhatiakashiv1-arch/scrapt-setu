import type { Recycler } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_RECYCLERS } from './demoData';
import { getItem, setItem } from './storage';

const CACHE_KEY = 'recyclers';

export async function fetchRecyclers(): Promise<Recycler[]> {
  if (supabase) {
    const { data, error } = await supabase.from('recyclers').select('*').order('name');
    if (!error && data && data.length > 0) return data as Recycler[];
  }
  const cached = getItem<Recycler[]>(CACHE_KEY);
  if (cached && cached.length > 0) return cached;
  setItem(CACHE_KEY, DEMO_RECYCLERS);
  return DEMO_RECYCLERS;
}

export async function fetchRecyclerById(id: string): Promise<Recycler | null> {
  const recyclers = await fetchRecyclers();
  return recyclers.find((r) => r.id === id) ?? null;
}
