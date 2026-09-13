import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, MapPin } from 'lucide-react';
import { Card, Badge, Button, LineChart, DemoBanner, formatINR } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { t } from '@/services/i18n';
import { getPriceHistory } from '@/services/priceService';

const RANGES = ['7 days', '30 days', '90 days'];

export function PriceBoard() {
  const { lang, prices } = useApp();
  const [selectedMaterial, setSelectedMaterial] = useState('PCB');
  const [range, setRange] = useState('7 days');

  const history = getPriceHistory(selectedMaterial);
  const labels7 = ['7d', '6d', '5d', '4d', '3d', '2d', '1d'];
  const labels30 = Array.from({ length: 30 }, (_, i) => `${30 - i}d`);
  const labels90 = Array.from({ length: 30 }, (_, i) => `${90 - i * 3}d`);
  const labels = range === '7 days' ? labels7 : range === '30 days' ? labels30 : labels90;
  const data = range === '7 days' ? history : range === '30 days' ? [...history, ...history, ...history, ...history, ...history.slice(0, 2)] : [...history, ...history, ...history, ...history, ...history, ...history, ...history, ...history, ...history, ...history, ...history, ...history, ...history.slice(0, 2)];

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">{t(lang, 'todayRates')}</h1>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3">Current Prices</h3>
        <div className="space-y-2">
          {prices.map((price) => {
            const change = price.price_change_pct ?? 0;
            const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
            const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-stone-400';
            return (
              <button
                key={price.id}
                onClick={() => setSelectedMaterial(price.material_name)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  selectedMaterial === price.material_name ? 'bg-[#C65D3B]/10' : 'hover:bg-stone-50'
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-stone-800">{price.material_name}</p>
                  <p className="text-sm text-stone-500">₹{price.price_min}–₹{price.price_max}/kg</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-800">₹{price.market_price}/kg</p>
                  <div className={`flex items-center justify-end gap-1 text-sm ${changeColor}`}>
                    <TrendIcon size={14} />
                    {change > 0 ? `▲${change}%` : change < 0 ? `▼${Math.abs(change)}%` : '—'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-stone-400">
          <MapPin size={12} /> Delhi · Updated today
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-stone-800">{selectedMaterial} — Price History</h3>
          <Badge variant="demo">DEMO PRICE DATA</Badge>
        </div>
        <div className="flex gap-1.5 mb-4">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                range === r ? 'bg-[#C65D3B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <LineChart data={data} labels={range === '7 days' ? labels : undefined} color="#C65D3B" height={120} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-[#F8F3EA] rounded-lg">
            <p className="text-xs text-stone-400">Min</p>
            <p className="font-bold text-stone-700">₹{Math.min(...data)}</p>
          </div>
          <div className="text-center p-2 bg-[#F8F3EA] rounded-lg">
            <p className="text-xs text-stone-400">Avg</p>
            <p className="font-bold text-stone-700">₹{Math.round(data.reduce((a, b) => a + b, 0) / data.length)}</p>
          </div>
          <div className="text-center p-2 bg-[#F8F3EA] rounded-lg">
            <p className="text-xs text-stone-400">Max</p>
            <p className="font-bold text-stone-700">₹{Math.max(...data)}</p>
          </div>
        </div>
      </Card>

      <DemoBanner text="DEMO PRICE DATA — Replace with verified market data before production" />
    </div>
  );
}
