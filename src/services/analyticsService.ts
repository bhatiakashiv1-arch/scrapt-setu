import type { Lot, Transaction, Price } from '@/types';

export function getMaterialDistribution(lots: Lot[]): { category: string; count: number; weight: number; value: number }[] {
  const map = new Map<string, { category: string; count: number; weight: number; value: number }>();
  for (const lot of lots) {
    const cat = lot.category ?? lot.material_name ?? 'Other';
    const existing = map.get(cat) ?? { category: cat, count: 0, weight: 0, value: 0 };
    existing.count += 1;
    existing.weight += lot.weight;
    existing.value += lot.estimated_value ?? 0;
    map.set(cat, existing);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function detectAnomalies(transactions: Transaction[], prices: Price[]): { transaction: Transaction; expectedRange: string; reason: string }[] {
  const anomalies: { transaction: Transaction; expectedRange: string; reason: string }[] = [];

  for (const txn of transactions) {
    if (txn.transaction_status !== 'Completed') continue;
    const price = prices.find((p) => p.material_name === txn.material_name);
    if (!price) continue;

    const actualRate = txn.final_price;
    if (actualRate < price.price_min * 0.85 || actualRate > price.price_max * 1.15) {
      anomalies.push({
        transaction: txn,
        expectedRange: `₹${price.price_min}–₹${price.price_max}/kg`,
        reason: actualRate < price.price_min
          ? 'Rate is significantly below recent local range.'
          : 'Rate is significantly above recent local range.',
      });
    }
  }

  return anomalies;
}

export function getDemandInsights(lots: Lot[]): { material: string; trend: 'up' | 'down' | 'stable'; volume: number }[] {
  const map = new Map<string, { material: string; count: number; weight: number }>();
  for (const lot of lots) {
    const mat = lot.material_name ?? lot.category ?? 'Other';
    const existing = map.get(mat) ?? { material: mat, count: 0, weight: 0 };
    existing.count += 1;
    existing.weight += lot.weight;
    map.set(mat, existing);
  }
  return Array.from(map.values()).map((v) => ({
    material: v.material,
    trend: v.weight > 50 ? 'up' as const : v.weight > 20 ? 'stable' as const : 'down' as const,
    volume: v.weight,
  }));
}
