CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'clinic', 'field_unit')),
  governorate TEXT NOT NULL,
  total_beds INTEGER NOT NULL CHECK (total_beds > 0),
  occupied_beds INTEGER NOT NULL CHECK (occupied_beds >= 0),
  status TEXT NOT NULL CHECK (status IN ('RED', 'GREEN')) DEFAULT 'GREEN',
  location GEOGRAPHY(POINT, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS ambulances (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('available', 'dispatched')) DEFAULT 'available',
  location GEOGRAPHY(POINT, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS occupancy_snapshots (
  id UUID PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  occupied_beds INTEGER NOT NULL,
  total_beds INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('RED', 'GREEN')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_assignments (
  id UUID PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
  destination GEOGRAPHY(POINT, 4326) NOT NULL,
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_ambulances_location ON ambulances USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_facilities_governorate ON facilities (governorate);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities (status);
CREATE INDEX IF NOT EXISTS idx_occupancy_snapshots_facility_recorded ON occupancy_snapshots (facility_id, recorded_at DESC);

INSERT INTO facilities (id, name, type, governorate, total_beds, occupied_beds, status, location)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Damascus Central Hospital', 'hospital', 'Damascus', 120, 70, 'GREEN', ST_SetSRID(ST_MakePoint(36.2765, 33.5138), 4326)::geography),
  ('11111111-1111-1111-1111-111111111102', 'Aleppo Field Clinic', 'field_unit', 'Aleppo', 40, 30, 'GREEN', ST_SetSRID(ST_MakePoint(37.1343, 36.2021), 4326)::geography),
  ('11111111-1111-1111-1111-111111111103', 'Homs General Hospital', 'hospital', 'Homs', 90, 75, 'GREEN', ST_SetSRID(ST_MakePoint(36.7136, 34.7324), 4326)::geography),
  ('11111111-1111-1111-1111-111111111104', 'Latakia Coastal Clinic', 'clinic', 'Latakia', 35, 20, 'GREEN', ST_SetSRID(ST_MakePoint(35.7956, 35.5311), 4326)::geography),
  ('11111111-1111-1111-1111-111111111105', 'Daraa Emergency Unit', 'field_unit', 'Daraa', 25, 18, 'GREEN', ST_SetSRID(ST_MakePoint(36.1021, 32.6189), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ambulances (id, code, status, location)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'AMB-DMS-01', 'available', ST_SetSRID(ST_MakePoint(36.2900, 33.5100), 4326)::geography),
  ('22222222-2222-2222-2222-222222222202', 'AMB-ALP-02', 'available', ST_SetSRID(ST_MakePoint(37.1500, 36.2000), 4326)::geography),
  ('22222222-2222-2222-2222-222222222203', 'AMB-HMS-03', 'available', ST_SetSRID(ST_MakePoint(36.7200, 34.7400), 4326)::geography),
  ('22222222-2222-2222-2222-222222222204', 'AMB-LTK-04', 'available', ST_SetSRID(ST_MakePoint(35.7800, 35.5400), 4326)::geography)
ON CONFLICT (id) DO NOTHING;
