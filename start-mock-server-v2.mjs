#!/usr/bin/env node

/**
 * Mock Server v2 - Full Stack (ES Module)
 * Includes: Suppliers + Offers + Fleet Rental
 * Run: npm run dev:mock-server
 */

import http from 'http';
import url from 'url';

const PORT = 3001;

// ===== FLEET RENTAL SEED DATA (Inline) =====

const MOCK_FLEETS = [
  { fleetId: 'FLEET-001', name: 'Marmara Filo', taxNumber: '1234567890', address: 'İstanbul, Beyoğlu, Şişli Cad. No:45', contactPerson: 'Ahmet Yılmaz', contactPhone: '+90-212-555-1001', createdAt: '2023-01-15T10:00:00Z', updatedAt: '2026-02-20T14:30:00Z' },
  { fleetId: 'FLEET-002', name: 'Anadolu Teknoloji', taxNumber: '1234567891', address: 'Ankara, Çankaya, Turan Güneş Bulvarı No:120', contactPerson: 'Fatih Kaya', contactPhone: '+90-312-555-2002', createdAt: '2023-02-10T10:00:00Z', updatedAt: '2026-02-22T09:15:00Z' },
  { fleetId: 'FLEET-003', name: 'Ege Sales & Logistics', taxNumber: '1234567892', address: 'İzmir, Konak, Alsancak Cad. No:88', contactPerson: 'Zeynep Arslan', contactPhone: '+90-232-555-3003', createdAt: '2023-03-05T10:00:00Z', updatedAt: '2026-02-21T16:45:00Z' },
];

