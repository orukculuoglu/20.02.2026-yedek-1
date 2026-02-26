#!/usr/bin/env node

/**
 * Mock Server Starter (ES Module)
 * Run: npm run dev:mock-server
 */

import http from 'http';
import url from 'url';

const PORT = 3001;

// Mock data
const MOCK_SUPPLIERS = [
    { supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', country: 'Turkey' },
    { supplierId: 'SUP-002', supplierName: 'Bosch Distribütör', country: 'Turkey' },
    { supplierId: 'SUP-003', supplierName: 'Mann-Filter Türkiye', country: 'Turkey' },
];

// Supplier Offers
const MOCK_OFFERS = [
  // BRAKE_PAD_FRONT_001 (PM-0001)
  { offerId: 'OFF-001', supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', partMasterId: 'PM-0001', price: 2450, currency: 'TRY', minOrderQty: 1, packQty: 4, stock: 85, leadDays: 2, lastUpdated: new Date('2025-02-20').toISOString(), isVerified: true, trustScore: 95 },
  { offerId: 'OFF-002', supplierId: 'SUP-002', supplierName: 'Bosch Türkiye', partMasterId: 'PM-0001', price: 2100, currency: 'TRY', minOrderQty: 1, packQty: 4, stock: 120, leadDays: 1, lastUpdated: new Date('2025-02-19').toISOString(), isVerified: true, trustScore: 98 },
  { offerId: 'OFF-003', supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', partMasterId: 'PM-0001', price: 1850, currency: 'TRY', minOrderQty: 2, packQty: 4, stock: 200, leadDays: 2, lastUpdated: new Date('2025-02-18').toISOString(), isVerified: true, trustScore: 88 },
  // FILTER_OIL_001 (PM-0002)
  { offerId: 'OFF-004', supplierId: 'SUP-003', supplierName: 'Mann-Filter Türkiye', partMasterId: 'PM-0002', price: 890, currency: 'TRY', minOrderQty: 1, packQty: 6, stock: 500, leadDays: 3, lastUpdated: new Date('2025-02-20').toISOString(), isVerified: true, trustScore: 92 },
  { offerId: 'OFF-005', supplierId: 'SUP-002', supplierName: 'Bosch Türkiye', partMasterId: 'PM-0002', price: 750, currency: 'TRY', minOrderQty: 1, packQty: 6, stock: 0, leadDays: 5, lastUpdated: new Date('2025-02-19').toISOString(), isVerified: true, trustScore: 96 },
  { offerId: 'OFF-006', supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', partMasterId: 'PM-0002', price: 380, currency: 'TRY', minOrderQty: 3, packQty: 6, stock: 1000, leadDays: 1, lastUpdated: new Date('2025-02-20').toISOString(), isVerified: false, trustScore: 70 },
  // SPARK_PLUG_001 (PM-0003)
  { offerId: 'OFF-007', supplierId: 'SUP-002', supplierName: 'Bosch Türkiye', partMasterId: 'PM-0003', price: 450, currency: 'TRY', minOrderQty: 1, packQty: 10, stock: 300, leadDays: 1, lastUpdated: new Date('2025-02-20').toISOString(), isVerified: true, trustScore: 97 },
  { offerId: 'OFF-008', supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', partMasterId: 'PM-0003', price: 380, currency: 'TRY', minOrderQty: 1, packQty: 8, stock: 450, leadDays: 2, lastUpdated: new Date('2025-02-20').toISOString(), isVerified: true, trustScore: 90 },
  { offerId: 'OFF-009', supplierId: 'SUP-003', supplierName: 'Mann-Filter Türkiye', partMasterId: 'PM-0003', price: 220, currency: 'TRY', minOrderQty: 5, packQty: 10, stock: 2000, leadDays: 1, lastUpdated: new Date('2025-02-18').toISOString(), isVerified: true, trustScore: 82 },
  { offerId: 'OFF-010', supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', partMasterId: 'PM-0003', price: 120, currency: 'TRY', minOrderQty: 10, packQty: 10, stock: 5000, leadDays: 1, lastUpdated: new Date('2025-02-15').toISOString(), isVerified: false, trustScore: 65 },
];

const MOCK_OEM_CATALOG = [
    {
        id: 'CAT-BMW-001',
        oem_brand: 'BMW',
        oem_part_number: '34 11 6 789 123',
        part_name: 'Brake Pad Front Left',
        category: 'BRAKE_SYSTEM',
        last_updated: new Date().toISOString(),
        source: 'API',
    },
    {
        id: 'CAT-VW-001',
        oem_brand: 'Volkswagen',
        oem_part_number: '8K0 615 301 D',
        part_name: 'Brake Pad Rear Axle',
        category: 'BRAKE_SYSTEM',
        last_updated: new Date().toISOString(),
        source: 'API',
    },
    {
        id: 'CAT-FORD-001',
        oem_brand: 'Ford',
        oem_part_number: 'DG-511',
        part_name: 'Spark Plug Standard',
        category: 'IGNITION',
        last_updated: new Date().toISOString(),
        source: 'API',
    },
];

const MOCK_CROSSREF = [
    { oem_pn: '34116789123', brand: 'Bosch', pn: 'BP-BMW-320-FRONT', quality: 'OES' },
    { oem_pn: '34116789123', brand: 'Brembo', pn: 'BRM-SERIES-BM', quality: 'OEM' },
    { oem_pn: '34116789123', brand: 'Textar', pn: 'TX-2354201', quality: 'OES' },
    { oem_pn: '34116789123', brand: 'ATE', pn: 'AT-13646201321', quality: 'OES' },
];

// Create server
const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

    // Network latency simulation
    const delay = 100 + Math.random() * 100;

    setTimeout(() => {
        try {
            // GET /api/oem/catalog
            if (req.method === 'GET' && pathname === '/api/oem/catalog') {
                const brand = query.brand;
                let items = MOCK_OEM_CATALOG;

                if (brand) {
                    items = items.filter(item => item.oem_brand.toLowerCase() === brand.toLowerCase());
                }

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    items: items,
                    count: items.length,
                    timestamp: new Date().toISOString(),
                }));
            }
            // POST /api/oem/ingest
            else if (req.method === 'POST' && pathname === '/api/oem/ingest') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        const items = Array.isArray(payload.items) ? payload.items : [];

                        res.writeHead(200);
                        res.end(JSON.stringify({
                            success: true,
                            created_parts: items.length,
                            created_mappings: items.length,
                            stats: {
                                created: items.length,
                                mapped: items.length,
                                errors: 0,
                            },
                            timestamp: new Date().toISOString(),
                        }));
                    } catch (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ success: false, error: err.message }));
                    }
                });
            }
            // GET /api/suppliers
            else if (req.method === 'GET' && pathname === '/api/suppliers') {
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    suppliers: MOCK_SUPPLIERS,
                    timestamp: new Date().toISOString(),
                }));
            }
            // GET /api/part-master/catalog
            else if (req.method === 'GET' && pathname === '/api/part-master/catalog') {
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    parts: [],
                    message: 'Canonical Part Master. Use POST /api/oem/ingest to populate.',
                    timestamp: new Date().toISOString(),
                }));
            }
            // GET /api/oem-mapping
            else if (req.method === 'GET' && pathname === '/api/oem-mapping') {
                const oemPn = query.oemPartNumber;
                if (!oemPn) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ success: false, message: 'Missing oemPartNumber' }));
                    return;
                }

                const mapping = MOCK_CROSSREF.filter(ref => ref.oem_pn === oemPn.replace(/\D/g, ''));
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    oemPartNumber: oemPn,
                    mappings: mapping,
                    count: mapping.length,
                    timestamp: new Date().toISOString(),
                }));
            }
            // GET /api/offers (Supplier Offers)
            else if (req.method === 'GET' && pathname === '/api/offers') {
                const partMasterId = query.partMasterId;
                let filtered = MOCK_OFFERS;
                
                if (partMasterId) {
                    filtered = MOCK_OFFERS.filter(o => o.partMasterId === partMasterId);
                }
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: filtered,
                    count: filtered.length,
                    timestamp: new Date().toISOString(),
                }));
            }
            // GET /api/offers/:offerId
            else if (req.method === 'GET' && pathname.match(/^\/api\/offers\/[^/]+$/)) {
                const offerId = pathname.split('/')[3];
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
            // 404
            else {
                res.writeHead(404);
                res.end(JSON.stringify({
                    success: false,
                    message: `Not found: ${pathname}`,
                    timestamp: new Date().toISOString(),
                }));
            }
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500);
            res.end(JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            }));
        }
    }, delay);
});

// Start server
server.listen(PORT, () => {
    console.log(`\n✅ Mock Server çalışıyor: http://localhost:${PORT}\n`);
    console.log('📡 Kullanılabilir endpoint\'ler:');
    console.log('   GET  /api/oem/catalog?brand=BMW');
    console.log('   POST /api/oem/ingest');
    console.log('   GET  /api/part-master/catalog');
    console.log('   GET  /api/suppliers');
    console.log('   GET  /api/oem-mapping?oemPartNumber=...\n');
    console.log('💡 Test: curl http://localhost:3001/api/suppliers\n');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} zaten kullanımda!`);
        console.error('\nÇözüm:');
        console.error(`  netstat -ano | findstr :${PORT}`);
        console.error(`  Sonra: taskkill /PID [PID] /F\n`);
    } else {
        console.error('Server error:', err);
    }
});
