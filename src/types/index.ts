export type Role = 'collector' | 'recycler' | 'admin';
export type Language = 'en' | 'hi' | 'mr';

export type LotStatus =
  | 'Open for Recycler Quotes'
  | 'Quote Received'
  | 'Quote Accepted'
  | 'Pickup Scheduled'
  | 'Handover Completed'
  | 'Payment Completed'
  | 'Transaction Completed'
  | 'Offline Pending Sync';

export type QuoteStatus = 'Pending' | 'Countered' | 'Accepted' | 'Rejected' | 'Expired' | 'Completed';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';
export type TransactionStatus = 'Pending' | 'Completed' | 'Cancelled';

export type SourceType = 'Collector Provided' | 'Recycler Provided' | 'Market Data' | 'AI Estimate' | 'Demo Data';

export type TraceabilityEventType =
  | 'Collected'
  | 'AI Classified'
  | 'Lot Created'
  | 'Recycler Matched'
  | 'Quote Received'
  | 'Quote Accepted'
  | 'Pickup Scheduled'
  | 'Handover Initiated'
  | 'Final Weight Confirmed'
  | 'Recycler Confirmed'
  | 'Payment Completed'
  | 'Transaction Completed';

export interface Collector {
  id: string;
  name: string;
  phone?: string;
  language: Language;
  location?: string;
  latitude?: number;
  longitude?: number;
  profile_photo?: string;
  total_lots: number;
  completed_transactions: number;
  total_earnings: number;
  recycling_volume: number;
  safety_score: number;
  digital_readiness_score: number;
  created_at: string;
  updated_at: string;
}

export interface Recycler {
  id: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  materials_accepted: string[];
  service_area?: string;
  pickup_available: boolean;
  authorization_status: string;
  contact?: string;
  offered_rates: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  category: string;
  subcategory?: string;
  name: string;
  description?: string;
  recyclable_components?: string[];
  safety_warning?: string;
  created_at: string;
}

export interface Price {
  id: string;
  material_id?: string;
  material_name: string;
  location?: string;
  price_min: number;
  price_max: number;
  market_price: number;
  recycler_price?: number;
  source_type: string;
  previous_price?: number;
  price_change_pct?: number;
  recorded_at: string;
}

export interface Lot {
  id: string;
  reference_id: string;
  collector_id?: string;
  material_id?: string;
  material_name?: string;
  photo_url?: string;
  category?: string;
  description?: string;
  weight: number;
  condition?: string;
  estimated_min: number;
  estimated_max: number;
  estimated_value?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  collection_date: string;
  status: LotStatus;
  ai_confidence?: number;
  ai_classification?: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  lot_id: string;
  recycler_id: string;
  offered_rate: number;
  total_amount: number;
  pickup_available: boolean;
  pickup_cost: number;
  pickup_date?: string;
  pickup_time?: string;
  notes?: string;
  final_net_value: number;
  status: QuoteStatus;
  counter_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_id?: string;
  lot_id: string;
  collector_id?: string;
  recycler_id?: string;
  material_name?: string;
  final_weight: number;
  final_price: number;
  final_amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  transaction_status: TransactionStatus;
  handover_id?: string;
  collection_date: string;
  completed_at?: string;
  created_at: string;
}

export interface TraceabilityEvent {
  id: string;
  lot_id: string;
  event_type: TraceabilityEventType;
  description?: string;
  timestamp: string;
  location?: string;
  actor_type?: string;
  actor_id?: string;
  reference_id?: string;
}

export interface Earning {
  id: string;
  collector_id?: string;
  transaction_id?: string;
  transaction_ref?: string;
  gross_amount: number;
  transport_cost: number;
  platform_cost: number;
  net_amount: number;
  payment_method?: string;
  material_name?: string;
  created_at: string;
}

export interface RecyclerMatch {
  recycler: Recycler;
  match_score: number;
  distance: number;
  rate: number;
  pickup_available: boolean;
  estimated_gross_value: number;
  transport_cost: number;
  net_value: number;
  reasons: string[];
  factors: {
    material_compatibility: number;
    distance: number;
    offered_rate: number;
    pickup: number;
    service_area: number;
  };
}

export interface SyncQueueItem {
  id: string;
  type: 'lot' | 'quote' | 'transaction' | 'traceability' | 'earning';
  data: Record<string, unknown>;
  created_at: string;
  synced: boolean;
}