const MOCK_VEHICLES = [
  { vehicleId: 'VEH-001-001', fleetId: 'FLEET-001', plateNumber: '34 MR 001', brand: 'Hyundai', model: 'i10', year: 2021, vin: 'KMHEC4A46BU123401', currentMileage: 45200, status: 'ACTIVE', nextMaintenanceKm: 47000, nextMaintenanceDate: '2026-03-10' },
  { vehicleId: 'VEH-001-002', fleetId: 'FLEET-001', plateNumber: '34 MR 002', brand: 'Ford', model: 'Focus', year: 2020, vin: 'WF0UXXWPDC8P12345', currentMileage: 78500, status: 'MAINTENANCE', nextMaintenanceKm: 80000, nextMaintenanceDate: '2026-02-28' },
  { vehicleId: 'VEH-001-003', fleetId: 'FLEET-001', plateNumber: '34 MR 003', brand: 'Volkswagen', model: 'Passat', year: 2019, vin: 'WVW33C3DZ9E054321', currentMileage: 125300, status: 'ACTIVE', nextMaintenanceKm: 130000, nextMaintenanceDate: '2026-04-15' },
  { vehicleId: 'VEH-001-004', fleetId: 'FLEET-001', plateNumber: '34 MR 004', brand: 'Renault', model: 'Clio', year: 2022, vin: 'VF19R7GFPA1234567', currentMileage: 32100, status: 'ACTIVE', nextMaintenanceKm: 35000, nextMaintenanceDate: '2026-03-25' },
  { vehicleId: 'VEH-001-005', fleetId: 'FLEET-001', plateNumber: '34 MR 005', brand: 'Mercedes-Benz', model: 'Sprinter', year: 2018, vin: 'WDB9050151V123456', currentMileage: 198700, status: 'ACTIVE', nextMaintenanceKm: 200000, nextMaintenanceDate: '2026-03-01' },
  { vehicleId: 'VEH-002-001', fleetId: 'FLEET-002', plateNumber: '06 AN 001', brand: 'Toyota', model: 'Corolla', year: 2022, vin: 'JTDKRFVE7M3065432', currentMileage: 28900, status: 'ACTIVE', nextMaintenanceKm: 32000, nextMaintenanceDate: '2026-04-10' },
  { vehicleId: 'VEH-002-002', fleetId: 'FLEET-002', plateNumber: '06 AN 002', brand: 'Kia', model: 'Sportage', year: 2021, vin: 'KNALN4D46M5789012', currentMileage: 52400, status: 'ACTIVE', nextMaintenanceKm: 55000, nextMaintenanceDate: '2026-03-20' },
  { vehicleId: 'VEH-002-003', fleetId: 'FLEET-002', plateNumber: '06 AN 003', brand: 'Honda', model: 'Civic', year: 2020, vin: 'JHMFK7C64LS345678', currentMileage: 89200, status: 'ACTIVE', nextMaintenanceKm: 92000, nextMaintenanceDate: '2026-03-05' },
  { vehicleId: 'VEH-002-004', fleetId: 'FLEET-002', plateNumber: '06 AN 004', brand: 'Peugeot', model: '308', year: 2021, vin: 'VPLCR4AXXL3901234', currentMileage: 38500, status: 'OUT_OF_SERVICE', nextMaintenanceKm: 40000, nextMaintenanceDate: '2026-03-15' },
  { vehicleId: 'VEH-002-005', fleetId: 'FLEET-002', plateNumber: '06 AN 005', brand: 'Skoda', model: 'Octavia', year: 2022, vin: 'TMBF73FX8K3567890', currentMileage: 15600, status: 'ACTIVE', nextMaintenanceKm: 18000, nextMaintenanceDate: '2026-05-01' },
  { vehicleId: 'VEH-003-001', fleetId: 'FLEET-003', plateNumber: '35 EG 001', brand: 'Opel', model: 'Astra', year: 2019, vin: 'W0L0AHM84K2234567', currentMileage: 156800, status: 'ACTIVE', nextMaintenanceKm: 160000, nextMaintenanceDate: '2026-03-22' },
  { vehicleId: 'VEH-003-002', fleetId: 'FLEET-003', plateNumber: '35 EG 002', brand: 'Nissan', model: 'Qashqai', year: 2020, vin: 'VSNPN7GFLFY345678', currentMileage: 98400, status: 'MAINTENANCE', nextMaintenanceKm: 100000, nextMaintenanceDate: '2026-02-26' },
  { vehicleId: 'VEH-003-003', fleetId: 'FLEET-003', plateNumber: '35 EG 003', brand: 'BMW', model: 'X3', year: 2018, vin: 'WBADT42452G890123', currentMileage: 182200, status: 'ACTIVE', nextMaintenanceKm: 185000, nextMaintenanceDate: '2026-04-05' },
  { vehicleId: 'VEH-003-004', fleetId: 'FLEET-003', plateNumber: '35 EG 004', brand: 'Fiat', model: 'Doblo', year: 2021, vin: 'ZFFAB41F311234567', currentMileage: 64700, status: 'ACTIVE', nextMaintenanceKm: 67000, nextMaintenanceDate: '2026-03-18' },
  { vehicleId: 'VEH-003-005', fleetId: 'FLEET-003', plateNumber: '35 EG 005', brand: 'Chevrolet', model: 'Trax', year: 2022, vin: '3G1DA1E35C3234567', currentMileage: 22300, status: 'RETIRED', nextMaintenanceKm: 25000, nextMaintenanceDate: '2026-06-01' },
];

