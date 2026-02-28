/**
 * Auto Expert Inspection - Seed Data
 * Default checklist sections and items, plus 3 mock reports
 */

import type { ChecklistSection, ChecklistItem, ExpertReport } from './types';

/**
 * Default checklist items for each section
 */
export const DEFAULT_CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'body-paint',
    name: 'Gövde & Boya',
    items: [
      { id: 'body-01', label: 'Kaput hasarı', result: 'OK', weight: 2, scoreImpact: 0 },
      { id: 'body-02', label: 'Tavan/üst panel', result: 'OK', weight: 2, scoreImpact: 0 },
      { id: 'body-03', label: 'Yan panel hasarı', result: 'OK', weight: 3, scoreImpact: 0 },
      { id: 'body-04', label: 'Boya sürükleme/kalitesi', result: 'OK', weight: 2, scoreImpact: 0 },
    ],
  },
  {
    id: 'chassis-frame',
    name: 'Şasi & Direkler',
    items: [
      { id: 'chassis-01', label: 'Ön şasi hasar', result: 'OK', weight: 5, scoreImpact: 0, riskTrigger: 'StructuralRisk' },
      { id: 'chassis-02', label: 'Arka şasi hasar', result: 'OK', weight: 5, scoreImpact: 0, riskTrigger: 'StructuralRisk' },
      { id: 'chassis-03', label: 'Direk hasarı', result: 'OK', weight: 5, scoreImpact: 0, riskTrigger: 'StructuralRisk' },
    ],
  },
  {
    id: 'engine-mechanical',
    name: 'Motor & Mekanik',
    items: [
      { id: 'engine-01', label: 'Motor kaçağı', result: 'OK', weight: 4, scoreImpact: 0, riskTrigger: 'MechanicalRisk' },
      { id: 'engine-02', label: 'Motor sesi anormal', result: 'OK', weight: 3, scoreImpact: 0 },
      { id: 'engine-03', label: 'Soğutma sistemi', result: 'OK', weight: 3, scoreImpact: 0, riskTrigger: 'MechanicalRisk' },
      { id: 'engine-04', label: 'Hava filtresi/yakıt filtresi', result: 'OK', weight: 2, scoreImpact: 0 },
    ],
  },
  {
    id: 'transmission',
    name: 'Şanzıman',
    items: [
      { id: 'trans-01', label: 'Vites geçişleri pürüzsüz', result: 'OK', weight: 4, scoreImpact: 0, riskTrigger: 'MechanicalRisk' },
      { id: 'trans-02', label: 'Şanzıman kaçağı', result: 'OK', weight: 4, scoreImpact: 0, riskTrigger: 'MechanicalRisk' },
      { id: 'trans-03', label: 'Debriyaj işlemi', result: 'OK', weight: 3, scoreImpact: 0 },
    ],
  },
  {
    id: 'electronics',
    name: 'Elektronik',
    items: [
      { id: 'elec-01', label: 'Motor arıza lambası (MIL)', result: 'OK', weight: 3, scoreImpact: 0 },
      { id: 'elec-02', label: 'Aydınlatma sistemleri', result: 'OK', weight: 2, scoreImpact: 0 },
      { id: 'elec-03', label: 'Cam kaldırma / kilit sistemleri', result: 'OK', weight: 2, scoreImpact: 0 },
      { id: 'elec-04', label: 'Klima/isıtma', result: 'OK', weight: 2, scoreImpact: 0 },
    ],
  },
  {
    id: 'interior',
    name: 'İç Mekan',
    items: [
      { id: 'int-01', label: 'Koltuk ve döşeme', result: 'OK', weight: 2, scoreImpact: 0 },
      { id: 'int-02', label: 'Direksiyon/kontroller', result: 'OK', weight: 2, scoreImpact: 0 },
      { id: 'int-03', label: 'Yer kaplama hasarı', result: 'OK', weight: 2, scoreImpact: 0 },
    ],
  },
  {
    id: 'tires-suspension',
    name: 'Lastikler & Süspansiyon',
    items: [
      { id: 'tire-01', label: 'Lastik derinliği (min 1.6mm)', result: 'OK', weight: 4, scoreImpact: 0, riskTrigger: 'MechanicalRisk' },
      { id: 'tire-02', label: 'Lastik aşınması eşit', result: 'OK', weight: 3, scoreImpact: 0 },
      { id: 'tire-03', label: 'Süspansiyon/amortisörler', result: 'OK', weight: 4, scoreImpact: 0, riskTrigger: 'MechanicalRisk' },
      { id: 'tire-04', label: 'Fren balatası/diski', result: 'OK', weight: 4, scoreImpact: 0, riskTrigger: 'MechanicalRisk' },
    ],
  },
  {
    id: 'airbag-safety',
    name: 'Airbag & Güvenlik',
    items: [
      { id: 'safe-01', label: 'Airbag sistemleri aktif', result: 'OK', weight: 5, scoreImpact: 0, riskTrigger: 'AirbagRisk' },
      { id: 'safe-02', label: 'ABS sistemi', result: 'OK', weight: 4, scoreImpact: 0 },
      { id: 'safe-03', label: 'ESP/Stabilite kontrolü', result: 'OK', weight: 4, scoreImpact: 0 },
      { id: 'safe-04', label: 'Emniyet kemerleri', result: 'OK', weight: 3, scoreImpact: 0 },
    ],
  },
];

/**
 * Create default checklist (deep copy)
 */
export function createDefaultChecklist(): ChecklistSection[] {
  return JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_SECTIONS));
}

/**
 * Seed 3 mock reports for initial load
 */
export const SEED_REPORTS: ExpertReport[] = [
  {
    id: 'rep_seed_1',
    vehicleId: 'veh_1',
    vin: 'WF0UXXWPFA0012345',
    plate: '34ABC0001',
    vehicleModel: 'Fiat Egea',
    expertName: 'Ali Yılmaz',
    status: 'Draft',
    checklist: createDefaultChecklist(),
    score: 100,
    riskFlags: [],
    createdBy: 'expert_1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rep_seed_2',
    vehicleId: 'veh_2',
    vin: 'WVWZZZ3CZ9E123456',
    plate: '06XYZ0002',
    vehicleModel: 'Mercedes C200',
    expertName: 'Zeynep Kara',
    status: 'Draft',
    checklist: createDefaultChecklist(),
    score: 100,
    riskFlags: [],
    createdBy: 'expert_2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rep_seed_3',
    vehicleId: 'veh_3',
    vin: 'VSSZZZ3DZ9E654321',
    plate: '08ABC0003',
    vehicleModel: 'Toyota Corolla',
    expertName: 'Mehmet Şahin',
    status: 'Final',
    checklist: createDefaultChecklist(),
    score: 85,
    riskFlags: [],
    createdBy: 'expert_3',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    finalizedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
