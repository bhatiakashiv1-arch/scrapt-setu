import { Camera, Tag, Package, Wallet, User, Mic, MapPin, TrendingUp, ArrowRight, Truck, Shield } from 'lucide-react';
import { Card, Badge, Button, formatINR, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { t } from '@/services/i18n';
import type { Page } from '@/App';

export function CollectorHome({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang, collector, prices, lots, recyclers, earnings } = useApp();
  const activeLots = lots.filter((l) => l.status !== 'Transaction Completed');
  const monthlyEarnings = earnings.reduce((sum, e) => sum + e.net_amount, 0);
  const nearbyRecycler = recyclers[0];

  const topPrices = prices.slice(0, 4);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            नमस्ते, {collector?.name?.split(' ')[0] ?? 'Ramesh'} 👋
          </h1>
          <div className="flex items-center gap-1 text-sm text-stone-500 mt-0.5">
            <MapPin size={14} />
            {collector?.location ?? 'Delhi'}
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#C65D3B]/10 flex items-center justify-center text-[#C65D3B]">
          <Mic size={20} />
        </button>
      </div>

      {/* Main CTA */}
      <Card className="p-6 bg-gradient-to-br from-[#C65D3B] to-[#B04D2F] border-0" >
        <button onClick={() => onNavigate('sell')} className="w-full text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Camera size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{t(lang, 'sellScrap')}</h2>
              <p className="text-sm text-white/80">Take a photo and get an estimated value</p>
            </div>
            <ArrowRight size={24} className="text-white/60" />
          </div>
        </button>
      </Card>

      {/* Price Board */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-stone-800">{t(lang, 'todayRates')}</h3>
          <button onClick={() => onNavigate('priceBoard')} className="text-sm text-[#C65D3B] font-medium flex items-center gap-1">
            {t(lang, 'viewPriceTrends')} <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {topPrices.map((price) => (
            <div key={price.id} className="flex items-center justify-between bg-[#F8F3EA] rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-stone-700">{price.material_name}</span>
              <div className="text-right">
                <span className="font-bold text-stone-800">₹{price.market_price}/kg</span>
                {price.price_change_pct !== undefined && price.price_change_pct > 0 && (
                  <span className="text-xs text-green-600 ml-1">▲{price.price_change_pct}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <DemoBanner text="DEMO DATA — Replace with verified field data before production" />
      </Card>

      {/* Active Lots */}
      {activeLots.length > 0 && (
        <Card className="p-4">
          <h3 className="font-bold text-stone-800 mb-3">Active Lots</h3>
          {activeLots.slice(0, 2).map((lot) => (
            <div key={lot.id} className="border-b border-stone-100 last:border-0 pb-3 last:pb-0 mb-3 last:mb-0" onClick={() => onNavigate('myLots')}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-stone-800">{lot.material_name} — {lot.weight}kg</span>
                <Badge variant={lot.status === 'Open for Recycler Quotes' ? 'info' : 'success'}>{lot.status}</Badge>
              </div>
              <div className="text-sm text-stone-500">
                Estimated: {formatINR(lot.estimated_min)}–{formatINR(lot.estimated_max)}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">{lot.reference_id}</div>
            </div>
          ))}
        </Card>
      )}

      {/* Monthly Earnings */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">{t(lang, 'monthlyEarnings')}</p>
            <p className="text-3xl font-bold text-[#68745A]">{formatINR(monthlyEarnings)}</p>
          </div>
          <button onClick={() => onNavigate('earnings')} className="text-sm text-[#C65D3B] font-medium">
            View →
          </button>
        </div>
      </Card>

      {/* Nearby Recycler */}
      {nearbyRecycler && (
        <Card className="p-4">
          <h3 className="font-bold text-stone-800 mb-2">{t(lang, 'nearbyRecycler')}</h3>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-stone-800">{nearbyRecycler.name}</p>
              <p className="text-sm text-stone-500">{nearbyRecycler.location} · {nearbyRecycler.materials_accepted.slice(0, 3).join(', ')}</p>
              <div className="flex items-center gap-2 mt-1">
                {nearbyRecycler.pickup_available && <Badge variant="success"><Truck size={12} className="mr-1" />Pickup</Badge>}
                <Badge variant="demo">{nearbyRecycler.authorization_status}</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Safety Center Quick Link */}
      <Card className="p-4 bg-[#68745A]/5 border-[#68745A]/20" onClick={() => onNavigate('safety')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#68745A] flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-800">{t(lang, 'safetyCenter')}</p>
            <p className="text-xs text-stone-500">Safe handling guidelines for e-waste</p>
          </div>
          <ArrowRight size={20} className="text-stone-400" />
        </div>
      </Card>
    </div>
  );
}
