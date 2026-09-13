import { Receipt, Search, Eye } from 'lucide-react';
import { useState } from 'react';
import { Card, Badge, StatusBadge, EmptyState, DemoBanner, formatINR } from '@/components/ui';
import { useApp } from '@/context/AppContext';

export function AdminTransactions({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { transactions, lots } = useApp();
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) =>
    t.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
    t.material_name?.toLowerCase().includes(search.toLowerCase()) ||
    lots.find((l) => l.id === t.lot_id)?.reference_id.includes(search.toUpperCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Transaction Monitoring</h1>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Transaction ID, Lot ID, or material..." className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Receipt size={48} />} title="No transactions found" message="Transactions will appear here once completed." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500 bg-[#F8F3EA]">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Lot ID</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const lot = lots.find((l) => l.id === t.lot_id);
                  return (
                    <tr key={t.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="py-2 px-4 font-mono text-xs">{t.transaction_id}</td>
                      <td className="py-2 px-4 font-mono text-xs">{lot?.reference_id}</td>
                      <td className="py-2 px-4 font-medium">{t.material_name}</td>
                      <td className="py-2 px-4">{t.final_weight} kg</td>
                      <td className="py-2 px-4 font-bold">{formatINR(t.final_amount)}</td>
                      <td className="py-2 px-4">{t.payment_method}</td>
                      <td className="py-2 px-4"><StatusBadge status={t.payment_status} /></td>
                      <td className="py-2 px-4">
                        <button onClick={() => onNavigate('traceability')} className="text-[#C65D3B] flex items-center gap-1 text-xs">
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <DemoBanner text="DEMO DATA — SIH Prototype" />
    </div>
  );
}
