import type { InstitutionPriceRule } from '../../types/partMaster';

/**
 * Mock institution price rules
 * INST-001 rules for Martaş and Bosch suppliers
 */

export const MOCK_PRICE_RULES: InstitutionPriceRule[] = [
  {
    rule_id: 'RULE-001',
    institution_id: 'INST-001',
    supplier_id: 'SUP-001',        // Martaş
    discount_pct: 8,
    margin_pct: 5,
    payment_term_days: 30,
    freight_flat: 75,              // TRY per order
    effective_from: '2024-01-01',
    effective_to: '2025-12-31',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2025-02-20').toISOString(),
  },
  {
    rule_id: 'RULE-002',
    institution_id: 'INST-001',
    supplier_id: 'SUP-002',        // Bosch
    discount_pct: 3,
    margin_pct: 3,
    payment_term_days: 15,
    freight_flat: 50,              // TRY per order (lower freight from local supplier)
    effective_from: '2024-02-01',
    effective_to: '2025-12-31',
    createdAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2025-02-20').toISOString(),
  },
  {
    rule_id: 'RULE-003',
    institution_id: 'INST-001',
    supplier_id: 'SUP-003',        // Mann
    discount_pct: 10,
    margin_pct: 4,
    payment_term_days: 45,
    freight_flat: 100,             // TRY
    effective_from: '2024-03-01',
    effective_to: '2025-12-31',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2025-02-20').toISOString(),
  },
];
