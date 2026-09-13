import { useState } from 'react';
import { MapPin, Package } from 'lucide-react';
import { Card, Badge, Button, EmptyState, Modal, formatINR, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { t } from '@/services/i18n';
import type { Lot } from '@/types';

export function IncomingLots({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang, lots, recyclers, addQuote, setLotStatus, addTraceability } = useApp();
  const [quoteModal, setQuoteModal] = useState<Lot | null>(null);
  const [rate, setRate] = useState<number>(0);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [notes, setNotes] = useState('');

  const incoming = lots.filter((l) => l.status === 'Open for Recycler Quotes' || l.status === 'Quote Received');
  const recycler = recyclers[0];

  const handleSubmitQuote = async () => {
    if (!quoteModal || !recycler || rate <= 0) return;
    const total = Math.round(rate * quoteModal.weight);
    const transportCost = pickupAvailable ? 0 : 200;
    await addQuote({
      lot_id: quoteModal.id,
      recycler_id: recycler.id,
      offered_rate: rate,
      total_amount: total,
      pickup_available: pickupAvailable,
      pickup_cost: transportCost,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      notes,
      final_net_value: total - transportCost,
    });
    await setLotStatus(quoteModal.id, 'Quote Received');
    await addTraceability(quoteModal.id, 'Quote Received', `Quote received from ${recycler.name}: ₹${rate}/kg`, 'Recycler', recycler.id, quoteModal.location, quoteModal.reference_id);
    setQuoteModal(null);
    setRate(0);
    setPickupDate('');
    setPickupTime('');
    setNotes('');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Incoming Lots</h1>

      {incoming.length === 0 ? (
        <EmptyState icon={<Package size={48} />} title="No incoming lots" message="New lots from collectors will appear here." />
      ) : (
        <div className="space-y-3">
          {incoming.map((lot) => (
            <Card key={lot.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-3">
                  {lot.photo_url && (
                    <img src={lot.photo_url} alt={lot.material_name} className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-stone-800">{lot.material_name} — {lot.weight}kg</p>
                    <p className="text-xs text-stone-400 font-mono">{lot.reference_id}</p>
                  </div>
                </div>
                <Badge variant="info">{lot.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="text-stone-500">Category:</span> <span className="font-medium">{lot.category}</span></div>
                <div><span className="text-stone-500">Estimate:</span> <span className="font-medium">{formatINR(lot.estimated_min)}–{formatINR(lot.estimated_max)}</span></div>
                <div className="flex items-center gap-1"><MapPin size={12} className="text-stone-400" /> <span className="font-medium">{lot.location}</span></div>
                {lot.ai_confidence && <div><Badge variant="ai">AI: {lot.ai_confidence}%</Badge></div>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setQuoteModal(lot); setRate(lot.estimated_min ? Math.round(lot.estimated_min / lot.weight) : 580); }}>
                  Submit Quote
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onNavigate('pickups')}>Schedule Pickup</Button>
                <Button size="sm" variant="ghost" className="text-red-500">Reject</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {quoteModal && (
        <Modal title="Submit Quote" onClose={() => setQuoteModal(null)}>
          <div className="space-y-3">
            <div className="p-3 bg-[#F8F3EA] rounded-lg">
              <p className="font-bold text-stone-800">{quoteModal.material_name} — {quoteModal.weight}kg</p>
              <p className="text-xs text-stone-400">{quoteModal.reference_id}</p>
            </div>
            <div>
              <label className="text-sm text-stone-600 block mb-1">Rate per kg (₹)</label>
              <input type="number" value={rate || ''} onChange={(e) => setRate(parseFloat(e.target.value) || 0)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-lg font-bold" />
            </div>
            <div className="p-3 bg-[#F8F3EA] rounded-lg flex justify-between">
              <span className="text-stone-600">Total Amount:</span>
              <span className="font-bold text-[#C65D3B] text-lg">{formatINR(Math.round(rate * quoteModal.weight))}</span>
            </div>
            <div>
              <label className="text-sm text-stone-600 block mb-1">Pickup Date</label>
              <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-stone-600 block mb-1">Pickup Time</label>
              <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={pickupAvailable} onChange={(e) => setPickupAvailable(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-stone-600">Pickup available</span>
            </label>
            <div>
              <label className="text-sm text-stone-600 block mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" rows={2} />
            </div>
            <Button className="w-full" onClick={handleSubmitQuote} disabled={rate <= 0}>Submit Quote</Button>
          </div>
        </Modal>
      )}
      <DemoBanner text="DEMO DATA — SIH Prototype" />
    </div>
  );
}
