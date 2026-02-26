/**
 * Cross-Reference Database
 * 
 * Maps OEM part numbers to aftermarket equivalents
 * Format: { oem_pn: normalized OEM PN, brand: aftermarket brand, pn: part number, quality: grade }
 * 
 * This data is used by detectAftermarketCandidates() to find high-confidence matches
 * In production: fetch from automotive cross-reference providers (e.g., Intersearch, ProQuest)
 */

export const MOCK_CROSSREF = [
  // ========== BMW BRAKE PADS (34 11 6 789 123) ==========
  { oem_pn: '34116789123', brand: 'Bosch', pn: 'BP-BMW-320-FRONT', quality: 'OES' },
  { oem_pn: '34116789123', brand: 'Brembo', pn: 'BRM-SERIES-BM', quality: 'OEM' },
  { oem_pn: '34116789123', brand: 'Textar', pn: 'TX-2354201', quality: 'OES' },
  { oem_pn: '34116789123', brand: 'ATE', pn: 'AT-13646201321', quality: 'OES' },

  // ========== BMW BRAKE DISC (34.11.2.282.285) ==========
  { oem_pn: '34112282285', brand: 'Brembo', pn: 'BRM-DISC-330', quality: 'OEM' },
  { oem_pn: '34112282285', brand: 'Zimmermann', pn: 'ZIM-100.3347.00', quality: 'OES' },
  { oem_pn: '34112282285', brand: 'ATE', pn: 'AT-24012301901', quality: 'OES' },

  // ========== VW BRAKE PAD REAR (8K0 615 301 D) ==========
  { oem_pn: '8K0615301D', brand: 'Textar', pn: 'TX-2354207', quality: 'OES' },
  { oem_pn: '8K0615301D', brand: 'Bosch', pn: 'BP-VW-GOLF-REAR', quality: 'OES' },
  { oem_pn: '8K0615301D', brand: 'Mintex', pn: 'MX-MDB1611', quality: 'AFTERMARKET_A' },
  { oem_pn: '8K0615301D', brand: 'Ferodo', pn: 'FDB-1666SM', quality: 'AFTERMARKET_A' },

  // ========== VW OIL FILTER (06J 115 561 A) ==========
  { oem_pn: '06J115561A', brand: 'Mann-Filter', pn: 'MANN-HU-816X', quality: 'OES' },
  { oem_pn: '06J115561A', brand: 'Mahle', pn: 'OC-545', quality: 'OES' },
  { oem_pn: '06J115561A', brand: 'Bosch', pn: '0451103306', quality: 'OES' },
  { oem_pn: '06J115561A', brand: 'Fram', pn: 'PH2817A', quality: 'AFTERMARKET_A' },

  // ========== FORD SPARK PLUG (DG-511) ==========
  { oem_pn: 'DG511', brand: 'Bosch', pn: 'FR7DC', quality: 'OES' },
  { oem_pn: 'DG511', brand: 'NGK', pn: 'BPR6ES-11', quality: 'OES' },
  { oem_pn: 'DG511', brand: 'Denso', pn: 'K16PRU-11', quality: 'OES' },
  { oem_pn: 'DG511', brand: 'Champion', pn: 'RC8YCC', quality: 'AFTERMARKET_A' },

  // ========== FORD AIR FILTER (1S7G 6026 CA) ==========
  { oem_pn: '1S7G6026CA', brand: 'M ahle', pn: 'LX-1540', quality: 'OES' },
  { oem_pn: '1S7G6026CA', brand: 'Fram', pn: 'CA7496', quality: 'OES' },
  { oem_pn: '1S7G6026CA', brand: 'Bosch', pn: 'S0174', quality: 'OES' },

  // ========== MB SHOCK ABSORBER (A 204 326 04 00) ==========
  { oem_pn: 'A20432604 00', brand: 'Bilstein', pn: '24-211395', quality: 'OES' },
  { oem_pn: 'A20432604 00', brand: 'KYB', pn: 'KYB-334254', quality: 'OES' },
  { oem_pn: 'A20432604 00', brand: 'Bosch', pn: 'BOSCH-0265304219', quality: 'OES' },

  // ========== MB BALLAST (2034601348) ==========
  { oem_pn: '2034601348', brand: 'Bosch', pn: '0227400081', quality: 'OEM' },
  { oem_pn: '2034601348', brand: 'Hella', pn: '1H2950000', quality: 'OES' },

  // ========== BMW CABIN FILTER (13 32 1 247 034) ==========
  { oem_pn: '1332124703 4', brand: 'Mann-Filter', pn: 'MANN-CUK31', quality: 'OES' },
  { oem_pn: '1332124703 4', brand: 'Mahle', pn: 'LAT-450', quality: 'OES' },
  { oem_pn: '1332124703 4', brand: 'Fram', pn: 'CF12000', quality: 'AFTERMARKET_A' },

  // ========== BMW ENGINE AIR FILTER (11 42 7 556 201) ==========
  { oem_pn: '1142755620 1', brand: 'Mann-Filter', pn: 'MANN-C25083', quality: 'OES' },
  { oem_pn: '1142755620 1', brand: 'Mahle', pn: 'LX-1545', quality: 'OES' },
  { oem_pn: '1142755620 1', brand: 'Fram', pn: 'CA8102', quality: 'AFTERMARKET_A' },

  // ========== SACHS CLUTCH KIT (3000 951 601) ==========
  { oem_pn: '3000951601', brand: 'Valeo', pn: 'VAL-826455', quality: 'OES' },
  { oem_pn: '3000951601', brand: 'LuK', pn: 'LUK-623344109', quality: 'OES' },
  { oem_pn: '3000951601', brand: 'EXEDY', pn: 'EXY-16047', quality: 'AFTERMARKET_A' },

  // ========== LUK CLUTCH ASSEMBLY (623 3044 09) ==========
  { oem_pn: '623304409', brand: 'Sachs', pn: 'SACHS-3000951607', quality: 'OES' },
  { oem_pn: '623304409', brand: 'Valeo', pn: 'VAL-007045', quality: 'OES' },
  { oem_pn: '623304409', brand: 'EXEDY', pn: 'EXY-15004', quality: 'AFTERMARKET_A' },

  // ========== BMW VALVE COVER GASKET (11 11 7 837 297) ==========
  { oem_pn: '1111783729 7', brand: 'Elring', pn: 'ELR-028.900', quality: 'OES' },
  { oem_pn: '1111783729 7', brand: 'Bosch', pn: 'BOSCH-1120189600', quality: 'OES' },

  // ========== NISSAN WATER PUMP (152095F010) ==========
  { oem_pn: '152095F010', brand: 'Bosch', pn: 'BW-99000911', quality: 'OES' },
  { oem_pn: '152095F010', brand: 'Aisin', pn: 'WPS-101-200', quality: 'OES' },

  // ========== BOSCH STARTER MOTOR (0 301 302 001) ==========
  { oem_pn: '0301302001', brand: 'Valeo', pn: 'VAL-438087', quality: 'OES' },
  { oem_pn: '0301302001', brand: 'Denso', pn: 'DST-280HD', quality: 'OES' },

  // ========== HELLA HEADLIGHT BULB (1A5 962 381-501) ==========
  { oem_pn: '1A5962381501', brand: 'Osram', pn: 'OSR-64210NBU', quality: 'OES' },
  { oem_pn: '1A5962381501', brand: 'Philips', pn: 'PH-12972NBVB1', quality: 'OES' },
  { oem_pn: '1A5962381501', brand: 'Bosch', pn: 'BSH-1987302411', quality: 'OES' },

  // ========== BILSTEIN SHOCK ABSORBER REAR (24-211395) ==========
  { oem_pn: '24211395', brand: 'KYB', pn: 'KYB-343368', quality: 'OES' },
  { oem_pn: '24211395', brand: 'Sachs', pn: 'SACHS-311503', quality: 'OES' },

  // ========== LEMFÖRDER TIE ROD END (37401 01) ==========
  { oem_pn: '3740101', brand: 'Bosch', pn: 'BSH-6Q0423812', quality: 'OES' },
  { oem_pn: '3740101', brand: 'ZF Sachs', pn: 'ZF-3074615', quality: 'OES' },

  // ========== BOSCH FUEL PUMP (0 580 314 108) ==========
  { oem_pn: '0580314108', brand: 'Pierburg', pn: 'PIE-7.20661.15', quality: 'OES' },
  { oem_pn: '0580314108', brand: 'Hella', pn: 'HEL-8TT357084051', quality: 'OES' },

  // ========== MAHLE FUEL FILTER (70315481) ==========
  { oem_pn: '70315481', brand: 'Fram', pn: 'FF-FI8610', quality: 'OES' },
  { oem_pn: '70315481', brand: 'Bosch', pn: 'BSH-0450741027', quality: 'OES' },

  // ========== EBERSPÄCHER CATALYTIC CONVERTER (07.004.00) ==========
  { oem_pn: '0700400', brand: 'Bosal', pn: 'BOS-099-9502', quality: 'OES' },
  { oem_pn: '0700400', brand: 'Walker', pn: 'WAL-15700', quality: 'AFTERMARKET_A' },

  // ========== BOSAL MUFFLER (290-013) ==========
  { oem_pn: '290013', brand: 'Walker', pn: 'WAL-47125', quality: 'OES' },
  { oem_pn: '290013', brand: 'Eberspächer', pn: 'EBE-07.501.00', quality: 'OES' },

  // ========== MANN OIL FILTER CARTRIDGE (W 811/80) ==========
  { oem_pn: 'W81180', brand: 'Mahle', pn: 'OC-573', quality: 'OES' },
  { oem_pn: 'W81180', brand: 'Bosch', pn: '1457429192', quality: 'OES' },
  { oem_pn: 'W81180', brand: 'Fram', pn: 'CH-10358', quality: 'AFTERMARKET_A' },

  // ========== FRAM OIL FILTER SPIN-ON (PH2817A) ==========
  { oem_pn: 'PH2817A', brand: 'Bosch', pn: '0451103306', quality: 'OES' },
  { oem_pn: 'PH2817A', brand: 'Mann-Filter', pn: 'MANN-HU815', quality: 'OES' },

  // ========== HELLA THERMOSTAT (8MK 376 734-241) ==========
  { oem_pn: '8MK376734241', brand: 'Bosch', pn: 'BSH-0392170009', quality: 'OES' },
  { oem_pn: '8MK376734241', brand: 'Mahle', pn: 'MAHLE-TX-32-92D', quality: 'OES' },

  // ========== VALEO ENGINE COOLING FAN (820156) ==========
  { oem_pn: '820156', brand: 'Bosch', pn: 'BSH-0986342240', quality: 'OES' },
  { oem_pn: '820156', brand: 'Hella', pn: 'HEL-8EW351044-571', quality: 'OES' },

  // ========== NGK SPARK PLUG (BPR6ES-11) ==========
  { oem_pn: 'BPR6ES11', brand: 'Bosch', pn: 'FR7DC', quality: 'OES' },
  { oem_pn: 'BPR6ES11', brand: 'Denso', pn: 'K16PR11', quality: 'OES' },
  { oem_pn: 'BPR6ES11', brand: 'Champion', pn: 'RC8YC', quality: 'AFTERMARKET_A' },

  // ========== DENSO SPARK PLUG (K16PRU11) ==========
  { oem_pn: 'K16PRU11', brand: 'NGK', pn: 'BPR6ES-11', quality: 'OES' },
  { oem_pn: 'K16PRU11', brand: 'Bosch', pn: 'FR7DC', quality: 'OES' },

  // ========== BOSCH MAF SENSOR (0 281 010 268) ==========
  { oem_pn: '0281010268', brand: 'Siemens', pn: 'SIE-5WK9012Z', quality: 'OES' },
  { oem_pn: '0281010268', brand: 'Hella', pn: 'HEL-5WK96033Z', quality: 'OES' },

  // ========== PIERBURG AGR VALVE (7.21800.15.0) ==========
  { oem_pn: '7218001 50', brand: 'Bosch', pn: 'BSH-0281011068', quality: 'OES' },
  { oem_pn: '7218001 50', brand: 'Hella', pn: 'HEL-5WK96018Z', quality: 'OES' },
];

console.log(`[CrossRef] Loaded ${MOCK_CROSSREF.length} cross-reference mappings`);
