import { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { Card, Badge, Button, EmptyState, Spinner } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import type { TraceabilityEvent } from '@/types';

export function AdminTraceability() {
  const { lots, transactions, getTraceability } = useApp();
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [foundLot, setFoundLot] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!search) return;
    const lot = lots.find((l) => l.reference_id === search || l.id === search);
    const txn = transactions.find((t) => t.transaction_id === search || t.handover_id === search);
    const lotId = lot?.id ?? (txn ? txn.lot_id : null);
    if (lotId) {
      setLoading(true);
      setFoundLot(lotId);
      const tr = await getTraceability(lotId);
      setEvents(tr);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lots.length > 0 && !foundLot) {
      setFoundLot(lots[0].id);
      getTraceability(lots[0].id).then(setEvents);
    }
  }, [lots, foundLot, getTraceability]);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Traceability Search</h1>

      <Card className="p-4 mb-4">
        <div className="flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Lot ID, Transaction ID, or Handover ID..." className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch}><Search size={18} /></Button>
        </div>
        <p className="text-xs text-stone-400 mt-2">Try: EW-260911-0248 or TXN-2026-00981 or HND-982614</p>
      </Card>

      {loading ? (
        <Card className="p-6"><Spinner label="Loading..." /></Card>
      ) : events.length === 0 ? (
        <EmptyState title="No results" message="Search for a lot or transaction to see its timeline." />
      ) : (
        <Card className="p-4">
          <h3 className="font-bold text-stone-800 mb-1">Complete Transaction Timeline</h3>
          <p className="text-xs text-stone-400 mb-4">{events[0]?.reference_id ?? ''}</p>
          <div className="space-y-3">
            {events.map((event, i) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i < events.length - 1 ? 'bg-[#C65D3B]' : 'bg-green-500'}`} />
                  {i < events.length - 1 && <div className="w-0.5 h-10 bg-stone-200" />}
                </div>
                <div className="pb-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    <p className="text-sm font-medium text-stone-800">{event.event_type}</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{event.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-stone-400">{new Date(event.timestamp).toLocaleString('en-IN')}</span>
                    {event.actor_type && <Badge variant="default">{event.actor_type}</Badge>}
                    {event.location && <span className="text-xs text-stone-400">· {event.location}</span>}
                    {event.reference_id && <span className="text-xs text-stone-400 font-mono">· {event.reference_id}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
