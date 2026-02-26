/**
 * Mock Server Stub for Development
 * Simulates real API endpoints without backend dependency
 * Runs on localhost:3001 (set in .env as VITE_API_BASE_URL)
 *
 * Usage:
 * 1. Start this server: npm run dev:mock-server (add to package.json)
 * 2. Set VITE_USE_REAL_API=true in .env
 * 3. Application will call localhost:3001 endpoints instead of real API
 */

import { createServer } from 'http';
import type { VehicleProfile, DamageRecord, PartRiskAnalysis, Supplier, B2BPart, B2BEdge } from '../../types';
import type { SupplierOffer, EffectiveOffer, InstitutionPriceRule, Supplier as PartMasterSupplier } from '../../types/partMaster';

const PORT = 3001;

// Mock data
const MOCK_VEHICLES: VehicleProfile[] = [
    {
        vehicle_id: 'WBALZ7C5-XXXX-1',
        brand: 'BMW',
        model: '320i',
        year: 2018,
        engine: '2.0L',
        transmission: 'Automatic',
        last_query: '2025-02-20',
        total_queries: 45,
        mileage: 125000,
        institutionId: 'INST-001',
        average_part_life_score: 72,
        failure_frequency_index: 28,
        risk_score: 45,
        resale_value_prediction: 85000,
        damage_probability: 0.22,
        compatible_parts_count: 324,
    },
    {
        vehicle_id: 'WBAVM135-XXXX-2',
        brand: 'BMW',
        model: '318d',
        year: 2019,
        engine: '2.0L Diesel',
        transmission: 'Automatic',
        last_query: '2025-02-21',
        total_queries: 32,
        mileage: 98000,
        institutionId: 'INST-001',
        average_part_life_score: 78,
        failure_frequency_index: 18,
        risk_score: 35,
        resale_value_prediction: 92000,
        damage_probability: 0.15,
        compatible_parts_count: 318,
    },
    {
        vehicle_id: 'VVWZZZ3C-XXXX-3',
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2017,
        engine: '1.4L',
        transmission: 'Manual',
        last_query: '2025-02-19',
        total_queries: 38,
        mileage: 145000,
        institutionId: 'INST-001',
        average_part_life_score: 65,
        failure_frequency_index: 35,
        risk_score: 52,
        resale_value_prediction: 78000,
        damage_probability: 0.35,
        compatible_parts_count: 295,
    },
];

// B2B Network Mock Data
const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'Martaş Otomotiv', city: 'İstanbul', score: 98, type: 'DISTRIBUTOR' },
    { id: 'sup-2', name: 'Üçler Yedek Parça', city: 'Ankara', score: 94, type: 'WHOLESALER' },
    { id: 'sup-3', name: 'Esen Dağıtım', city: 'İzmir', score: 92, type: 'DISTRIBUTOR' },
    { id: 'sup-4', name: 'Özden Global', city: 'Bursa', score: 89, type: 'MANUFACTURER' },
    { id: 'sup-5', name: 'LENT Supply Node', city: 'Kocaeli', score: 99, type: 'DISTRIBUTOR' },
];

const MOCK_B2B_PARTS: B2BPart[] = [
    { id: 'p-1', name: 'Fren Balatası Ön (Brembo)', brand: 'Brembo', sku: 'BRM-4421', price: 2450, stock: 45, category: 'Fren' },
    { id: 'p-2', name: 'Yağ Filtresi (Mann)', brand: 'Mann', sku: 'MNN-1102', price: 420, stock: 120, category: 'Filtre' },
    { id: 'p-3', name: 'Ateşleme Bujisi (NGK)', brand: 'NGK', sku: 'NGK-9921', price: 180, stock: 300, category: 'Motor' },
    { id: 'p-4', name: 'Hava Filtresi (Bosch)', brand: 'Bosch', sku: 'BSH-0021', price: 380, stock: 85, category: 'Filtre' },
    { id: 'p-5', name: 'Debriyaj Seti (LuK)', brand: 'LuK', sku: 'LUK-8821', price: 12500, stock: 12, category: 'Şanzıman' },
];

