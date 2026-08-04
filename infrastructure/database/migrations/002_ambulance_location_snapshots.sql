CREATE TABLE IF NOT EXISTS ambulance_location_snapshots (
  id UUID PRIMARY KEY,
  ambulance_id UUID NOT NULL REFERENCES ambulances(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available', 'dispatched')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambulance_location_snapshots_gist ON ambulance_location_snapshots USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_ambulance_location_snapshots_recorded ON ambulance_location_snapshots (ambulance_id, recorded_at DESC);
