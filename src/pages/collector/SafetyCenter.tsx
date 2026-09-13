import { Flame, Battery, AlertTriangle, Hand, FireExtinguisher, Wrench, Shield, Volume2 } from 'lucide-react';
import { Card, Button, DemoBanner } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { t } from '@/services/i18n';
import { speakText } from '@/services/voiceService';

const SAFETY_TOPICS = [
  { icon: Flame, title: 'Do NOT burn cables', desc: 'Burning cables to recover copper releases toxic dioxins and furans. These cause cancer and respiratory diseases. Always strip cables mechanically.', color: '#C73E3E' },
  { icon: Battery, title: 'Do NOT puncture batteries', desc: 'Puncturing batteries can cause explosions, fires, and acid burns. Handle all batteries with care and store them separately.', color: '#D97757' },
  { icon: AlertTriangle, title: 'Do NOT open batteries', desc: 'Opening batteries exposes harmful chemicals. Lead-acid batteries contain corrosive acid. Lithium batteries can catch fire if damaged.', color: '#C73E3E' },
  { icon: FireExtinguisher, title: 'Do NOT use acid to recover metals', desc: 'Acid processing of e-waste releases toxic fumes and contaminates soil and water. Use proper recycling channels instead.', color: '#D97757' },
  { icon: Wrench, title: 'Do NOT break CRTs manually', desc: 'CRT tubes contain lead and toxic phosphor coatings. They also pose implosion risk. Handle with care and use proper equipment.', color: '#C73E3E' },
  { icon: Hand, title: 'Always use gloves', desc: 'Wear protective gloves when handling e-waste. Many components contain hazardous materials that can be absorbed through skin.', color: '#68745A' },
  { icon: Battery, title: 'Keep batteries away from heat', desc: 'Heat can cause batteries to leak, catch fire, or explode. Store in cool, dry places away from direct sunlight.', color: '#D97757' },
  { icon: Shield, title: 'Use safer dismantling practices', desc: 'Work in well-ventilated areas. Wear masks and eye protection. Separate hazardous components first. Follow proper disposal guidelines.', color: '#68745A' },
];

export function SafetyCenter() {
  const { lang } = useApp();

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">{t(lang, 'safetyCenter')}</h1>
      <p className="text-sm text-stone-500 mb-4">Safe handling guidelines for e-waste collectors</p>

      <div className="space-y-3">
        {SAFETY_TOPICS.map((topic, i) => {
          const Icon = topic.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: topic.color + '15' }}>
                  <Icon size={24} style={{ color: topic.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 mb-1">{topic.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{topic.desc}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-[#68745A]"
                    onClick={() => speakText(`${topic.title}. ${topic.desc}`, lang)}
                  >
                    <Volume2 size={14} className="mr-1" /> Listen
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <DemoBanner text="Safety guidelines based on general e-waste handling best practices" />
    </div>
  );
}
