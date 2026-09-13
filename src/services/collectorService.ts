import type { Collector } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_COLLECTOR } from './demoData';
import { getItem, setItem } from './storage';

const CACHE_KEY = 'collector';

export async function fetchCollector(userId?: string): Promise<Collector> {
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('collectors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data) return data as Collector;

    // No collector row yet — create one from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile) {
      const newCollector = {
        user_id: userId,
        name: profile.name,
        phone: profile.phone,
        language: profile.language ?? 'en',
        location: profile.location,
        total_lots: 0,
        completed_transactions: 0,
        total_earnings: 0,
        recycling_volume: 0,
        safety_score: 0,
        digital_readiness_score: 50,
      };
      const { data: inserted, error: insErr } = await supabase
        .from('collectors')
        .insert(newCollector)
        .select()
        .maybeSingle();
      if (!insErr && inserted) return inserted as Collector;
    }
  }

  // Fallback: demo data
  if (supabase) {
    const { data, error } = await supabase.from('collectors').select('*').limit(1).maybeSingle();
    if (!error && data) return data as Collector;
  }

  const cached = getItem<Collector>(CACHE_KEY);
  if (cached) return cached;
  setItem(CACHE_KEY, DEMO_COLLECTOR);
  return DEMO_COLLECTOR;
}

export async function updateCollector(updates: Partial<Collector>, userId?: string): Promise<Collector | null> {
  const current = await fetchCollector(userId);
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  if (supabase) {
    let query = supabase.from('collectors').update(updated);
    if (userId) query = query.eq('user_id', userId);
    else query = query.eq('id', current.id);
    const { data, error } = await query.select().maybeSingle();
    if (!error && data) {
      setItem(CACHE_KEY, data as Collector);
      return data as Collector;
    }
  }
  setItem(CACHE_KEY, updated);
  return updated;
}
