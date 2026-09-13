import type { TraceabilityEvent, TraceabilityEventType } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_TRACEABILITY } from './demoData';
import { getItem, setItem } from './storage';

const CACHE_KEY = 'traceability';

export async function fetchTraceabilityByLot(lotId: string): Promise<TraceabilityEvent[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('traceability_events')
      .select('*')
      .eq('lot_id', lotId)
      .order('timestamp', { ascending: true });
    if (!error && data && data.length > 0) return data as TraceabilityEvent[];
  }
  const cached = getItem<TraceabilityEvent[]>(CACHE_KEY);
  const events = cached && cached.length > 0 ? cached : DEMO_TRACEABILITY;
  if (!cached) setItem(CACHE_KEY, DEMO_TRACEABILITY);
  return events.filter((e) => e.lot_id === lotId);
}

export async function addTraceabilityEvent(
  lotId: string,
  eventType: TraceabilityEventType,
  description: string,
  actorType?: string,
  actorId?: string,
  location?: string,
  referenceId?: string
): Promise<void> {
  const event: TraceabilityEvent = {
    id: crypto.randomUUID(),
    lot_id: lotId,
    event_type: eventType,
    description,
    timestamp: new Date().toISOString(),
    actor_type: actorType,
    actor_id: actorId,
    location,
    reference_id: referenceId,
  };

  if (supabase) {
    const { error } = await supabase.from('traceability_events').insert(event);
    if (!error) {
      const cached = getItem<TraceabilityEvent[]>(CACHE_KEY) ?? [];
      setItem(CACHE_KEY, [...cached, event]);
      return;
    }
  }
  const cached = getItem<TraceabilityEvent[]>(CACHE_KEY) ?? DEMO_TRACEABILITY;
  setItem(CACHE_KEY, [...cached, event]);
}
