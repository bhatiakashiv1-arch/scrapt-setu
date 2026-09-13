import type { Recycler, Lot, RecyclerMatch } from '@/types';

export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function matchRecyclers(
  lot: Lot,
  recyclers: Recycler[],
  marketPrice: number
): RecyclerMatch[] {
  const matches: RecyclerMatch[] = [];

  for (const recycler of recyclers) {
    const materialAccepted = recycler.materials_accepted.some(
      (m) => m.toLowerCase() === (lot.material_name ?? '').toLowerCase() ||
      m.toLowerCase() === (lot.category ?? '').toLowerCase()
    );

    if (!materialAccepted) continue;

    const rate = recycler.offered_rates[lot.material_name ?? ''] ?? recycler.offered_rates[lot.category ?? ''] ?? marketPrice;

    const distance = calculateDistance(
      lot.latitude ?? 28.6139, lot.longitude ?? 77.209,
      recycler.latitude ?? 28.7041, recycler.longitude ?? 77.1025
    );

    const estimatedGrossValue = Math.round(rate * lot.weight);
    const transportCost = recycler.pickup_available ? 0 : Math.round(distance * 50);
    const netValue = estimatedGrossValue - transportCost;

    const materialScore = 40;
    const distanceScore = Math.max(0, 20 - (distance / 5) * 2);
    const rateScore = Math.min(25, ((rate - marketPrice * 0.9) / (marketPrice * 0.2)) * 25);
    const pickupScore = recycler.pickup_available ? 10 : 0;
    const serviceAreaScore = 5;

    const matchScore = Math.round(materialScore + distanceScore + rateScore + pickupScore + serviceAreaScore);

    const reasons: string[] = [];
    if (materialAccepted) reasons.push('Material accepted');
    if (distance < 10) reasons.push('Nearby');
    if (rate >= marketPrice) reasons.push('Good rate');
    if (recycler.pickup_available) reasons.push('Pickup available');
    reasons.push('Suitable service area');

    matches.push({
      recycler,
      match_score: Math.min(matchScore, 99),
      distance,
      rate,
      pickup_available: recycler.pickup_available,
      estimated_gross_value: estimatedGrossValue,
      transport_cost: transportCost,
      net_value: netValue,
      reasons,
      factors: {
        material_compatibility: materialScore,
        distance: Math.round(distanceScore),
        offered_rate: Math.round(rateScore),
        pickup: pickupScore,
        service_area: serviceAreaScore,
      },
    });
  }

  matches.sort((a, b) => b.net_value - a.net_value);
  return matches;
}

export function getBestNetDeal(matches: RecyclerMatch[]): RecyclerMatch | undefined {
  if (matches.length === 0) return undefined;
  return matches[0];
}
