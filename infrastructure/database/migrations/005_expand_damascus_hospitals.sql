INSERT INTO facilities (id, name, type, governorate, total_beds, occupied_beds, status, location)
VALUES
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
  ('22222222-2222-2222-2222-222222222217', 'AMB-DMS-17', 'available', ST_SetSRID(ST_MakePoint(36.3005, 33.5095), 4326)::geography),
  ('22222222-2222-2222-2222-222222222218', 'AMB-DMS-18', 'available', ST_SetSRID(ST_MakePoint(36.2700, 33.5050), 4326)::geography),
  ('22222222-2222-2222-2222-222222222219', 'AMB-DMS-19', 'available', ST_SetSRID(ST_MakePoint(36.2925, 33.5125), 4326)::geography),
  ('22222222-2222-2222-2222-222222222220', 'AMB-DMS-20', 'available', ST_SetSRID(ST_MakePoint(36.2605, 33.4990), 4326)::geography),
  ('22222222-2222-2222-2222-222222222221', 'AMB-DMS-21', 'available', ST_SetSRID(ST_MakePoint(36.3110, 33.5175), 4326)::geography),
  ('22222222-2222-2222-2222-222222222222', 'AMB-DMS-22', 'available', ST_SetSRID(ST_MakePoint(36.2865, 33.5005), 4326)::geography),
  ('22222222-2222-2222-2222-222222222223', 'AMB-RDS-23', 'available', ST_SetSRID(ST_MakePoint(36.4000, 33.5700), 4326)::geography),
  ('22222222-2222-2222-2222-222222222224', 'AMB-RDS-24', 'available', ST_SetSRID(ST_MakePoint(36.3660, 33.5570), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

UPDATE ambulances SET status = 'available' WHERE status = 'dispatched';
