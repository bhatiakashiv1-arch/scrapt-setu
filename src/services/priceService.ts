import type { Price } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_PRICES, DEMO_PRICE_HISTORY } from './demoData';
import { getItem, setItem } from './storage';

const CACHE_KEY = 'prices';

export async function fetchPrices(): Promise<Price[]> {
  if (supabase) {
    const { data, error } = await supabase.from('prices').select('*').order('recorded_at', { ascending: false });
    if (!error && data && data.length > 0) return data as Price[];
  }
  const cached = getItem<Price[]>(CACHE_KEY);
  if (cached && cached.length > 0) return cached;
  setItem(CACHE_KEY, DEMO_PRICES);
  return DEMO_PRICES;
}

export async function addPrice(price: Omit<Price, 'id'>): Promise<Price | null> {
  const newPrice: Price = { ...price, id: crypto.randomUUID() };
  if (supabase) {
    const { data, error } = await supabase.from('prices').insert(newPrice).select().single();
    if (!error && data) return data as Price;
  }
  const prices = await fetchPrices();
  setItem(CACHE_KEY, [newPrice, ...prices]);
  return newPrice;
}

export function getPriceForMaterial(materialName: string, prices: Price[]): Price | undefined {
  return prices.find((p) => p.material_name.toLowerCase() === materialName.toLowerCase());
}

export function getPriceHistory(materialName: string): number[] {
  return DEMO_PRICE_HISTORY[materialName] ?? DEMO_PRICE_HISTORY['PCB'];
}

export function estimateValue(marketPrice: number, weight: number): { min: number; max: number; mid: number } {
  const min = Math.round(marketPrice * 0.93 * weight);
  const max = Math.round(marketPrice * 1.07 * weight);
  const mid = Math.round((min + max) / 2);
  return { min, max, mid };
}
