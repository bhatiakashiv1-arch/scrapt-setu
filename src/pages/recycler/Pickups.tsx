import { useState } from 'react';
import { Truck, Check, MapPin } from 'lucide-react';
import { Card, Badge, Button, EmptyState, Modal, formatINR, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import type { Lot } from '@/types';

export function Pickups({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lots, recyclers, quotes, completeTransaction, addTraceability } = useApp();
  const [handoverLot, setHandoverLot] = useState<Lot | null>(null);
  const [finalWeight, setFinalWeight] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const pickupLots = lots.filter((l) => l.status === 'Quote Accepted' || l.status === 'Pickup Scheduled');
  const completedPickups = lots.filter((l) => l.status === 'Transaction Completed');

  const handleConfirmHandover = async () => {
    if (!handoverLot) return;
    const quote = quotes.find((q) => q.lot_id === handoverLot.id);
    const recycler = quote ? recyclers.find((r) => r.id === quote.recycler_id) : null;
    if (!quote || !recycler) return;
    const fw = finalWeight || handoverLot.weight;
    await completeTransaction(
      handoverLot.id,
      handoverLot.collector_id ?? '',
      recycler.id,
      handoverLot.material_name ?? '',
      fw,
      quote.offered_rate,
      paymentMethod
    );
    setHandoverLot(null);
    setFinalWeight(0);
    onNavigate('transactions');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Pickups</h1>

      {pickupLots.length > 0 && (
        <>
          <h3 className="font-bold text-stone-700 mb-2">Scheduled Pickups</h3>
          <div className="space-y-3 mb-6">
            {pickupLots.map((lot) => {
              const quote = quotes.find((q) => q.lot_id === lot.id);
              const recycler = quote ? recyclers.find((r) => r.id === quote.recycler_id) : null;
              return (
                <Card key={lot.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-stone-800">{lot.material_name} — {lot.weight}kg</p>
                      <p className="text-xs text-stone-400">{lot.reference_id}</p>
                      <div className="flex items-center gap-1 text-xs text-stone-500 mt-1"><MapPin size={12} /> {lot.location}</div>
                    </div>
                    <Badge variant="info">{lot.status}</Badge>
                  </div>
                  {quote && recycler && (
                    <div className="text-sm text-stone-500 mb-3">
                      Rate: ₹{quote.offered_rate}/kg · Total: {formatINR(quote.total_amount)} · {recycler.name}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" onClick={() => { setHandoverLot(lot); setFinalWeight(lot.weight); }}>
                      <Check size={16} className="mr-1" /> Confirm Handover
                    </Button>
                    <Button size="sm" variant="ghost">Start Pickup</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <h3 className="font-bold text-stone-700 mb-2">Completed Pickups</h3>
      {completedPickups.length === 0 ? (
        <EmptyState icon={<Truck size={40} />} title="No completed pickups" message="Confirmed handovers will appear here." />
      ) : (
        <div className="space-y-3">
          {completedPickups.map((lot) => (
            <Card key={lot.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800">{lot.material_name} — {lot.weight}kg</p>
                  <p className="text-xs text-stone-400">{lot.reference_id}</p>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {handoverLot && (
        <Modal title="Confirm Handover" onClose={() => setHandoverLot(null)}>
          <div className="space-y-3">
            <div className="p-3 bg-[#F8F3EA] rounded-lg">
              <p className="font-bold text-stone-800">{handoverLot.material_name}</p>
              <p className="text-xs text-stone-400">{handoverLot.reference_id}</p>
              <p className="text-sm text-stone-500 mt-1">Expected weight: {handoverLot.weight} kg</p>
            </div>
            <div>
              <label className="text-sm text-stone-600 block mb-1">Actual Weight (kg)</label>
              <input type="number" step="0.1" value={finalWeight || ''} onChange={(e) => setFinalWeight(parseFloat(e.target.value) || 0)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-lg font-bold" />
            </div>
            <div>
              <label className="text-sm text-stone-600 block mb-1">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'UPI', 'Bank Transfer'].map((m) => (
                  <button key={m} onClick={() => setPaymentMethod(m)} className={`px-3 py-2 rounded-lg text-sm font-medium border-2 ${paymentMethod === m ? 'border-[#C65D3B] bg-[#C65D3B]/10 text-[#C65D3B]' : 'border-stone-200 text-stone-600'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div className="p-3 bg-[#F8F3EA] rounded-lg">
              <div className="flex justify-between text-sm"><span className="text-stone-500">Final Weight:</span><span className="font-bold">{finalWeight} kg</span></div>
              <div className="flex justify-between text-lg mt-1"><span className="font-semibold">Final Amount:</span><span className="font-bold text-[#C65D3B]">{formatINR(Math.round(finalWeight * (quotes.find(q => q.lot_id === handoverLot.id)?.offered_rate ?? 0)))}</span></div>
            </div>
            <Button variant="success" className="w-full" onClick={handleConfirmHandover}>Confirm Handover</Button>
          </div>
        </Modal>
      )}
      <DemoBanner text="DEMO DATA — SIH Prototype" />
    </div>
  );
}
