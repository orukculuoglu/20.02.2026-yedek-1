import type { OemCatalogItem } from '../../types/partMaster';

/**
 * Mock OEM Catalog
 * 
 * 30+ OEM parts from major manufacturers (BMW, Volkswagen, Ford, Mercedes)
 * Covers: Brakes, Filters, Ignition, Suspension, Drivetrain, Engine, Cooling, Electrical
 * 
 * This seed is used by oemMasterEngine to generate canonical PartMaster
 * In production: fetch from real OEM supplier APIs or SFTP feeds
 */

export const MOCK_OEM_CATALOG: OemCatalogItem[] = [
  // ========== BMW BRAKE SYSTEM ==========
  {
    id: 'CAT-BMW-001',
    oem_brand: 'BMW',
    oem_part_number: '34 11 6 789 123',
    part_name: 'Brake Pad Front Left',
    category: 'BRAKE_SYSTEM',
    vehicle_fitment: [
      {
        make: 'BMW',
        model: '320i',
        year_from: 2015,
        year_to: 2021,
        engine: '2.0L N20',
        transmission: 'Automatic',
      },
      {
        make: 'BMW',
        model: '330i',
        year_from: 2012,
        year_to: 2019,
        engine: '3.0L N55',
      },
    ],
    attributes: { material: 'Sintered Metal', thickness_mm: '14.5', width_mm: '123' },
    last_updated: new Date('2025-02-01').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-BMW-002',
    oem_brand: 'BMW',
    oem_part_number: '34.11.2.282.285',
    part_name: 'Brake Disc Front Right',
    category: 'BRAKE_SYSTEM',
    vehicle_fitment: [
      { make: 'BMW', model: '320i', year_from: 2015, year_to: 2021 },
    ],
    attributes: { material: 'Cast Iron', diameter_mm: '330', thickness_mm: '28' },
    last_updated: new Date('2025-02-01').toISOString(),
    source: 'API',
  },

  // ========== VOLKSWAGEN BRAKE & FILTERS ==========
  {
    id: 'CAT-VW-001',
    oem_brand: 'Volkswagen',
    oem_part_number: '8K0 615 301 D',
    part_name: 'Brake Pad Rear Axle',
    category: 'BRAKE_SYSTEM',
    vehicle_fitment: [
      { make: 'Volkswagen', model: 'Golf VII', year_from: 2012, year_to: 2020, engine: '1.4L TSI' },
      { make: 'Volkswagen', model: 'Jetta VI', year_from: 2010, year_to: 2018 },
    ],
    attributes: { material: 'Semi-Metallic', thickness_mm: '12' },
    last_updated: new Date('2025-02-01').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-VW-002',
    oem_brand: 'Volkswagen',
    oem_part_number: '06J 115 561 A',
    part_name: 'Oil Filter',
    category: 'FILTERS',
    vehicle_fitment: [
      { make: 'Volkswagen', model: 'Golf VII', year_from: 2012, year_to: 2020 },
      { make: 'Audi', model: 'A4 B8', year_from: 2008, year_to: 2015 },
    ],
    attributes: { capacity_litres: '5.1', diameter_mm: '76' },
    last_updated: new Date('2025-02-01').toISOString(),
    source: 'API',
  },

  // ========== FORD IGNITION & ENGINE ==========
  {
    id: 'CAT-FORD-001',
    oem_brand: 'Ford',
    oem_part_number: 'DG-511',
    part_name: 'Spark Plug Standard',
    category: 'IGNITION',
    vehicle_fitment: [
      { make: 'Ford', model: 'Focus II', year_from: 2004, year_to: 2010, engine: '1.6L' },
      { make: 'Ford', model: 'Fiesta VI', year_from: 2008, year_to: 2017 },
    ],
    attributes: { gap_mm: '1.3', type: 'Standard' },
    last_updated: new Date('2025-02-01').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-FORD-002',
    oem_brand: 'Ford',
    oem_part_number: '1S7G 6026 CA',
    part_name: 'Air Filter Element',
    category: 'FILTERS',
    vehicle_fitment: [
      { make: 'Ford', model: 'Mondeo III', year_from: 2000, year_to: 2007 },
    ],
    attributes: { shape: 'Cartridge', dimensions_mm: '200x120x60' },
    last_updated: new Date('2025-02-01').toISOString(),
    source: 'MANUAL',
  },

  // ========== MERCEDES SUSPENSION & STEERING ==========
  {
    id: 'CAT-MB-001',
    oem_brand: 'Mercedes-Benz',
    oem_part_number: 'A 204 326 04 00',
    part_name: 'Shock Absorber Front Left',
    category: 'SUSPENSION',
    vehicle_fitment: [
      { make: 'Mercedes-Benz', model: 'C-Class W204', year_from: 2007, year_to: 2014, engine: '1.6L' },
    ],
    attributes: { type: 'Gas Pressure', length_mm: '735', mounting: 'Strut' },
    last_updated: new Date('2025-02-01').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-MB-002',
    oem_brand: 'Mercedes-Benz',
    oem_part_number: '2034601348',
    part_name: 'Ballast Resistor Ignition',
    category: 'ELECTRICAL',
    vehicle_fitment: [
      { make: 'Mercedes-Benz', model: 'E-Class W210', year_from: 1995, year_to: 2003 },
    ],
    attributes: { resistance_ohms: '1.5' },
    last_updated: new Date('2025-02-01').toISOString(),
    source: 'API',
  },

  // ========== BMW FILTERS & FLUIDS ==========
  {
    id: 'CAT-BMW-003',
    oem_brand: 'BMW',
    oem_part_number: '13 32 1 247 034',
    part_name: 'Cabin Air Filter',
    category: 'FILTERS',
    vehicle_fitment: [
      { make: 'BMW', model: '320i F30', year_from: 2011, year_to: 2019 },
    ],
    attributes: { dimensions_mm: '360x210x30', material: 'Activated Charcoal' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-BMW-004',
    oem_brand: 'BMW',
    oem_part_number: '11 42 7 556 201',
    part_name: 'Engine Air Intake Filter',
    category: 'FILTERS',
    vehicle_fitment: [
      { make: 'BMW', model: '320i E90', year_from: 2005, year_to: 2012 },
      { make: 'BMW', model: '325i E90', year_from: 2006, year_to: 2011 },
    ],
    attributes: { shape: 'Cartridge', dimensions_mm: '220x150x90' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'API',
  },

  // ========== CLUTCH & TRANSMISSION ==========
  {
    id: 'CAT-SACHS-001',
    oem_brand: 'Sachs',
    oem_part_number: '3000 951 601',
    part_name: 'Clutch Kit MF200',
    category: 'CLUTCH',
    vehicle_fitment: [
      { make: 'Volkswagen', model: 'Golf V', year_from: 2003, year_to: 2009, engine: '1.9L TDI' },
      { make: 'Volkswagen', model: 'Jetta V', year_from: 2005, year_to: 2010 },
    ],
    attributes: { diameter_mm: '200', numberOfDiscs: '1', pressure_bar: '18' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-LUK-001',
    oem_brand: 'LuK',
    oem_part_number: '623 3044 09',
    part_name: 'Clutch Assembly',
    category: 'CLUTCH',
    vehicle_fitment: [
      { make: 'BMW', model: '320i E46', year_from: 1998, year_to: 2005, engine: '2.0L M52' },
    ],
    attributes: { diameter_mm: '240', system: 'Integral flywheel' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'MANUAL',
  },

  // ========== ENGINE COMPONENTS ==========
  {
    id: 'CAT-BMW-005',
    oem_brand: 'BMW',
    oem_part_number: '11 11 7 837 297',
    part_name: 'Valve Cover Gasket',
    category: 'ENGINE',
    vehicle_fitment: [
      { make: 'BMW', model: '318i E46', year_from: 2001, year_to: 2006 },
    ],
    attributes: { sealant_type: 'Silicone' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-NISSAN-001',
    oem_brand: 'Nissan',
    oem_part_number: '152095F010',
    part_name: 'Water Pump Assembly',
    category: 'COOLING',
    vehicle_fitment: [
      { make: 'Nissan', model: 'Altima', year_from: 2007, year_to: 2012 },
      { make: 'Nissan', model: 'Rogue', year_from: 2008, year_to: 2013 },
    ],
    attributes: { flow_lpm: '85', material: 'Aluminum' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'API',
  },

  // ========== ELECTRICAL & LIGHTING ==========
  {
    id: 'CAT-BOSCH-001',
    oem_brand: 'Bosch',
    oem_part_number: '0 301 302 001',
    part_name: 'Starter Motor',
    category: 'ELECTRICAL',
    vehicle_fitment: [
      { make: 'BMW', model: '320i E90', year_from: 2005, year_to: 2012 },
    ],
    attributes: { power_kw: '2.0', voltage_v: '12' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-HELLA-001',
    oem_brand: 'Hella',
    oem_part_number: '1A5 962 381-501',
    part_name: 'Headlight Bulb H7',
    category: 'ELECTRICAL',
    vehicle_fitment: [
      { make: 'Volkswagen', model: 'Golf V', year_from: 2003, year_to: 2009 },
      { make: 'Audi', model: 'A4 B5', year_from: 1994, year_to: 2001 },
    ],
    attributes: { wattage_w: '55', voltage_v: '12', type: 'H7' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'MANUAL',
  },

  // ========== SUSPENSION & STEERING CONTINUED ==========
  {
    id: 'CAT-BILSTEIN-001',
    oem_brand: 'Bilstein',
    oem_part_number: '24-211395',
    part_name: 'Shock Absorber Rear',
    category: 'SUSPENSION',
    vehicle_fitment: [
      { make: 'Volkswagen', model: 'Passat B5', year_from: 1996, year_to: 2005 },
    ],
    attributes: { type: 'Twin-Tube', length_mm: '680' },
    last_updated: new Date('2025-02-02').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-LEMFOERDER-001',
    oem_brand: 'Lemförder',
    oem_part_number: '37401 01',
    part_name: 'Tie Rod End',
    category: 'SUSPENSION',
    vehicle_fitment: [
      { make: 'BMW', model: '318i E46', year_from: 2001, year_to: 2006 },
    ],
    attributes: { ball_diameter_mm: '38' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'MANUAL',
  },

  // ========== FUEL SYSTEM ==========
  {
    id: 'CAT-BOSCH-002',
    oem_brand: 'Bosch',
    oem_part_number: '0 580 314 108',
    part_name: 'Fuel Pump Motor',
    category: 'FUEL',
    vehicle_fitment: [
      { make: 'Volkswagen', model: 'Golf IV', year_from: 1997, year_to: 2006, engine: '1.6L AZD' },
    ],
    attributes: { flow_lph: '80', pressure_bar: '3.8' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-MAHLE-001',
    oem_brand: 'Mahle',
    oem_part_number: '70315481',
    part_name: 'Fuel Filter',
    category: 'FUEL',
    vehicle_fitment: [
      { make: 'Fiat', model: 'Panda II', year_from: 2003, year_to: 2012 },
    ],
    attributes: { dimensions_mm: '85x70' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'MANUAL',
  },

  // ========== EXHAUST SYSTEM ==========
  {
    id: 'CAT-EBERSPAECHER-001',
    oem_brand: 'Eberspächer',
    oem_part_number: '07.004.00',
    part_name: 'Catalytic Converter',
    category: 'EXHAUST',
    vehicle_fitment: [
      { make: 'BMW', model: '318i E46', year_from: 2001, year_to: 2006 },
    ],
    attributes: { material: 'Ceramic Monolith', housing_material: 'Stainless Steel' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-BOSAL-001',
    oem_brand: 'Bosal',
    oem_part_number: '290-013',
    part_name: 'Muffler Silencer',
    category: 'EXHAUST',
    vehicle_fitment: [
      { make: 'Seat', model: 'Ibiza III', year_from: 1999, year_to: 2002 },
    ],
    attributes: { diameter_mm: '60', material: 'Aluminized Steel' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'MANUAL',
  },

  // ========== ADDITIONAL FILTERS ==========
  {
    id: 'CAT-MANN-001',
    oem_brand: 'Mann Filter',
    oem_part_number: 'W 811/80',
    part_name: 'Oil Filter Cartridge',
    category: 'FILTERS',
    vehicle_fitment: [
      { make: 'BMW', model: '325i E90', year_from: 2005, year_to: 2011 },
    ],
    attributes: { diameter_mm: '82', capacity_litres: '1.2' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-FRAM-001',
    oem_brand: 'Fram',
    oem_part_number: 'PH2817A',
    part_name: 'Oil Filter Spin-On',
    category: 'FILTERS',
    vehicle_fitment: [
      { make: 'Ford', model: 'Escape', year_from: 2000, year_to: 2012 },
    ],
    attributes: { thread_mm: '1-1/16', height_mm: '95' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'API',
  },

  // ========== COOLING SYSTEM ==========
  {
    id: 'CAT-HELLA-002',
    oem_brand: 'Hella',
    oem_part_number: '8MK 376 734-241',
    part_name: 'Thermostat Housing',
    category: 'COOLING',
    vehicle_fitment: [
      { make: 'Seat', model: 'Leon I', year_from: 1999, year_to: 2006 },
    ],
    attributes: { temperature_celsius: '88' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'MANUAL',
  },
  {
    id: 'CAT-VALEO-001',
    oem_brand: 'Valeo',
    oem_part_number: '820156',
    part_name: 'Engine Cooling Fan Blade',
    category: 'COOLING',
    vehicle_fitment: [
      { make: 'Renault', model: 'Megane II', year_from: 2002, year_to: 2009 },
    ],
    attributes: { diameter_mm: '370', blades: '4' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'API',
  },

  // ========== IGNITION SYSTEM (continued) ==========
  {
    id: 'CAT-NGK-001',
    oem_brand: 'NGK',
    oem_part_number: 'BPR6ES-11',
    part_name: 'Spark Plug Iridium',
    category: 'IGNITION',
    vehicle_fitment: [
      { make: 'Honda', model: 'Civic VIII', year_from: 2005, year_to: 2012, engine: '1.8L' },
      { make: 'Honda', model: 'Accord VII', year_from: 2002, year_to: 2008 },
    ],
    attributes: { gap_mm: '0.9', type: 'Iridium' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-DENSO-001',
    oem_brand: 'Denso',
    oem_part_number: 'K16PRU11',
    part_name: 'Spark Plug Long Reach',
    category: 'IGNITION',
    vehicle_fitment: [
      { make: 'Toyota', model: 'Corolla IX', year_from: 2000, year_to: 2008 },
    ],
    attributes: { gap_mm: '1.1', reach_mm: '19' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'MANUAL',
  },

  // ========== ADDITIONAL ENGINE PARTS ==========
  {
    id: 'CAT-BOSCH-003',
    oem_brand: 'Bosch',
    oem_part_number: '0 281 010 268',
    part_name: 'Mass Air Flow Sensor',
    category: 'ENGINE',
    vehicle_fitment: [
      { make: 'BMW', model: '320i E46', year_from: 2001, year_to: 2006 },
    ],
    attributes: { voltage_v: '5', resistance_ohms: '5' },
    last_updated: new Date('2025-02-03').toISOString(),
    source: 'API',
  },
  {
    id: 'CAT-PIERBURG-001',
    oem_brand: 'Pierburg',
    oem_part_number: '7.21800.15.0',
    part_name: 'Agr Valve',
    category: 'ENGINE',
    vehicle_fitment: [
      { make: 'Volkswagen', model: 'Golf IV', year_from: 1997, year_to: 2006, engine: '1.9L TDI' },
    ],
    attributes: { capacity_cc: '500' },
    last_updated: new Date('2025-02-04').toISOString(),
    source: 'MANUAL',
  },
];

console.log(`[OemCatalog] Loaded ${MOCK_OEM_CATALOG.length} mock OEM parts`);
