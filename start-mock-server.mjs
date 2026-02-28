#!/usr/bin/env node

/**
 * Mock Server - Full Stack (ES Module)
 * Includes: Suppliers + Offers + Fleet Rental V1 + V2.1
 * Run: npm run dev:mock-server
 */

import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  MOCK_FLEETS,
  MOCK_VEHICLES,
  MOCK_CONTRACTS,
  MOCK_MAINTENANCE_LOGS,
  MOCK_COSTS,
  MOCK_PARTS_RECOMMENDATIONS,
  MOCK_SERVICE_POINTS,
  MOCK_FLEET_POLICIES,
  MOCK_SERVICE_REDIRECTS,
  MOCK_WORK_ORDERS as SEED_WORK_ORDERS,
  MOCK_COST_LEDGER,
} from './src/mocks/fleetRentalSeed.mjs';

const PORT = 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PERSISTENCE_DIR = path.join(__dirname, '.mock-persistence');

// V2.6 - Persistence Functions
const ensurePersistenceDir = () => {
  if (!fs.existsSync(PERSISTENCE_DIR)) {
    fs.mkdirSync(PERSISTENCE_DIR, { recursive: true });
  }
};

const savePersistentState = (key, data) => {
  ensurePersistenceDir();
  const filePath = path.join(PERSISTENCE_DIR, `${key}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving ${key}:`, err.message);
  }
};

const loadPersistentState = (key, defaultValue = []) => {
  ensurePersistenceDir();
  const filePath = path.join(PERSISTENCE_DIR, `${key}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error loading ${key}:`, err.message);
  }
  return defaultValue;
};

