export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function createSpeechRecognition(lang: string): { recognition: any | null; supported: boolean } {
  if (!isSpeechRecognitionSupported()) {
    return { recognition: null, supported: false };
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';

  return { recognition, supported: true };
}

export function speakText(text: string, lang: string): void {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function parseVoiceInput(transcript: string): { material?: string; weight?: number; price?: number } {
  const result: { material?: string; weight?: number; price?: number } = {};

  const lower = transcript.toLowerCase();

  const materials = ['pcb', 'cable', 'copper', 'motor', 'battery', 'batteries', 'crt', 'lcd', 'plastic', 'mobile', 'computer', 'aluminium', 'aluminum'];
  for (const mat of materials) {
    if (lower.includes(mat)) {
      result.material = mat === 'copper' ? 'Copper Cable' : mat.charAt(0).toUpperCase() + mat.slice(1);
      break;
    }
  }

  const weightMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kilo|kg|किलो|किलोग्राम)/);
  if (weightMatch) {
    result.weight = parseFloat(weightMatch[1]);
  }

  const priceMatch = lower.match(/(\d+)\s*(?:rupaye|rupees|rs|r|रुपये|रुपये)/);
  if (priceMatch) {
    result.price = parseInt(priceMatch[1], 10);
  }

  return result;
}
