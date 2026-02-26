
import { B2BNetworkState, Supplier, B2BPart, B2BEdge } from '../types';
import { SupplierOffer, PartMasterCatalog } from '../types/partMaster';

export interface AlternativeSignal {
    id: string;
    availabilitySignal: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    brandLabel: string;
    tier: 'OEM' | 'PREMIUM' | 'ECONOMIC';
    priceMin: number;
    priceMax: number;
    leadTimeLabel: string;
    compatSignal: 'COMPATIBLE' | 'UNCERTAIN';
}

/**
 * Bridge: Map B2B Network data to Part Master Supplier Offers
 * This allows Aftermarket and Bakım Merkezi to use B2B network data
 * seamlessly alongside other suppliers.
 */
export function mapB2BToSupplierOffers(
  b2bState: B2BNetworkState,
  catalog: PartMasterCatalog
): SupplierOffer[] {
  const offers: SupplierOffer[] = [];

  for (const edge of b2bState.edges || []) {
    const supplier = b2bState.suppliers?.find(s => s.id === edge.supplierId);
    const b2bPart = b2bState.parts?.find(p => p.id === edge.partId);

    if (!supplier || !b2bPart) continue;

    // Find matching part in catalog by SKU or name fuzzy match
    const catalogPart = catalog.parts.find(p =>
      p.sku.toLowerCase().includes(b2bPart.sku?.toLowerCase() || '') ||
      p.name.toLowerCase().includes(b2bPart.name?.toLowerCase() || '')
    );

    if (!catalogPart) continue;

    // Create SupplierOffer
    const offer: SupplierOffer = {
      offerId: `SUP-${supplier.id}-${b2bPart.id}-${Date.now()}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      partMasterId: catalogPart.partMasterId,
      price: b2bPart.price,
      currency: 'TRY',
      minOrderQty: 1,
      stock: b2bPart.stock,
      leadDays: edge.leadDays || 3,
      lastUpdated: new Date().toISOString(),
      isVerified: supplier.score ? supplier.score > 85 : false,
      trustScore: supplier.score || 80,
    };

    offers.push(offer);
  }

  console.log(`[B2B Bridge] Mapped ${offers.length} offers from B2B network`);
  return offers;
}

/**
 * B2B Network Mock Service
 * Simulates a global automotive supply network.
 */
export async function getB2BNetwork(): Promise<B2BNetworkState> {
  // Artificial latency for realism
  await new Promise(resolve => setTimeout(resolve, 800));

  const suppliers: Supplier[] = [
    { id: 'sup-1', name: 'Martaş Otomotiv', city: 'İstanbul', score: 98, type: 'DISTRIBUTOR' },
    { id: 'sup-2', name: 'Üçler Yedek Parça', city: 'Ankara', score: 94, type: 'WHOLESALER' },
    { id: 'sup-3', name: 'Esen Dağıtım', city: 'İzmir', score: 92, type: 'DISTRIBUTOR' },
    { id: 'sup-4', name: 'Özden Global', city: 'Bursa', score: 89, type: 'MANUFACTURER' },
    { id: 'sup-5', name: 'LENT Supply Node', city: 'Kocaeli', score: 99, type: 'DISTRIBUTOR' },
  ];

  const parts: B2BPart[] = [
    { id: 'p-1', name: 'Fren Balatası Ön (Brembo)', brand: 'Brembo', sku: 'BRM-4421', price: 2450, stock: 45, category: 'Fren' },
    { id: 'p-2', name: 'Yağ Filtresi (Mann)', brand: 'Mann', sku: 'MNN-1102', price: 420, stock: 120, category: 'Filtre' },
    { id: 'p-3', name: 'Ateşleme Bujisi (NGK)', brand: 'NGK', sku: 'NGK-9921', price: 180, stock: 300, category: 'Motor' },
    { id: 'p-4', name: 'Hava Filtresi (Bosch)', brand: 'Bosch', sku: 'BSH-0021', price: 380, stock: 85, category: 'Filtre' },
    { id: 'p-5', name: 'Debriyaj Seti (LuK)', brand: 'LuK', sku: 'LUK-8821', price: 12500, stock: 12, category: 'Şanzıman' },
    { id: 'p-6', name: 'Triger Seti (Dayco)', brand: 'Dayco', sku: 'DYC-7721', price: 4800, stock: 24, category: 'Motor' },
    { id: 'p-7', name: 'Amortisör Ön (Sachs)', brand: 'Sachs', sku: 'SCH-1122', price: 3200, stock: 18, category: 'Süspansiyon' },
    { id: 'p-8', name: 'Silecek Takımı (Valeo)', brand: 'Valeo', sku: 'VAL-4455', price: 750, stock: 150, category: 'Aksesuar' },
    { id: 'p-9', name: 'Z-Rot (Lemförder)', brand: 'Lemförder', sku: 'LMF-0099', price: 850, stock: 60, category: 'Süspansiyon' },
    { id: 'p-10', name: 'Termostat (Mahle)', brand: 'Mahle', sku: 'MHL-2211', price: 1100, stock: 35, category: 'Motor' },
  ];

  const edges: B2BEdge[] = [
    { supplierId: 'sup-1', partId: 'p-1', leadDays: 1 },
    { supplierId: 'sup-1', partId: 'p-2', leadDays: 1 },
    { supplierId: 'sup-1', partId: 'p-4', leadDays: 1 },
    { supplierId: 'sup-2', partId: 'p-2', leadDays: 2 },
    { supplierId: 'sup-2', partId: 'p-3', leadDays: 1 },
    { supplierId: 'sup-3', partId: 'p-5', leadDays: 3 },
    { supplierId: 'sup-3', partId: 'p-6', leadDays: 2 },
    { supplierId: 'sup-4', partId: 'p-6', leadDays: 4 },
    { supplierId: 'sup-4', partId: 'p-7', leadDays: 3 },
    { supplierId: 'sup-5', partId: 'p-1', leadDays: 1 },
    { supplierId: 'sup-5', partId: 'p-5', leadDays: 1 },
    { supplierId: 'sup-5', partId: 'p-8', leadDays: 1 },
    { supplierId: 'sup-5', partId: 'p-9', leadDays: 1 },
    { supplierId: 'sup-5', partId: 'p-10', leadDays: 1 },
    { supplierId: 'sup-2', partId: 'p-8', leadDays: 2 },
  ];

  return {
    suppliers: suppliers || [],
    parts: parts || [],
    edges: edges || []
  };
}

export function searchB2BParts(query: string, parts: B2BPart[]): B2BPart[] {
  if (!query) return parts;
  const lowerQuery = query.toLowerCase();
  return parts.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) || 
    p.brand?.toLowerCase().includes(lowerQuery) || 
    p.sku?.toLowerCase().includes(lowerQuery)
  );
}

// Fix: Implementation of getAlternativesForPart required by B2BAlternativesPanel.tsx
export function getAlternativesForPart(params: { tenantId: string, partHint: string, brandHint?: string }): AlternativeSignal[] {
  // Return mock data for the panel consistent with expected UI state
  return [
    {
      id: 'alt-' + Math.random().toString(36).substring(7),
      availabilitySignal: 'HIGH',
      brandLabel: 'Brembo Premium',
      tier: 'PREMIUM',
      priceMin: 2200,
      priceMax: 2600,
      leadTimeLabel: 'Bugün Teslimat',
      compatSignal: 'COMPATIBLE'
    },
    {
      id: 'alt-' + Math.random().toString(36).substring(7),
      availabilitySignal: 'MEDIUM',
      brandLabel: 'TRW Economic',
      tier: 'ECONOMIC',
      priceMin: 1400,
      priceMax: 1600,
      leadTimeLabel: 'Yarın',
      compatSignal: 'COMPATIBLE'
    }
  ];
}