const MOCK_CONTRACTS = [
  { contractId: 'CNT-001-001', fleetId: 'FLEET-001', vehicleId: 'VEH-001-001', customerName: 'Şentürk Lojistik A.Ş.', startDate: '2026-01-20', endDate: '2026-06-30', dailyRate: 1250, monthlyRate: 27500, kmLimit: 15000, depositAmount: 50000, status: 'ACTIVE', createdBy: 'ahmet.yilmaz', createdAt: '2026-01-18T10:00:00Z', updatedAt: '2026-02-22T14:00:00Z' },
  { contractId: 'CNT-001-002', fleetId: 'FLEET-001', vehicleId: 'VEH-001-002', customerName: 'Kurtuluş Turizm', startDate: '2026-02-01', endDate: '2026-04-15', dailyRate: 1800, monthlyRate: 39600, kmLimit: 8000, depositAmount: 75000, status: 'ACTIVE', createdBy: 'ahmet.yilmaz', createdAt: '2026-01-28T09:30:00Z', updatedAt: '2026-02-20T11:00:00Z' },
  { contractId: 'CNT-001-003', fleetId: 'FLEET-001', vehicleId: 'VEH-001-003', customerName: 'Demiryolu İşletmeleri', startDate: '2025-11-10', endDate: '2026-05-10', dailyRate: 3200, monthlyRate: 70400, kmLimit: 20000, depositAmount: 150000, status: 'ACTIVE', createdBy: 'ahmet.yilmaz', createdAt: '2025-11-05T14:00:00Z', updatedAt: '2026-02-15T09:00:00Z' },
  { contractId: 'CNT-002-001', fleetId: 'FLEET-002', vehicleId: 'VEH-002-001', customerName: 'ENKA İnşaat', startDate: '2026-02-01', endDate: '2026-12-31', dailyRate: 1100, monthlyRate: 24200, kmLimit: 12000, depositAmount: 40000, status: 'ACTIVE', createdBy: 'fatih.kaya', createdAt: '2026-01-25T11:00:00Z', updatedAt: '2026-02-18T15:00:00Z' },
  { contractId: 'CNT-003-001', fleetId: 'FLEET-003', vehicleId: 'VEH-003-001', customerName: 'Turist Rehberleri Birliği', startDate: '2026-01-20', endDate: '2026-09-20', dailyRate: 1500, monthlyRate: 33000, kmLimit: 18000, depositAmount: 70000, status: 'ACTIVE', createdBy: 'zeynep.arslan', createdAt: '2026-01-12T12:00:00Z', updatedAt: '2026-02-21T14:30:00Z' },
];

const MOCK_MAINTENANCE = [
  { maintenanceId: 'MNT-001-001-01', vehicleId: 'VEH-001-001', mileageAtService: 40000, serviceDate: '2025-11-15', serviceType: 'OIL_CHANGE', notes: 'Rutin bakım, yağ + filtre değişimi', incurredCost: 850, sparePartsUsed: ['PM-0087', 'PM-0088'] },
  { maintenanceId: 'MNT-001-002-01', vehicleId: 'VEH-001-002', mileageAtService: 75000, serviceDate: '2025-12-10', serviceType: 'BRAKE_CHECK', notes: 'Fren kontrolü + balata incelemesi', incurredCost: 2100, sparePartsUsed: ['PM-0001'] },
  { maintenanceId: 'MNT-002-001-01', vehicleId: 'VEH-002-001', mileageAtService: 28000, serviceDate: '2026-01-30', serviceType: 'OIL_CHANGE', notes: 'Rutin bakım', incurredCost: 800, sparePartsUsed: ['PM-0087'] },
  { maintenanceId: 'MNT-003-001-01', vehicleId: 'VEH-003-001', mileageAtService: 152000, serviceDate: '2025-11-22', serviceType: 'INSPECTION', notes: 'Kapsamlı bakım', incurredCost: 2600, sparePartsUsed: [] },
];

const MOCK_COSTS = [
  { costId: 'CST-001-001-01', vehicleId: 'VEH-001-001', category: 'MAINTENANCE', amount: 850, currency: 'TRY', date: '2025-11-15', note: 'Yağ değişimi' },
  { costId: 'CST-001-001-02', vehicleId: 'VEH-001-001', category: 'INSURANCE', amount: 3200, currency: 'TRY', date: '2026-01-01', note: 'Aylık sigorta' },
  { costId: 'CST-001-001-03', vehicleId: 'VEH-001-001', category: 'FUEL', amount: 2100, currency: 'TRY', date: '2026-02-20', note: 'Benzin, Şubat' },
  { costId: 'CST-002-001-01', vehicleId: 'VEH-002-001', category: 'MAINTENANCE', amount: 800, currency: 'TRY', date: '2026-01-30', note: 'Yağ' },
  { costId: 'CST-002-001-02', vehicleId: 'VEH-002-001', category: 'INSURANCE', amount: 2800, currency: 'TRY', date: '2026-01-01', note: 'Sigorta' },
];

