import { Users, Building2, Package, TrendingUp, Receipt, Wallet, Activity } from 'lucide-react';
import { Card, StatCard, Badge, DemoBanner, SimpleBarChart, formatINR } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { getMaterialDistribution } from '@/services/analyticsService';

export function AdminDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lots, transactions } = useApp();
  const dist = getMaterialDistribution(lots);
  const distLabels = dist.slice(0, 6).map((d) => d.category);
  const distData = dist.slice(0, 6).map((d) => d.count);

  return (
    <div className="p-4 max-w-5xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">E-Waste Ecosystem Intelligence</h1>
      <div className="mb-4"><DemoBanner text="DEMO DATA — SIH Prototype" /></div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Collectors" value="2,841" icon={<Users size={20} />} />
        <StatCard label="Recyclers" value="126" icon={<Building2 size={20} />} />
        <StatCard label="Lots Created" value="18,420" icon={<Package size={20} />} />
        <StatCard label="Formal Handover Volume" value="94.7 t" icon={<TrendingUp size={20} />} />
        <StatCard label="Completed Transactions" value="12,680" icon={<Receipt size={20} />} />
        <StatCard label="Collector Earnings" value="₹2.84 Cr" icon={<Wallet size={20} />} />
      </div>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3">Material Category Distribution</h3>
        <SimpleBarChart data={distData.length > 0 ? distData : [5, 3, 2, 2, 1, 1]} labels={distLabels.length > 0 ? distLabels : ['PCB', 'Cables', 'Batteries', 'Motors', 'LCD', 'CRT']} color="#C65D3B" height={120} />
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4" onClick={() => onNavigate('transactions')}>
          <h3 className="font-bold text-stone-800 mb-2">Recent Transactions</h3>
          {transactions.slice(0, 3).map((t) => (
            <div key={t.id} className="flex justify-between py-2 border-b border-stone-100 last:border-0 text-sm">
              <span>{t.material_name} — {t.final_weight}kg</span>
              <span className="font-medium">{formatINR(t.final_amount)}</span>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-sm text-stone-400">No transactions yet.</p>}
        </Card>

        <Card className="p-4" onClick={() => onNavigate('traceability')}>
          <h3 className="font-bold text-stone-800 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => onNavigate('analytics')} className="w-full text-left p-2 hover:bg-stone-50 rounded-lg text-sm text-stone-600 flex items-center gap-2">
              <Activity size={16} className="text-[#C65D3B]" /> View Analytics
            </button>
            <button onClick={() => onNavigate('datasetExplorer')} className="w-full text-left p-2 hover:bg-stone-50 rounded-lg text-sm text-stone-600 flex items-center gap-2">
              <Package size={16} className="text-[#C65D3B]" /> Dataset Explorer
            </button>
            <button onClick={() => onNavigate('recyclers')} className="w-full text-left p-2 hover:bg-stone-50 rounded-lg text-sm text-stone-600 flex items-center gap-2">
              <Building2 size={16} className="text-[#C65D3B]" /> Recycler Directory
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
