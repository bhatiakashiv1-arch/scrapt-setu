import { Card, Badge, DemoBanner, formatINR } from '@/components/ui';

export function UnitEconomics() {
  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-stone-800 mb-4">Why Would Collectors Use ScrapSetu?</h1>
      <p className="text-sm text-stone-500 mb-4">Unit economics comparison</p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card className="p-5 border-stone-300">
          <h3 className="font-bold text-stone-700 mb-3">Existing Informal Sale</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-stone-500">Sale:</span><span className="font-medium">{formatINR(4200)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Transport:</span><span className="font-medium text-red-600">-{formatINR(300)}</span></div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-lg"><span className="font-semibold">Net:</span><span className="font-bold text-stone-700">{formatINR(3900)}</span></div>
          </div>
        </Card>

        <Card className="p-5 border-[#68745A] bg-[#68745A]/5">
          <h3 className="font-bold text-[#68745A] mb-3">ScrapSetu</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-stone-500">Recycler quote:</span><span className="font-medium">{formatINR(4800)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Shared/free pickup:</span><span className="font-medium text-green-600">{formatINR(0)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Platform/service:</span><span className="font-medium text-red-600">-{formatINR(50)}</span></div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-lg"><span className="font-semibold text-[#68745A]">Net:</span><span className="font-bold text-[#68745A]">{formatINR(4750)}</span></div>
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-gradient-to-br from-[#68745A]/10 to-[#68745A]/5 border-[#68745A]/30 mb-4">
        <div className="text-center">
          <p className="text-sm text-stone-500">Improvement for the collector</p>
          <p className="text-4xl font-bold text-[#68745A] mt-1">+{formatINR(850)}</p>
          <p className="text-sm text-stone-500 mt-1">~21.8% more than informal sale</p>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-stone-800 mb-2">How ScrapSetu Creates Value</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <p>• Fair price intelligence ensures collectors know the market rate before selling</p>
          <p>• Direct connection to recyclers removes middleman margins</p>
          <p>• Shared/cluster pickup eliminates transport costs for small collectors</p>
          <p>• Transparent platform fee (₹50) is far less than informal dealer margins</p>
          <p>• Digital traceability builds trust and enables repeat business</p>
        </div>
      </Card>

      <DemoBanner text="DEMO UNIT ECONOMICS — Replace with field-validated values" />
    </div>
  );
}
