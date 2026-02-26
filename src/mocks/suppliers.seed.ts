import type { Supplier } from '../../types/partMaster';

/**
 * Mock suppliers for offers system
 * Used by offers + recommendations endpoints
 */

export const MOCK_SUPPLIERS = [
  {
    supplier_id: 'SUP-001',
    name: 'Martaş Distribütörlük',
    type: 'DISTRIBUTOR',
    regions: ['TURKEY'],
    rating: 95,
    avgLeadDays: 2,
    reliabilityScore: 95,
    priceCompetitiveness: 85,
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2025-02-20').toISOString(),
  },
  {
    supplier_id: 'SUP-002',
    name: 'Bosch Perakende Satış',
    type: 'RETAILER',
    regions: ['TURKEY'],
    rating: 98,
    avgLeadDays: 1,
    reliabilityScore: 98,
    priceCompetitiveness: 75,
    isActive: true,
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2025-02-20').toISOString(),
  },
  {
    supplier_id: 'SUP-003',
    name: 'Mann Filter Distribüsyon',
    type: 'WHOLESALER',
    regions: ['TURKEY', 'EU'],
    rating: 90,
    avgLeadDays: 3,
    reliabilityScore: 90,
    priceCompetitiveness: 88,
    isActive: true,
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date('2025-02-20').toISOString(),
  },
] as Supplier[];
