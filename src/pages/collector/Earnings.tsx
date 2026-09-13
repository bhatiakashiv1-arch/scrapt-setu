import { Wallet, TrendingUp, Calendar, Banknote } from 'lucide-react';
import { Card, Badge, EmptyState, formatINR, DemoBanner, SimpleBarChart } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { t } from '@/services/i18n';
import { calculateEarningsSummary } from '@/services/earningsService';

export function Earnings() {
  const { lang, earnings } = useApp();
  const summary = calculateEarningsSummary(earnings);

  const weeklyData = [3200, 2800, 4500, 3800, 5200, 4100, 4952];
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">{t(lang, 'myEarnings')}</h1>

      <Card className="p-5 bg-gradient-to-br from-[#68745A] to-[#5A6650] border-0 mb-4">
        <p className="text-white/80 text-sm">Total Earnings</p>
        <p className="text-4xl font-bold text-white mt-1">{formatINR(summary.total)}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-stone-400" />
            <p className="text-xs text-stone-500">This Month</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{formatINR(summary.thisMonth)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-stone-400" />
            <p className="text-xs text-stone-500">Today</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{formatINR(summary.today)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-stone-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{formatINR(summary.pending)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-stone-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{formatINR(summary.completed)}</p>
        </Card>
      </div>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3">Weekly Earnings</h3>
        <SimpleBarChart data={weeklyData} labels={weeklyLabels} color="#68745A" height={100} />
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-stone-800 mb-3">Transaction History</h3>
        {earnings.length === 0 ? (
          <EmptyState icon={<Wallet size={40} />} title="No earnings yet" message="Your completed transactions will appear here." />
        ) : (
          <div className="space-y-3">
            {earnings.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-stone-100 last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="font-medium text-stone-800">{e.material_name}</p>
                  <p className="text-xs text-stone-400">{e.transaction_ref} · {new Date(e.created_at).toLocaleDateString('en-IN')}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="default">{e.payment_method}</Badge>
                    <span className="text-xs text-stone-400">Gross: {formatINR(e.gross_amount)}</span>
                    {e.transport_cost > 0 && <span className="text-xs text-stone-400">Transport: -{formatINR(e.transport_cost)}</span>}
                    <span className="text-xs text-stone-400">Platform: -{formatINR(e.platform_cost)}</span>
                  </div>
                </div>
                <p className="font-bold text-[#68745A] text-lg">{formatINR(e.net_amount)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
      <DemoBanner text="DEMO DATA — Replace with verified field data before production" />
    </div>
  );
}