const MOCK_FLEET_RISKS = [
  { fleetId: 'FLEET-001', avgRiskScore: 52, topRiskVehicles: [ { vehicleId: 'VEH-001-002', vin: 'WF0UXXWPDC8P12345', plateNumber: '34 MR 002', riskScore: 68, reasonCodes: ['OVERDUE_BRAKE_SERVICE', 'HIGH_MILEAGE'] } ] },
  { fleetId: 'FLEET-002', avgRiskScore: 35, topRiskVehicles: [ { vehicleId: 'VEH-002-004', vin: 'VPLCR4AXXL3901234', plateNumber: '06 AN 004', riskScore: 55, reasonCodes: ['OUT_OF_SERVICE'] } ] },
  { fleetId: 'FLEET-003', avgRiskScore: 68, topRiskVehicles: [ { vehicleId: 'VEH-003-002', vin: 'VSNPN7GFLFY345678', plateNumber: '35 EG 002', riskScore: 82, reasonCodes: ['RECENT_REPAIR', 'HIGH_COST_PATTERN'] } ] },
];

// Tenant to fleet mapping
const TENANT_FLEET_MAP = {
  'TENANT-001': 'FLEET-001',
  'TENANT-002': 'FLEET-002',
  'TENANT-003': 'FLEET-003',
  'demo': 'FLEET-001', // Demo tenant
};

// In-memory DB for contract updates
let contractsDb = [...MOCK_CONTRACTS];

// ===== SUPPLIER DATA (Legacy) =====

