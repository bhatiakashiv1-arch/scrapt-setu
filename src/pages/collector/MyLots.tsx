import { useState } from 'react';
import { Package, ArrowRight, MapPin } from 'lucide-react';
import { Card, Badge, StatusBadge, EmptyState, Button, formatINR, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { t } from '@/services/i18n';
import type { Lot } from '@/types';

const STATUS_FILTERS = ['All', 'Open for Recycler Quotes', 'Quote Received', 'Quote Accepted', 'Pickup Scheduled', 'Completed', 'Offline Pending Sync'];

export function MyLots({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang, lots, collector } = useApp();
  const [filter, setFilter] = useState('All');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  const myLots = lots.filter((l) => !collector || l.collector_id === collector.id);
  const filtered = filter === 'All'
    ? myLots
    : filter === 'Completed'
    ? myLots.filter((l) => l.status === 'Transaction Completed')
    : myLots.filter((l) => l.status === filter);

  if (selectedLot) {
    return <LotDetail lot={selectedLot} onBack={() => setSelectedLot(null)} onNavigate={onNavigate} />;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">{t(lang, 'myLots')}</h1>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-[#C65D3B] text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={48} />}
          title="No active lots yet"
          message="Sell your first scrap to get started."
          action={<Button onClick={() => onNavigate('sell')}>{t(lang, 'sellScrap')}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((lot) => (
            <Card key={lot.id} className="p-4" onClick={() => setSelectedLot(lot)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-stone-800">{lot.material_name} — {lot.weight}kg</p>
                  <p className="text-xs text-stone-400 font-mono">{lot.reference_id}</p>
                </div>
                <StatusBadge status={lot.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-stone-500">Estimate: </span>
                  <span className="font-medium text-stone-700">{formatINR(lot.estimated_min)}–{formatINR(lot.estimated_max)}</span>
                </div>
                {lot.location && (
                  <div className="flex items-center gap-1 text-stone-400 text-xs">
                    <MapPin size={12} /> {lot.location}
                  </div>
                )}
              </div>
              {lot.ai_confidence && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="ai">AI: {lot.ai_confidence}%</Badge>
                  <ArrowRight size={14} className="text-stone-300" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LotDetail({ lot, onBack, onNavigate }: { lot: Lot; onBack: () => void; onNavigate: (page: string) => void }) {
  const { quotes, recyclers, transactions, getTraceability } = useApp();
  const [traceability, setTraceability] = useState<any[]>([]);
  const lotQuotes = quotes.filter((q) => q.lot_id === lot.id);
  const txn = transactions.find((t) => t.lot_id === lot.id);

  useState(() => {
    getTraceability(lot.id).then(setTraceability);
  });

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <button onClick={onBack} className="text-sm text-stone-500 mb-3 flex items-center gap-1">
        ← Back to My Lots
      </button>
      <h1 className="text-xl font-bold text-stone-800 mb-1">{lot.material_name} — {lot.weight}kg</h1>
      <p className="text-sm text-stone-400 font-mono mb-4">{lot.reference_id}</p>
      <StatusBadge status={lot.status} />

      <Card className="p-4 mt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-stone-500">Material:</span><span className="font-medium">{lot.material_name}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Category:</span><span className="font-medium">{lot.category}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Weight:</span><span className="font-medium">{lot.weight} kg</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Condition:</span><span className="font-medium">{lot.condition}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Estimate:</span><span className="font-medium">{formatINR(lot.estimated_min)}–{formatINR(lot.estimated_max)}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Location:</span><span className="font-medium">{lot.location}</span></div>
          {lot.ai_confidence && <div className="flex justify-between"><span className="text-stone-500">AI Classification:</span><Badge variant="ai">{lot.ai_classification} ({lot.ai_confidence}%)</Badge></div>}
        </div>
      </Card>

      {lotQuotes.length > 0 && (
        <Card className="p-4 mt-3">
          <h3 className="font-bold text-stone-800 mb-2">Quotes</h3>
          {lotQuotes.map((q) => {
            const recycler = recyclers.find((r) => r.id === q.recycler_id);
            return (
              <div key={q.id} className="border-b border-stone-100 last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                <div className="flex justify-between">
                  <span className="font-medium text-stone-800">{recycler?.name}</span>
                  <StatusBadge status={q.status} />
                </div>
                <div className="text-sm text-stone-500">₹{q.offered_rate}/kg · Total: {formatINR(q.total_amount)}</div>
                {q.pickup_available && <Badge variant="success">Pickup available</Badge>}
              </div>
            );
          })}
        </Card>
      )}

      {txn && (
        <Card className="p-4 mt-3">
          <h3 className="font-bold text-stone-800 mb-2">Transaction</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-stone-500">Transaction ID:</span><span className="font-mono font-medium">{txn.transaction_id}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Final Weight:</span><span className="font-medium">{txn.final_weight} kg</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Final Amount:</span><span className="font-bold text-[#C65D3B]">{formatINR(txn.final_amount)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Payment:</span><Badge variant="success">{txn.payment_status}</Badge></div>
            <div className="flex justify-between"><span className="text-stone-500">Handover:</span><span className="font-mono font-medium">{txn.handover_id}</span></div>
          </div>
        </Card>
      )}

      {traceability.length > 0 && (
        <Card className="p-4 mt-3">
          <h3 className="font-bold text-stone-800 mb-3">Traceability Timeline</h3>
          <div className="space-y-3">
            {traceability.map((event, i) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i < traceability.length - 1 ? 'bg-[#C65D3B]' : 'bg-green-500'}`} />
                  {i < traceability.length - 1 && <div className="w-0.5 h-8 bg-stone-200" />}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-medium text-stone-800">{event.event_type}</p>
                  <p className="text-xs text-stone-500">{event.description}</p>
                  <p className="text-xs text-stone-400">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Button variant="outline" className="w-full mt-3" onClick={() => onNavigate('traceability')}>
        View Full Traceability
      </Button>
    </div>
  );
}