// V2.6 - Service Appointments (Maintenance Randevuları) - Persistent
let MOCK_SERVICE_APPOINTMENTS = loadPersistentState('appointments', []);
let MOCK_WORK_ORDERS = loadPersistentState('workorders', []);
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
    // CORS - Allow localhost:3003 (dev server)
    const origin = req.headers.origin;
    const allowedOrigins = ['http://localhost:3003', 'http://127.0.0.1:3003'];
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tenant-id, x-role');
    res.setHeader('Access-Control-Request-Method', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // ===== GLOBAL TENANT MIDDLEWARE - ALL /api ENDPOINTS REQUIRE x-tenant-id =====
    if (pathname.startsWith('/api')) {
        const tenantId = req.headers['x-tenant-id'];
        const role = req.headers['x-role'] || 'guest';
        
        if (!tenantId) {
            res.writeHead(401);
            res.end(JSON.stringify({
                error: 'x-tenant-id header is required',
                code: 'MISSING_TENANT_ID',
                timestamp: new Date().toISOString(),
            }));
            console.log(`[BLOCKED] Tenant: MISSING | Role: ${role} | Path: ${pathname} | Reason: x-tenant-id required`);
            return;
        }

        // Request logging
        console.log(`[REQUEST] Tenant: ${tenantId.substring(0, 20)} | Role: ${role} | Method: ${req.method} | Path: ${pathname}`);
    }

    // Helper: Validate tenant header for Fleet endpoints
    const validateTenant = (path) => {
        return path.startsWith('/api/fleet');
    };

    const checkTenant = (req, res) => {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            res.writeHead(401);
            res.end(JSON.stringify({
                error: 'x-tenant-id header is required',
                code: 'MISSING_TENANT_ID',
                timestamp: new Date().toISOString(),
            }));
            return false;
        }
        return true;
    };

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

            // ===== FLEET RENTAL ENDPOINTS =====
            
            // GET /api/fleet - List all fleets
            else if (req.method === 'GET' && pathname === '/api/fleet') {
                if (!checkTenant(req, res)) return;
                
                res.writeHead(200);
                res.end(JSON.stringify(MOCK_FLEETS));
            }

            // GET /api/fleet/:fleetId/vehicles - List vehicles for fleet
            else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+\/vehicles$/)) {
                if (!checkTenant(req, res)) return;
                
                const fleetId = pathname.split('/')[3];
                const vehicles = MOCK_VEHICLES.filter(v => v.fleetId === fleetId);
                
                res.writeHead(200);
                res.end(JSON.stringify(vehicles));
            }

            // GET /api/fleet/:fleetId/contracts - List contracts for fleet
            else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+\/contracts$/)) {
                if (!checkTenant(req, res)) return;
                
                const fleetId = pathname.split('/')[3];
                const contracts = MOCK_CONTRACTS.filter(c => c.fleetId === fleetId);
                
                res.writeHead(200);
                res.end(JSON.stringify(contracts));
            }

            // POST /api/fleet/:fleetId/contracts - Create new contract
            else if (req.method === 'POST' && pathname.match(/^\/api\/fleet\/[^/]+\/contracts$/)) {
                if (!checkTenant(req, res)) return;
                
                // Role enforcement - viewer cannot write
                const role = req.headers['x-role'];
                const tenantId = req.headers['x-tenant-id'];
                if (role === 'viewer') {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'viewer role cannot create contracts',
                        code: 'FORBIDDEN_ROLE',
                    }));
                    console.log(`[BLOCKED-WRITE] Tenant: ${tenantId} | Role: ${role} | Path: /api/fleet/...contracts | Reason: viewer cannot write`);
                    return;
                }
                
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        const fleetId = pathname.split('/')[3];
                        
                        // Create new contract
                        const newContract = {
                            contractId: `CNT-${Date.now()}`,
                            fleetId,
                            ...payload,
                            status: 'DRAFT',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        
                        MOCK_CONTRACTS.push(newContract);
                        
                        res.writeHead(201);
                        res.end(JSON.stringify(newContract));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Invalid request body',
                            error: error.message,
                            timestamp: new Date().toISOString(),
                        }));
                    }
                });
                return;
            }

            // GET /api/vehicle/:vehicleId/summary - Get vehicle summary (V2.1)
            else if (req.method === 'GET' && pathname.match(/^\/api\/vehicle\/[^/]+\/summary$/)) {
                if (!checkTenant(req, res)) return;

                const vehicleId = pathname.split('/')[3];
                const vehicle = MOCK_VEHICLES.find(v => v.vehicleId === vehicleId);
                
                if (!vehicle) {
                    res.writeHead(404);
                    res.end(JSON.stringify({
                        error: 'Vehicle not found',
                        vehicleId,
                    }));
                    return;
                }

                // Calculate upcoming maintenance
                const nextKmGap = vehicle.nextMaintenanceKm - vehicle.currentMileage;
                const nextDateGap = new Date(vehicle.nextMaintenanceDate) - new Date();
                const upcoming = (nextKmGap <= 3000) || (nextDateGap <= 30 * 24 * 60 * 60 * 1000);

                // Get related data
                const recentMaintenance = MOCK_MAINTENANCE_LOGS[vehicleId] || [];
                const partsRecs = MOCK_PARTS_RECOMMENDATIONS[vehicleId] || [];
                const servicePoints = MOCK_SERVICE_POINTS[vehicleId] || [];

                // Calculate last 30 days
                const now = new Date();
                const last30DaysMs = 30 * 24 * 60 * 60 * 1000;
                const last30Date = new Date(now.getTime() - last30DaysMs);

                // Filter MOCK_COSTS for last 30 days
                const costBreakdown = (MOCK_COSTS[vehicleId] || [])
                  .filter(c => new Date(c.date) >= last30Date)
                  .map(c => ({
                    date: c.date,
                    category: c.category,
                    amount: c.amount,
                    source: c.source || 'System'
                  }));

                // Filter MOCK_COST_LEDGER for this vehicle and last 30 days
                const ledgerCosts = MOCK_COST_LEDGER
                  .filter(c => c.vehicleId === vehicleId && new Date(c.date) >= last30Date)
                  .map(lc => ({
                    date: lc.date,
                    category: lc.category,
                    amount: lc.amount,
                    source: lc.source
                  }));

                // Combine all costs (MOCK_COSTS + MOCK_COST_LEDGER)
                const allCosts = [...costBreakdown, ...ledgerCosts];

                // Calculate last 30 days total cost
                const last30DaysTotal = allCosts.reduce((sum, c) => sum + c.amount, 0);

                // Build risk summary (simplified)
                const riskFlags = [];
                if (vehicle.riskScore > 60) riskFlags.push('High Risk Score');
                if (vehicle.status === 'MAINTENANCE') riskFlags.push('Under Maintenance');
                if (vehicle.status === 'OUT_OF_SERVICE') riskFlags.push('Out of Service');

                // Build category-wise breakdown
                const categoryBreakdown = {
                  maintenance: 0,
                  insurance: 0,
                  fuel: 0,
                  other: 0
                };
                
                allCosts.forEach(cost => {
                  const cat = cost.category?.toLowerCase() || 'other';
                  if (cat === 'maintenance') categoryBreakdown.maintenance += cost.amount;
                  else if (cat === 'insurance') categoryBreakdown.insurance += cost.amount;
                  else if (cat === 'fuel') categoryBreakdown.fuel += cost.amount;
                  else categoryBreakdown.other += cost.amount;
                });

                const summary = {
                    vehicleId: vehicle.vehicleId,
                    vin: vehicle.vin,
                    plateNumber: vehicle.plateNumber,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    year: vehicle.year,
                    status: vehicle.status,
                    currentMileage: vehicle.currentMileage,
                    
                    risk: {
                        score: vehicle.riskScore || 0,
                        flags: riskFlags,
                    },
                    
                    maintenance: {
                        nextMaintenanceKm: vehicle.nextMaintenanceKm,
                        nextMaintenanceDate: vehicle.nextMaintenanceDate,
                        upcoming,
                        recent: recentMaintenance.slice(0, 3),
                    },
                    
                    costs: {
                        last30DaysTotal,
                        breakdown: categoryBreakdown,
                        items: allCosts,
                    },
                    
                    parts: {
                        recommendedOffersCount: partsRecs.length,
                        topParts: partsRecs.slice(0, 3),
                    },
                    
                    service: {
                        recommendedServicePoints: servicePoints.slice(0, 3),
                    },
                };

                res.writeHead(200);
                res.end(JSON.stringify(summary));
                return;
            }

            // ===== V2.2 Fleet Policy =====
            // GET /api/fleet/:fleetId/policy
            else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+\/policy$/)) {
                if (!checkTenant(req, res)) return;

                const fleetId = pathname.split('/')[3];
                const policy = MOCK_FLEET_POLICIES[fleetId] || {
                    fleetId,
                    autoSetServicedOnRedirect: false,
                };

                res.writeHead(200);
                res.end(JSON.stringify(policy));
                return;
            }

            // PATCH /api/fleet/:fleetId/policy
            else if (req.method === 'PATCH' && pathname.match(/^\/api\/fleet\/[^/]+\/policy$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({
                        error: 'Forbidden: Viewer role cannot modify fleet policy',
                    }));
                    return;
                }

                const fleetId = pathname.split('/')[3];
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        MOCK_FLEET_POLICIES[fleetId] = {
                            fleetId,
                            autoSetServicedOnRedirect: payload.autoSetServicedOnRedirect !== undefined ? payload.autoSetServicedOnRedirect : (MOCK_FLEET_POLICIES[fleetId]?.autoSetServicedOnRedirect || false),
                            costApplyMode: payload.costApplyMode || (MOCK_FLEET_POLICIES[fleetId]?.costApplyMode || 'OnClose'), // V2.4
                        };

                        res.writeHead(200);
                        res.end(JSON.stringify(MOCK_FLEET_POLICIES[fleetId]));
                    } catch (e) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Invalid request body' }));
                    }
                });
                return;
            }

            // ===== V2.2 Service Redirects =====
            // GET /api/vehicle/:vehicleId/service-redirects
            else if (req.method === 'GET' && pathname.match(/^\/api\/vehicle\/[^/]+\/service-redirects$/)) {
                if (!checkTenant(req, res)) return;

                const vehicleId = pathname.split('/')[3];
                const redirects = MOCK_SERVICE_REDIRECTS.filter(sr => sr.vehicleId === vehicleId);

                res.writeHead(200);
                res.end(JSON.stringify(redirects));
                return;
            }

            // POST /api/vehicle/:vehicleId/service-redirects (V2.5 - supports RoutineMaintenance & BreakdownIncident)
            else if (req.method === 'POST' && pathname.match(/^\/api\/vehicle\/[^/]+\/service-redirects$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({
                        error: 'Forbidden: Viewer role cannot create service redirects',
                    }));
                    return;
                }

                const vehicleId = pathname.split('/')[3];
                const vehicle = MOCK_VEHICLES.find(v => v.vehicleId === vehicleId);
                
                if (!vehicle) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: `Vehicle not found: ${vehicleId}` }));
                    return;
                }

                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        const { servicePointId, redirectType, reason, applyStatusChange, trigger, incident } = payload;

                        // V2.5 Validation
                        if (!redirectType || !['RoutineMaintenance', 'BreakdownIncident'].includes(redirectType)) {
                            res.writeHead(400);
                            res.end(JSON.stringify({ error: 'redirectType must be RoutineMaintenance or BreakdownIncident' }));
                            return;
                        }

                        if (redirectType === 'BreakdownIncident') {
                            if (!incident || !incident.symptom || !incident.severity) {
                                res.writeHead(400);
                                res.end(JSON.stringify({ error: 'BreakdownIncident requires incident with symptom and severity' }));
                                return;
                            }
                        }

                        // Find service point
                        const servicePointsList = MOCK_SERVICE_POINTS[vehicleId] || [];
                        const servicePoint = servicePointsList.find(sp => sp.servicePointId === servicePointId);

                        if (!servicePoint) {
                            res.writeHead(404);
                            res.end(JSON.stringify({ error: 'Service point not found' }));
                            return;
                        }

                        // Generate redirect ID
                        const redirectId = 'SR-' + Math.random().toString(36).substr(2, 9);

                        // Determine if status should change
                        const fleetPolicy = MOCK_FLEET_POLICIES[vehicle.fleetId] || {
                            autoSetServicedOnRedirect: false,
                        };
                        const shouldChangeStatus = applyStatusChange !== undefined 
                            ? applyStatusChange 
                            : fleetPolicy.autoSetServicedOnRedirect;

                        // Create redirect (V2.5 schema)
                        const redirect = {
                            redirectId,
                            vehicleId: vehicle.vehicleId,
                            fleetId: vehicle.fleetId,
                            vin: vehicle.vin,
                            plateNumber: vehicle.plateNumber,
                            servicePointId: servicePoint.servicePointId,
                            servicePointName: servicePoint.name,
                            servicePointType: servicePoint.type || 'Partner',
                            city: servicePoint.city,
                            reason,
                            redirectType, // V2.5: RoutineMaintenance | BreakdownIncident
                            trigger: trigger || null, // V2.5: For RoutineMaintenance
                            incident: incident || null, // V2.5: For BreakdownIncident
                            createdBy: req.headers['x-user'] || 'ops',
                            createdAt: new Date().toISOString(),
                            applyStatusChange: shouldChangeStatus,
                            newStatus: shouldChangeStatus ? 'Serviced' : undefined,
                        };

                        // Add to redirects list
                        MOCK_SERVICE_REDIRECTS.push(redirect);

                        // V2.6 - Create ServiceAppointment from redirect
                        const appointmentId = 'APT-' + Math.random().toString(36).substr(2, 9);
                        const appointment = {
                            appointmentId,
                            tenantFleetId: vehicle.fleetId,
                            source: 'FleetRental',
                            sourceRefId: redirectId,
                            vehicleId: vehicle.vehicleId,
                            vin: vehicle.vin,
                            plateNumber: vehicle.plateNumber,
                            servicePointId: servicePoint.servicePointId,
                            servicePointName: servicePoint.name,
                            appointmentType: redirectType === 'RoutineMaintenance' ? 'Routine' : 'Breakdown',
                            scheduledAt: trigger?.dueDateAtRedirect || null,
                            arrivalMode: 'Appointment',
                            status: 'Scheduled',
                            tags: [],
                            createdAt: new Date().toISOString(),
                        };

                        MOCK_SERVICE_APPOINTMENTS.push(appointment);
                        savePersistentState('appointments', MOCK_SERVICE_APPOINTMENTS);  // V2.6 - PERSIST

                        // Update vehicle status if needed
                        if (shouldChangeStatus) {
                            vehicle.status = 'Serviced';
                        }

                        res.writeHead(200);
                        res.end(JSON.stringify({
                            redirectId: redirect.redirectId,
                            appointmentId: appointment.appointmentId, // V2.6 - Return appointment ID
                            redirect,
                            appointment, // V2.6 - Return appointment object
                            updatedVehicle: {
                              vehicleId: vehicle.vehicleId,
                              status: vehicle.status,
                              applyStatusChange: shouldChangeStatus,
                            },
                        }));
                    } catch (e) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Invalid request body', details: e.message }));
                    }
                });
                return;
            }

            // ===== V2.3 Work Orders =====
            // POST /api/service-redirects/:redirectId/create-workorder
            else if (req.method === 'POST' && pathname.match(/^\/api\/service-redirects\/[^/]+\/create-workorder$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({
                        error: 'Forbidden: Viewer role cannot create work orders',
                    }));
                    return;
                }

                const redirectId = pathname.split('/')[3];
                const redirect = MOCK_SERVICE_REDIRECTS.find(r => r.redirectId === redirectId);

                if (!redirect) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Service redirect not found' }));
                    return;
                }

                if (redirect.workOrderId) {
                    res.writeHead(409);
                    res.end(JSON.stringify({ error: 'Work order already exists for this redirect' }));
                    return;
                }

                // Generate work order ID
                const workOrderId = 'WO-' + Math.random().toString(36).substr(2, 9);

                // V2.5 - Map redirectType to workOrderType
                const workOrderType = redirect.redirectType === 'RoutineMaintenance' ? 'Routine' : 'Breakdown';

                // Create work order
                const workOrder = {
                    workOrderId,
                    vehicleId: redirect.vehicleId,
                    fleetId: redirect.fleetId,
                    servicePointId: redirect.servicePointId,
                    source: 'FleetRedirect',
                    status: 'INTAKE_PENDING',
                    createdAt: new Date().toISOString(),
                    // V2.5
                    workOrderType,
                    relatedRedirectId: redirectId,
                    lineItems: [],
                    plannedTotal: 0,
                    extraTotal: 0,
                    totalAmount: 0,
                    currency: 'TRY',
                    costApplied: false,
                    approval: {
                        status: 'NotRequested',
                    },
                };

                // Link redirect to work order
                redirect.workOrderId = workOrderId;

                // Add to work orders list
                MOCK_WORK_ORDERS.push(workOrder);

                res.writeHead(200);
                res.end(JSON.stringify({
                    workOrderId,
                    status: 'INTAKE_PENDING',
                    workOrderType, // V2.5
                    approval: workOrder.approval, // V2.5
                }));
                return;
            }

            // GET /api/workorders?fleetId=FLEET-001
            else if (req.method === 'GET' && pathname === '/api/workorders') {
                if (!checkTenant(req, res)) return;

                const urlObj = url.parse(req.url, true);
                const fleetId = urlObj.query.fleetId;
                const tenantId = req.headers['x-tenant-id'];

                console.log('[GET /api/workorders] tenantId:', tenantId, '| fleetId:', fleetId, '| MOCK_WORK_ORDERS.length:', MOCK_WORK_ORDERS.length);

                // V2.7 - Filter by tenantId (request header) + optional fleetId
                let orders = MOCK_WORK_ORDERS.filter(wo => 
                    wo.tenantId === tenantId && (!fleetId || wo.fleetId === fleetId)
                );

                // If no workOrders found, derive from accepted appointments (rehydrate)
                if (orders.length === 0) {
                    console.log('[GET /api/workorders] Rehydrating from appointments... total appointments:', MOCK_SERVICE_APPOINTMENTS.length);
                    const acceptedAppointments = MOCK_SERVICE_APPOINTMENTS.filter(apt => 
                        apt.status === 'Accepted' && apt.workOrderId
                        // Note: Not filtering by tenantId here - rehydrate all accepted appointments regardless of tenant
                        // to ensure WorkOrders persist across restarts
                    );
                    console.log('[GET /api/workorders] Found', acceptedAppointments.length, 'accepted appointments to rehydrate');

                    orders = acceptedAppointments.map(apt => ({
                        workOrderId: apt.workOrderId,
                        id: apt.workOrderId,
                        tenantId: tenantId, // V2.7 - Use request tenant (e.g., LENT-CORP-DEMO)
                        customerTenantId: apt.tenantFleetId, // V2.7 - Track original customer fleet
                        vehicleId: apt.vehicleId,
                        fleetId: apt.tenantFleetId,
                        vin: apt.vin,
                        plateNumber: apt.plateNumber,
                        servicePointId: apt.servicePointId,
                        servicePointName: apt.servicePointName,
                        source: 'ServiceAppointment',
                        sourceAppointmentId: apt.appointmentId,
                        status: 'INTAKE_PENDING',
                        createdAt: apt.acceptedAt || apt.updatedAt || new Date().toISOString(),
                        updatedAt: apt.acceptedAt || apt.updatedAt || new Date().toISOString(),
                        operationalHash: apt.appointmentId || 'WO-' + Math.random().toString(36).substr(2, 9),
                        sourceEventId: apt.appointmentId,
                        intakeChecklist: [],
                        diagnosisItems: [],
                        operationalDetails: {
                            customerName: 'Müşteri',
                            customerPhone: '---',
                            plate: apt.plateNumber || '---',
                            mileage: 0,
                        },
                        lineItems: [],
                        totalAmount: 0,
                        costApplied: false,
                        workOrderType: apt.workOrderType || apt.appointmentType || 'Routine',
                        plannedTotal: 0,
                        extraTotal: 0,
                        approval: { status: 'NotRequested' },
                        origin: {
                            channel: apt.source,
                            arrivalMode: apt.arrivalMode,
                        },
                    }));

                    // Apply fleetId filter if specified
                    if (fleetId) {
                        orders = orders.filter(o => o.fleetId === fleetId);
                    }

                    // Cache the rehydrated list
                    MOCK_WORK_ORDERS = orders;
                    console.log('[GET /api/workorders] Rehydrated', orders.length, 'workorders');
                }

                res.writeHead(200);
                res.end(JSON.stringify(orders));
                return;
            }

            // ===== V2.4 Work Order Cost Management =====
            // GET /api/workorders/:id
            else if (req.method === 'GET' && pathname.match(/^\/api\/workorders\/[^/]+$/)) {
                if (!checkTenant(req, res)) return;

                const workOrderId = pathname.split('/')[3];
                const workOrder = MOCK_WORK_ORDERS.find(wo => wo.workOrderId === workOrderId);

                if (!workOrder) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Work order not found' }));
                    return;
                }

                res.writeHead(200);
                res.end(JSON.stringify(workOrder));
                return;
            }

            // PATCH /api/workorders/:id (update status, etc.)
            else if (req.method === 'PATCH' && pathname.match(/^\/api\/workorders\/[^/]+$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'Forbidden: Viewer cannot modify work orders' }));
                    return;
                }

                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        const workOrderId = pathname.split('/')[3];
                        const workOrder = MOCK_WORK_ORDERS.find(wo => wo.workOrderId === workOrderId);

                        if (!workOrder) {
                            res.writeHead(404);
                            res.end(JSON.stringify({ error: 'Work order not found' }));
                            return;
                        }

                        // Update status if provided
                        if (payload.status && ['INTAKE_PENDING', 'DIAGNOSIS', 'OFFER_DRAFT', 'WAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'READY_FOR_DELIVERY', 'DELIVERED'].includes(payload.status)) {
                            const wasApplied = workOrder.costApplied || false;
                            
                            // V2.6: Cost Chain - Apply cost when transitioning to Delivery
                            if (!wasApplied && payload.costApplied === true && ['READY_FOR_DELIVERY', 'DELIVERED'].includes(payload.status)) {
                                const total = (workOrder.plannedTotal || 0) + (workOrder.extraTotal || 0);
                                if (total > 0) {
                                    // Create VehicleCost record
                                    const costId = 'COST-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                                    MOCK_COST_LEDGER.push({
                                        costId,
                                        vehicleId: workOrder.vehicleId,
                                        fleetId: workOrder.fleetId,
                                        category: 'Maintenance',
                                        amount: total,
                                        currency: workOrder.currency || 'TRY',
                                        date: new Date().toISOString(),
                                        source: 'WorkOrder',
                                        sourceRefId: workOrderId,
                                        notes: `Maintenance cost from WorkOrder ${workOrderId}`,
                                        createdAt: new Date().toISOString(),
                                    });
                                    workOrder.costApplied = true;
                                    workOrder.totalAmount = total;
                                    console.log(`[CostChain] Created cost record: ${costId} | WorkOrder: ${workOrderId} | Amount: ${total} ${workOrder.currency || 'TRY'}`);
                                    
                                    // Save cost ledger
                                    savePersistentState('costLedger', MOCK_COST_LEDGER);
                                }
                            }

                            workOrder.status = payload.status;

                            // V2.4/V2.5: If closing and policy.costApplyMode === 'OnClose', auto-apply cost
                            if (payload.status === 'Closed') {
                                const policy = MOCK_FLEET_POLICIES[workOrder.fleetId];
                                if (policy && policy.costApplyMode === 'OnClose' && !workOrder.costApplied) {
                                    // V2.5 - Calculate amount based on approval
                                    let costAmount = workOrder.plannedTotal || 0;
                                    if (workOrder.workOrderType === 'Routine' && workOrder.approval?.approvedExtraTotal !== undefined) {
                                        costAmount += workOrder.approval.approvedExtraTotal;
                                    } else if (workOrder.workOrderType === 'Breakdown' && workOrder.approval?.approvedExtraTotal !== undefined) {
                                        costAmount = workOrder.approval.approvedExtraTotal;
                                    }

                                    // Auto-apply cost
                                    const costId = 'CL-' + Math.random().toString(36).substr(2, 9);
                                    MOCK_COST_LEDGER.push({
                                        costId,
                                        vehicleId: workOrder.vehicleId,
                                        fleetId: workOrder.fleetId,
                                        category: 'Maintenance',
                                        amount: costAmount,
                                        currency: workOrder.currency || 'TRY',
                                        date: new Date().toISOString(),
                                        source: 'WorkOrder',
                                        sourceRefId: workOrderId,
                                        notes: `Cost from Work Order ${workOrderId}`,
                                        createdAt: new Date().toISOString(),
                                    });
                                    workOrder.costApplied = true;
                                }
                            }
                        }

                        savePersistentState('workorders', MOCK_WORK_ORDERS);  // V2.6 - PERSIST workorders after update

                        res.writeHead(200);
                        res.end(JSON.stringify(workOrder));
                    } catch (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Invalid request body' }));
                    }
                });
                return;
            }

            // POST /api/workorders/:id/line-items (add line items)
            else if (req.method === 'POST' && pathname.match(/^\/api\/workorders\/[^/]+\/line-items$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'Forbidden: Viewer cannot add line items' }));
                    return;
                }

                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body);
                        const workOrderId = pathname.split('/')[3];
                        const workOrder = MOCK_WORK_ORDERS.find(wo => wo.workOrderId === workOrderId);

                        if (!workOrder) {
                            res.writeHead(404);
                            res.end(JSON.stringify({ error: 'Work order not found' }));
                            return;
                        }

                        // Initialize lineItems if needed
                        if (!workOrder.lineItems) {
                            workOrder.lineItems = [];
                        }

                        // Create new line item (V2.5 - include scope)
                        const lineItem = {
                            lineId: 'LI-' + Math.random().toString(36).substr(2, 9),
                            type: payload.type, // 'Labor' or 'Part'
                            description: payload.description,
                            qty: payload.qty || 1,
                            unitPrice: payload.unitPrice || 0,
                            currency: payload.currency || 'TRY',
                            scope: payload.scope || 'Planned', // V2.5 - Default 'Planned'
                        };

                        workOrder.lineItems.push(lineItem);

                        // V2.5 - Recalculate plannedTotal and extraTotal
                        workOrder.plannedTotal = workOrder.lineItems
                            .filter(li => li.scope === 'Planned')
                            .reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
                        workOrder.extraTotal = workOrder.lineItems
                            .filter(li => li.scope === 'Extra')
                            .reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
                        workOrder.totalAmount = workOrder.plannedTotal + workOrder.extraTotal;
                        workOrder.currency = payload.currency || 'TRY';

                        savePersistentState('workorders', MOCK_WORK_ORDERS);  // V2.6 - PERSIST workorders after adding line item

                        res.writeHead(200);
                        res.end(JSON.stringify({
                            lineId: lineItem.lineId,
                            totalAmount: workOrder.totalAmount,
                            plannedTotal: workOrder.plannedTotal, // V2.5
                            extraTotal: workOrder.extraTotal, // V2.5
                        }));
                    } catch (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Invalid request body' }));
                    }
                });
                return;
            }

            // ===== V2.5 APPROVAL WORKFLOW =====

            // POST /api/workorders/:id/request-approval
            else if (req.method === 'POST' && pathname.match(/^\/api\/workorders\/[^/]+\/request-approval$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'Forbidden: Viewer cannot request approval' }));
                    return;
                }

                const workOrderId = pathname.split('/')[3];
                const workOrder = MOCK_WORK_ORDERS.find(wo => wo.workOrderId === workOrderId);

                if (!workOrder) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Work order not found' }));
                    return;
                }

                // Update approval status
                workOrder.approval = workOrder.approval || { status: 'NotRequested' };
                workOrder.approval.status = 'Requested';
                workOrder.approval.requestedAt = new Date().toISOString();
                workOrder.approval.requestedBy = req.headers['x-role']; // simplified, should be user ID

                savePersistentState('workorders', MOCK_WORK_ORDERS);  // V2.6 - PERSIST workorders after requesting approval

                res.writeHead(200);
                res.end(JSON.stringify({
                    message: 'Approval requested',
                    approval: workOrder.approval,
                }));
                return;
            }

            // POST /api/workorders/:id/approve
            else if (req.method === 'POST' && pathname.match(/^\/api\/workorders\/[^/]+\/approve$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'Forbidden: Viewer cannot approve' }));
                    return;
                }

                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body || '{}');
                        const workOrderId = pathname.split('/')[3];
                        const workOrder = MOCK_WORK_ORDERS.find(wo => wo.workOrderId === workOrderId);

                        if (!workOrder) {
                            res.writeHead(404);
                            res.end(JSON.stringify({ error: 'Work order not found' }));
                            return;
                        }

                        // V2.5 - Approval logic based on workOrderType
                        if (workOrder.workOrderType === 'Routine') {
                            // For Routine: if extraTotal > 0, must specify approvedExtraTotal
                            if (workOrder.extraTotal && workOrder.extraTotal > 0) {
                                if (payload.approvedExtraTotal === undefined) {
                                    res.writeHead(400);
                                    res.end(JSON.stringify({
                                        error: 'approvedExtraTotal required for Routine with extras',
                                    }));
                                    return;
                                }
                                if (payload.approvedExtraTotal < 0 || payload.approvedExtraTotal > workOrder.extraTotal) {
                                    res.writeHead(400);
                                    res.end(JSON.stringify({
                                        error: 'approvedExtraTotal must be between 0 and extraTotal',
                                    }));
                                    return;
                                }
                                workOrder.approval.approvedExtraTotal = payload.approvedExtraTotal;
                            }
                        } else if (workOrder.workOrderType === 'Breakdown') {
                            // For Breakdown: approvedExtraTotal defaults to totalAmount
                            workOrder.approval.approvedExtraTotal = payload.approvedExtraTotal || workOrder.totalAmount;
                        }

                        workOrder.approval.status = 'Approved';
                        workOrder.approval.approvedAt = new Date().toISOString();
                        workOrder.approval.approvedBy = req.headers['x-role'];
                        workOrder.approval.note = payload.note;

                        savePersistentState('workorders', MOCK_WORK_ORDERS);  // V2.6 - PERSIST workorders after approval

                        res.writeHead(200);
                        res.end(JSON.stringify({
                            message: 'Approved',
                            approval: workOrder.approval,
                        }));
                    } catch (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Invalid request body' }));
                    }
                });
                return;
            }

            // POST /api/workorders/:id/reject
            else if (req.method === 'POST' && pathname.match(/^\/api\/workorders\/[^/]+\/reject$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'Forbidden: Viewer cannot reject' }));
                    return;
                }

                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body || '{}');
                        const workOrderId = pathname.split('/')[3];
                        const workOrder = MOCK_WORK_ORDERS.find(wo => wo.workOrderId === workOrderId);

                        if (!workOrder) {
                            res.writeHead(404);
                            res.end(JSON.stringify({ error: 'Work order not found' }));
                            return;
                        }

                        if (!payload.note) {
                            res.writeHead(400);
                            res.end(JSON.stringify({ error: 'Rejection note required' }));
                            return;
                        }

                        workOrder.approval.status = 'Rejected';
                        workOrder.approval.rejectedAt = new Date().toISOString();
                        workOrder.approval.rejectedBy = req.headers['x-role'];
                        workOrder.approval.note = payload.note;

                        savePersistentState('workorders', MOCK_WORK_ORDERS);  // V2.6 - PERSIST workorders after rejection

                        res.writeHead(200);
                        res.end(JSON.stringify({
                            message: 'Rejected',
                            approval: workOrder.approval,
                        }));
                    } catch (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Invalid request body' }));
                    }
                });
                return;
            }

            // POST /api/workorders/:id/apply-cost (apply cost to ledger - V2.5)
            else if (req.method === 'POST' && pathname.match(/^\/api\/workorders\/[^/]+\/apply-cost$/)) {
                if (!checkTenant(req, res)) return;

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'Forbidden: Viewer cannot apply costs' }));
                    return;
                }

                const workOrderId = pathname.split('/')[3];
                const workOrder = MOCK_WORK_ORDERS.find(wo => wo.workOrderId === workOrderId);

                if (!workOrder) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Work order not found' }));
                    return;
                }

                // V2.5 - Check cost already applied
                if (workOrder.costApplied) {
                    res.writeHead(409);
                    res.end(JSON.stringify({ error: 'Cost already applied for this work order' }));
                    return;
                }

                // V2.5 - Check closed status (409 Conflict instead of 400)
                if (workOrder.status !== 'Closed') {
                    res.writeHead(409);
                    res.end(JSON.stringify({ error: 'WorkOrder must be Closed before applying cost' }));
                    return;
                }

                // V2.5 - Check approval requirements
                if (workOrder.workOrderType === 'Breakdown' && workOrder.approval?.status !== 'Approved') {
                    res.writeHead(409);
                    res.end(JSON.stringify({ error: 'Breakdown requires approval before applying cost' }));
                    return;
                }

                if (workOrder.workOrderType === 'Routine' && workOrder.extraTotal > 0 && workOrder.approval?.status !== 'Approved') {
                    res.writeHead(409);
                    res.end(JSON.stringify({ error: 'Routine with extras requires approval before applying cost' }));
                    return;
                }

                // Calculate cost amount based on workOrderType and approval
                let costAmount = 0;
                if (workOrder.workOrderType === 'Routine') {
                    costAmount = workOrder.plannedTotal || 0;
                    if (workOrder.extraTotal > 0 && workOrder.approval?.approvedExtraTotal !== undefined) {
                        costAmount += workOrder.approval.approvedExtraTotal;
                    }
                } else if (workOrder.workOrderType === 'Breakdown') {
                    // For Breakdown, use approvedExtraTotal if available, else totalAmount
                    if (workOrder.approval?.approvedExtraTotal !== undefined) {
                        costAmount = workOrder.approval.approvedExtraTotal;
                    } else {
                        costAmount = workOrder.totalAmount || 0;
                    }
                }

                // Check if there's actually a cost to apply
                if (costAmount <= 0) {
                    res.writeHead(409);
                    res.end(JSON.stringify({ error: 'No cost to apply (totalAmount is 0 or negative)' }));
                    return;
                }

                // Create cost ledger entry
                const costId = 'CL-' + Math.random().toString(36).substr(2, 9);
                MOCK_COST_LEDGER.push({
                    costId,
                    vehicleId: workOrder.vehicleId,
                    fleetId: workOrder.fleetId,
                    category: 'Maintenance',
                    amount: costAmount,
                    currency: workOrder.currency || 'TRY',
                    date: new Date().toISOString(),
                    source: 'WorkOrder',
                    sourceRefId: workOrderId,
                    notes: `Cost from Work Order ${workOrderId}`,
                    createdAt: new Date().toISOString(),
                });

                workOrder.costApplied = true;

                res.writeHead(200);
                res.end(JSON.stringify({
                    costId,
                    amount: costAmount,
                    message: 'Cost applied successfully'
                }));
                return;
            }

            // ===== V2.6 MAINTENANCE ENDPOINTS =====
            // GET /api/maintenance/appointments (list appointments with status filter)
            else if (req.method === 'GET' && pathname.match(/^\/api\/maintenance\/appointments/)) {
                if (!checkTenant(req, res)) return;

                // V2.6 - x-module header check for Maintenance module
                const module = req.headers['x-module'];
                if (module !== 'Maintenance') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'This endpoint is for Maintenance module only (x-module: Maintenance)' }));
                    return;
                }

                // Parse status filter ?status=Scheduled|Arrived|Accepted
                const parsedUrl = new URL(`http://${req.headers.host}${req.url}`);
                const statusFilter = parsedUrl.searchParams.get('status');
                
                // Default: Scheduled + Arrived
                const defaultStatuses = ['Scheduled', 'Arrived'];
                const allowedStatuses = statusFilter 
                    ? statusFilter.split('|').filter(s => ['Scheduled', 'Arrived', 'Accepted', 'Cancelled'].includes(s))
                    : defaultStatuses;

                const filtered = MOCK_SERVICE_APPOINTMENTS.filter(apt => 
                    allowedStatuses.includes(apt.status)
                );

                res.writeHead(200);
                res.end(JSON.stringify({
                    appointments: filtered,
                    count: filtered.length,
                    filter: { status: allowedStatuses }
                }));
                return;
            }

            // POST /api/maintenance/appointments/:appointmentId/accept (Araç Kabul -> WorkOrder)
            else if (req.method === 'POST' && pathname.match(/^\/api\/maintenance\/appointments\/[^/]+\/accept$/)) {
                if (!checkTenant(req, res)) return;

                // V2.6 - x-module header check
                const module = req.headers['x-module'];
                if (module !== 'Maintenance') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'This endpoint is for Maintenance module only' }));
                    return;
                }

                const role = req.headers['x-role'];
                if (role === 'viewer') {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'Forbidden: Viewer cannot accept appointments' }));
                    return;
                }

                const appointmentId = pathname.split('/')[4];
                const appointment = MOCK_SERVICE_APPOINTMENTS.find(apt => apt.appointmentId === appointmentId);

                if (!appointment) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Appointment not found' }));
                    return;
                }

                // Change appointment status to Accepted
                appointment.status = 'Accepted';
                savePersistentState('appointments', MOCK_SERVICE_APPOINTMENTS);  // V2.6 - PERSIST appointments

                // Create WorkOrder from appointment (V2.6 - ServiceAppointment source)
                const workOrderId = 'WO-' + Math.random().toString(36).substr(2, 9);
                const requestTenantId = req.headers['x-tenant-id'] || 'LENT-CORP-DEMO';
                const workOrder = {
                    workOrderId,
                    tenantId: requestTenantId, // V2.7 - Use request header tenant (LENT-CORP-DEMO for Maintenance)
                    vehicleId: appointment.vehicleId,
                    fleetId: appointment.tenantFleetId, // Customer tenant (FLEET-001)
                    customerTenantId: appointment.tenantFleetId, // V2.7 - Track original fleet tenant
                    vin: appointment.vin,
                    plateNumber: appointment.plateNumber,
                    servicePointId: appointment.servicePointId,
                    servicePointName: appointment.servicePointName,
                    source: 'ServiceAppointment', // V2.6 - NEW
                    sourceAppointmentId: appointmentId, // V2.6 - NEW
                    status: 'INTAKE_PENDING',
                    createdAt: new Date().toISOString(),
                    lineItems: [],
                    totalAmount: 0,
                    costApplied: false,
                    workOrderType: appointment.appointmentType, // Routine or Breakdown
                    plannedTotal: 0,
                    extraTotal: 0,
                    approval: {
                        status: 'NotRequested',
                    },
                    // V2.6 - Origin information
                    origin: {
                        channel: appointment.source, // FleetRental, Individual, Dealer
                        arrivalMode: appointment.arrivalMode, // Appointment, WalkIn
                    },
                };

                MOCK_WORK_ORDERS.push(workOrder);
                savePersistentState('workorders', MOCK_WORK_ORDERS);  // V2.6 - PERSIST workorders

                // Link appointment back to workOrder + persist full appointment data
                appointment.status = 'Accepted';
                appointment.workOrderId = workOrderId;
                appointment.acceptedAt = new Date().toISOString();
                appointment.workOrderType = appointment.appointmentType; // For rehydration
                appointment.updatedAt = new Date().toISOString();
                savePersistentState('appointments', MOCK_SERVICE_APPOINTMENTS);  // V2.6 - PERSIST updated appointment

                res.writeHead(200);
                res.end(JSON.stringify({
                    message: 'Appointment accepted and work order created',
                    workOrderId: workOrder.workOrderId,
                    workOrder,
                }));
                return;
            }

            // ===== 404 =====
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
    console.log('   GET  /api/oem-mapping?oemPartNumber=...');
    console.log('   ');
    console.log('   [Fleet Rental V1]');
    console.log('   GET  /api/fleet (Header: x-tenant-id)');
    console.log('   GET  /api/fleet/:fleetId/vehicles (Header: x-tenant-id)');
    console.log('   GET  /api/fleet/:fleetId/contracts (Header: x-tenant-id)');
    console.log('   POST /api/fleet/:fleetId/contracts (Header: x-tenant-id)\n');
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
