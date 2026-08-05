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

CREATE TABLE IF NOT EXISTS ambulance_location_snapshots (
  id UUID PRIMARY KEY,
  ambulance_id UUID NOT NULL REFERENCES ambulances(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available', 'dispatched')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_ambulances_location ON ambulances USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_ambulance_location_snapshots_gist ON ambulance_location_snapshots USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_facilities_governorate ON facilities (governorate);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities (status);
CREATE INDEX IF NOT EXISTS idx_occupancy_snapshots_facility_recorded ON occupancy_snapshots (facility_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ambulance_location_snapshots_recorded ON ambulance_location_snapshots (ambulance_id, recorded_at DESC);

INSERT INTO facilities (id, name, type, governorate, total_beds, occupied_beds, status, location)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Damascus Central Hospital', 'hospital', 'Damascus', 120, 70, 'GREEN', ST_SetSRID(ST_MakePoint(36.2765, 33.5138), 4326)::geography),
  ('11111111-1111-1111-1111-111111111102', 'Aleppo Field Clinic', 'field_unit', 'Aleppo', 40, 30, 'GREEN', ST_SetSRID(ST_MakePoint(37.1343, 36.2021), 4326)::geography),
  ('11111111-1111-1111-1111-111111111103', 'Homs General Hospital', 'hospital', 'Homs', 90, 75, 'GREEN', ST_SetSRID(ST_MakePoint(36.7136, 34.7324), 4326)::geography),
  ('11111111-1111-1111-1111-111111111104', 'Latakia Coastal Clinic', 'clinic', 'Latakia', 35, 20, 'GREEN', ST_SetSRID(ST_MakePoint(35.7956, 35.5311), 4326)::geography),
  ('11111111-1111-1111-1111-111111111105', 'Daraa Emergency Unit', 'field_unit', 'Daraa', 25, 18, 'GREEN', ST_SetSRID(ST_MakePoint(36.1021, 32.6189), 4326)::geography),
  ('11111111-1111-1111-1111-111111111106', 'Damascus Ibn Al-Nafis Hospital', 'hospital', 'Damascus', 150, 138, 'RED', ST_SetSRID(ST_MakePoint(36.2950, 33.5220), 4326)::geography),
  ('11111111-1111-1111-1111-111111111107', 'Aleppo University Hospital', 'hospital', 'Aleppo', 200, 185, 'RED', ST_SetSRID(ST_MakePoint(37.1610, 36.2150), 4326)::geography),
  ('11111111-1111-1111-1111-111111111108', 'Hama National Hospital', 'hospital', 'Hama', 110, 72, 'GREEN', ST_SetSRID(ST_MakePoint(36.7570, 35.1330), 4326)::geography),
  ('11111111-1111-1111-1111-111111111109', 'Tartus Marine Clinic', 'clinic', 'Tartus', 40, 22, 'GREEN', ST_SetSRID(ST_MakePoint(35.8865, 34.8890), 4326)::geography),
  ('11111111-1111-1111-1111-111111111110', 'Idlib Field Medical Unit', 'field_unit', 'Idlib', 45, 41, 'RED', ST_SetSRID(ST_MakePoint(36.6330, 35.9300), 4326)::geography),
  ('11111111-1111-1111-1111-111111111111', 'Deir ez-Zor Central Hospital', 'hospital', 'Deir ez-Zor', 95, 60, 'GREEN', ST_SetSRID(ST_MakePoint(40.1400, 35.3360), 4326)::geography),
  ('11111111-1111-1111-1111-111111111112', 'Raqqa Emergency Clinic', 'clinic', 'Raqqa', 50, 46, 'RED', ST_SetSRID(ST_MakePoint(39.0080, 35.9520), 4326)::geography),
  ('11111111-1111-1111-1111-111111111113', 'Hasakah General Hospital', 'hospital', 'Hasakah', 80, 48, 'GREEN', ST_SetSRID(ST_MakePoint(40.7430, 36.5070), 4326)::geography),
  ('11111111-1111-1111-1111-111111111114', 'Qamishli Field Unit', 'field_unit', 'Hasakah', 30, 16, 'GREEN', ST_SetSRID(ST_MakePoint(41.2280, 37.0500), 4326)::geography),
  ('11111111-1111-1111-1111-111111111115', 'Sweida Community Clinic', 'clinic', 'Sweida', 35, 19, 'GREEN', ST_SetSRID(ST_MakePoint(36.5690, 32.7090), 4326)::geography),
  ('11111111-1111-1111-1111-111111111116', 'Palmyra Desert Field Unit', 'field_unit', 'Homs', 28, 25, 'RED', ST_SetSRID(ST_MakePoint(38.2840, 34.5600), 4326)::geography),
  ('11111111-1111-1111-1111-111111111117', 'Quneitra Border Clinic', 'clinic', 'Quneitra', 22, 10, 'GREEN', ST_SetSRID(ST_MakePoint(35.8240, 33.1260), 4326)::geography),
  ('11111111-1111-1111-1111-111111111118', 'Rural Damascus Field Hospital', 'field_unit', 'Rural Damascus', 55, 33, 'GREEN', ST_SetSRID(ST_MakePoint(36.4010, 33.4870), 4326)::geography),
  ('11111111-1111-1111-1111-111111111119', 'Banias Coastal Clinic', 'clinic', 'Tartus', 26, 14, 'GREEN', ST_SetSRID(ST_MakePoint(35.9580, 35.1820), 4326)::geography),
  ('11111111-1111-1111-1111-111111111120', 'Jableh Medical Center', 'clinic', 'Latakia', 32, 29, 'RED', ST_SetSRID(ST_MakePoint(35.9220, 35.3620), 4326)::geography),
  ('11111111-1111-1111-1111-111111111121', 'Al Mujtahid Hospital', 'hospital', 'Damascus', 180, 112, 'GREEN', ST_SetSRID(ST_MakePoint(36.3012, 33.5088), 4326)::geography),
  ('11111111-1111-1111-1111-111111111122', 'Al Assad University Hospital', 'hospital', 'Damascus', 220, 205, 'RED', ST_SetSRID(ST_MakePoint(36.2688, 33.5042), 4326)::geography),
  ('11111111-1111-1111-1111-111111111123', 'Children Hospital of Damascus', 'hospital', 'Damascus', 140, 88, 'GREEN', ST_SetSRID(ST_MakePoint(36.2844, 33.5195), 4326)::geography),
  ('11111111-1111-1111-1111-111111111124', 'Al Mouwasat University Hospital', 'hospital', 'Damascus', 200, 186, 'RED', ST_SetSRID(ST_MakePoint(36.2918, 33.5112), 4326)::geography),
  ('11111111-1111-1111-1111-111111111125', 'Tishreen Military Hospital', 'hospital', 'Damascus', 160, 97, 'GREEN', ST_SetSRID(ST_MakePoint(36.2595, 33.4980), 4326)::geography),
  ('11111111-1111-1111-1111-111111111126', 'Al Zahrawi Surgical Hospital', 'hospital', 'Damascus', 110, 102, 'RED', ST_SetSRID(ST_MakePoint(36.3120, 33.5168), 4326)::geography),
  ('11111111-1111-1111-1111-111111111127', 'Eye Surgical Hospital', 'hospital', 'Damascus', 90, 54, 'GREEN', ST_SetSRID(ST_MakePoint(36.2735, 33.5210), 4326)::geography),
  ('11111111-1111-1111-1111-111111111128', 'Obstetrics Hospital Damascus', 'hospital', 'Damascus', 130, 79, 'GREEN', ST_SetSRID(ST_MakePoint(36.2880, 33.4995), 4326)::geography),
  ('11111111-1111-1111-1111-111111111129', 'Al Fayhaa General Hospital', 'hospital', 'Damascus', 100, 93, 'RED', ST_SetSRID(ST_MakePoint(36.3055, 33.4928), 4326)::geography),
  ('11111111-1111-1111-1111-111111111130', 'Douma National Hospital', 'hospital', 'Rural Damascus', 120, 76, 'GREEN', ST_SetSRID(ST_MakePoint(36.4025, 33.5720), 4326)::geography),
  ('11111111-1111-1111-1111-111111111131', 'Harasta General Hospital', 'hospital', 'Rural Damascus', 95, 88, 'RED', ST_SetSRID(ST_MakePoint(36.3680, 33.5585), 4326)::geography),
  ('11111111-1111-1111-1111-111111111132', 'Aleppo Military Hospital', 'hospital', 'Aleppo', 170, 101, 'GREEN', ST_SetSRID(ST_MakePoint(37.1455, 36.2088), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ambulances (id, code, status, location)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'AMB-DMS-01', 'available', ST_SetSRID(ST_MakePoint(36.2900, 33.5100), 4326)::geography),
  ('22222222-2222-2222-2222-222222222202', 'AMB-ALP-02', 'available', ST_SetSRID(ST_MakePoint(37.1500, 36.2000), 4326)::geography),
  ('22222222-2222-2222-2222-222222222203', 'AMB-HMS-03', 'available', ST_SetSRID(ST_MakePoint(36.7200, 34.7400), 4326)::geography),
  ('22222222-2222-2222-2222-222222222204', 'AMB-LTK-04', 'available', ST_SetSRID(ST_MakePoint(35.7800, 35.5400), 4326)::geography),
  ('22222222-2222-2222-2222-222222222205', 'AMB-DMS-05', 'available', ST_SetSRID(ST_MakePoint(36.2650, 33.5050), 4326)::geography),
  ('22222222-2222-2222-2222-222222222206', 'AMB-ALP-06', 'available', ST_SetSRID(ST_MakePoint(37.1200, 36.1900), 4326)::geography),
  ('22222222-2222-2222-2222-222222222207', 'AMB-HMA-07', 'available', ST_SetSRID(ST_MakePoint(36.7400, 35.1400), 4326)::geography),
  ('22222222-2222-2222-2222-222222222208', 'AMB-TRS-08', 'available', ST_SetSRID(ST_MakePoint(35.8700, 34.8800), 4326)::geography),
  ('22222222-2222-2222-2222-222222222209', 'AMB-IDL-09', 'available', ST_SetSRID(ST_MakePoint(36.6500, 35.9200), 4326)::geography),
  ('22222222-2222-2222-2222-222222222210', 'AMB-DEZ-10', 'available', ST_SetSRID(ST_MakePoint(40.1500, 35.3300), 4326)::geography),
  ('22222222-2222-2222-2222-222222222211', 'AMB-RQA-11', 'available', ST_SetSRID(ST_MakePoint(39.0200, 35.9400), 4326)::geography),
  ('22222222-2222-2222-2222-222222222212', 'AMB-HSK-12', 'available', ST_SetSRID(ST_MakePoint(40.7500, 36.5000), 4326)::geography),
  ('22222222-2222-2222-2222-222222222213', 'AMB-SWD-13', 'available', ST_SetSRID(ST_MakePoint(36.5600, 32.7000), 4326)::geography),
  ('22222222-2222-2222-2222-222222222214', 'AMB-PLM-14', 'available', ST_SetSRID(ST_MakePoint(38.2700, 34.5500), 4326)::geography),
  ('22222222-2222-2222-2222-222222222215', 'AMB-QNT-15', 'available', ST_SetSRID(ST_MakePoint(35.8300, 33.1200), 4326)::geography),
  ('22222222-2222-2222-2222-222222222216', 'AMB-RDS-16', 'available', ST_SetSRID(ST_MakePoint(36.3900, 33.4800), 4326)::geography),
  ('22222222-2222-2222-2222-222222222217', 'AMB-DMS-17', 'available', ST_SetSRID(ST_MakePoint(36.3005, 33.5095), 4326)::geography),
  ('22222222-2222-2222-2222-222222222218', 'AMB-DMS-18', 'available', ST_SetSRID(ST_MakePoint(36.2700, 33.5050), 4326)::geography),
  ('22222222-2222-2222-2222-222222222219', 'AMB-DMS-19', 'available', ST_SetSRID(ST_MakePoint(36.2925, 33.5125), 4326)::geography),
  ('22222222-2222-2222-2222-222222222220', 'AMB-DMS-20', 'available', ST_SetSRID(ST_MakePoint(36.2605, 33.4990), 4326)::geography),
  ('22222222-2222-2222-2222-222222222221', 'AMB-DMS-21', 'available', ST_SetSRID(ST_MakePoint(36.3110, 33.5175), 4326)::geography),
  ('22222222-2222-2222-2222-222222222222', 'AMB-DMS-22', 'available', ST_SetSRID(ST_MakePoint(36.2865, 33.5005), 4326)::geography),
  ('22222222-2222-2222-2222-222222222223', 'AMB-RDS-23', 'available', ST_SetSRID(ST_MakePoint(36.4000, 33.5700), 4326)::geography),
  ('22222222-2222-2222-2222-222222222224', 'AMB-RDS-24', 'available', ST_SetSRID(ST_MakePoint(36.3660, 33.5570), 4326)::geography)
ON CONFLICT (id) DO NOTHING;
