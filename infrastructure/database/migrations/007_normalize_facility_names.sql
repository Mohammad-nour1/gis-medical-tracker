UPDATE facilities SET name = 'Damascus Central Hospital' WHERE name IN ('مشفى دمشق المركزي');
UPDATE facilities SET name = 'Aleppo University Hospital' WHERE name IN ('مشفى حلب الجامعي');
UPDATE facilities SET name = 'Latakia National Hospital' WHERE name IN ('مشفى اللاذقية الوطني');
UPDATE facilities SET name = 'Bab Tuma Clinic' WHERE name IN ('مستوصف باب توما');

DELETE FROM facilities a
USING facilities b
WHERE a.id <> b.id
  AND a.name = b.name
  AND a.governorate = b.governorate
  AND a.name IN (
    'Damascus Central Hospital',
    'Aleppo University Hospital',
    'Latakia National Hospital',
    'Bab Tuma Clinic'
  )
  AND a.id::text > b.id::text;
