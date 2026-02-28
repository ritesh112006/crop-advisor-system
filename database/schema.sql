-- ============================================================
-- CROP ADVISOR SYSTEM — PostgreSQL Schema
-- Paste this in Render PostgreSQL > Query > Execute
-- Password: tany_@112654
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. FARM PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farm_profiles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     TEXT NOT NULL UNIQUE,          -- Supabase auth user ID
    full_name   TEXT NOT NULL,
    email       TEXT,
    mobile      TEXT,
    state       TEXT NOT NULL,
    farm_name   TEXT DEFAULT 'My Farm',
    soil_type   TEXT DEFAULT 'Loamy',
    land_acres  NUMERIC(8,2) DEFAULT 1.0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. SENSOR READINGS (IoT data from farm)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      TEXT NOT NULL,
    nitrogen     NUMERIC(6,2),      -- kg/ha
    phosphorus   NUMERIC(6,2),
    potassium    NUMERIC(6,2),
    ph_level     NUMERIC(4,2),
    soil_moisture NUMERIC(5,2),     -- percentage
    temperature  NUMERIC(5,2),      -- celsius
    humidity     NUMERIC(5,2),      -- percentage
    recorded_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sensor_user_id ON sensor_readings(user_id);
CREATE INDEX idx_sensor_recorded ON sensor_readings(recorded_at DESC);

-- ─────────────────────────────────────────────
-- 3. CROP SELECTIONS (AI-recommended + chosen)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crop_selections (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       TEXT NOT NULL,
    crop_name     TEXT NOT NULL,
    confidence    NUMERIC(5,2),
    season        TEXT,
    soil_type     TEXT,
    expected_yield TEXT,
    market_price  NUMERIC(10,2),
    selected_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crop_user ON crop_selections(user_id);

-- ─────────────────────────────────────────────
-- 4. MARKET PRICE CACHE (ML predictions)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_predictions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name    TEXT NOT NULL,
    state        TEXT NOT NULL,
    base_price   NUMERIC(10,2),
    phase1_price NUMERIC(10,2),   -- Days 1-15
    phase2_price NUMERIC(10,2),   -- Days 16-30
    phase3_price NUMERIC(10,2),   -- Days 31-45
    phase4_price NUMERIC(10,2),   -- Days 46-60
    predicted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crop_name, state, DATE(predicted_at))
);

-- ─────────────────────────────────────────────
-- 5. ALERTS LOG
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farm_alerts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     TEXT NOT NULL,
    category    TEXT NOT NULL,    -- water, fertilizer, pest, weather
    severity    TEXT NOT NULL,    -- high, medium, low
    title       TEXT NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON farm_alerts(user_id);

-- ─────────────────────────────────────────────
-- 6. UPDATED_AT TRIGGER (auto-update)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER farm_profiles_updated_at
BEFORE UPDATE ON farm_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────
SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name::regclass)) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
