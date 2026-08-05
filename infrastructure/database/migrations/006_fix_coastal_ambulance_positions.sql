UPDATE ambulances
SET location = ST_SetSRID(ST_MakePoint(35.7985, 35.5318), 4326)::geography
WHERE code = 'AMB-LTK-04';

UPDATE ambulances
SET location = ST_SetSRID(ST_MakePoint(35.8985, 34.8910), 4326)::geography
WHERE code = 'AMB-TRS-08';

UPDATE ambulances
SET location = ST_SetSRID(
  ST_MakePoint(
    GREATEST(ST_X(location::geometry), 35.92),
    ST_Y(location::geometry)
  ),
  4326
)::geography
WHERE ST_X(location::geometry) < 35.90
  AND ST_Y(location::geometry) BETWEEN 34.40 AND 36.20;
