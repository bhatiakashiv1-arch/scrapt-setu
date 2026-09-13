import { Card, Badge, DemoBanner } from '@/components/ui';
import { Users, Building2, ClipboardList, TrendingUp } from 'lucide-react';

export function FieldResearch() {
  const cards = [
    { icon: Users, title: 'Collector Interviews', desc: 'Interviews with informal e-waste collectors about their current practices, pain points, and needs.' },
    { icon: Building2, title: 'Recycler Interviews', desc: 'Discussions with formal recyclers about sourcing challenges and quality requirements.' },
    { icon: ClipboardList, title: 'Usability Tests', desc: 'User testing sessions with the ScrapSetu prototype with target users.' },
    { icon: TrendingUp, title: 'Price Observations', desc: 'Field observations of actual prices paid in informal and formal channels.' },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Field Research</h1>
      <Badge variant="warning">Field validation pending</Badge>
      <p className="text-sm text-stone-500 mt-2 mb-4">
        The following research areas need to be completed before production deployment.
        No interviews have been conducted yet — these are placeholders.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} className="p-5">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center mb-3">
                <Icon size={20} className="text-stone-400" />
              </div>
              <h3 className="font-bold text-stone-800 mb-1">{c.title}</h3>
              <p className="text-sm text-stone-500">{c.desc}</p>
              <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-dashed border-stone-300">
                <p className="text-xs text-stone-400 text-center">No data collected yet</p>
              </div>
            </Card>
          );
        })}
      </div>

      <DemoBanner text="Field validation pending — No interviews have been conducted" />
    </div>
  );
}
