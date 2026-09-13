import { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Mic, ArrowRight, ArrowLeft, Check, Info, TrendingUp, Package, Truck, Wallet } from 'lucide-react';
import { Card, Button, Badge, Spinner, DemoBanner, formatINR } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { getDemoPhoto, fileToDataURL, uploadImageToSupabase } from '@/services/storageService';
import { isSpeechRecognitionSupported, createSpeechRecognition, parseVoiceInput } from '@/services/voiceService';
import { matchRecyclers, getBestNetDeal } from '@/services/matchService';
import { estimateValue, getPriceForMaterial } from '@/services/priceService';
import type { Lot, RecyclerMatch } from '@/types';

type Step = 'photo' | 'classification' | 'weight' | 'estimate' | 'lot' | 'matching' | 'quotes' | 'handover' | 'receipt';

export function SellScrap({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { lang, collector, materials, prices, recyclers, addLot, addQuote, setLotStatus, completeTransaction, getTraceability, addTraceability, authUser } = useApp();

  const [step, setStep] = useState<Step>('photo');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [aiClassification, setAiClassification] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiCategory, setAiCategory] = useState<string>('');
  const [aiCondition, setAiCondition] = useState<string>('');
  const [aiComponents, setAiComponents] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [weight, setWeight] = useState<number>(0);
  const [estimate, setEstimate] = useState<{ min: number; max: number; mid: number } | null>(null);
  const [createdLot, setCreatedLot] = useState<Lot | null>(null);
  const [matches, setMatches] = useState<RecyclerMatch[]>([]);
  const [bestDeal, setBestDeal] = useState<RecyclerMatch | null>(null);
  const [acceptedMatch, setAcceptedMatch] = useState<RecyclerMatch | null>(null);
  const [finalWeight, setFinalWeight] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [handoverId, setHandoverId] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [showCalc, setShowCalc] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string>('');
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDemoPhoto = () => {
    setPhotoUrl(getDemoPhoto());
    runClassification();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCameraError('');
      try {
        const url = await fileToDataURL(file);
        setPhotoUrl(url);
        setPhotoFile(file);
        runClassification();
      } catch {
        setCameraError('Could not read the selected image. Please try again.');
      }
    }
    e.target.value = '';
  };

  const triggerUpload = () => {
    setCameraError('');
    uploadInputRef.current?.click();
  };

  const triggerCamera = () => {
    setCameraError('');
    if (!navigator.mediaDevices && !cameraInputRef.current) {
      setCameraError('Camera is not supported on this browser. Use Upload Photo instead.');
      return;
    }
    cameraInputRef.current?.click();
  };

  const runClassification = () => {
    setStep('classification');
    setTimeout(() => {
      setAiClassification('PCB');
      setAiConfidence(91);
      setAiCategory('Electronic Component');
      setAiCondition('Used');
      setAiComponents(['Copper', 'Gold', 'Silver', 'Other metals']);
      setSelectedMaterial('PCB');
    }, 1500);
  };

  const handleMaterialChange = (mat: string) => {
    setSelectedMaterial(mat);
    const material = materials.find((m) => m.name === mat || m.category === mat);
    if (material) {
      setAiClassification(material.name);
      setAiCategory(material.category);
      setAiComponents(material.recyclable_components ?? []);
    }
  };

  const handleWeightContinue = () => {
    const price = getPriceForMaterial(selectedMaterial, prices);
    if (price && weight > 0) {
      const est = estimateValue(price.market_price, weight);
      setEstimate(est);
      setStep('estimate');
    }
  };

  const handleCreateLot = async () => {
    if (!collector || !estimate) return;
    setPublishing(true);
    setPublishError('');
    const material = materials.find((m) => m.name === selectedMaterial || m.category === selectedMaterial);

    let finalPhotoUrl = photoUrl;
    if (photoFile && authUser) {
      const uploadedUrl = await uploadImageToSupabase(photoFile, authUser.id);
      if (uploadedUrl) {
        finalPhotoUrl = uploadedUrl;
      } else {
        setPublishError('Image upload failed. Please try again.');
        setPublishing(false);
        return;
      }
    }

    const lot = await addLot({
      collector_id: collector.id,
      material_id: material?.id,
      material_name: selectedMaterial,
      category: aiCategory,
      photo_url: finalPhotoUrl,
      weight,
      condition: aiCondition,
      estimated_min: estimate.min,
      estimated_max: estimate.max,
      estimated_value: estimate.mid,
      location: collector.location,
      latitude: collector.latitude,
      longitude: collector.longitude,
      ai_confidence: aiConfidence,
      ai_classification: aiClassification,
      collection_date: new Date().toISOString(),
    });
    setPublishing(false);
    if (lot) {
      setCreatedLot(lot);
      setStep('lot');
    } else {
      setPublishError('Failed to save product. Please try again.');
    }
  };

  const handleFindRecyclers = async () => {
    setStep('matching');
    const price = getPriceForMaterial(selectedMaterial, prices);
    const marketPrice = price?.market_price ?? 580;
    const lotForMatch = createdLot ?? { weight, material_name: selectedMaterial, latitude: collector?.latitude, longitude: collector?.longitude, category: aiCategory } as unknown as Lot;
    const result = matchRecyclers(lotForMatch, recyclers, marketPrice);
    setMatches(result);
    setBestDeal(getBestNetDeal(result) ?? null);

    // Auto-generate a quote from the best match recycler
    if (result.length > 0 && createdLot) {
      const best = result[0];
      await addQuote({
        lot_id: createdLot.id,
        recycler_id: best.recycler.id,
        offered_rate: best.rate,
        total_amount: best.estimated_gross_value,
        pickup_available: best.pickup_available,
        pickup_cost: best.transport_cost,
        pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        pickup_time: '10:00 AM',
        notes: 'Pickup available from your location.',
        final_net_value: best.net_value,
      });
      await addTraceability(createdLot.id, 'Recycler Matched', `Best match: ${best.recycler.name} (${best.match_score}% match)`, 'System', undefined, collector?.location, createdLot.reference_id);
      await addTraceability(createdLot.id, 'Quote Received', `Quote received from ${best.recycler.name}: ₹${best.rate}/kg`, 'Recycler', best.recycler.id, collector?.location, createdLot.reference_id);
      await setLotStatus(createdLot.id, 'Quote Received');
    }

    setTimeout(() => setStep('quotes'), 2000);
  };

  const handleAcceptQuote = async () => {
    if (!createdLot || !bestDeal) return;
    setAcceptedMatch(bestDeal);
    await setLotStatus(createdLot.id, 'Quote Accepted');
    await addTraceability(createdLot.id, 'Quote Accepted', `Collector accepted quote from ${bestDeal.recycler.name}`, 'Collector', collector?.id, collector?.location, createdLot.reference_id);
    await addTraceability(createdLot.id, 'Pickup Scheduled', `Pickup scheduled for ${new Date(Date.now() + 86400000).toLocaleDateString()}`, 'Recycler', bestDeal.recycler.id, collector?.location, createdLot.reference_id);
    setStep('handover');
  };

  const handleConfirmHandover = async () => {
    if (!createdLot || !acceptedMatch || !collector) return;
    const fw = finalWeight || (weight + 0.2);
    const fp = acceptedMatch.rate;
    const fa = Math.round(fw * fp);
    setFinalWeight(fw);
    setFinalPrice(fp);
    setFinalAmount(fa);

    const txn = await completeTransaction(
      createdLot.id,
      collector.id,
      acceptedMatch.recycler.id,
      selectedMaterial,
      fw,
      fp,
      paymentMethod
    );
    if (txn) {
      setHandoverId(txn.handover_id ?? '');
      setTransactionRef(txn.transaction_id ?? '');
      setStep('receipt');
    }
  };

  const handleVoiceInput = () => {
    setVoiceError('');
    if (!isSpeechRecognitionSupported()) {
      setVoiceError("Voice input isn't supported on this browser. You can type instead.");
      return;
    }
    const { recognition, supported } = createSpeechRecognition(lang);
    if (!supported || !recognition) {
      setVoiceError("Voice input isn't supported on this browser. You can type instead.");
      return;
    }
    setVoiceListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceListening(false);
      const parsed = parseVoiceInput(transcript);
      if (parsed.weight) setWeight(parsed.weight);
      if (parsed.material) {
        setSelectedMaterial(parsed.material);
        handleMaterialChange(parsed.material);
      }
    };
    recognition.onerror = () => {
      setVoiceListening(false);
      setVoiceError('Could not hear you. Please try again or type.');
    };
    recognition.onend = () => setVoiceListening(false);
    recognition.start();
  };

  const stepOrder: Step[] = ['photo', 'classification', 'weight', 'estimate', 'lot', 'matching', 'quotes', 'handover', 'receipt'];
  const currentStepIdx = stepOrder.indexOf(step);

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      {/* Progress */}
      {step !== 'photo' && (
        <div className="flex items-center gap-1 mb-4">
          {stepOrder.slice(0, 6).map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= currentStepIdx ? 'bg-[#C65D3B]' : 'bg-stone-200'}`} />
          ))}
        </div>
      )}

      {/* Step 1: Photo */}
      {step === 'photo' && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-stone-800">कबाड़ की फोटो लें</h1>
          <p className="text-stone-500">Take a photo of your scrap to get started</p>
          {photoUrl && (
            <img src={photoUrl} alt="Scrap" className="w-full rounded-xl border border-stone-200" />
          )}
          {cameraError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{cameraError}</p>
          )}
          <div className="space-y-2">
            <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={handleDemoPhoto}>
              <ImageIcon size={20} /> Use Demo Photo
            </Button>
            <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <Button size="lg" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={triggerUpload}>
              <Upload size={20} /> Upload Photo
            </Button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
            <Button size="lg" variant="ghost" className="w-full flex items-center justify-center gap-2" onClick={triggerCamera}>
              <Camera size={20} /> Take Photo
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Classification */}
      {step === 'classification' && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-stone-800">AI-assisted identification</h1>
          {aiClassification ? (
            <>
              <Card className="p-4">
                <img src={photoUrl} alt="Scrap" className="w-full h-48 object-cover rounded-lg mb-3" />
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-stone-800">{aiClassification}</p>
                    <p className="text-sm text-stone-500">{aiCategory} · {aiCondition}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#C65D3B]">{aiConfidence}%</p>
                    <Badge variant="ai">AI Estimate</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">Potential recoverable materials:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiComponents.map((c) => (
                      <Badge key={c} variant="default">{c}</Badge>
                    ))}
                  </div>
                </div>
                <DemoBanner text="AI DEMO ESTIMATE — Not a scientifically validated ML model" />
              </Card>
              <div>
                <p className="text-sm text-stone-600 mb-2">Looks wrong? Change material:</p>
                <select
                  value={selectedMaterial}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 bg-white text-stone-700"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.name}>{m.name} ({m.category})</option>
                  ))}
                </select>
              </div>
              <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={() => setStep('weight')}>
                Continue <ArrowRight size={20} />
              </Button>
            </>
          ) : (
            <Card className="p-6">
              <Spinner label="Analyzing photo..." />
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Weight */}
      {step === 'weight' && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-stone-800">Approximate weight</h1>
          <Card className="p-6 text-center">
            <p className="text-sm text-stone-500 mb-2">Enter weight in kg</p>
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="w-32 text-center text-4xl font-bold border-2 border-[#C65D3B] rounded-xl py-3 bg-white text-stone-800"
              placeholder="0"
              autoFocus
            />
            <span className="text-2xl font-bold text-stone-400 ml-2">kg</span>
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="outline" size="sm" onClick={() => setWeight(Math.max(0, weight - 0.5))}>- 0.5 kg</Button>
              <Button variant="outline" size="sm" onClick={() => setWeight(weight + 0.5)}>+ 0.5 kg</Button>
            </div>
          </Card>
          <Button size="lg" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleVoiceInput}>
            <Mic size={20} className={voiceListening ? 'animate-pulse text-red-500' : ''} />
            {voiceListening ? 'Listening...' : 'Voice Input'}
          </Button>
          {voiceError && <p className="text-sm text-amber-600 text-center">{voiceError}</p>}
          <Button size="lg" className="w-full" onClick={handleWeightContinue} disabled={weight <= 0}>
            Continue <ArrowRight size={20} className="inline ml-1" />
          </Button>
        </div>
      )}

      {/* Step 4: Estimate */}
      {step === 'estimate' && estimate && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-stone-800">Fair Price Estimate</h1>
          <Card className="p-6 text-center">
            <p className="text-sm text-stone-500">{selectedMaterial} · {weight} kg</p>
            <p className="text-4xl font-bold text-[#C65D3B] mt-2">
              {formatINR(estimate.min)} – {formatINR(estimate.max)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="info">Market Data</Badge>
              <Badge variant="ai">AI-assisted estimate</Badge>
            </div>
          </Card>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-stone-500">Local range:</span> <span className="font-medium text-stone-800">₹540–₹620/kg</span></div>
              <div><span className="text-stone-500">Reference:</span> <span className="font-medium text-stone-800">₹580/kg</span></div>
              <div><span className="text-stone-500">Weight:</span> <span className="font-medium text-stone-800">{weight} kg</span></div>
              <div><span className="text-stone-500">Location:</span> <span className="font-medium text-stone-800">{collector?.location}</span></div>
            </div>
            <button onClick={() => setShowCalc(!showCalc)} className="text-sm text-[#C65D3B] font-medium mt-3 flex items-center gap-1">
              <Info size={14} /> How is this calculated?
            </button>
            {showCalc && (
              <div className="mt-3 p-3 bg-[#F8F3EA] rounded-lg text-sm text-stone-600 space-y-1">
                <p>• Material type and category</p>
                <p>• Weight entered by collector</p>
                <p>• Location-based pricing</p>
                <p>• Recent price history (7-30 days)</p>
                <p>• Recycler offered rates</p>
                <p>• Market range (min/max)</p>
              </div>
            )}
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-800">Estimate only. Final price depends on recycler inspection and final weight.</p>
            </div>
          </Card>
          {publishError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{publishError}</p>
          )}
          <Button size="lg" className="w-full" onClick={handleCreateLot} disabled={publishing}>
            {publishing ? <Spinner label="" /> : <>Create Lot <ArrowRight size={20} className="inline ml-1" /></>}
          </Button>
        </div>
      )}

      {/* Step 5: Lot Created */}
      {step === 'lot' && createdLot && (
        <div className="space-y-4">
          <div className="text-center pt-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Lot Created!</h1>
            <p className="text-lg font-mono font-bold text-[#C65D3B] mt-2">{createdLot.reference_id}</p>
            <Badge variant="success">{createdLot.status}</Badge>
          </div>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-stone-500">Material:</span> <span className="font-medium">{createdLot.material_name}</span></div>
              <div><span className="text-stone-500">Weight:</span> <span className="font-medium">{createdLot.weight} kg</span></div>
              <div><span className="text-stone-500">Estimate:</span> <span className="font-medium">{formatINR(createdLot.estimated_min)}–{formatINR(createdLot.estimated_max)}</span></div>
              <div><span className="text-stone-500">Location:</span> <span className="font-medium">{createdLot.location}</span></div>
            </div>
          </Card>
          <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={handleFindRecyclers}>
            <TrendingUp size={20} /> Find Recycler
          </Button>
        </div>
      )}

      {/* Step 6: Matching */}
      {step === 'matching' && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-stone-800">Finding recyclers...</h1>
          <Card className="p-6">
            <Spinner label="Matching with best recyclers..." />
          </Card>
        </div>
      )}

      {/* Step 7: Quotes / Recycler Matches */}
      {step === 'quotes' && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-stone-800">Best Recycler Matches</h1>

          {/* Best Net Deal */}
          {bestDeal && (
            <Card className="p-4 bg-gradient-to-br from-[#68745A]/10 to-[#68745A]/5 border-[#68745A]/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="success">Best Net Deal</Badge>
              </div>
              <p className="font-bold text-stone-800 text-lg">{bestDeal.recycler.name}</p>
              <p className="text-sm text-stone-500">{bestDeal.match_score}% Match · {bestDeal.distance} km · ₹{bestDeal.rate}/kg</p>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Gross Value:</span><span className="font-medium">{formatINR(bestDeal.estimated_gross_value)}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Transport:</span><span className="font-medium">{formatINR(bestDeal.transport_cost)}</span></div>
                <div className="flex justify-between border-t border-stone-200 pt-1"><span className="font-semibold text-stone-700">Net Value:</span><span className="font-bold text-[#68745A]">{formatINR(bestDeal.net_value)}</span></div>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-stone-500 mb-1">Why this recycler?</p>
                <div className="flex flex-wrap gap-1">
                  {bestDeal.reasons.map((r, i) => (
                    <span key={i} className="text-xs text-green-700 flex items-center gap-0.5">
                      <Check size={12} /> {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1 text-xs">
                <div className="text-center"><p className="text-stone-400">Material</p><p className="font-bold text-stone-700">{bestDeal.factors.material_compatibility}%</p></div>
                <div className="text-center"><p className="text-stone-400">Distance</p><p className="font-bold text-stone-700">{bestDeal.factors.distance}%</p></div>
                <div className="text-center"><p className="text-stone-400">Rate</p><p className="font-bold text-stone-700">{bestDeal.factors.offered_rate}%</p></div>
                <div className="text-center"><p className="text-stone-400">Pickup</p><p className="font-bold text-stone-700">{bestDeal.factors.pickup}%</p></div>
                <div className="text-center"><p className="text-stone-400">Area</p><p className="font-bold text-stone-700">{bestDeal.factors.service_area}%</p></div>
              </div>
            </Card>
          )}

          {/* Other matches */}
          {matches.slice(1).map((match, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-stone-800">{match.recycler.name}</p>
                <Badge variant="info">{match.match_score}% Match</Badge>
              </div>
              <div className="text-sm text-stone-500 space-y-1">
                <p>{match.distance} km · ₹{match.rate}/kg · {match.pickup_available ? 'Pickup available' : 'No pickup'}</p>
                <div className="flex justify-between"><span>Gross:</span><span>{formatINR(match.estimated_gross_value)}</span></div>
                <div className="flex justify-between"><span>Transport:</span><span>{formatINR(match.transport_cost)}</span></div>
                <div className="flex justify-between font-medium"><span>Net:</span><span>{formatINR(match.net_value)}</span></div>
              </div>
            </Card>
          ))}

          {bestDeal && (
            <Button size="lg" className="w-full" onClick={handleAcceptQuote}>
              Accept Quote from {bestDeal.recycler.name}
            </Button>
          )}
        </div>
      )}

      {/* Step 8: Handover */}
      {step === 'handover' && acceptedMatch && createdLot && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-stone-800">Digital Handover</h1>
          <Card className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Lot ID:</span><span className="font-mono font-medium">{createdLot.reference_id}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Recycler:</span><span className="font-medium">{acceptedMatch.recycler.name}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Expected weight:</span><span className="font-medium">{weight} kg</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Expected value:</span><span className="font-medium">{formatINR(acceptedMatch.estimated_gross_value)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Rate:</span><span className="font-medium">₹{acceptedMatch.rate}/kg</span></div>
            </div>
          </Card>

          <Card className="p-4">
            <p className="font-medium text-stone-700 mb-2">Confirm Final Weight</p>
            <input
              type="number"
              value={finalWeight || weight}
              onChange={(e) => setFinalWeight(parseFloat(e.target.value) || 0)}
              className="w-full text-center text-2xl font-bold border-2 border-[#C65D3B] rounded-xl py-2.5 bg-white"
              step="0.1"
            />
            <p className="text-xs text-stone-400 mt-1 text-center">Expected: {weight} kg</p>
          </Card>

          <Card className="p-4">
            <p className="font-medium text-stone-700 mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'UPI', 'Bank Transfer'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    paymentMethod === method ? 'border-[#C65D3B] bg-[#C65D3B]/10 text-[#C65D3B]' : 'border-stone-200 text-stone-600'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-[#F8F3EA]">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Final Weight:</span><span className="font-bold">{finalWeight || weight} kg</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Final Price:</span><span className="font-bold">₹{acceptedMatch.rate}/kg</span></div>
              <div className="flex justify-between text-lg"><span className="font-semibold text-stone-700">Final Amount:</span><span className="font-bold text-[#C65D3B]">{formatINR(Math.round((finalWeight || weight) * acceptedMatch.rate))}</span></div>
            </div>
          </Card>

          <Button size="lg" variant="success" className="w-full" onClick={handleConfirmHandover}>
            Confirm Handover
          </Button>
        </div>
      )}

      {/* Step 9: Receipt */}
      {step === 'receipt' && (
        <div className="space-y-4">
          <div className="text-center pt-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Transaction Complete!</h1>
          </div>

          <Card className="p-6">
            <div className="text-center mb-4 pb-4 border-b border-stone-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[#C65D3B] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" /><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" /><path d="m14 16-3 3 3 3" /><path d="M8.293 13.596 7.196 9.5 3.1 10.598" /><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" /><path d="m13.378 9.633 4.096 1.098 1.097-4.096" /></svg>
                </div>
                <p className="font-bold text-stone-800 text-lg">SCRAPSETU</p>
              </div>
              <p className="text-xs text-stone-400">Digital Receipt</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Transaction:</span><span className="font-mono font-medium">{transactionRef}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Lot:</span><span className="font-mono font-medium">{createdLot?.reference_id}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Material:</span><span className="font-medium">{selectedMaterial}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Final Weight:</span><span className="font-medium">{finalWeight} kg</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Final Rate:</span><span className="font-medium">₹{finalPrice}/kg</span></div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-lg"><span className="font-semibold text-stone-700">Final Amount:</span><span className="font-bold text-[#C65D3B]">{formatINR(finalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Recycler:</span><span className="font-medium">{acceptedMatch?.recycler.name}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Payment:</span><span className="font-medium">{paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Status:</span><Badge variant="success">PAID</Badge></div>
              <div className="flex justify-between"><span className="text-stone-500">Handover:</span><span className="font-mono font-medium">{handoverId}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Date:</span><span className="font-medium">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-200">
              <DemoBanner text="DEMO TRANSACTION" />
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              Print / Save Receipt
            </Button>
            <Button className="flex-1" onClick={() => onNavigate('traceability')}>
              View Traceability
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={() => onNavigate('home')}>
            Back to Home
          </Button>
        </div>
      )}
    </div>
  );
}
