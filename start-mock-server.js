#!/usr/bin/env node

/**
 * Mock Server Starter
 * Run: node start-mock-server.js
 */

const http = require('http');
const path = require('path');
const url = require('url');

const PORT = 3001;

// Mock data
const MOCK_SUPPLIERS = [
    { supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', country: 'Turkey' },
    { supplierId: 'SUP-002', supplierName: 'Bosch Distribütör', country: 'Turkey' },
    { supplierId: 'SUP-003', supplierName: 'Mann-Filter Türkiye', country: 'Turkey' },
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
];

const MOCK_CROSSREF = [
    { oem_pn: '34116789123', brand: 'Bosch', pn: 'BP-BMW-320-FRONT', quality: 'OES' },
    { oem_pn: '34116789123', brand: 'Brembo', pn: 'BRM-SERIES-BM', quality: 'OEM' },
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
    console.log(`\n⚡ Mock Server running on http://localhost:${PORT}\n`);
    console.log('Available endpoints:');
    console.log('   GET  /api/oem/catalog?brand=BMW&query=...');
    console.log('   POST /api/oem/ingest');
    console.log('   GET  /api/part-master/catalog');
    console.log('   GET  /api/suppliers\n');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} zaten kullanımda!`);
        console.error('Yapılacak işlem:');
        console.error(`  1. Başka bir terminal bulun ve PORT'u değiştirin`);
        console.error(`  2. Veya: netstat -ano | grep ${PORT} (Windows)`);
        console.error(`  3. Veya: lsof -i :${PORT} (Mac/Linux)\n`);
    } else {
        console.error('Server error:', err);
    }
});
