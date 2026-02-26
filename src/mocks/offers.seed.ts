import type { SupplierOffer } from '../../types/partMaster';

/**
 * Mock supplier offers
 * 10 offers covering 3 parts: BRAKE_PAD_FRONT_001, FILTER_OIL_001, SPARK_PLUG_001
 */

export const MOCK_OFFERS = [
  // ===== BRAKE_PAD_FRONT_001 (PM-0001) =====
  {
    offerId: 'OFF-001',
    supplierId: 'SUP-001',           // Martaş
    supplierName: 'Martaş Otomotiv',
    partMasterId: 'PM-0001',         // BRAKE_PAD_FRONT_001
    price: 2450,
    currency: 'TRY',
    minOrderQty: 1,
    packQty: 4,
    stock: 85,
    leadDays: 2,
    lastUpdated: new Date('2025-02-20').toISOString(),
    isVerified: true,
    trustScore: 95,
  },
  {
    offerId: 'OFF-002',
    supplierId: 'SUP-002',           // Bosch
    supplierName: 'Bosch Türkiye',
    partMasterId: 'PM-0001',
    price: 2100,
    currency: 'TRY',
    minOrderQty: 1,
    packQty: 4,
    stock: 120,
    leadDays: 1,
    lastUpdated: new Date('2025-02-19').toISOString(),
    isVerified: true,
    trustScore: 98,
  },
  {
    offerId: 'OFF-003',
    supplierId: 'SUP-001',           // Martaş
    supplierName: 'Martaş Otomotiv',
    partMasterId: 'PM-0001',
    price: 1850,
    currency: 'TRY',
    minOrderQty: 2,
    packQty: 4,
    stock: 200,
    leadDays: 2,
    lastUpdated: new Date('2025-02-18').toISOString(),
    isVerified: true,
    trustScore: 88,
  },

  // ===== FILTER_OIL_001 (PM-0002) =====
  {
    offerId: 'OFF-004',
    supplierId: 'SUP-003',           // Mann
    supplierName: 'Mann-Filter Türkiye',
    partMasterId: 'PM-0002',         // FILTER_OIL_001
    price: 890,
    currency: 'TRY',
    minOrderQty: 1,
    packQty: 6,
    stock: 500,
    leadDays: 3,
    lastUpdated: new Date('2025-02-20').toISOString(),
    isVerified: true,
    trustScore: 92,
  },
  {
    offerId: 'OFF-005',
    supplierId: 'SUP-002',           // Bosch
    supplierName: 'Bosch Türkiye',
    partMasterId: 'PM-0002',
    price: 750,
    currency: 'TRY',
    minOrderQty: 1,
    packQty: 6,
    stock: 0,                        // Out of stock
    leadDays: 5,
    lastUpdated: new Date('2025-02-19').toISOString(),
    isVerified: true,
    trustScore: 96,
  },
  {
    offerId: 'OFF-006',
    supplierId: 'SUP-001',           // Martaş
    supplierName: 'Martaş Otomotiv',
    partMasterId: 'PM-0002',
    price: 380,
    currency: 'TRY',
    minOrderQty: 3,
    packQty: 6,
    stock: 1000,
    leadDays: 1,
    lastUpdated: new Date('2025-02-20').toISOString(),
    isVerified: false,
    trustScore: 70,
  },

  // ===== SPARK_PLUG_001 (PM-0003) =====
  {
    offerId: 'OFF-007',
    supplierId: 'SUP-002',           // Bosch
    supplierName: 'Bosch Türkiye',
    partMasterId: 'PM-0003',         // SPARK_PLUG_001
    price: 450,
    currency: 'TRY',
    minOrderQty: 1,
    packQty: 10,
    stock: 300,
    leadDays: 1,
    lastUpdated: new Date('2025-02-20').toISOString(),
    isVerified: true,
    trustScore: 97,
  },
  {
    offerId: 'OFF-008',
    supplierId: 'SUP-001',           // Martaş
    supplierName: 'Martaş Otomotiv',
    partMasterId: 'PM-0003',
    price: 380,
    currency: 'TRY',
    minOrderQty: 1,
    packQty: 8,
    stock: 450,
    leadDays: 2,
    lastUpdated: new Date('2025-02-20').toISOString(),
    isVerified: true,
    trustScore: 90,
  },
  {
    offerId: 'OFF-009',
    supplierId: 'SUP-003',           // Mann (cross-supplier)
    supplierName: 'Mann-Filter Türkiye',
    partMasterId: 'PM-0003',
    price: 220,
    currency: 'TRY',
    minOrderQty: 5,
    packQty: 10,
    stock: 2000,
    leadDays: 1,
    lastUpdated: new Date('2025-02-18').toISOString(),
    isVerified: true,
    trustScore: 82,
  },
  {
    offerId: 'OFF-010',
    supplierId: 'SUP-001',           // Martaş
    supplierName: 'Martaş Otomotiv',
    partMasterId: 'PM-0003',
    price: 120,
    currency: 'TRY',
    minOrderQty: 10,
    packQty: 10,
    stock: 5000,
    leadDays: 1,
    lastUpdated: new Date('2025-02-15').toISOString(),
    isVerified: false,
    trustScore: 65,
  },
] as SupplierOffer[];
