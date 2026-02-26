import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { PART_MASTER_MOCK } from './types/partMaster';
import { startMockServer } from './src/mocks/server';

// Mock API data
const MOCK_VEHICLES = [
    {
        vehicle_id: 'WBALZ7C5-XXXX-1',
        brand: 'BMW', model: '320i', year: 2018, engine: '2.0L',
        transmission: 'Automatic', last_query: '2025-02-20', total_queries: 45,
        mileage: 125000, institutionId: 'INST-001',
        average_part_life_score: 72, failure_frequency_index: 28, risk_score: 45,
        resale_value_prediction: 85000, damage_probability: 0.22, compatible_parts_count: 324,
    },
];

// Mock PartMaster data
const MOCK_PART_MASTER = [
  {
    partId: 'INST-001-P001',
    sku: 'P001',
    name: 'Fren Balatası Ön',
    brand: 'Brembo',
    category: 'body',
    oemRefs: ['BMW-34-11-6-855-375'],
    crossRefs: ['Bosch-0986424392'],
    tags: ['critical', 'brake'],
    unit: 'adet',
    packSize: 1,
    pricing: { buy: 850, sell: 1200, currency: 'TRY', updatedAt: new Date().toISOString() },
    inventory: { onHand: 15, reserved: 2, incoming: 10, leadDays: 3, updatedAt: new Date().toISOString() },
    demandSignals: { dailyAvg30d: 4.0, weeklyTrend: 'UP', deadStockRisk30d: 5, turnover30d: 120, coverageDays: 3 },
    source: 'MOCK',
    tenantId: 'INST-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    partId: 'INST-001-P002',
    sku: 'P002',
    name: 'Yağ Filtresi',
    brand: 'Mann',
    category: 'powertrain',
    oemRefs: ['BMW-11-42-1-734-564'],
    crossRefs: ['Bosch-0451203055'],
    tags: ['service', 'oil'],
    unit: 'adet',
    packSize: 1,
    pricing: { buy: 350, sell: 480, currency: 'TRY', updatedAt: new Date().toISOString() },
    inventory: { onHand: 45, reserved: 5, incoming: 20, leadDays: 2, updatedAt: new Date().toISOString() },
    demandSignals: { dailyAvg30d: 3.0, weeklyTrend: 'STABLE', deadStockRisk30d: 0, turnover30d: 90, coverageDays: 15 },
    source: 'MOCK',
    tenantId: 'INST-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    partId: 'INST-001-P003',
    sku: 'P003',
    name: 'Hava Filtresi',
    brand: 'Mann',
    category: 'powertrain',
    oemRefs: ['BMW-13-71-7-605-047'],
    crossRefs: [],
    tags: ['service', 'air'],
    unit: 'adet',
    packSize: 1,
    pricing: { buy: 280, sell: 380, currency: 'TRY', updatedAt: new Date().toISOString() },
    inventory: { onHand: 8, reserved: 1, incoming: 15, leadDays: 5, updatedAt: new Date().toISOString() },
    demandSignals: { dailyAvg30d: 1.0, weeklyTrend: 'DOWN', deadStockRisk30d: 3, turnover30d: 30, coverageDays: 8 },
    source: 'MOCK',
    tenantId: 'INST-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    partId: 'INST-001-P004',
    sku: 'P004',
    name: 'Triger Kayışı',
    brand: 'Contitech',
    category: 'powertrain',
    oemRefs: ['BMW-11-31-1-740-574'],
    crossRefs: ['Gates-T38390'],
    tags: ['critical', 'timing'],
    unit: 'set',
    packSize: 1,
    pricing: { buy: 4500, sell: 6200, currency: 'TRY', updatedAt: new Date().toISOString() },
    inventory: { onHand: 2, reserved: 1, incoming: 5, leadDays: 14, updatedAt: new Date().toISOString() },
    demandSignals: { dailyAvg30d: 0.2, weeklyTrend: 'STABLE', deadStockRisk30d: 80, turnover30d: 5, coverageDays: 10 },
    source: 'MOCK',
    tenantId: 'INST-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    partId: 'INST-001-P005',
    sku: 'P005',
    name: 'Motor Yağı 5W30',
    brand: 'Castrol',
    category: 'aftermarket',
    oemRefs: [],
    crossRefs: ['Shell-Helix', 'Mobil-1'],
    tags: ['consumable', 'oil'],
    unit: 'litre',
    packSize: 5,
    pricing: { buy: 85, sell: 120, currency: 'TRY', updatedAt: new Date().toISOString() },
    inventory: { onHand: 120, reserved: 20, incoming: 100, leadDays: 1, updatedAt: new Date().toISOString() },
    demandSignals: { dailyAvg30d: 13.3, weeklyTrend: 'UP', deadStockRisk30d: 0, turnover30d: 400, coverageDays: 9 },
    source: 'MOCK',
    tenantId: 'INST-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// API middleware plugin
function apiMiddlewarePlugin() {
  return {
    name: 'api-middleware',
    configureServer(server: any) {
      // Start mock server (handles /api/effective-offers, /api/supplier-offers, etc)
      startMockServer().catch((err: any) => {
        if (err?.code === 'EADDRINUSE') {
          console.log('[MockServer] Already running on port 3001');
        } else {
          console.error('[MockServer Error]', err?.message);
        }
      });

      server.middlewares.use((req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          next();
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const pathname = req.url.split('?')[0];
        const method = req.method;

        console.log(`[DevAPI] ${method} ${pathname}`);

        // GET /api/vehicles
        if (method === 'GET' && pathname === '/api/vehicles') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: MOCK_VEHICLES,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/vehicles/:vehicleId/damage-history
        if (method === 'GET' && pathname.match(/^\/api\/vehicles\/[^/]+\/damage-history$/)) {
          const vehicleId = pathname.split('/')[3];
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: [
              { id: 'D1', date: '2023-11-15', type: 'ACCIDENT', amount: 45000 },
            ],
            vehicleId,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/vehicles/:vehicleId/part-analysis
        if (method === 'GET' && pathname.match(/^\/api\/vehicles\/[^/]+\/part-analysis$/)) {
          const vehicleId = pathname.split('/')[3];
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: [
              { id: 'RA1', partName: 'Triger Kayışı', riskLevel: 'CRITICAL', healthScore: 15 },
            ],
            vehicleId,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/vehicles/:vehicleId/part-risk (required endpoint for PATCH B/1)
        if (method === 'GET' && pathname.match(/^\/api\/vehicles\/[^/]+\/part-risk$/)) {
          const vehicleId = pathname.split('/')[3];
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: [
              { id: 'RA1', partName: 'Triger Kayışı', riskLevel: 'CRITICAL', healthScore: 15, demographicImpact: 'Yüksek KM', insuranceRef: 'IRC-992', regionName: 'Marmara', partCost: 4500, laborCost: 2000, estimatedTime: 240 },
              { id: 'RA2', partName: 'Fren Diskleri', riskLevel: 'HIGH', healthScore: 45, demographicImpact: 'Trafik Yoğunluğu', insuranceRef: 'IRC-102', regionName: 'İstanbul', partCost: 3000, laborCost: 800, estimatedTime: 90 },
            ],
            vehicleId,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/b2b-network
        if (method === 'GET' && pathname === '/api/b2b-network') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              suppliers: [{ id: 'sup-1', name: 'Martaş', city: 'İstanbul', score: 98 }],
              parts: [{ id: 'p-1', name: 'Fren Balatası', brand: 'Brembo', price: 2450 }],
              edges: [{ supplierId: 'sup-1', partId: 'p-1', leadDays: 1 }],
            },
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/part-master?tenantId=...
        // Returns full PartMasterSnapshot (canonical single source of truth)
        if (method === 'GET' && pathname === '/api/part-master') {
          const tenantId = new URL('http://localhost' + req.url).searchParams.get('tenantId') || PART_MASTER_MOCK.tenantId;
          const snapshot = {
            ...PART_MASTER_MOCK,
            tenantId,
            generatedAt: new Date().toISOString(),
          };
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: snapshot,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/aftermarket/summary?tenantId=...
        if (method === 'GET' && pathname === '/api/aftermarket/summary') {
          const tenantId = new URL('http://localhost' + req.url).searchParams.get('tenantId') || 'INST-001';
          const parts = MOCK_PART_MASTER.filter(p => p.tenantId === tenantId);
          
          const metrics = {
            totalStockValue: parts.reduce((sum, p) => sum + (p.inventory.onHand * p.pricing.sell), 0),
            totalOnHand: parts.reduce((sum, p) => sum + p.inventory.onHand, 0),
            totalReserved: parts.reduce((sum, p) => sum + p.inventory.reserved, 0),
            totalIncoming: parts.reduce((sum, p) => sum + p.inventory.incoming, 0),
            avgTurnover30d: Math.round(parts.reduce((sum, p) => sum + p.demandSignals.turnover30d, 0) / parts.length),
            deadStockCount: parts.filter(p => p.demandSignals.deadStockRisk30d > 50).length,
            criticalStockCount: parts.filter(p => p.inventory.onHand < 5 && p.demandSignals.dailyAvg30d > 1).length,
          };
          
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: metrics,
            tenantId,
            dataSource: 'MOCK',
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/aftermarket/critical?tenantId=...
        if (method === 'GET' && pathname === '/api/aftermarket/critical') {
          const tenantId = new URL('http://localhost' + req.url).searchParams.get('tenantId') || 'INST-001';
          const critical = MOCK_PART_MASTER.filter(p =>
            p.tenantId === tenantId &&
            (p.tags.includes('critical') || p.inventory.onHand < 5)
          );
          
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: critical,
            count: critical.length,
            tenantId,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/aftermarket/top-turnover?tenantId=...&limit=10
        if (method === 'GET' && pathname === '/api/aftermarket/top-turnover') {
          const tenantId = new URL('http://localhost' + req.url).searchParams.get('tenantId') || 'INST-001';
          const limit = parseInt(new URL('http://localhost' + req.url).searchParams.get('limit') || '10');
          
          const topTurnover = MOCK_PART_MASTER
            .filter(p => p.tenantId === tenantId)
            .map(p => ({ ...p, turnover: p.demandSignals.turnover30d }))
            .sort((a, b) => b.turnover - a.turnover)
            .slice(0, limit);
          
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: topTurnover,
            limit,
            tenantId,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/aftermarket/top-margin?tenantId=...&limit=10
        if (method === 'GET' && pathname === '/api/aftermarket/top-margin') {
          const tenantId = new URL('http://localhost' + req.url).searchParams.get('tenantId') || 'INST-001';
          const limit = parseInt(new URL('http://localhost' + req.url).searchParams.get('limit') || '10');
          
          const topMargin = MOCK_PART_MASTER
            .filter(p => p.tenantId === tenantId)
            .map(p => {
              const margin = p.pricing.sell - p.pricing.buy;
              const marginPercent = (margin / p.pricing.buy) * 100;
              return { ...p, marginPercent };
            })
            .sort((a, b) => b.marginPercent - a.marginPercent)
            .slice(0, limit);
          
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: topMargin,
            limit,
            tenantId,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // GET /api/aftermarket/recommendations?tenantId=...&vehicleId=...
        if (method === 'GET' && pathname === '/api/aftermarket/recommendations') {
          const tenantId = new URL('http://localhost' + req.url).searchParams.get('tenantId') || 'INST-001';
          const vehicleId = new URL('http://localhost' + req.url).searchParams.get('vehicleId');
          
          // Simple: critical parts + high turnover
          const recommendations = MOCK_PART_MASTER
            .filter(p => p.tenantId === tenantId && (p.tags.includes('critical') || p.demandSignals.turnover30d > 100))
            .slice(0, 5)
            .map(p => ({
              partId: p.partId,
              sku: p.sku,
              name: p.name,
              reason: p.tags.includes('critical') ? 'Kritik parça' : p.demandSignals.turnover30d > 100 ? 'Yüksek dönen' : 'Stok',
              suggestedOrderQty: Math.ceil(p.demandSignals.dailyAvg30d * 30),
              estimatedCost: Math.ceil(p.demandSignals.dailyAvg30d * 30 * p.pricing.buy),
            }));
          
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: recommendations,
            vehicleId,
            tenantId,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // 404
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          message: `API not found: ${pathname}`,
        }));
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3003,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
