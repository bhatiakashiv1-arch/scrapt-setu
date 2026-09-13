import { User, MapPin, Phone, Globe, Package, Check, Award, TrendingUp } from 'lucide-react';
import { Card, Badge, Button, ProgressBar, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { t } from '@/services/i18n';
import type { Language } from '@/types';

export function Profile() {
  const { lang, collector, setLang, updateCollectorProfile } = useApp();
  if (!collector) return null;

  const readinessFactors = [
    { label: 'Profile complete', score: 90 },
    { label: 'Product data quality', score: 75 },
    { label: 'Price usage', score: 85 },
    { label: 'Formal handovers', score: 80 },
    { label: 'Digital receipts', score: 82 },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">{t(lang, 'profile')}</h1>

      <Card className="p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C65D3B]/10 flex items-center justify-center text-[#C65D3B]">
            <User size={32} />
          </div>
          <div>
            <p className="text-xl font-bold text-stone-800">{collector.name}</p>
            <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
              <span className="flex items-center gap-1"><MapPin size={14} /> {collector.location}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {collector.phone}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3">Language Preference</h3>
        <div className="grid grid-cols-3 gap-2">
          {([
            { code: 'en', label: 'English' },
            { code: 'hi', label: 'हिंदी' },
            { code: 'mr', label: 'मराठी' },
          ] as { code: Language; label: string }[]).map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                lang === l.code ? 'border-[#C65D3B] bg-[#C65D3B]/10 text-[#C65D3B]' : 'border-stone-200 text-stone-600'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="p-4">
          <Package size={20} className="text-stone-400 mb-1" />
          <p className="text-xs text-stone-500">Total Lots</p>
          <p className="text-2xl font-bold text-stone-800">{collector.total_lots}</p>
        </Card>
        <Card className="p-4">
          <Check size={20} className="text-stone-400 mb-1" />
          <p className="text-xs text-stone-500">Completed Transactions</p>
          <p className="text-2xl font-bold text-stone-800">{collector.completed_transactions}</p>
        </Card>
        <Card className="p-4">
          <TrendingUp size={20} className="text-stone-400 mb-1" />
          <p className="text-xs text-stone-500">Total Earnings</p>
          <p className="text-2xl font-bold text-[#68745A]">₹{collector.total_earnings.toLocaleString('en-IN')}</p>
        </Card>
        <Card className="p-4">
          <Award size={20} className="text-stone-400 mb-1" />
          <p className="text-xs text-stone-500">Recycling Volume</p>
          <p className="text-2xl font-bold text-stone-800">{collector.recycling_volume} kg</p>
        </Card>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-stone-800">{t(lang, 'digitalReadinessScore')}</h3>
          <Badge variant="demo">Prototype</Badge>
        </div>
        <div className="text-center mb-4">
          <p className="text-4xl font-bold text-[#C65D3B]">{collector.digital_readiness_score}<span className="text-xl text-stone-400">/100</span></p>
        </div>
        <ProgressBar value={collector.digital_readiness_score} color="#C65D3B" />
        <div className="mt-4 space-y-2">
          {readinessFactors.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-600">{f.label}</span>
                <span className="text-stone-400">{f.score}%</span>
              </div>
              <ProgressBar value={f.score} color="#68745A" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-2">Safety Score</h3>
        <div className="flex items-center gap-3">
          <ProgressBar value={collector.safety_score} color="#5B8C5A" />
          <span className="text-lg font-bold text-[#5B8C5A]">{collector.safety_score}/100</span>
        </div>
      </Card>

      <DemoBanner text="DEMO DATA — Replace with verified field data before production" />
    </div>
  );
}
