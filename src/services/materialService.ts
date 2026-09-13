import type { Material } from '@/types';
import { supabase } from './supabaseClient';
import { DEMO_MATERIALS } from './demoData';
import { getItem, setItem } from './storage';

const CACHE_KEY = 'materials';

export async function fetchMaterials(): Promise<Material[]> {
  if (supabase) {
    const { data, error } = await supabase.from('materials').select('*').order('category');
    if (!error && data && data.length > 0) return data as Material[];
  }
  const cached = getItem<Material[]>(CACHE_KEY);
  if (cached && cached.length > 0) return cached;
  setItem(CACHE_KEY, DEMO_MATERIALS);
  return DEMO_MATERIALS;
}

export function findMaterialByName(name: string, materials: Material[]): Material | undefined {
  return materials.find(
    (m) => m.name.toLowerCase() === name.toLowerCase() || m.category.toLowerCase() === name.toLowerCase()
  );
}

export function getCategories(materials: Material[]): string[] {
  return [...new Set(materials.map((m) => m.category))];
}
