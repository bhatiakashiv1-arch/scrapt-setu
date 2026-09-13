import { Button, Card, Badge } from '@/components/ui';
import { Camera, Tag, FileText, Truck, Wallet, Shield, MapPin, Mic, Wifi, Leaf, TrendingUp, Package, ArrowRight, Recycle } from 'lucide-react';
import type { Role } from '@/types';

export function Landing({ onEnter, onLoadDemo }: { onEnter: (role: Role) => void; onLoadDemo: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8F3EA]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F3EA] via-[#F8F3EA] to-[#F0E8D8]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-1.5 mb-6 border border-stone-200">
              <Recycle size={16} className="text-[#C65D3B]" />
              <span className="text-sm font-semibold text-stone-700">ScrapSetu</span>
              <Badge variant="demo">SIH 2026 Prototype</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-[#242321] leading-tight">
              Fair Price. Safe Recycling. Verified Handover.
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mt-4 leading-relaxed">
              A vernacular, offline-first platform connecting informal e-waste collectors with formal recycling channels.
            </p>
            <p className="text-base text-[#68745A] mt-2 font-medium">
              From Informal Collection to Formal Recycling.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button size="lg" onClick={() => onEnter('collector')} className="flex items-center justify-center gap-2">
                <Camera size={20} />
                Start Selling Scrap
              </Button>
              <Button size="lg" variant="outline" onClick={() => onEnter('admin')} className="flex items-center justify-center gap-2">
                Explore the Ecosystem <ArrowRight size={20} />
              </Button>
            </div>
            <div className="mt-4">
              <Button size="md" variant="ghost" onClick={onLoadDemo} className="text-[#C79A4B] underline">
                Load SIH Demo Scenario
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-[#242321] mb-8">The Journey</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {[
              { label: 'Collect', icon: <Camera size={24} /> },
              { label: 'Identify', icon: <Tag size={24} /> },
              { label: 'Price', icon: <TrendingUp size={24} /> },
              { label: 'Match', icon: <Recycle size={24} /> },
              { label: 'Handover', icon: <Truck size={24} /> },
              { label: 'Earn', icon: <Wallet size={24} /> },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#F8F3EA] border border-stone-200 flex items-center justify-center text-[#C65D3B]">
                    {step.icon}
                  </div>
                  <span className="text-sm font-medium text-stone-700">{step.label}</span>
                </div>
                {i < 5 && <ArrowRight size={20} className="text-stone-300 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F8F3EA] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Fair Prices',
                desc: 'Know the local price range before selling. AI-assisted price intelligence based on market data and recycler quotes.',
                icon: <TrendingUp size={28} />,
                color: '#C65D3B',
              },
              {
                title: 'Verified Recycling',
                desc: 'Connect with suitable formal recycling channels. Explainable match scoring — understand why a recycler was recommended.',
                icon: <Shield size={28} />,
                color: '#68745A',
              },
              {
                title: 'Traceable Transactions',
                desc: 'Every lot gets a unique digital record. Full traceability from collection to payment with timestamps and actors.',
                icon: <FileText size={28} />,
                color: '#C79A4B',
              },
            ].map((benefit, i) => (
              <Card key={i} className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: benefit.color + '15', color: benefit.color }}>
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-2">{benefit.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Built for */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#242321] mb-2">Built for the informal e-waste economy</h2>
          <p className="text-stone-500 mb-8">We don't formalize the collector by adding paperwork. We formalize the transaction by making the formal route simpler, safer and more profitable.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Low literacy', icon: <FileText size={16} /> },
              { label: 'Low connectivity', icon: <Wifi size={16} /> },
              { label: 'Vernacular users', icon: <Mic size={16} /> },
              { label: 'Small collectors', icon: <Package size={16} /> },
              { label: 'Local aggregators', icon: <MapPin size={16} /> },
              { label: 'Entry-level Android', icon: <Camera size={16} /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#F8F3EA] border border-stone-200 rounded-lg px-3 py-2">
                <span className="text-[#68745A]">{item.icon}</span>
                <span className="text-sm text-stone-700 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="bg-[#242321] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Core Differentiators</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              'Fair Price Intelligence',
              'AI Material Recognition',
              'Explainable Recycler Matching',
              'Best Net Deal',
              'Smart Lot Aggregation',
              'Digital Traceability',
              'Offline-First Operation',
              'Vernacular Voice UX',
              'Safety Guidance',
              'Earnings Ledger',
            ].map((d, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                <p className="text-sm text-white/80 font-medium">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="bg-[#F8F3EA] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#242321] mb-4">
            Small Collectors. Better Prices. Formal Recycling. One Connected Network.
          </h2>
          <p className="text-lg text-[#68745A] font-semibold">
            We don't just digitize scrap. We digitize the transaction.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => onEnter('collector')}>Enter Collector App</Button>
            <Button size="lg" variant="secondary" onClick={() => onEnter('recycler')}>Recycler Portal</Button>
            <Button size="lg" variant="outline" onClick={() => onEnter('admin')}>Admin Dashboard</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#242321] text-white/60 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm">
          <p className="mb-1">ScrapSetu — SIH 2026 Prototype</p>
          <p className="text-xs text-white/40">DEMO DATA — Replace with verified field data before production</p>
        </div>
      </footer>
    </div>
  );
}
