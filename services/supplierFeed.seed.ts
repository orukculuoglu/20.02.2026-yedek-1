import type { SupplierPriceFeed } from '../types/partMaster';

/**
 * Supplier Price Feed Mock Data
 * 
 * 3 Suppliers with realistic feed data:
 * - SUP-001: Martaş (Premium distributor)
 * - SUP-002: Bosch (Direct OEM supplier)
 * - SUP-003: Mann-Filter (Component specialist)
 * 
 * Feed characteristics:
 * - Mix of OEM, OES, AFTERMARKET grades
 * - Realistic pricing with discounts & freight
 * - Stock ranges from 0 to 1000+
 * - Valid until dates: some expired, some future
 */

export const MOCK_SUPPLIER_FEEDS: SupplierPriceFeed[] = [
  // ===== SUPPLIER: MARTAŞ (SUP-001) =====
  // Brake Pads (PM-0001)
  {
    id: 'FEED-001-001',
    supplier_id: 'SUP-001',
    supplier_name: 'Martaş Otomotiv',
    part_master_id: 'PM-0001',
    supplier_part_number: 'BRM-4421-FRONT',
    currency: 'TRY',
    list_price: 2500,
    discount_pct: 5,
    freight_cost: 250,
    stock_on_hand: 85,
    lead_time_days: 2,
    valid_from: new Date('2027-02-01').toISOString(),
    valid_until: new Date('2027-05-31').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'OES',
  },
  {
    id: 'FEED-001-002',
    supplier_id: 'SUP-001',
    supplier_name: 'Martaş Otomotiv',
    part_master_id: 'PM-0001',
    supplier_part_number: 'BRM-4421-ALT',
    currency: 'TRY',
    list_price: 1900,
    discount_pct: 10,
    freight_cost: 150,
    stock_on_hand: 200,
    lead_time_days: 2,
    valid_from: new Date('2027-02-10').toISOString(),
    valid_until: new Date('2027-04-30').toISOString(), // EXPIRED
    last_sync_at: new Date('2025-02-20').toISOString(),
    source: 'SFTP',
    is_active: false, // Manually marked inactive
    quality_grade: 'AFTERMARKET_A',
  },
  {
    id: 'FEED-001-003',
    supplier_id: 'SUP-001',
    supplier_name: 'Martaş Otomotiv',
    part_master_id: 'PM-0001',
    supplier_part_number: 'GEN-BP-GENERIC',
    currency: 'TRY',
    list_price: 1500,
    discount_pct: 15,
    freight_cost: 100,
    stock_on_hand: 1000,
    lead_time_days: 1,
    valid_from: new Date('2027-02-15').toISOString(),
    valid_until: new Date('2027-06-30').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'AFTERMARKET_B',
  },

  // Oil Filter (PM-0002)
  {
    id: 'FEED-001-004',
    supplier_id: 'SUP-001',
    supplier_name: 'Martaş Otomotiv',
    part_master_id: 'PM-0002',
    supplier_part_number: 'MANN-HU-816',
    currency: 'TRY',
    list_price: 950,
    discount_pct: 8,
    freight_cost: 100,
    stock_on_hand: 500,
    lead_time_days: 3,
    valid_from: new Date('2027-02-01').toISOString(),
    valid_until: new Date('2027-05-15').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-25').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'OES',
  },
  {
    id: 'FEED-001-005',
    supplier_id: 'SUP-001',
    supplier_name: 'Martaş Otomotiv',
    part_master_id: 'PM-0002',
    supplier_part_number: 'FILTER-OIL-GENERIC',
    currency: 'TRY',
    list_price: 450,
    discount_pct: 20,
    freight_cost: 50,
    stock_on_hand: 0, // Out of stock
    lead_time_days: 5,
    valid_from: new Date('2027-02-15').toISOString(),
    valid_until: new Date('2027-06-15').toISOString(), // FUTURE - valid but OOS
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'AFTERMARKET_B',
  },

  // Clutch Kit (PM-0003)
  {
    id: 'FEED-001-006',
    supplier_id: 'SUP-001',
    supplier_name: 'Martaş Otomotiv',
    part_master_id: 'PM-0003',
    supplier_part_number: 'LUK-CLUTCH-VW',
    currency: 'TRY',
    list_price: 13000,
    discount_pct: 5,
    freight_cost: 300,
    stock_on_hand: 12,
    lead_time_days: 2,
    valid_from: new Date('2027-02-01').toISOString(),
    valid_until: new Date('2027-05-31').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'MANUAL',
    is_active: true,
    quality_grade: 'OES',
  },

  // ===== SUPPLIER: BOSCH (SUP-002) =====
  // Brake Pads (PM-0001)
  {
    id: 'FEED-002-001',
    supplier_id: 'SUP-002',
    supplier_name: 'Bosch Distribütör',
    part_master_id: 'PM-0001',
    supplier_part_number: 'BOSCH-BP-FRONT-01',
    currency: 'TRY',
    list_price: 2200,
    discount_pct: 3,
    freight_cost: 200,
    stock_on_hand: 120,
    lead_time_days: 1,
    valid_from: new Date('2027-02-10').toISOString(),
    valid_until: new Date('2027-06-30').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'OES',
  },
  {
    id: 'FEED-002-002',
    supplier_id: 'SUP-002',
    supplier_name: 'Bosch Distribütör',
    part_master_id: 'PM-0001',
    supplier_part_number: 'BOSCH-BP-ECO',
    currency: 'TRY',
    list_price: 1700,
    discount_pct: 12,
    freight_cost: 120,
    stock_on_hand: 450,
    lead_time_days: 1,
    valid_from: new Date('2027-02-20').toISOString(),
    valid_until: new Date('2027-07-15').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'AFTERMARKET_A',
  },

  // Oil Filter (PM-0002)
  {
    id: 'FEED-002-003',
    supplier_id: 'SUP-002',
    supplier_name: 'Bosch Distribütör',
    part_master_id: 'PM-0002',
    supplier_part_number: 'BOSCH-OIL-FILTER-1108',
    currency: 'TRY',
    list_price: 800,
    discount_pct: 5,
    freight_cost: 80,
    stock_on_hand: 0, // Out of stock
    lead_time_days: 5,
    valid_from: new Date('2027-02-15').toISOString(),
    valid_until: new Date('2027-03-31').toISOString(), // EXPIRED
    last_sync_at: new Date('2025-02-20').toISOString(),
    source: 'API',
    is_active: false, // Automatically marked inactive due to expiry
    quality_grade: 'OES',
  },

  // Clutch Kit (PM-0003)
  {
    id: 'FEED-002-004',
    supplier_id: 'SUP-002',
    supplier_name: 'Bosch Distribütör',
    part_master_id: 'PM-0003',
    supplier_part_number: 'BOSCH-CLUTCH-PREMIUM',
    currency: 'TRY',
    list_price: 15000,
    discount_pct: 2,
    freight_cost: 400,
    stock_on_hand: 5,
    lead_time_days: 1,
    valid_from: new Date('2027-02-01').toISOString(),
    valid_until: new Date('2027-08-31').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'OES',
  },

  // ===== SUPPLIER: MANN-FILTER (SUP-003) =====
  // Oil Filter (PM-0002) - specialist
  {
    id: 'FEED-003-001',
    supplier_id: 'SUP-003',
    supplier_name: 'Mann-Filter Türkiye',
    part_master_id: 'PM-0002',
    supplier_part_number: 'MANN-HU-819X',
    currency: 'TRY',
    list_price: 920,
    discount_pct: 6,
    freight_cost: 80,
    stock_on_hand: 800,
    lead_time_days: 2,
    valid_from: new Date('2027-02-05').toISOString(),
    valid_until: new Date('2027-06-30').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'OEM',
  },
  {
    id: 'FEED-003-002',
    supplier_id: 'SUP-003',
    supplier_name: 'Mann-Filter Türkiye',
    part_master_id: 'PM-0002',
    supplier_part_number: 'MANN-HU-BUDGET',
    currency: 'TRY',
    list_price: 400,
    discount_pct: 25,
    freight_cost: 50,
    stock_on_hand: 2000,
    lead_time_days: 1,
    valid_from: new Date('2027-02-20').toISOString(),
    valid_until: new Date('2027-07-31').toISOString(), // FUTURE - valid
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'SFTP',
    is_active: true,
    quality_grade: 'AFTERMARKET_B',
  },

  // Brake Pads (PM-0001) - bulk supplier
  {
    id: 'FEED-003-003',
    supplier_id: 'SUP-003',
    supplier_name: 'Mann-Filter Türkiye',
    part_master_id: 'PM-0001',
    supplier_part_number: 'CHAMPION-BP-BULK',
    currency: 'TRY',
    list_price: 1450,
    discount_pct: 20,
    freight_cost: 100,
    stock_on_hand: 5000,
    lead_time_days: 1,
    valid_from: new Date('2027-02-10').toISOString(),
    valid_until: new Date('2027-09-30').toISOString(), // FUTURE - valid, bulk
    last_sync_at: new Date('2025-02-26').toISOString(),
    source: 'API',
    is_active: true,
    quality_grade: 'AFTERMARKET_A',
  },

  // Clutch Kit (PM-0003)
  {
    id: 'FEED-003-004',
    supplier_id: 'SUP-003',
    supplier_name: 'Mann-Filter Türkiye',
    part_master_id: 'PM-0003',
    supplier_part_number: 'VALEO-CLUTCH-ECO',
    currency: 'TRY',
    list_price: 11000,
    discount_pct: 15,
    freight_cost: 250,
    stock_on_hand: 30,
    lead_time_days: 3,
    valid_from: new Date('2027-02-15').toISOString(),
    valid_until: new Date('2027-05-30').toISOString(), // EXPIRED
    last_sync_at: new Date('2025-02-22').toISOString(),
    source: 'MANUAL',
    is_active: false, // Expired
    quality_grade: 'AFTERMARKET_A',
  },
];
