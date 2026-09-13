import { Building2, MapPin, Phone, Truck } from 'lucide-react';
import { Card, Badge, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';

export function AdminRecyclers() {
  const { recyclers } = useApp();

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Recycler Directory</h1>

      <div className="space-y-3">
        {recyclers.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-stone-800">{r.name}</p>
                <div className="flex items-center gap-1 text-sm text-stone-500 mt-0.5">
                  <MapPin size={14} /> {r.location}
                </div>
              </div>
              <Badge variant="demo">{r.authorization_status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <div><span className="text-stone-500">Service Area:</span> <span className="font-medium">{r.service_area}</span></div>
              <div><span className="text-stone-500">Contact:</span> <span className="font-medium">{r.contact}</span></div>
            </div>
            <div className="mb-2">
              <p className="text-sm text-stone-500 mb-1">Materials Accepted:</p>
              <div className="flex flex-wrap gap-1">
                {r.materials_accepted.map((m) => <Badge key={m} variant="info">{m}</Badge>)}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-sm text-stone-500 mb-1">Offered Rates:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(r.offered_rates).map(([mat, rate]) => (
                  <Badge key={mat} variant="default">{mat}: ₹{rate}/kg</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.pickup_available ? (
                <Badge variant="success"><Truck size={12} className="mr-1" /> Pickup Available</Badge>
              ) : (
                <Badge variant="warning">No Pickup</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
      <DemoBanner text="DEMO VERIFIED — Not actual government certification" />
    </div>
  );
}
