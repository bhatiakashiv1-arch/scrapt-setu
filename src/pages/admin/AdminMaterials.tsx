import { Boxes, Search } from 'lucide-react';
import { useState } from 'react';
import { Card, Badge, DemoBanner, EmptyState } from '@/components/ui';
import { useApp } from '@/context/AppContext';

export function AdminMaterials() {
  const { materials } = useApp();
  const [search, setSearch] = useState('');
  const filtered = materials.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Materials</h1>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search materials..." className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Boxes size={48} />} title="No materials found" message="Try a different search term." />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-stone-800">{m.name}</p>
                  <Badge variant="default">{m.category}</Badge>
                </div>
              </div>
              <p className="text-sm text-stone-600 mb-2">{m.description}</p>
              {m.recyclable_components && m.recyclable_components.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {m.recyclable_components.map((c) => <Badge key={c} variant="info">{c}</Badge>)}
                </div>
              )}
              {m.safety_warning && (
                <div className="p-2 bg-red-50 rounded-lg mt-2">
                  <p className="text-xs text-red-700">⚠ {m.safety_warning}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <DemoBanner text="DEMO DATA — SIH Prototype" />
    </div>
  );
}
