import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { Card, Badge, Button, Modal, DemoBanner, formatINR } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { addPrice } from '@/services/priceService';
import { getPriceHistory } from '@/services/priceService';
import { LineChart } from '@/components/ui';

export function AdminPrices() {
  const { prices, refreshData } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('PCB');
  const [newPrice, setNewPrice] = useState({ material_name: 'PCB', location: 'Delhi', price_min: 540, price_max: 620, market_price: 580, recycler_price: 600 });

  const history = getPriceHistory(selectedMaterial);

  const handleAdd = async () => {
    await addPrice({ ...newPrice, source_type: 'Market Data', recorded_at: new Date().toISOString() });
    await refreshData();
    setShowAdd(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-stone-800">Price Intelligence</h1>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={16} className="mr-1" /> Add Price</Button>
      </div>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3">Current Rates</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="py-2 pr-4">Material</th>
                <th className="py-2 pr-4">Range</th>
                <th className="py-2 pr-4">Market</th>
                <th className="py-2 pr-4">Recycler</th>
                <th className="py-2 pr-4">Change</th>
                <th className="py-2 pr-4">Location</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => {
                const change = p.price_change_pct ?? 0;
                return (
                  <tr key={p.id} className="border-b border-stone-100 last:border-0">
                    <td className="py-2 pr-4 font-medium text-stone-800">{p.material_name}</td>
                    <td className="py-2 pr-4 text-stone-600">₹{p.price_min}–₹{p.price_max}</td>
                    <td className="py-2 pr-4 font-medium">₹{p.market_price}</td>
                    <td className="py-2 pr-4 text-stone-600">{p.recycler_price ? `₹${p.recycler_price}` : '—'}</td>
                    <td className="py-2 pr-4">
                      {change > 0 ? <span className="text-green-600 flex items-center gap-0.5"><TrendingUp size={12} />{change}%</span> :
                       change < 0 ? <span className="text-red-600 flex items-center gap-0.5"><TrendingDown size={12} />{Math.abs(change)}%</span> :
                       <span className="text-stone-400">—</span>}
                    </td>
                    <td className="py-2 pr-4 text-stone-500">{p.location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-stone-800">Price History</h3>
          <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className="border border-stone-200 rounded-lg px-2 py-1 text-sm">
            {prices.map((p) => <option key={p.id} value={p.material_name}>{p.material_name}</option>)}
          </select>
        </div>
        <LineChart data={history} color="#C65D3B" height={120} />
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-stone-800 mb-2">Price Volatility & Regional Differences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-[#F8F3EA] rounded-lg"><p className="text-stone-500">PCB Volatility</p><p className="font-bold text-stone-800">Low (4.2%)</p></div>
          <div className="p-3 bg-[#F8F3EA] rounded-lg"><p className="text-stone-500">Cable Volatility</p><p className="font-bold text-stone-800">Low (2.0%)</p></div>
          <div className="p-3 bg-[#F8F3EA] rounded-lg"><p className="text-stone-500">Delhi vs Noida</p><p className="font-bold text-stone-800">+3.5%</p></div>
        </div>
      </Card>

      {showAdd && (
        <Modal title="Add Price Record" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div><label className="text-sm text-stone-600 block mb-1">Material Name</label><input value={newPrice.material_name} onChange={(e) => setNewPrice({ ...newPrice, material_name: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2" /></div>
            <div><label className="text-sm text-stone-600 block mb-1">Location</label><input value={newPrice.location} onChange={(e) => setNewPrice({ ...newPrice, location: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-sm text-stone-600 block mb-1">Min Price</label><input type="number" value={newPrice.price_min} onChange={(e) => setNewPrice({ ...newPrice, price_min: parseFloat(e.target.value) })} className="w-full border border-stone-200 rounded-lg px-3 py-2" /></div>
              <div><label className="text-sm text-stone-600 block mb-1">Max Price</label><input type="number" value={newPrice.price_max} onChange={(e) => setNewPrice({ ...newPrice, price_max: parseFloat(e.target.value) })} className="w-full border border-stone-200 rounded-lg px-3 py-2" /></div>
              <div><label className="text-sm text-stone-600 block mb-1">Market Price</label><input type="number" value={newPrice.market_price} onChange={(e) => setNewPrice({ ...newPrice, market_price: parseFloat(e.target.value) })} className="w-full border border-stone-200 rounded-lg px-3 py-2" /></div>
              <div><label className="text-sm text-stone-600 block mb-1">Recycler Price</label><input type="number" value={newPrice.recycler_price} onChange={(e) => setNewPrice({ ...newPrice, recycler_price: parseFloat(e.target.value) })} className="w-full border border-stone-200 rounded-lg px-3 py-2" /></div>
            </div>
            <Button className="w-full" onClick={handleAdd}>Add Price Record</Button>
          </div>
        </Modal>
      )}
      <DemoBanner text="DEMO PRICE DATA — Replace with verified market data" />
    </div>
  );
}
