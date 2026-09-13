/*
# ScrapSetu — Complete Database Schema

## Overview
Creates the full database schema for the ScrapSetu e-waste transaction platform.
This is a prototype/demo application with no real authentication — all data is
intentionally public/shared for SIH demonstration purposes.

## New Tables
1. `collectors` — e-waste collector profiles (name, phone, language, location, lat/lng)
2. `recyclers` — recycler profiles (name, location, materials accepted, rates, authorization)
3. `materials` — material catalog (category, subcategory, safety warnings, recyclable components)
4. `prices` — price records per material/location with min/max/market/recycler prices
5. `lots` — digital lots created by collectors (reference_id, material, weight, estimate, status)
6. `quotes` — recycler quotes on lots (rate, total, pickup, net value, status)
7. `transactions` — completed transactions (final weight, price, payment, status)
8. `traceability_events` — event timeline per lot (event_type, actor, location, timestamp)
9. `earnings` — collector earnings ledger (gross, transport, platform, net amounts)

## Security
- RLS enabled on ALL tables.
- All tables use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a no-auth demo app where all data is intentionally shared.
- No user_id columns — single-tenant demo prototype.

## Notes
- All tables use `gen_random_uuid()` for primary keys.
- Timestamps default to `now()`.
- Idempotent creation with `IF NOT EXISTS`.
- Policies are dropped before creation to be safe on re-runs.
*/

-- ============================================================
-- COLLECTORS
-- ============================================================
CREATE TABLE IF NOT EXISTS collectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  language text DEFAULT 'en',
  location text,
  latitude double precision,
  longitude double precision,
  profile_photo text,
  total_lots integer DEFAULT 0,
  completed_transactions integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  recycling_volume numeric DEFAULT 0,
  safety_score integer DEFAULT 0,
  digital_readiness_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_collectors" ON collectors;
CREATE POLICY "anon_select_collectors" ON collectors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_collectors" ON collectors;
CREATE POLICY "anon_insert_collectors" ON collectors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_collectors" ON collectors;
CREATE POLICY "anon_update_collectors" ON collectors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_collectors" ON collectors;
CREATE POLICY "anon_delete_collectors" ON collectors FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- RECYCLERS
-- ============================================================
CREATE TABLE IF NOT EXISTS recyclers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  latitude double precision,
  longitude double precision,
  materials_accepted text[],
  service_area text,
  pickup_available boolean DEFAULT false,
  authorization_status text DEFAULT 'DEMO VERIFIED',
  contact text,
  offered_rates jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recyclers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recyclers" ON recyclers;
CREATE POLICY "anon_select_recyclers" ON recyclers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recyclers" ON recyclers;
CREATE POLICY "anon_insert_recyclers" ON recyclers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recyclers" ON recyclers;
CREATE POLICY "anon_update_recyclers" ON recyclers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recyclers" ON recyclers;
CREATE POLICY "anon_delete_recyclers" ON recyclers FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- MATERIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  subcategory text,
  name text NOT NULL,
  description text,
  recyclable_components text[],
  safety_warning text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_materials" ON materials;
CREATE POLICY "anon_select_materials" ON materials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_materials" ON materials;
CREATE POLICY "anon_insert_materials" ON materials FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_materials" ON materials;
CREATE POLICY "anon_update_materials" ON materials FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_materials" ON materials;
CREATE POLICY "anon_delete_materials" ON materials FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- PRICES
-- ============================================================
CREATE TABLE IF NOT EXISTS prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES materials(id) ON DELETE CASCADE,
  material_name text,
  location text,
  price_min numeric,
  price_max numeric,
  market_price numeric,
  recycler_price numeric,
  source_type text DEFAULT 'Market Data',
  previous_price numeric,
  price_change_pct numeric,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_prices" ON prices;
