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
export function startMockServer() {
    const server = createServer((req: any, res: any) => {
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

        setTimeout(() => {
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

    server.listen(PORT, () => {
        console.log(`⚡ Mock Server running on http://localhost:${PORT}`);
        console.log(`   GET /api/vehicles`);
        console.log(`   GET /api/vehicles/:vehicleId/damage-history`);
        console.log(`   GET /api/vehicles/:vehicleId/part-analysis`);
        console.log(`   GET /api/b2b-network`);
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
