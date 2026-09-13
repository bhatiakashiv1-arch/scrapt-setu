import type { Quote, QuoteStatus } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_QUOTE } from './demoData';
import { getItem, setItem } from './storage';

const CACHE_KEY = 'quotes';

export async function fetchQuotes(): Promise<Quote[]> {
  if (supabase) {
    const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as Quote[];
  }
  const cached = getItem<Quote[]>(CACHE_KEY);
  if (cached && cached.length > 0) return cached;
  setItem(CACHE_KEY, [DEMO_QUOTE]);
  return [DEMO_QUOTE];
}

export async function fetchQuotesByLot(lotId: string): Promise<Quote[]> {
  const quotes = await fetchQuotes();
  return quotes.filter((q) => q.lot_id === lotId);
}

export async function fetchQuotesByRecycler(recyclerId: string): Promise<Quote[]> {
  const quotes = await fetchQuotes();
  return quotes.filter((q) => q.recycler_id === recyclerId);
}

export async function createQuote(quote: Omit<Quote, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: QuoteStatus }): Promise<Quote | null> {
  const newQuote: Quote = {
    ...quote,
    id: crypto.randomUUID(),
    status: quote.status ?? 'Pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase.from('quotes').insert(newQuote).select().maybeSingle();
    if (!error && data) {
      const quotes = await fetchQuotes();
      setItem(CACHE_KEY, [data as Quote, ...quotes]);
      return data as Quote;
    }
  }

  const quotes = await fetchQuotes();
  setItem(CACHE_KEY, [newQuote, ...quotes]);
  return newQuote;
}

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus, counterRate?: number): Promise<void> {
  if (supabase) {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (counterRate !== undefined) updates.counter_rate = counterRate;
    const { error } = await supabase.from('quotes').update(updates).eq('id', quoteId);
    if (!error) {
      const quotes = await fetchQuotes();
      setItem(CACHE_KEY, quotes.map((q) => (q.id === quoteId ? { ...q, ...updates } as Quote : q)));
      return;
    }
  }
  const quotes = await fetchQuotes();
  setItem(CACHE_KEY, quotes.map((q) => (q.id === quoteId ? { ...q, status, counter_rate: counterRate ?? q.counter_rate, updated_at: new Date().toISOString() } as Quote : q)));
}