const MOCK_B2B_EDGES: B2BEdge[] = [
    { supplierId: 'sup-1', partId: 'p-1', leadDays: 1 },
    { supplierId: 'sup-1', partId: 'p-2', leadDays: 1 },
    { supplierId: 'sup-2', partId: 'p-2', leadDays: 2 },
    { supplierId: 'sup-2', partId: 'p-3', leadDays: 1 },
    { supplierId: 'sup-3', partId: 'p-5', leadDays: 3 },
    { supplierId: 'sup-5', partId: 'p-1', leadDays: 1 },
    { supplierId: 'sup-5', partId: 'p-5', leadDays: 1 },
];

/**
 * Simple HTTP server implementation using Node's http module
 * This is for development/demo purposes
 */
export async function startMockServer() {
    const server = createServer(async (req: any, res: any) => {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tenant-id, Authorization');
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;
        const method = req.method;

        console.log(`[MockServer] ${method} ${path}`);

        // Simulate network latency (100-200ms)
        const delay = 100 + Math.random() * 100;

        setTimeout(async () => {
            // GET /api/vehicles
            if (method === 'GET' && path === '/api/vehicles') {
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: MOCK_VEHICLES,
                    total: MOCK_VEHICLES.length,
                    timestamp: new Date().toISOString(),
                }));
            }

            // GET /api/vehicles/:vehicleId/damage-history
            else if (method === 'GET' && path.match(/^\/api\/vehicles\/[^/]+\/damage-history$/)) {
                const vehicleId = path.split('/')[3];
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: 'D1',
                            date: '2023-11-15',
                            type: 'ACCIDENT',
                            source: 'SBM',
                            amount: 45000,
                            description: 'Ön tampon ve far değişimi',
                            serviceProvider: 'Yetkili Servis',
                            partsReplaced: ['Ön Tampon', 'Sağ Far'],
                        },
                        {
                            id: 'D2',
                            date: '2023-05-20',
                            type: 'MAINTENANCE',
                            source: 'SERVICE',
                            amount: 8500,
                            description: '60.000 KM Bakımı',
                            serviceProvider: 'Borusan Oto',
                            partsReplaced: ['Yağ', 'Filtreler', 'Balata'],
                        },
                    ] as DamageRecord[],
                    vehicleId,
                    timestamp: new Date().toISOString(),
                }));
            }

            // GET /api/vehicles/:vehicleId/part-analysis
            else if (method === 'GET' && path.match(/^\/api\/vehicles\/[^/]+\/part-analysis$/)) {
                const vehicleId = path.split('/')[3];
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: 'RA1',
                            partName: 'Triger Kayışı',
                            riskLevel: 'CRITICAL',
                            healthScore: 15,
                            demographicImpact: 'Yüksek KM',
                            insuranceRef: 'IRC-992',
                            regionName: 'Marmara',
                            partCost: 4500,
                            laborCost: 2000,
                            estimatedTime: 240,
                        },
                        {
                            id: 'RA2',
                            partName: 'Fren Diskleri',
                            riskLevel: 'HIGH',
                            healthScore: 45,
                            demographicImpact: 'Trafik Yoğunluğu',
                            insuranceRef: 'IRC-102',
                            regionName: 'İstanbul',
                            partCost: 3000,
                            laborCost: 800,
                            estimatedTime: 90,
                        },
                        {
                            id: 'RA3',
                            partName: 'Amortisörler',
                            riskLevel: 'LOW',
                            healthScore: 85,
                            demographicImpact: '-',
                            insuranceRef: 'IRC-001',
                            regionName: 'Genel',
                            partCost: 0,
                            laborCost: 0,
                            estimatedTime: 0,
                        },
                    ] as PartRiskAnalysis[],
                    vehicleId,
                    timestamp: new Date().toISOString(),
                }));
            }

            // GET /api/b2b-network
            else if (method === 'GET' && path === '/api/b2b-network') {
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: {
                        suppliers: MOCK_SUPPLIERS,
                        parts: MOCK_B2B_PARTS,
                        edges: MOCK_B2B_EDGES,
                    },
                    timestamp: new Date().toISOString(),
                }));
            }

            // ========== SUPPLIER OFFERS ENDPOINTS ==========

            // GET /api/offers or /api/supplier-offers (ALL offers)
            else if (method === 'GET' && (path === '/api/offers' || path === '/api/supplier-offers')) {
                const reqUrl = new URL(req.url, `http://${req.headers.host}`);
                const partMasterId = reqUrl.searchParams.get('partMasterId');
                
                // Load mock offers
                const { MOCK_OFFERS } = await import('./offers.seed');
                
                // Filter by partMasterId if provided
                let filteredOffers = MOCK_OFFERS;
                if (partMasterId) {
                    filteredOffers = MOCK_OFFERS.filter(o => o.partMasterId === partMasterId);
                }
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: filteredOffers,
                    count: filteredOffers.length,
                    timestamp: new Date().toISOString(),
                }));
            }

            // GET /api/offers/:offerId (single offer)
            else if (method === 'GET' && path.match(/^\/api\/offers\/[^/]+$/)) {
                const offerId = path.split('/')[3];
                const { MOCK_OFFERS } = await import('./offers.seed');
                const offer = MOCK_OFFERS.find(o => o.offerId === offerId);
                
                if (offer) {
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        success: true,
                        data: offer,
                        timestamp: new Date().toISOString(),
                    }));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({
                        success: false,
                        message: `Offer ${offerId} not found`,
                        timestamp: new Date().toISOString(),
                    }));
                }
            }

            // POST /api/offers (create single offer)
            else if (method === 'POST' && path === '/api/offers') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        const newOffer: SupplierOffer = {
                            offerId: `OFF-${Date.now()}`,
                            supplierId: payload.supplierId,
                            supplierName: payload.supplierName,
                            partMasterId: payload.partMasterId,
                            price: payload.price,
                            currency: payload.currency || 'TRY',
                            minOrderQty: payload.minOrderQty || 1,
                            packQty: payload.packQty,
                            stock: payload.stock,
                            leadDays: payload.leadDays,
                            lastUpdated: new Date().toISOString(),
                            isVerified: payload.isVerified || false,
                            trustScore: payload.trustScore,
                        };
                        res.writeHead(201);
                        res.end(JSON.stringify({
                            success: true,
                            data: newOffer,
                            message: 'Offer created successfully',
                            timestamp: new Date().toISOString(),
                        }));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Invalid request body',
                            timestamp: new Date().toISOString(),
                        }));
                    }
                });
            }

            // POST /api/supplier-offers (legacy - create single offer)
            else if (method === 'POST' && path === '/api/supplier-offers') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        const newOffer: SupplierOffer = {
                            offerId: `OFF-${Date.now()}`,
                            supplierId: payload.supplierId,
                            supplierName: payload.supplierName,
                            partMasterId: payload.partMasterId,
                            price: payload.price,
                            currency: payload.currency || 'TRY',
                            minOrderQty: payload.minOrderQty || 1,
                            packQty: payload.packQty,
                            stock: payload.stock,
                            leadDays: payload.leadDays,
                            lastUpdated: new Date().toISOString(),
                            isVerified: payload.isVerified || false,
                            trustScore: payload.trustScore,
                        };
                        res.writeHead(201);
                        res.end(JSON.stringify({
                            success: true,
                            data: newOffer,
                            message: 'Offer created successfully',
                            timestamp: new Date().toISOString(),
                        }));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Invalid request body',
                            timestamp: new Date().toISOString(),
                        }));
                    }
                });
            }

            // POST /api/offers/bulk or /api/supplier-offers/bulk (bulk import)
            else if (method === 'POST' && (path === '/api/offers/bulk' || path === '/api/supplier-offers/bulk')) {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        const offers = (payload.offers || payload) as SupplierOffer[];
                        const created = offers.map((o, idx) => ({
                            ...o,
                            offerId: o.offerId || `OFF-bulk-${Date.now()}-${idx}`,
                            lastUpdated: new Date().toISOString(),
                        }));
                        res.writeHead(201);
                        res.end(JSON.stringify({
                            success: true,
                            data: created,
                            count: created.length,
                            message: `${created.length} offers imported`,
                            timestamp: new Date().toISOString(),
                        }));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Invalid bulk import payload',
                            timestamp: new Date().toISOString(),
                        }));
                    }
                });
            }

            // GET /api/effective-offers?partMasterId=...&institutionId=...
            // This endpoint should compute effective offers with scoring
            else if (method === 'GET' && path.includes('/api/effective-offers')) {
                const reqUrl = new URL(req.url, `http://${req.headers.host}`);
                const partMasterId = reqUrl.searchParams.get('partMasterId');
                const institutionId = reqUrl.searchParams.get('institutionId') || 'INST-001';
                
                // Load mock data
                const { MOCK_OFFERS } = await import('./offers.seed');
                const { MOCK_SUPPLIERS } = await import('./suppliers.seed');
                const { MOCK_PRICE_RULES } = await import('./priceRules.seed');
                const { computeOfferRecommendation } = await import('../../services/effectiveOfferEngine');
                
                if (!partMasterId) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Missing partMasterId parameter',
                        timestamp: new Date().toISOString(),
                    }));
                    return;
                }
                
                // Filter offers for this part
                const partOffers = MOCK_OFFERS.filter(o => o.part_master_id === partMasterId);
                
                // DEBUG LOG
                console.log(`[SERVER-FILTER-DEBUG] partMasterId="${partMasterId}", MOCK_OFFERS.length=${MOCK_OFFERS.length}, partOffers.length=${partOffers.length}`);
                if (partOffers.length === 0) {
                  console.log(`[SERVER-FILTER-DEBUG] ❌ No match! Available part_master_ids:`, MOCK_OFFERS.map(o => o.part_master_id).slice(0, 10));
                }
                
                // Create supplier map
                const suppliersMap = new Map(MOCK_SUPPLIERS.map(s => [s.supplierId, s]));
                
                // Filter rules by institution
                const rules = MOCK_PRICE_RULES.filter(r => r.institution_id === institutionId);
                
                // Compute recommendation
                const recommendation = computeOfferRecommendation(
                    partOffers,
                    rules,
                    suppliersMap,
                    partMasterId,
                    institutionId
                );
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: recommendation,
                    timestamp: new Date().toISOString(),
                }));
            }

            // GET /api/suppliers
            else if (method === 'GET' && path === '/api/suppliers') {
                const { MOCK_SUPPLIERS } = await import('./suppliers.seed');
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: MOCK_SUPPLIERS,
                    timestamp: new Date().toISOString(),
                }));
            }

            // GET /api/oem-alternatives?oem=...&brand=...
            else if (method === 'GET' && path.includes('/api/oem-alternatives')) {
                const reqUrl = new URL(req.url, `http://${req.headers.host}`);
                const oem = reqUrl.searchParams.get('oem');
                const brand = reqUrl.searchParams.get('brand');

                if (!oem || !brand) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Missing oem or brand parameter',
                        timestamp: new Date().toISOString(),
                    }));
                    return;
                }

                // Load mapping engine
                const { getAlternativesByOem } = await import('../../services/oemMappingEngine');
                const alternatives = await getAlternativesByOem(oem, brand);

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    oem: oem,
                    brand: brand,
                    alternatives: alternatives,
                    count: alternatives.length,
                    timestamp: new Date().toISOString(),
                }));
            }

            // POST /api/supplier-feed/sync?supplierId=SUP-001
            else if (method === 'POST' && path.includes('/api/supplier-feed/sync')) {
                const reqUrl = new URL(req.url, `http://${req.headers.host}`);
                const supplierId = reqUrl.searchParams.get('supplierId');

                if (!supplierId) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Missing supplierId parameter',
                        timestamp: new Date().toISOString(),
                    }));
                    return;
                }

                // Sync supplier feed
                const { syncSupplierFeed } = await import('../../services/supplierFeedEngine');
                const result = await syncSupplierFeed(supplierId);

                res.writeHead(200);
                res.end(JSON.stringify(result));
            }

            // ========== OEM MASTER CATALOG ENDPOINTS ==========

            // GET /api/oem/catalog?brand=BMW&query=...
            else if (method === 'GET' && path.includes('/api/oem/catalog')) {
                const { MOCK_OEM_CATALOG } = await import('./oemCatalog.seed');
                const brand = reqUrl.searchParams.get('brand');
                const query = reqUrl.searchParams.get('query')?.toLowerCase();

                let results = MOCK_OEM_CATALOG;

                if (brand) {
                    results = results.filter(item => item.oem_brand.toLowerCase() === brand.toLowerCase());
                }

                if (query) {
                    results = results.filter(item =>
                        item.part_name.toLowerCase().includes(query) ||
                        item.oem_part_number.toLowerCase().includes(query)
                    );
                }

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    items: results,
                    count: results.length,
                    timestamp: new Date().toISOString(),
                }));
            }

            // POST /api/oem/ingest (ingest OEM catalog items and create canonical PartMaster)
            else if (method === 'POST' && path === '/api/oem/ingest') {
                let body = '';
                req.on('data', (chunk: any) => body += chunk);
                req.on('end', async () => {
                    try {
                        const payload = JSON.parse(body);
                        const items = Array.isArray(payload.items) ? payload.items : [];

                        if (items.length === 0) {
                            res.writeHead(400);
                            res.end(JSON.stringify({
                                success: false,
                                message: 'No OEM items provided',
                            }));
                            return;
                        }

                        // Import OEM engine and cross-ref
                        const { batchIngestOemCatalog, buildCrossRefMap } = await import('../../services/oemMasterEngine');
                        const { MOCK_CROSSREF } = await import('./crossRef.seed');

                        // Build cross-ref map
                        const crossRefMap = buildCrossRefMap(MOCK_CROSSREF);

                        // Batch ingest
                        const result = await batchIngestOemCatalog(items, crossRefMap);

                        res.writeHead(200);
                        res.end(JSON.stringify({
                            success: true,
                            created_parts: result.partMasters.length,
                            created_mappings: result.maps.length,
                            stats: result.stats,
                            timestamp: new Date().toISOString(),
                        }));
                    } catch (error: any) {
                        console.error('[OEM Ingest] Error:', error);
                        res.writeHead(500);
                        res.end(JSON.stringify({
                            success: false,
                            error: error.message,
                        }));
                    }
                });
            }

            // GET /api/part-master/catalog (canonical single source of truth)
            else if (method === 'GET' && path === '/api/part-master/catalog') {
                // In this mock, we return empty since parts are created on-demand by OEM ingest
                // In production: this would return all canonical parts from database
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    parts: [],
                    message: 'Part Master Catalog (canonical). Use POST /api/oem/ingest to populate.',
                    timestamp: new Date().toISOString(),
                }));
            }

            // GET /api/oem-mapping?oemPartNumber=...
            else if (method === 'GET' && path.includes('/api/oem-mapping')) {
                const oemPn = reqUrl.searchParams.get('oemPartNumber');

                if (!oemPn) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Missing oemPartNumber parameter',
                    }));
                    return;
                }

                // In this mock, mappings are created during OEM ingest
                // Would need persistent storage to retrieve here
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    message: 'OEM mappings created during ingest. Use POST /api/oem/ingest to generate.',
                    timestamp: new Date().toISOString(),
                }));
            }

            // 404 Not Found
            else {
                res.writeHead(404);
                res.end(JSON.stringify({
                    success: false,
                    message: `Endpoint not found: ${path}`,
                    timestamp: new Date().toISOString(),
                }));
            }
        }, delay);
    });

    server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`[MockServer] Port ${PORT} already in use (development HMR restart)`);
        } else {
            console.error(`[MockServer Error]`, err);
        }
    });

    server.listen(PORT, () => {
        console.log(`⚡ Mock Server running on http://localhost:${PORT}`);
        console.log(`   GET /api/vehicles`);
        console.log(`   GET /api/vehicles/:vehicleId/damage-history`);
        console.log(`   GET /api/vehicles/:vehicleId/part-analysis`);
        console.log(`   GET /api/b2b-network`);
        console.log(`   GET /api/suppliers`);
        console.log(`   GET /api/supplier-offers?partMasterId=...&tenantId=...`);
        console.log(`   GET /api/effective-offers?partMasterId=...&institutionId=...`);
        console.log(`   POST /api/supplier-offers`);
        console.log(`   POST /api/supplier-offers/bulk`);
        console.log(`   GET /api/oem/catalog?brand=BMW&query=...`);
        console.log(`   POST /api/oem/ingest`);
        console.log(`   GET /api/part-master/catalog`);
        console.log(`   GET /api/oem-mapping?oemPartNumber=...`);
    });

    server.on('error', (err: any) => {
        console.error('Mock server error:', err);
    });

    return server;
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startMockServer();
}