const MOCK_SUPPLIERS = [
  { supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', country: 'Turkey' },
  { supplierId: 'SUP-002', supplierName: 'Bosch Distribütör', country: 'Turkey' },
  { supplierId: 'SUP-003', supplierName: 'Mann-Filter Türkiye', country: 'Turkey' },
];

const MOCK_OFFERS = [
  { offerId: 'OFF-001', supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', partMasterId: 'PM-0001', price: 2450, currency: 'TRY', minOrderQty: 1, packQty: 4, stock: 85, leadDays: 2, lastUpdated: new Date('2027-02-20').toISOString(), isVerified: true, trustScore: 95 },
  { offerId: 'OFF-002', supplierId: 'SUP-002', supplierName: 'Bosch Türkiye', partMasterId: 'PM-0001', price: 2100, currency: 'TRY', minOrderQty: 1, packQty: 4, stock: 120, leadDays: 1, lastUpdated: new Date('2027-02-19').toISOString(), isVerified: true, trustScore: 98 },
  { offerId: 'OFF-003', supplierId: 'SUP-001', supplierName: 'Martaş Otomotiv', partMasterId: 'PM-0001', price: 1850, currency: 'TRY', minOrderQty: 2, packQty: 4, stock: 200, leadDays: 2, lastUpdated: new Date('2027-02-18').toISOString(), isVerified: true, trustScore: 88 },
  { offerId: 'OFF-004', supplierId: 'SUP-003', supplierName: 'Mann-Filter Türkiye', partMasterId: 'PM-0002', price: 890, currency: 'TRY', minOrderQty: 1, packQty: 6, stock: 500, leadDays: 3, lastUpdated: new Date('2027-02-20').toISOString(), isVerified: true, trustScore: 92 },
];

// ===== HELPER FUNCTIONS =====

function getTenantFleet(tenantId) {
  const fleetId = TENANT_FLEET_MAP[tenantId] || TENANT_FLEET_MAP['demo'];
  return fleetId;
}

function checkTenantAccess(req, res) {
  const tenantId = req.headers['x-tenant-id'] || 'demo';
  const role = req.headers['x-role'] || 'ops';
  
  if (!tenantId) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Unauthorized: x-tenant-id required' }));
    return null;
  }
  
  return { tenantId, role };
}

function success(data, message = '') {
  return { success: true, data, message, timestamp: new Date().toISOString() };
}

function errorResp(message, code = 400) {
  return { success: false, error: message, timestamp: new Date().toISOString() };
}

// ===== SERVER =====

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tenant-id, x-role');
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
  console.log('  Headers:', { 'x-tenant-id': req.headers['x-tenant-id'], 'x-role': req.headers['x-role'], 'content-type': req.headers['content-type'] });

  const delay = 50 + Math.random() * 100;

  setTimeout(async () => {
    try {
      // ===== SUPPLIES ENDPOINTS (Legacy) =====
      
      if (req.method === 'GET' && pathname === '/api/offers') {
        const partMasterId = query.partMasterId;
        let filtered = MOCK_OFFERS;
        if (partMasterId) filtered = MOCK_OFFERS.filter(o => o.partMasterId === partMasterId);
        res.writeHead(200);
        res.end(JSON.stringify(success(filtered, `${filtered.length} offers`)));
      }
      else if (req.method === 'GET' && pathname === '/api/suppliers') {
        res.writeHead(200);
        res.end(JSON.stringify(success(MOCK_SUPPLIERS)));
      }

      // ===== FLEET ENDPOINTS =====

      // GET /api/fleet - List all fleets (with tenant filter)
      else if (req.method === 'GET' && pathname === '/api/fleet') {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const tenantFleetId = getTenantFleet(auth.tenantId);
        const fleet = MOCK_FLEETS.find(f => f.fleetId === tenantFleetId);
        
        res.writeHead(200);
        res.end(JSON.stringify(success([fleet] || [])));
      }

      // GET /api/fleet/:fleetId - Get single fleet
      else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const fleetId = pathname.split('/')[3];
        const fleet = MOCK_FLEETS.find(f => f.fleetId === fleetId);
        
        if (fleet) {
          res.writeHead(200);
          res.end(JSON.stringify(success(fleet)));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify(errorResp('Fleet not found')));
        }
      }

      // GET /api/fleet/:fleetId/vehicles - List vehicles for fleet
      else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+\/vehicles$/) && !pathname.includes('/vehicles/')) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const fleetId = pathname.split('/')[3];
        const vehicles = MOCK_VEHICLES.filter(v => v.fleetId === fleetId);
        
        res.writeHead(200);
        res.end(JSON.stringify(success({ data: vehicles, total: vehicles.length, page: 1, pageSize: 50 })));
      }

      // GET /api/fleet/:fleetId/vehicles/:vehicleId - Get vehicle details
      else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+\/vehicles\/[^/]+$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const parts = pathname.split('/');
        const vehicleId = parts[5];
        const vehicle = MOCK_VEHICLES.find(v => v.vehicleId === vehicleId);
        
        if (vehicle) {
          res.writeHead(200);
          res.end(JSON.stringify(success(vehicle)));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify(errorResp('Vehicle not found')));
        }
      }

      // GET /api/fleet/:fleetId/contracts - List contracts for fleet
      else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+\/contracts$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const fleetId = pathname.split('/')[3];
        const contracts = contractsDb.filter(c => c.fleetId === fleetId);
        
        res.writeHead(200);
        res.end(JSON.stringify(success({ data: contracts, total: contracts.length, page: 1, pageSize: 50 })));
      }

      // GET /api/contract/:contractId - Get single contract
      else if (req.method === 'GET' && pathname.match(/^\/api\/contract\/[^/]+$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const contractId = pathname.split('/')[3];
        const contract = contractsDb.find(c => c.contractId === contractId);
        
        if (contract) {
          res.writeHead(200);
          res.end(JSON.stringify(success(contract)));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify(errorResp('Contract not found')));
        }
      }

      // POST /api/contract - Create new contract
      else if (req.method === 'POST' && pathname === '/api/contract') {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const newContract = {
              contractId: `CNT-${Date.now()}`,
              ...payload,
              createdBy: auth.tenantId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'DRAFT',
            };
            contractsDb.push(newContract);
            
            res.writeHead(201);
            res.end(JSON.stringify(success(newContract, 'Contract created')));
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify(errorResp(err.message)));
          }
        });
      }

      // PATCH /api/contract/:contractId - Update contract
      else if (req.method === 'PATCH' && pathname.match(/^\/api\/contract\/[^/]+$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const contractId = pathname.split('/')[3];
        const contractIdx = contractsDb.findIndex(c => c.contractId === contractId);
        
        if (contractIdx === -1) {
          res.writeHead(404);
          res.end(JSON.stringify(errorResp('Contract not found')));
          return;
        }
        
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const updates = JSON.parse(body);
            contractsDb[contractIdx] = { ...contractsDb[contractIdx], ...updates, updatedAt: new Date().toISOString() };
            
            res.writeHead(200);
            res.end(JSON.stringify(success(contractsDb[contractIdx], 'Contract updated')));
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify(errorResp(err.message)));
          }
        });
      }

      // GET /api/vehicle/:vehicleId/maintenance - List maintenance logs
      else if (req.method === 'GET' && pathname.match(/^\/api\/vehicle\/[^/]+\/maintenance$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const vehicleId = pathname.split('/')[3];
        const logs = MOCK_MAINTENANCE.filter(m => m.vehicleId === vehicleId);
        
        res.writeHead(200);
        res.end(JSON.stringify(success({ data: logs, total: logs.length })));
      }

      // GET /api/vehicle/:vehicleId/costs - List vehicle costs
      else if (req.method === 'GET' && pathname.match(/^\/api\/vehicle\/[^/]+\/costs$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const vehicleId = pathname.split('/')[3];
        const costs = MOCK_COSTS.filter(c => c.vehicleId === vehicleId);
        
        res.writeHead(200);
        res.end(JSON.stringify(success({ data: costs, total: costs.length, costBreakdown: { MAINTENANCE: 1650, INSURANCE: 6000, FUEL: 2100, OTHER: 0, FINE: 0 } })));
      }

      // GET /api/fleet/:fleetId/summary - Fleet risk summary
      else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+\/summary$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const fleetId = pathname.split('/')[3];
        const summary = MOCK_FLEET_RISKS.find(r => r.fleetId === fleetId);
        
        if (summary) {
          res.writeHead(200);
          res.end(JSON.stringify(success(summary)));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify(errorResp('Fleet summary not found')));
        }
      }

      // GET /api/fleet/:fleetId/vehicles/:vehicleId/summary - Vehicle full summary
      else if (req.method === 'GET' && pathname.match(/^\/api\/fleet\/[^/]+\/vehicles\/[^/]+\/summary$/)) {
        const auth = checkTenantAccess(req, res);
        if (!auth) return;
        
        const parts = pathname.split('/');
        const vehicleId = parts[5];
        const vehicle = MOCK_VEHICLES.find(v => v.vehicleId === vehicleId);
        
        if (!vehicle) {
          res.writeHead(404);
          res.end(JSON.stringify(errorResp('Vehicle not found')));
          return;
        }
        
        // Build comprehensive summary
        const summary = {
          vehicle,
          risk: { riskScore: 52, factors: ['HIGH_MILEAGE'] },
          maintenance: MOCK_MAINTENANCE.filter(m => m.vehicleId === vehicleId).slice(0, 3),
          costs: { total: 10850, breakdown: { MAINTENANCE: 1650, INSURANCE: 6000, FUEL: 2100, OTHER: 1100 } },
          parts: ['PM-0001', 'PM-0087', 'PM-0088'],
          service: { lastServiceKm: 45200, lastServiceDate: '2025-11-15', nextServiceKm: 47000 },
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(success(summary)));
      }

      // 404
      else {
        res.writeHead(404);
        res.end(JSON.stringify(errorResp(`Not found: ${pathname}`)));
      }

    } catch (error) {
      console.error('Error:', error);
      res.writeHead(500);
      res.end(JSON.stringify(errorResp(error.message, 500)));
    }
  }, delay);
});

// Start
server.listen(PORT, () => {
  console.log(`\n✅ Mock Server v2 running: http://localhost:${PORT}\n`);
  console.log('📡 Endpoints:');
  console.log('   FLEET: GET /api/fleet, /api/fleet/:fleetId, /api/fleet/:id/vehicles');
  console.log('   VEHICLE: GET /api/fleet/:id/vehicles/:id/maintenance, /costs, /summary');
  console.log('   CONTRACT: GET/POST /api/contract, PATCH /api/contract/:id');
  console.log('   SUPPLIERS: GET /api/offers, /api/suppliers\n');
  console.log('🔐 Headers: x-tenant-id (demo|TENANT-001|TENANT-002|TENANT-003), x-role (ops|admin|viewer)\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} already in use!`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

export default server;
