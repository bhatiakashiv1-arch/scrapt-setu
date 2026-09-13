import { Inbox, FileText, Truck, Check, Package, TrendingUp } from 'lucide-react';
import { Card, StatCard, Badge, formatINR, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { t } from '@/services/i18n';

export function RecyclerDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang, lots, quotes, transactions, recyclers } = useApp();

  const incomingLots = lots.filter((l) => l.status === 'Open for Recycler Quotes' || l.status === 'Quote Received');
  const pendingQuotes = quotes.filter((q) => q.status === 'Pending' || q.status === 'Countered');
  const todayPickups = lots.filter((l) => l.status === 'Pickup Scheduled' || l.status === 'Quote Accepted');
  const completedTxns = transactions.filter((t) => t.transaction_status === 'Completed');
  const totalMaterial = completedTxns.reduce((sum, t) => sum + t.final_weight, 0);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Recycler Portal</h1>
      <p className="text-sm text-stone-500 mb-4">Dashboard</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatCard label="Incoming Lots" value={String(incomingLots.length)} icon={<Inbox size={20} />} />
        <StatCard label="Pending Quotes" value={String(pendingQuotes.length)} icon={<FileText size={20} />} />
        <StatCard label="Today's Pickups" value={String(todayPickups.length)} icon={<Truck size={20} />} />
        <StatCard label="Completed" value={String(completedTxns.length)} icon={<Check size={20} />} />
        <StatCard label="Material Received" value={`${totalMaterial.toFixed(1)} kg`} icon={<Package size={20} />} />
        <StatCard label="Total Value" value={formatINR(completedTxns.reduce((s, t) => s + t.final_amount, 0))} icon={<TrendingUp size={20} />} />
      </div>

      <Card className="p-4 mb-4" onClick={() => onNavigate('incomingLots')}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-stone-800">Recent Incoming Lots</h3>
          <span className="text-sm text-[#C65D3B]">View all →</span>
        </div>
        {incomingLots.length === 0 ? (
          <p className="text-sm text-stone-400">No incoming lots right now.</p>
        ) : (
          incomingLots.slice(0, 3).map((lot) => (
            <div key={lot.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
              <div>
                <p className="font-medium text-stone-800">{lot.material_name} — {lot.weight}kg</p>
                <p className="text-xs text-stone-400">{lot.reference_id} · {lot.location}</p>
              </div>
              <Badge variant="info">{lot.status}</Badge>
            </div>
          ))
        )}
      </Card>

      <Card className="p-4" onClick={() => onNavigate('transactions')}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-stone-800">Recent Transactions</h3>
          <span className="text-sm text-[#C65D3B]">View all →</span>
        </div>
        {completedTxns.length === 0 ? (
          <p className="text-sm text-stone-400">No completed transactions yet.</p>
        ) : (
          completedTxns.slice(0, 3).map((txn) => (
            <div key={txn.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
              <div>
                <p className="font-medium text-stone-800">{txn.material_name} — {txn.final_weight}kg</p>
                <p className="text-xs text-stone-400">{txn.transaction_id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-stone-800">{formatINR(txn.final_amount)}</p>
                <Badge variant="success">{txn.payment_status}</Badge>
              </div>
            </div>
          ))
        )}
      </Card>

      <DemoBanner text="DEMO DATA — SIH Prototype" />
    </div>
  );
}