CREATE POLICY "anon_select_prices" ON prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_prices" ON prices;
CREATE POLICY "anon_insert_prices" ON prices FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_prices" ON prices;
CREATE POLICY "anon_update_prices" ON prices FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_prices" ON prices;
CREATE POLICY "anon_delete_prices" ON prices FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- LOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  collector_id uuid REFERENCES collectors(id) ON DELETE CASCADE,
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  material_name text,
  photo_url text,
  category text,
  description text,
  weight numeric,
  condition text,
  estimated_min numeric,
  estimated_max numeric,
  estimated_value numeric,
  location text,
  latitude double precision,
  longitude double precision,
  collection_date timestamptz DEFAULT now(),
  status text DEFAULT 'Open for Recycler Quotes',
  ai_confidence numeric,
  ai_classification text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lots" ON lots;
CREATE POLICY "anon_select_lots" ON lots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lots" ON lots;
CREATE POLICY "anon_insert_lots" ON lots FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lots" ON lots;
CREATE POLICY "anon_update_lots" ON lots FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_lots" ON lots;
CREATE POLICY "anon_delete_lots" ON lots FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- QUOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES lots(id) ON DELETE CASCADE,
  recycler_id uuid REFERENCES recyclers(id) ON DELETE CASCADE,
  offered_rate numeric,
  total_amount numeric,
  pickup_available boolean DEFAULT false,
  pickup_cost numeric DEFAULT 0,
  pickup_date text,
  pickup_time text,
  notes text,
  final_net_value numeric,
  status text DEFAULT 'Pending',
  counter_rate numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quotes" ON quotes;
CREATE POLICY "anon_select_quotes" ON quotes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quotes" ON quotes;
CREATE POLICY "anon_insert_quotes" ON quotes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quotes" ON quotes;
CREATE POLICY "anon_update_quotes" ON quotes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quotes" ON quotes;
CREATE POLICY "anon_delete_quotes" ON quotes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE,
  lot_id uuid REFERENCES lots(id) ON DELETE CASCADE,
  collector_id uuid REFERENCES collectors(id) ON DELETE SET NULL,
  recycler_id uuid REFERENCES recyclers(id) ON DELETE SET NULL,
  material_name text,
  final_weight numeric,
  final_price numeric,
  final_amount numeric,
  payment_method text,
  payment_status text DEFAULT 'Pending',
  transaction_status text DEFAULT 'Pending',
  handover_id text,
  collection_date timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TRACEABILITY EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS traceability_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES lots(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text,
  timestamp timestamptz DEFAULT now(),
  location text,
  actor_type text,
  actor_id text,
  reference_id text
);

ALTER TABLE traceability_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_traceability" ON traceability_events;
CREATE POLICY "anon_select_traceability" ON traceability_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_traceability" ON traceability_events;
CREATE POLICY "anon_insert_traceability" ON traceability_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_traceability" ON traceability_events;
CREATE POLICY "anon_update_traceability" ON traceability_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_traceability" ON traceability_events;
CREATE POLICY "anon_delete_traceability" ON traceability_events FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- EARNINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id uuid REFERENCES collectors(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  transaction_ref text,
  gross_amount numeric,
  transport_cost numeric DEFAULT 0,
  platform_cost numeric DEFAULT 0,
  net_amount numeric,
  payment_method text,
  material_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_earnings" ON earnings;
CREATE POLICY "anon_select_earnings" ON earnings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_earnings" ON earnings;
CREATE POLICY "anon_insert_earnings" ON earnings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_earnings" ON earnings;
CREATE POLICY "anon_update_earnings" ON earnings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_earnings" ON earnings;
CREATE POLICY "anon_delete_earnings" ON earnings FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lots_collector_id ON lots(collector_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);
CREATE INDEX IF NOT EXISTS idx_lots_reference_id ON lots(reference_id);
CREATE INDEX IF NOT EXISTS idx_quotes_lot_id ON quotes(lot_id);
CREATE INDEX IF NOT EXISTS idx_quotes_recycler_id ON quotes(recycler_id);
CREATE INDEX IF NOT EXISTS idx_transactions_lot_id ON transactions(lot_id);
CREATE INDEX IF NOT EXISTS idx_transactions_collector_id ON transactions(collector_id);
CREATE INDEX IF NOT EXISTS idx_traceability_lot_id ON traceability_events(lot_id);
CREATE INDEX IF NOT EXISTS idx_earnings_collector_id ON earnings(collector_id);
CREATE INDEX IF NOT EXISTS idx_prices_material_id ON prices(material_id);
