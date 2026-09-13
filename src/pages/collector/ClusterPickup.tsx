import { Users, Package, Truck, Check } from 'lucide-react';
import { Card, Badge, Button, ProgressBar, DemoBanner, formatINR } from '@/components/ui';

const CLUSTER_DATA = [
  { name: 'Collector A', weight: 150 },
  { name: 'Collector B', weight: 200 },
  { name: 'Collector C', weight: 180 },
  { name: 'Collector D', weight: 220 },
  { name: 'Collector E', weight: 330 },
];

const THRESHOLD = 1000;
const TOTAL = CLUSTER_DATA.reduce((sum, c) => sum + c.weight, 0);

export function ClusterPickup() {
  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Cluster Pickup</h1>
      <p className="text-sm text-stone-500 mb-4">
        Small collectors often have quantities too small for economical formal pickup.
        ScrapSetu aggregates nearby lots to reach bulk pickup thresholds.
      </p>

      <Card className="p-4 mb-4">
        <div className="space-y-3">
          {CLUSTER_DATA.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-stone-700">{c.name}</span>
                <span className="text-stone-500">{c.weight} kg</span>
              </div>
              <ProgressBar value={c.weight} max={TOTAL} color="#C65D3B" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 mb-4 bg-gradient-to-br from-[#68745A]/10 to-[#68745A]/5 border-[#68745A]/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#68745A] flex items-center justify-center">
            <Check size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-stone-800">Bulk pickup threshold reached</p>
            <p className="text-sm text-stone-500">Total: {TOTAL} kg · Threshold: {THRESHOLD} kg</p>
          </div>
        </div>
        <ProgressBar value={TOTAL} max={THRESHOLD} color="#5B8C5A" />
        <p className="text-sm text-stone-600 mt-3">
          This cluster qualifies for formal recycling pickup. Individual small collectors
          benefit from aggregated transport, making formal recycling economically attractive.
        </p>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3">How It Works</h3>
        <div className="space-y-3 text-sm text-stone-600">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#C65D3B]/10 text-[#C65D3B] flex items-center justify-center font-bold shrink-0">1</div>
            <p>Collectors create lots with their scrap material and weight.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#C65D3B]/10 text-[#C65D3B] flex items-center justify-center font-bold shrink-0">2</div>
            <p>ScrapSetu identifies nearby lots with compatible materials.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#C65D3B]/10 text-[#C65D3B] flex items-center justify-center font-bold shrink-0">3</div>
            <p>When total weight crosses the pickup threshold, a cluster pickup is scheduled.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#C65D3B]/10 text-[#C65D3B] flex items-center justify-center font-bold shrink-0">4</div>
            <p>Recycler picks up the aggregated lot — transport cost shared across collectors.</p>
          </div>
        </div>
      </Card>

      <DemoBanner text="DEMO DATA — Cluster aggregation values are illustrative" />
    </div>
  );
}
