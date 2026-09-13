import { Activity, TrendingUp, AlertTriangle, Brain, BarChart3 } from 'lucide-react';
import { Card, Badge, DemoBanner, SimpleBarChart, formatINR } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { getMaterialDistribution, detectAnomalies, getDemandInsights } from '@/services/analyticsService';

export function AdminAnalytics() {
  const { lots, transactions, prices } = useApp();
  const dist = getMaterialDistribution(lots);
  const anomalies = detectAnomalies(transactions, prices);
  const demand = getDemandInsights(lots);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Analytics</h1>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3">Material Category Distribution</h3>
        <SimpleBarChart
          data={dist.length > 0 ? dist.map((d) => d.count) : [5, 3, 2, 2, 1, 1]}
          labels={dist.length > 0 ? dist.map((d) => d.category) : ['PCB', 'Cables', 'Batteries', 'Motors', 'LCD', 'CRT']}
          color="#C65D3B"
          height={120}
        />
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" /> Abnormal Transaction Detection
        </h3>
        <Badge variant="demo">AI/ANALYTICS DEMO</Badge>
        {anomalies.length === 0 ? (
          <p className="text-sm text-stone-500 mt-3">No unusual transactions detected. All transactions are within expected price ranges.</p>
        ) : (
          <div className="space-y-3 mt-3">
            {anomalies.map((a, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{a.transaction.material_name} — {a.transaction.final_weight}kg</p>
                    <p className="text-xs text-stone-400">{a.transaction.transaction_id}</p>
                  </div>
                  <Badge variant="warning">⚠ Unusual</Badge>
                </div>
                <p className="text-sm text-amber-700 mt-2">{a.reason}</p>
                <p className="text-xs text-stone-500 mt-1">Expected range: {a.expectedRange} · Actual: ₹{a.transaction.final_price}/kg</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-[#68745A]" /> Demand Intelligence
        </h3>
        <Badge variant="demo">DEMO ANALYSIS</Badge>
        <div className="space-y-2 mt-3">
          {demand.map((d) => (
            <div key={d.material} className="flex items-center justify-between p-2 bg-[#F8F3EA] rounded-lg">
              <span className="font-medium text-stone-700">{d.material}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500">{d.volume} kg</span>
                {d.trend === 'up' && <Badge variant="success">↑ Rising</Badge>}
                {d.trend === 'down' && <Badge variant="warning">↓ Falling</Badge>}
                {d.trend === 'stable' && <Badge variant="default">→ Stable</Badge>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
          <Brain size={18} className="text-[#C65D3B]" /> AI Intelligence Center
        </h3>
        <Badge variant="ai">AI-assisted prototype</Badge>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {[
            { title: 'Material Classification', desc: 'Photo → Material identification (91% confidence demo)', icon: '📷' },
            { title: 'Price Estimation', desc: 'Material + location + weight + history → estimated range', icon: '₹' },
            { title: 'Recycler Recommendation', desc: 'Material + location + rate + pickup → match score', icon: '🔄' },
            { title: 'Anomaly Detection', desc: 'Historical range → unusual transaction alert', icon: '⚠' },
            { title: 'Demand Intelligence', desc: 'Historical transactions → emerging demand', icon: '📈' },
          ].map((item, i) => (
            <div key={i} className="p-3 border border-stone-200 rounded-lg">
              <p className="font-medium text-stone-800">{item.icon} {item.title}</p>
              <p className="text-xs text-stone-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-stone-800 mb-3">Regional Demand Chart</h3>
        <SimpleBarChart data={[320, 280, 220, 180, 150, 95]} labels={['Delhi', 'Noida', 'Gzb', 'Faridabad', 'Gurgaon', 'Other']} color="#68745A" height={100} />
      </Card>

      <DemoBanner text="DEMO ANALYSIS — Replace with verified field data" />
    </div>
  );
}
