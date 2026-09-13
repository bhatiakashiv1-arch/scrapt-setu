import { useState } from 'react';
import { Database, Search, Download } from 'lucide-react';
import { Card, Badge, Button, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';

const TABS = ['Materials', 'Prices', 'Recyclers', 'Transactions', 'Traceability', 'Collectors'];

export function DatasetExplorer() {
  const { materials, prices, recyclers, transactions, lots } = useApp();
  const [tab, setTab] = useState('Materials');
  const [search, setSearch] = useState('');

  const renderTable = () => {
    let headers: string[] = [];
    let rows: Record<string, unknown>[] = [];

    switch (tab) {
      case 'Materials':
        headers = ['name', 'category', 'description'];
        rows = materials as unknown as Record<string, unknown>[];
        break;
      case 'Prices':
        headers = ['material_name', 'price_min', 'price_max', 'market_price', 'location', 'source_type'];
        rows = prices as unknown as Record<string, unknown>[];
        break;
      case 'Recyclers':
        headers = ['name', 'location', 'service_area', 'authorization_status', 'pickup_available'];
        rows = recyclers as unknown as Record<string, unknown>[];
        break;
      case 'Transactions':
        headers = ['transaction_id', 'material_name', 'final_weight', 'final_amount', 'payment_method', 'payment_status'];
        rows = transactions as unknown as Record<string, unknown>[];
        break;
      case 'Traceability':
        headers = ['reference_id', 'event_type', 'description', 'timestamp'];
        rows = lots as unknown as Record<string, unknown>[];
        break;
      case 'Collectors':
        headers = ['name', 'location', 'total_lots', 'completed_transactions', 'total_earnings'];
        rows = [{ name: 'Ramesh Kumar', location: 'Delhi', total_lots: 24, completed_transactions: 18, total_earnings: 18450 }];
        break;
    }

    const filtered = rows.filter((r) =>
      headers.some((h) => String(r[h] ?? '').toLowerCase().includes(search.toLowerCase()))
    );

    return (
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500 bg-[#F8F3EA]">
                {headers.map((h) => <th key={h} className="py-3 px-4 capitalize">{h.replace(/_/g, ' ')}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                  {headers.map((h) => (
                    <td key={h} className="py-2 px-4">
                      {typeof row[h] === 'boolean' ? (row[h] ? 'Yes' : 'No') : String(row[h] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-stone-400 py-8 text-sm">No records found.</p>}
      </Card>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Dataset Explorer</h1>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${tab === t ? 'bg-[#C65D3B] text-white' : 'bg-stone-100 text-stone-600'}`}>{t}</button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records..." className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg text-sm" />
        </div>
        <Button variant="outline" size="md"><Download size={16} className="mr-1" /> Export</Button>
      </div>

      {renderTable()}
      <DemoBanner text="DEMO DATA — SIH Prototype" />
    </div>
  );
}
