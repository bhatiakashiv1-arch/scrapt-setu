import { Receipt } from 'lucide-react';
import { Card, Badge, StatusBadge, EmptyState, formatINR, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';

export function RecyclerTransactions() {
  const { transactions, lots } = useApp();

  if (transactions.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto pb-20">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">Transactions</h1>
        <EmptyState icon={<Receipt size={48} />} title="No transactions yet" message="Completed transactions will appear here." />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Transactions</h1>
      <div className="space-y-3">
        {transactions.map((txn) => {
          const lot = lots.find((l) => l.id === txn.lot_id);
          return (
            <Card key={txn.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-stone-800">{txn.material_name} — {txn.final_weight}kg</p>
                  <p className="text-xs text-stone-400 font-mono">{txn.transaction_id}</p>
                  <p className="text-xs text-stone-400">{lot?.reference_id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#C65D3B] text-lg">{formatINR(txn.final_amount)}</p>
                  <StatusBadge status={txn.payment_status} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div><span className="text-stone-500">Rate:</span> <span className="font-medium">₹{txn.final_price}/kg</span></div>
                <div><span className="text-stone-500">Payment:</span> <span className="font-medium">{txn.payment_method}</span></div>
                <div><span className="text-stone-500">Handover:</span> <span className="font-mono text-xs">{txn.handover_id}</span></div>
              </div>
              <div className="text-xs text-stone-400 mt-2">{new Date(txn.completed_at ?? txn.created_at).toLocaleString('en-IN')}</div>
            </Card>
          );
        })}
      </div>
      <DemoBanner text="DEMO DATA — SIH Prototype" />
    </div>
  );
}
