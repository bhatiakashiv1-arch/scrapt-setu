import { FileText, Check, X, ArrowRight } from 'lucide-react';
import { Card, Badge, StatusBadge, EmptyState, Button, formatINR, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';

export function RecyclerQuotes({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { quotes, lots, recyclers, setQuoteStatus } = useApp();

  if (quotes.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto pb-20">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">Quotes</h1>
        <EmptyState icon={<FileText size={48} />} title="No quotes yet" message="Submit quotes on incoming lots to see them here." />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Quotes</h1>
      <div className="space-y-3">
        {quotes.map((q) => {
          const lot = lots.find((l) => l.id === q.lot_id);
          const recycler = recyclers.find((r) => r.id === q.recycler_id);
          return (
            <Card key={q.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-stone-800">{lot?.material_name} — {lot?.weight}kg</p>
                  <p className="text-xs text-stone-400">{lot?.reference_id}</p>
                </div>
                <StatusBadge status={q.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="text-stone-500">Recycler:</span> <span className="font-medium">{recycler?.name}</span></div>
                <div><span className="text-stone-500">Rate:</span> <span className="font-medium">₹{q.offered_rate}/kg</span></div>
                <div><span className="text-stone-500">Total:</span> <span className="font-medium">{formatINR(q.total_amount)}</span></div>
                <div><span className="text-stone-500">Pickup:</span> <span className="font-medium">{q.pickup_available ? 'Available' : 'Not available'}</span></div>
                {q.counter_rate && <div><span className="text-stone-500">Counter:</span> <span className="font-medium text-amber-600">₹{q.counter_rate}/kg</span></div>}
              </div>
              {q.notes && <p className="text-sm text-stone-500 mb-2">{q.notes}</p>}
              {q.status === 'Countered' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={() => setQuoteStatus(q.id, 'Accepted')}>Accept Counter</Button>
                  <Button size="sm" variant="ghost" onClick={() => setQuoteStatus(q.id, 'Rejected')}>Reject</Button>
                </div>
              )}
              {q.status === 'Accepted' && (
                <Button size="sm" onClick={() => onNavigate('pickups')}>
                  Go to Pickup <ArrowRight size={14} className="inline ml-1" />
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      <DemoBanner text="DEMO DATA — SIH Prototype" />
    </div>
  );
}
