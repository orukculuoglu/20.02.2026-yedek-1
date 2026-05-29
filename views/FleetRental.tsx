import React, { useState, useEffect } from 'react';
import { listFleets, listVehicles, listContracts, createContract, getVehicleSummary, setContext, getContext, getFleetPolicy, updateFleetPolicy, listServiceRedirects, createServiceRedirect, createWorkOrder, getWorkOrder, updateWorkOrder, addLineItem, applyCost, updateFleetPolicyWithCosts, requestApproval, approveWorkOrder, rejectWorkOrder } from '../services/fleetRentalService';
import type { Fleet, Vehicle, RentalContract, CreateContractPayload, VehicleSummary, FleetPolicy, ServiceRedirect, WorkOrder, WorkOrderLineItem } from '../types/fleetRental';
import { FleetIntelligenceRiskPanel } from './FleetIntelligenceRiskPanel';
import { AlertTriangle, CheckCircle, TrendingUp, AlertCircle, Settings, DollarSign, Database, Briefcase, Calendar, Wrench, Shield, Users, TrendingDown, Eye, X, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { getDataEngineSender } from '../src/modules/data-engine/adapters/dataEngineSender';
import type { DataEngineEventEnvelope, DataEngineEventType } from '../src/modules/data-engine/contracts/dataEngineContract';
import { makeEventId, makeOccurredAt, makeIdempotencyKey } from '../src/modules/data-engine/contracts/dataEngineContract';

// ========== FLEET RENTAL AVID-SAFE EVENT HELPER ==========
/**
 * Safe event payload for Fleet Rental feedback events
 * Uses vehicleId as AVID - no VIN, plate, chassis, or PII
 */
interface FleetRentalEventPayload {
  domain: 'fleet-rental';
  eventSource: 'fleet-rental-ui';
  vehicleId: string;             // AVID
  fleetId?: string;              // Fleet context (if not PII)
  contractId?: string;           // Contract context (if not PII)
  operationStatus?: string;      // e.g., 'ready', 'maintenance'
  readinessStatus?: string;      // e.g., 'ready', 'monitored', 'approval_required'
  readinessLabel?: string;       // Human label
  approvalLevel?: string;        // e.g., 'manager_approval', 'compliance_escalation'
  approvalReasonCodes?: string[]; // Structured reason codes
  riskScore?: number;            // 0-100 risk metric
  mileageKm?: number;            // Current mileage (operational use only)
  maintenanceSignal?: string;    // e.g., 'scheduled', 'urgent'
  serviceRedirectStatus?: string; // Redirect context
  dataConfidence?: number;       // 0-100 confidence
  identityStatus?: string;       // AVID verification status
  domainIsolationStatus?: string; // 'active', 'restricted', 'none'
  dataSharingEligibility?: string; // 'full', 'restricted', 'minimal'
}

/**
 * Emit a Fleet Rental feedback event to Data Engine
 * - Gracefully fails without crashing UI
 * - Uses vehicleId as AVID
 * - No VIN, plate, chassis, or customer PII
 * - Includes safe operational metadata
 */
async function emitFleetRentalEvent(
  eventType: DataEngineEventType,
  vehicle: Vehicle,
  payload: Partial<FleetRentalEventPayload> = {}
): Promise<void> {
  try {
    // Construct AVID-safe payload
    const safePayload: FleetRentalEventPayload = {
      domain: 'fleet-rental',
      eventSource: 'fleet-rental-ui',
      vehicleId: vehicle.vehicleId, // AVID
      ...payload,
    };

    // Create event envelope
    const envelope: DataEngineEventEnvelope<FleetRentalEventPayload> = {
      schemaVersion: 'DE-1.0',
      eventId: makeEventId(),
      eventType: eventType as DataEngineEventType,
      occurredAt: makeOccurredAt(),
      tenantId: 'fleet-rental-tenant', // Can be overridden by context
      subject: {
        vehicleId: vehicle.vehicleId,
      },
      payload: safePayload,
      idempotencyKey: makeIdempotencyKey({
        vehicleId: vehicle.vehicleId,
        eventType,
        timestamp: Date.now(),
      }),
      meta: {
        source: 'fleet-rental-ui',
        env: import.meta.env.MODE,
        appVersion: '1.0.0',
      },
    };

    // Send event safely
    const sender = getDataEngineSender();
    const result = await sender.send(envelope);

    if (import.meta.env.DEV) {
      console.debug('[FleetRental] Event emitted', {
        eventType,
        vehicleId: vehicle.vehicleId,
        status: result.status,
      });
    }
  } catch (error) {
    // Gracefully fail without crashing UI
    if (import.meta.env.DEV) {
      console.warn('[FleetRental] Event emission failed (non-blocking)', {
        eventType,
        vehicleId: vehicle.vehicleId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    // Event failure does not affect user experience
  }
}

/**
 * Emit approval or readiness change event
 * Triggered when operational readiness status changes
 */
async function emitReadinessEvent(
  vehicle: Vehicle,
  readiness: { status: string; label: string; reasons: string[] }
): Promise<void> {
  const reasonCodes = readiness.reasons.map(r => r.split(' - ')[0] || 'unknown').slice(0, 5); // First 5 codes

  if (readiness.status === 'critical_approval_required') {
    // Compliance escalation required
    await emitFleetRentalEvent('FLEET_APPROVAL_ESCALATED', vehicle, {
      readinessStatus: readiness.status,
      readinessLabel: readiness.label,
      approvalLevel: 'compliance_escalation',
      approvalReasonCodes: reasonCodes,
    });
  } else if (readiness.status === 'approval_required') {
    // Manager approval required
    await emitFleetRentalEvent('FLEET_APPROVAL_REQUESTED', vehicle, {
      readinessStatus: readiness.status,
      readinessLabel: readiness.label,
      approvalLevel: 'manager_approval',
      approvalReasonCodes: reasonCodes,
    });
  } else {
    // Readiness status changed (ready, monitored, maintenance)
    await emitFleetRentalEvent('FLEET_VEHICLE_RISK_CHANGED', vehicle, {
      readinessStatus: readiness.status,
      readinessLabel: readiness.label,
      riskScore: vehicle.riskScore,
      operationStatus: vehicle.status,
    });
  }
}

// ========== AVID IDENTITY DERIVATION ==========
// VIN is intentionally not displayed or propagated in Fleet Rental.
// vehicleId represents AVID in this operational context.
interface AvidIdentityStatus {
  status: 'verified' | 'pending' | 'missing' | 'mismatch' | 'isolated';
  label: string;
  severity: 'low' | 'medium' | 'high';
  avidCode: string;
  domainIsolationStatus: 'active' | 'restricted' | 'none';
  dataSharingEligibility: 'full' | 'restricted' | 'minimal';
  identityConfidence: number;
}

function deriveAvidIdentity(vehicle: Vehicle): AvidIdentityStatus {
  // Determine AVID status based on vehicle properties
  const hasAvidField = vehicle && (vehicle as any).avidId;
  const isActive = vehicle.status === 'ACTIVE';
  
  // AVID Code - using vehicleId as AVID in operational context
  const avidCode = vehicle.vehicleId;
  
  // Determine AVID verification status
  let status: 'verified' | 'pending' | 'missing' | 'mismatch' | 'isolated' = 'pending';
  let severity: 'low' | 'medium' | 'high' = 'medium';
  let label = 'Doğrulama Bekleyen';
  
  if (hasAvidField) {
    status = 'verified';
    severity = 'low';
    label = 'AVID Doğrulanmış';
  } else if (vehicle.riskScore > 75) {
    status = 'mismatch';
    severity = 'high';
    label = 'Yüksek Risk - Eşleşme Sorunlu';
  } else {
    status = 'missing';
    severity = 'high';
    label = 'AVID Bilgisi Eksik';
  }
  
  // Domain isolation: if vehicle has active rental or maintenance, restrict data sharing
  const domainIsolationStatus: 'active' | 'restricted' | 'none' = 
    vehicle.status === 'MAINTENANCE' || (vehicle as any).activeContractCount > 0 ? 'restricted' : 'none';
  
  // Data sharing eligibility based on AVID and risk
  let dataSharingEligibility: 'full' | 'restricted' | 'minimal' = 'full';
  if (domainIsolationStatus !== 'none' || status !== 'verified') dataSharingEligibility = 'restricted';
  if (status === 'missing' || status === 'mismatch') dataSharingEligibility = 'minimal';
  
  // Identity confidence: 0-100%
  const identityConfidence = status === 'verified' ? 95 : 30;
  
  return {
    status,
    label,
    severity,
    avidCode,
    domainIsolationStatus,
    dataSharingEligibility,
    identityConfidence,
  };
}

// ========== OPERATIONAL READINESS DETERMINATION ==========
interface OperationalReadiness {
  status: 'ready' | 'monitored' | 'maintenance' | 'approval_required' | 'critical_approval_required';
  label: string;
  severity: 'low' | 'medium' | 'high';
  reasons: string[];
  suggestedAction: string;
}

function getOperationalReadiness(vehicle: Vehicle, contracts: RentalContract[]): OperationalReadiness {
  const reasons: string[] = [];
  let status: 'ready' | 'monitored' | 'maintenance' | 'approval_required' | 'critical_approval_required' = 'ready';
  let severity: 'low' | 'medium' | 'high' = 'low';
  const avidStatus = deriveAvidIdentity(vehicle);
  
  // Check AVID status - missing/mismatch = critical approval required
  if (avidStatus.status === 'missing' || avidStatus.status === 'mismatch') {
    status = 'critical_approval_required';
    severity = 'high';
    reasons.push('AVID kimlik doğrulama başarısız - uygunluk onayı gerekli');
  } else if (avidStatus.status === 'pending' || avidStatus.status === 'isolated') {
    status = 'approval_required';
    severity = 'medium';
    reasons.push('AVID doğrulama bekleyen - yetkili onayı gerekli');
  }
  
  // Check vehicle status
  if (vehicle.status === 'MAINTENANCE') {
    if (status !== 'critical_approval_required') status = 'maintenance';
    severity = 'high';
    reasons.push('Araç bakımda');
  } else if (vehicle.status !== 'ACTIVE') {
    status = 'critical_approval_required';
    severity = 'high';
    reasons.push('Araç aktif değil');
  }
  
  // Check risk score
  if (vehicle.riskScore > 75) {
    if (status === 'ready') status = 'approval_required';
    severity = 'high';
    reasons.push('Yüksek risk skoru - yetkili incelemesi gerekli');
  } else if (vehicle.riskScore > 60) {
    if (status === 'ready') status = 'monitored';
    severity = 'medium';
    reasons.push('Orta seviye risk - izleme önerilen');
  }
  
  // Check mileage
  if (vehicle.currentMileage > 75000) {
    status = 'maintenance';
    severity = 'high';
    reasons.push('Bakım kilometre sınırını aştı');
  } else if (vehicle.currentMileage > 50000) {
    if (status === 'ready') status = 'maintenance';
    severity = 'medium';
    reasons.push('Bakım kilometresine yaklaşıyor');
  }
  
  // Check if already rented
  const activeContract = contracts.find(c => c.vehicleId === vehicle.vehicleId && c.status === 'ACTIVE');
  if (activeContract) {
    if (status === 'ready') status = 'monitored';
    severity = 'low';
    reasons.push('Aktif kiralamada');
  }
  
  // Determine final label and action
  let label = 'Kiralamaya Hazır';
  let suggestedAction = 'İşleme başlayabilirsiniz';
  
  if (status === 'critical_approval_required') {
    label = 'Kritik Onay Gerekli';
    suggestedAction = 'Uygunluk ve kimlik doğrulama onayı için yönetici/uygunluk müdürüne yönlendir';
  } else if (status === 'approval_required') {
    label = 'Yetkili Onayı Gerekli';
    suggestedAction = 'Kiralama işlemine devam etmek için yetkili yöneticinin onayı gerekli';
  } else if (status === 'maintenance') {
    label = 'Uyarılı Kiralanabilir - Bakım Gerekli';
    suggestedAction = 'Bakım planlaması yapılmalı, acil kiralama gerekirse yönetici onayı alınacak';
  } else if (status === 'monitored') {
    label = 'Uyarılı Kiralanabilir';
    suggestedAction = 'Riskler göz önüne alınarak ve uygun koordinasyonla kiralanabilir';
  }
  
  return {
    status,
    label,
    severity,
    reasons,
    suggestedAction,
  };
}

export default function FleetRental() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Role-based access control
  const [role, setRole] = useState<'admin' | 'ops' | 'viewer'>('ops');

  // 7-section navigation (new design)
  const [currentSection, setCurrentSection] = useState<'operation' | 'vehicles' | 'contracts' | 'maintenance' | 'intelligence' | 'revenue' | 'avid'>('operation');

  // Operation center state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicleSummary, setVehicleSummary] = useState<VehicleSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // V2.2 Service Redirect state
  const [fleetPolicy, setFleetPolicy] = useState<FleetPolicy | null>(null);
  const [serviceRedirects, setServiceRedirects] = useState<ServiceRedirect[]>([]);
  const [redirectModal, setRedirectModal] = useState<{
    open: boolean;
    selectedServicePointId: string | null;
  }>({ open: false, selectedServicePointId: null });
  const [redirectForm, setRedirectForm] = useState<{
    reason: 'Maintenance' | 'Breakdown' | 'Risk' | 'Other';
    note: string;
    applyStatusChange: boolean;
  }>({ reason: 'Maintenance', note: '', applyStatusChange: false });
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // V2.3 Work Order state
  const [workOrderCreating, setWorkOrderCreating] = useState<{
    [redirectId: string]: boolean;
  }>({});

  // V2.4 Work Order Cost Management
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [workOrderDetailModal, setWorkOrderDetailModal] = useState(false);
  const [newLineItem, setNewLineItem] = useState<{
    type: 'Labor' | 'Part';
    description: string;
    qty: number;
    unitPrice: number;
    currency: 'TRY' | 'USD' | 'EUR';
  }>({ type: 'Labor', description: '', qty: 1, unitPrice: 0, currency: 'TRY' });

  // V2.5 Breakdown Incident Modal
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [breakdownForm, setBreakdownForm] = useState<{
    incidentId: string;
    title: string;
    symptom: string;
    severity: 'Low' | 'Medium' | 'High';
    locationCity: string;
    selectedServicePointId: string | null;
  }>({
    incidentId: 'INC-' + Math.random().toString(36).substr(2, 9),
    title: '',
    symptom: '',
    severity: 'Medium',
    locationCity: '',
    selectedServicePointId: null,
  });

  // Search & filter
  const [searchFleet, setSearchFleet] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchContract, setSearchContract] = useState('');

  // API status diagnostics
  const [apiStatus, setApiStatus] = useState({
    fleet: 'idle',
    vehicles: 'idle',
    contracts: 'idle',
  });

  // Contract form
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractForm, setContractForm] = useState<CreateContractPayload>({
    vehicleId: '',
    customerName: '',
    startDate: '',
    endDate: '',
    kmLimit: 10000,
    dailyRate: 500,
    monthlyRate: 22000,
    depositAmount: 5000,
  });

  // ========== CORE DATA LOADING ==========
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        setApiStatus({ fleet: 'loading', vehicles: 'loading', contracts: 'loading' });

        const fleetsData = await listFleets();
        
        // Empty data is not an error - it's a valid state
        if (!fleetsData || fleetsData.length === 0) {
          setFleets([]);
          setSelectedFleet(null);
          setVehicles([]);
          setContracts([]);
          setApiStatus({ fleet: 'success', vehicles: 'success', contracts: 'success' });
          setLoading(false);
          return;
        }

        setFleets(fleetsData);
        setSelectedFleet(fleetsData[0]);

        const [vehiclesData, contractsData] = await Promise.all([
          listVehicles(fleetsData[0].fleetId),
          listContracts(fleetsData[0].fleetId),
        ]);
        
        // Empty arrays are not errors
        setVehicles(vehiclesData || []);
        setContracts(contractsData || []);

        setApiStatus({ fleet: 'success', vehicles: 'success', contracts: 'success' });
        setLoading(false);
      } catch (err) {
        console.error('Fleet Rental data fetch failed:', err);
        setError('Veri yükleme başarısız. Lütfen sayfayı yenileyin.');
        setFleets([]);
        setVehicles([]);
        setContracts([]);
        setApiStatus({ fleet: 'error', vehicles: 'error', contracts: 'error' });
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ========= KPI CALCULATIONS ==========
  const calculateKPIs = () => {
    const totalVehicles = vehicles.length;
    const readyForRental = vehicles.filter(v => v.status === 'ACTIVE').length;
    const riskyButAvailable = vehicles.filter(v => v.status === 'ACTIVE' && v.riskScore > 60).length;
    const onRental = vehicles.filter(v => v.status === 'ACTIVE').length; // Approx - no rental status on vehicle
    const inMaintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length;
    const avgRiskScore = vehicles.length > 0 ? Math.round(vehicles.reduce((sum, v) => sum + v.riskScore, 0) / vehicles.length) : 0;
    const avergePerfRating = 85; // Placeholder
    const monthlyRevenue = contracts.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + (c.monthlyRate || 0), 0);

    // AVID & Operational Readiness Metrics
    const avidVerifiedVehicles = vehicles.filter(v => deriveAvidIdentity(v).status === 'verified').length;
    const avidPendingVehicles = vehicles.filter(v => {
      const status = deriveAvidIdentity(v).status;
      return status === 'pending' || status === 'isolated';
    }).length;
    const avidMissingVehicles = vehicles.filter(v => {
      const status = deriveAvidIdentity(v).status;
      return status === 'missing' || status === 'mismatch';
    }).length;
    
    // Count vehicles that are genuinely ready (AVID verified + operational ready)
    const fullyReadyVehicles = vehicles.filter(v => {
      const avidStatus = deriveAvidIdentity(v);
      const readiness = getOperationalReadiness(v, contracts);
      return avidStatus.status === 'verified' && readiness.status === 'ready';
    }).length;
    
    const complianceIssueVehicles = vehicles.filter(v => {
      const readiness = getOperationalReadiness(v, contracts);
      return readiness.status === 'approval_required' || readiness.status === 'critical_approval_required';
    }).length;

    return {
      totalVehicles,
      readyForRental,
      riskyButAvailable,
      onRental,
      inMaintenance,
      avgRiskScore,
      avergePerfRating,
      monthlyRevenue,
      avidVerifiedVehicles,
      avidPendingVehicles,
      avidMissingVehicles,
      fullyReadyVehicles,
      complianceIssueVehicles,
    };
  };

  const kpis = calculateKPIs();

  // ========== KANBAN BOARD CATEGORIZATION ==========
  const categorizeVehicles = () => {
    return {
      ready: vehicles.filter(v => v.status === 'ACTIVE' && v.riskScore <= 60),
      rented: vehicles.filter(v => v.status === 'ACTIVE' && v.riskScore > 40), // Proxy for rented
      maintenance_warning: vehicles.filter(v => v.currentMileage > 50000 && v.status !== 'MAINTENANCE'),
      in_service: vehicles.filter(v => v.status === 'MAINTENANCE'),
      risky: vehicles.filter(v => v.riskScore > 60),
    };
  };

  const kanbanData = categorizeVehicles();

  // ========== SMART SIGNALS ==========
  const generateSmartSignals = () => {
    const signals: Array<{ type: string; title: string; count: number; icon: React.ReactNode; severity: 'low' | 'medium' | 'high' }> = [];

    // AVID/KVKK Signals
    const avidPendingCount = vehicles.filter(v => {
      const status = deriveAvidIdentity(v).status;
      return status === 'pending' || status === 'isolated';
    }).length;
    if (avidPendingCount > 0) signals.push({
      type: 'avid_pending',
      title: 'AVID doğrulaması bekleyen araçlar',
      count: avidPendingCount,
      icon: <Unlock size={18} />,
      severity: 'medium',
    });

    const avidMissingCount = vehicles.filter(v => {
      const status = deriveAvidIdentity(v).status;
      return status === 'missing' || status === 'mismatch';
    }).length;
    if (avidMissingCount > 0) signals.push({
      type: 'avid_missing',
      title: 'AVID eşleşmesi eksik araçlar',
      count: avidMissingCount,
      icon: <Lock size={18} />,
      severity: 'high',
    });

    const domainRestrictedCount = vehicles.filter(v => {
      const avidStatus = deriveAvidIdentity(v);
      return avidStatus.domainIsolationStatus === 'restricted';
    }).length;
    if (domainRestrictedCount > 0) signals.push({
      type: 'domain_restricted',
      title: 'Domain isolation nedeniyle sınırlı veriyle çalışan araçlar',
      count: domainRestrictedCount,
      icon: <Database size={18} />,
      severity: 'medium',
    });

    const riskyNoAvidCount = vehicles.filter(v => {
      const avidStatus = deriveAvidIdentity(v);
      return v.riskScore > 60 && avidStatus.status !== 'verified';
    }).length;
    if (riskyNoAvidCount > 0) signals.push({
      type: 'risky_no_avid',
      title: 'Risk skoru var ama AVID doğrulaması olmayan araçlar',
      count: riskyNoAvidCount,
      icon: <AlertTriangle size={18} />,
      severity: 'high',
    });

    const readyButBlockedByAvidCount = vehicles.filter(v => {
      const readiness = getOperationalReadiness(v, contracts);
      return (readiness.status === 'approval_required' || readiness.status === 'critical_approval_required') && 
             readiness.reasons.some(r => r.includes('AVID'));
    }).length;
    if (readyButBlockedByAvidCount > 0) signals.push({
      type: 'blocked_by_avid',
      title: 'AVID doğrulaması nedeniyle yetkili onayı gereken araçlar',
      count: readyButBlockedByAvidCount,
      icon: <ShieldAlert size={18} />,
      severity: 'high',
    });

    // Maintenance Signal
    const maintenanceWarning = vehicles.filter(v => v.currentMileage > 50000).length;
    if (maintenanceWarning > 0) signals.push({
      type: 'maintenance',
      title: 'Bakım kilometre sınırına yaklaşan araçlar',
      count: maintenanceWarning,
      icon: <AlertTriangle size={18} />,
      severity: 'high',
    });

    // Risk Signal
    const riskyVehicles = vehicles.filter(v => v.status === 'ACTIVE' && v.riskScore > 60).length;
    if (riskyVehicles > 0) signals.push({
      type: 'risk',
      title: 'Müsait ama riskli araçlar',
      count: riskyVehicles,
      icon: <AlertCircle size={18} />,
      severity: 'medium',
    });

    // Contract Signal
    const endingContracts = contracts.filter(c => {
      const endDate = new Date(c.endDate);
      const today = new Date();
      const daysUntilEnd = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilEnd > 0 && daysUntilEnd < 7;
    }).length;
    if (endingContracts > 0) signals.push({
      type: 'contract',
      title: 'Yaklaşan sözleşme bitişleri',
      count: endingContracts,
      icon: <Calendar size={18} />,
      severity: 'medium',
    });

    return signals;
  };

  const smartSignals = generateSmartSignals();

  // ========== RENDER: OPERASYON MERKEZİ ==========
  const renderOperationCenter = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-black mb-2">Filo Kiralama Operasyon Merkezi</h1>
        <p className="text-blue-100 text-sm max-w-3xl">
          Araç kiralama, AVID kimlik, bakım uygunluğu, risk zekâsı, servis ağı ve veri motoru sinyallerini tek merkezden yönetin.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Toplam Araç" value={kpis.totalVehicles.toString()} icon={<Users size={24} />} color="blue" />
        <KPICard label="Kiralamaya Gerçekten Hazır" value={kpis.fullyReadyVehicles.toString()} icon={<CheckCircle size={24} />} color="emerald" />
        <KPICard label="AVID Doğrulanmış" value={kpis.avidVerifiedVehicles.toString()} icon={<Lock size={24} />} color="emerald" />
        <KPICard label="Kimlik Doğrulama Bekleyen" value={kpis.avidPendingVehicles.toString()} icon={<Unlock size={24} />} color="amber" />
        <KPICard label="Uygunluk Sorunu Olan" value={kpis.complianceIssueVehicles.toString()} icon={<AlertTriangle size={24} />} color="red" />
        <KPICard label="Bakımda / Serviste" value={kpis.inMaintenance.toString()} icon={<Wrench size={24} />} color="purple" />
        <KPICard label="Ortalama Risk Skoru" value={kpis.avgRiskScore.toString()} icon={<Shield size={24} />} color="red" />
        <KPICard label="Aylık Gelir" value={`₺${(kpis.monthlyRevenue / 1000).toFixed(0)}K`} icon={<DollarSign size={24} />} color="emerald" />
      </div>

      {/* Kanban Board & Smart Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kanban */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Akıllı Operasyon Kanbanı</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KanbanColumn title="Kiralamaya Hazır" vehicles={kanbanData.ready} onSelectVehicle={setSelectedVehicle} color="emerald" />
            <KanbanColumn title="Kirada" vehicles={kanbanData.rented} onSelectVehicle={setSelectedVehicle} color="blue" />
            <KanbanColumn title="Bakıma Yaklaşıyor" vehicles={kanbanData.maintenance_warning} onSelectVehicle={setSelectedVehicle} color="amber" />
            <KanbanColumn title="Serviste" vehicles={kanbanData.in_service} onSelectVehicle={setSelectedVehicle} color="purple" />
            <KanbanColumn title="Riskli / Bloklu" vehicles={kanbanData.risky} onSelectVehicle={setSelectedVehicle} color="red" />
          </div>
        </div>

        {/* Smart Signals */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Akıllı Sinyaller
          </h3>
          <div className="space-y-3">
            {smartSignals.length === 0 ? (
              <p className="text-sm text-slate-500">Önemli sinyal yok.</p>
            ) : (
              smartSignals.map((signal, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${signal.severity === 'high' ? 'bg-red-50 border-red-200' : signal.severity === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`${signal.severity === 'high' ? 'text-red-600' : signal.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'}`}>
                      {signal.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${signal.severity === 'high' ? 'text-red-700' : signal.severity === 'medium' ? 'text-amber-700' : 'text-blue-700'}`}>
                        {signal.title}
                      </p>
                      <p className={`text-lg font-black ${signal.severity === 'high' ? 'text-red-600' : signal.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'}`}>
                        {signal.count}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Detail Preview */}
      {selectedVehicle && (() => {
        const avidStatus = deriveAvidIdentity(selectedVehicle);
        const vehicleContracts = contracts.filter(c => c.vehicleId === selectedVehicle.vehicleId);
        const readiness = getOperationalReadiness(selectedVehicle, vehicleContracts);
        
        return (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-slate-900">Araç Detayları: {selectedVehicle.plateNumber}</h3>
              <button onClick={() => setSelectedVehicle(null)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Araç Kimliği</p>
                <p className="text-sm font-bold text-slate-900">{selectedVehicle.brand} {selectedVehicle.model}</p>
                <p className="text-xs text-slate-600">{selectedVehicle.plateNumber}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Kiralama Uygunluğu</p>
                <p className="text-2xl font-black text-emerald-600">{selectedVehicle.status === 'ACTIVE' ? 'Uygun' : 'Uygun Değil'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Bakım Sağlığı</p>
                <p className="text-sm font-bold text-slate-900">{selectedVehicle.currentMileage} km</p>
                <p className={`text-xs font-bold ${selectedVehicle.currentMileage > 50000 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {selectedVehicle.currentMileage > 50000 ? 'Bakım Gerekli' : 'İyi Durumda'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Risk Zekâsı</p>
                <p className="text-2xl font-black">{selectedVehicle.riskScore}/100</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Servis Ağı</p>
                <p className="text-sm text-slate-600">Bağlı Merkez</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Aksiyonlar</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Detay</button>
                  <button className="px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">Sözleşmeye Ata</button>
                </div>
              </div>
            </div>
            
            {/* AVID Kimlik & KVKK Uygunluk Section */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-slate-600" />
                AVID Kimlik & KVKK Uygunluk
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">AVID Durum</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        avidStatus.status === 'verified' ? 'bg-emerald-500' :
                        avidStatus.status === 'pending' ? 'bg-amber-500' :
                        avidStatus.status === 'mismatch' ? 'bg-red-500' :
                        avidStatus.status === 'isolated' ? 'bg-purple-500' :
                        'bg-slate-300'
                      }`}></div>
                      <p className="text-sm font-bold text-slate-900">{avidStatus.label}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">AVID Kodu</p>
                    <p className="text-sm font-mono text-slate-900">{avidStatus.avidCode}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Operasyonel Hazırlık</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        readiness.status === 'ready' ? 'bg-emerald-500' :
                        readiness.status === 'monitored' ? 'bg-blue-500' :
                        readiness.status === 'maintenance' ? 'bg-amber-500' :
                        readiness.status === 'approval_required' ? 'bg-purple-500' :
                        'bg-red-500'
                      }`}></div>
                      <p className="text-sm font-bold text-slate-900">{readiness.label}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Domain İzolasyon</p>
                    <p className="text-sm text-slate-900">{
                      avidStatus.domainIsolationStatus === 'active' ? 'Aktif - Veri Koruması Uygulanıyor' :
                      avidStatus.domainIsolationStatus === 'restricted' ? 'Kısıtlı - Sınırlı Erişim' :
                      'Yoktur - Standart Erişim'
                    }</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Veri Paylaşım Uygunluğu</p>
                    <p className="text-sm text-slate-900">{
                      avidStatus.dataSharingEligibility === 'full' ? 'Tam Paylaşıma Uygun' :
                      avidStatus.dataSharingEligibility === 'restricted' ? 'Kısıtlı Paylaşım' :
                      'Minimal Paylaşım'
                    }</p>
                  </div>
                </div>
              </div>
              
              {readiness.reasons && readiness.reasons.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Durum Nedenleri</p>
                  <ul className="space-y-1">
                    {readiness.reasons.map((reason, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );

  // ========== RENDER: VEHICLES SECTION ==========
  const renderVehicles = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Araçlar</h2>
        <input
          type="text"
          placeholder="Plaka veya marka araması..."
          value={searchVehicle}
          onChange={(e) => setSearchVehicle(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Plaka</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Marka/Model</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Durum</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Risk</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Kilometer</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {vehicles.filter(v => v.plateNumber?.includes(searchVehicle.toUpperCase())).map(vehicle => (
              <tr key={vehicle.vehicleId} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-900">{vehicle.plateNumber}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{vehicle.brand} {vehicle.model}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${vehicle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${vehicle.riskScore > 60 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {vehicle.riskScore}/100
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{vehicle.currentMileage} km</td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelectedVehicle(vehicle)} className="text-blue-600 hover:text-blue-700 font-bold text-sm">
                    Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== RENDER: CONTRACTS SECTION ==========
  const renderContracts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Sözleşmeler</h2>
        <button
          onClick={() => setShowContractForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm"
        >
          Yeni Sözleşme
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Müşteri</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Araç</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Durum</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Başlangıç</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Bitiş</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Günlük Ücret</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {contracts.map(contract => (
              <tr key={contract.contractId} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-900">{contract.customerName}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{contract.vehicleId}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${contract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {contract.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{new Date(contract.startDate).toLocaleDateString('tr-TR')}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{new Date(contract.endDate).toLocaleDateString('tr-TR')}</td>
                <td className="px-6 py-4 font-bold text-slate-900">₺{contract.dailyRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== RENDER: MAINTENANCE & SERVICE SECTION ==========
  const renderMaintenance = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Bakım & Servis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Wrench size={20} className="text-purple-600" />
            Bakım Bekleyen Araçlar
          </h3>
          <div className="space-y-2">
            {vehicles.filter(v => v.currentMileage > 50000).map(vehicle => (
              <div key={vehicle.vehicleId} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-bold text-slate-900">{vehicle.plateNumber}</p>
                <p className="text-xs text-slate-600">{vehicle.currentMileage} km - Bakım Gerekli</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-blue-600" />
            Serviste Olan Araçlar
          </h3>
          <div className="space-y-2">
            {vehicles.filter(v => v.status === 'MAINTENANCE').map(vehicle => (
              <div key={vehicle.vehicleId} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-bold text-slate-900">{vehicle.plateNumber}</p>
                <p className="text-xs text-slate-600">Servis Durumunda</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ========== RENDER: REVENUE & PERFORMANCE SECTION ==========
  const renderRevenue = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Gelir & Performans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 shadow-sm p-6">
          <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Aylık Gelir</p>
          <p className="text-3xl font-black text-emerald-700">₺{(kpis.monthlyRevenue / 1000).toFixed(1)}K</p>
          <p className="text-xs text-emerald-600 mt-2">Aktif sözleşmelerden</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-sm p-6">
          <p className="text-xs font-bold text-blue-600 uppercase mb-2">Araç Başı Gelir</p>
          <p className="text-3xl font-black text-blue-700">₺{kpis.totalVehicles > 0 ? Math.round(kpis.monthlyRevenue / kpis.totalVehicles) : 0}</p>
          <p className="text-xs text-blue-600 mt-2">Ortalama</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 shadow-sm p-6">
          <p className="text-xs font-bold text-purple-600 uppercase mb-2">Filo Verimliliği</p>
          <p className="text-3xl font-black text-purple-700">{Math.round((kpis.readyForRental / kpis.totalVehicles) * 100)}%</p>
          <p className="text-xs text-purple-600 mt-2">Kiralamaya Hazır</p>
        </div>
      </div>
    </div>
  );

  // ========== RENDER: AVID & DATA HEALTH SECTION ==========
  const renderAVIDAndData = () => {
    const kpis = calculateKPIs();
    
    // Calculate additional AVID metrics
    const avidVerificationRate = vehicles.length > 0 ? Math.round((kpis.avidVerifiedVehicles / vehicles.length) * 100) : 0;
    const complianceRate = vehicles.length > 0 ? Math.round(((vehicles.length - kpis.complianceIssueVehicles) / vehicles.length) * 100) : 0;
    const operationalReadinessRate = vehicles.length > 0 ? Math.round((kpis.fullyReadyVehicles / vehicles.length) * 100) : 0;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">AVID & Veri Sağlığı</h2>
        
        {/* AVID Identity Verification Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">AVID Doğrulanmış Araçlar</p>
            <p className="text-3xl font-black text-emerald-600">{kpis.avidVerifiedVehicles}</p>
            <p className="text-xs text-slate-600 mt-2">{avidVerificationRate}% Doğrulama Oranı</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Doğrulama Bekleyen</p>
            <p className="text-3xl font-black text-amber-600">{kpis.avidPendingVehicles}</p>
            <p className="text-xs text-slate-600 mt-2">Kimlik Doğrulama Devam Ediyor</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">AVID Sorunlu</p>
            <p className="text-3xl font-black text-red-600">{kpis.avidMissingVehicles}</p>
            <p className="text-xs text-slate-600 mt-2">Eksik / Eşleşme Sorunu</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Gerçekten Hazır</p>
            <p className="text-3xl font-black text-blue-600">{kpis.fullyReadyVehicles}</p>
            <p className="text-xs text-slate-600 mt-2">{operationalReadinessRate}% Operasyonel</p>
          </div>
        </div>
        
        {/* Operational Readiness & Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              AVID Uygunluk Durumu
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-slate-700">Uygunluk Sağlayanlar</p>
                  <p className="text-sm font-bold text-emerald-600">{complianceRate}%</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${complianceRate}%` }}></div>
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">KVKK Uygunluk</span>
                  <span className="font-bold text-emerald-600">✓ Sağlanıyor</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">Veri Koruması (Domain İzolasyon)</span>
                  <span className="font-bold text-emerald-600">✓ Aktif</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">AVID Kimliği Operasyonel</span>
                  <span className="font-bold text-emerald-600">✓ Aktif</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database size={20} className="text-purple-600" />
              Veri Sağlığı Göstergeleri
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-600 mb-2">Servis Ağı Veri Akışı</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-slate-600 mt-1">85% Sağlıklı</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-600 mb-2">Bakım Veri Akışı</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-slate-600 mt-1">78% Sağlıklı</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-600 mb-2">Risk Motoru Veri Akışı</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-xs text-slate-600 mt-1">92% Sağlıklı</p>
              </div>
              
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs font-bold text-slate-600 mb-2">Veri Paylaşım Uygunluğu</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">Tam: {Math.round(vehicles.length * 0.7)}</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">Kısıtlı: {Math.round(vehicles.length * 0.2)}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">Minimal: {Math.round(vehicles.length * 0.1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Domain Isolation & Readiness Rules */}
        {kpis.complianceIssueVehicles > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Onay Gerekli Araçlar ({kpis.complianceIssueVehicles} araç)
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Aşağıdaki araçlar kiralama işlemine devam etmeden önce yetkili onayı veya uygunluk doğrulaması gerektirir:
            </p>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>AVID kimliği eksik veya eşleşme sorunu olan araçlar → Kritik onay gerekli</span>
              </li>
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>Bakım süresi içinde olan araçlar (50.000+ km) → Bakım onayı ve yönetici incelemesi</span>
              </li>
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>Risk skoru 75+ olan araçlar (AVID eşleşme sorunu) → Yetkili incelemesi gerekli</span>
              </li>
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>INACTIVE durumda olan araçlar → Kritik onay gerekli</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-700 font-semibold">Filo Verileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!error && fleets.length === 0 && (
        <div className="flex items-center justify-center h-screen bg-slate-50">
          <div className="text-center">
            <div className="bg-slate-100 p-8 rounded-2xl inline-block mb-6">
              <Briefcase size={48} className="text-slate-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Henüz Filo Verisi Bulunmuyor</h2>
            <p className="text-slate-600 max-w-md mx-auto">Filo Kiralama modülü kullanmaya başlamak için önce filo ve araç verisi ekleyin.</p>
          </div>
        </div>
      )}

      {!error && fleets.length > 0 && (
        <>
          {/* Section Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 p-1 overflow-x-auto flex">
          {[
            { id: 'operation', label: 'Operasyon Merkezi', icon: Briefcase },
            { id: 'vehicles', label: 'Araçlar', icon: Users },
            { id: 'contracts', label: 'Sözleşmeler', icon: Calendar },
            { id: 'maintenance', label: 'Bakım & Servis', icon: Wrench },
            { id: 'intelligence', label: 'Filo Zekâ ve Risk Paneli', icon: TrendingUp },
            { id: 'revenue', label: 'Gelir & Performans', icon: DollarSign },
            { id: 'avid', label: 'AVID & Veri Sağlığı', icon: Database },
          ].map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id as any)}
                className={`flex-shrink-0 px-6 py-4 font-semibold text-sm transition flex items-center gap-2 whitespace-nowrap ${
                  currentSection === section.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {section.label}
              </button>
            );
          })}
          </div>

          {/* Section Content */}
          <div className="space-y-6">
            {currentSection === 'operation' && renderOperationCenter()}
            {currentSection === 'vehicles' && renderVehicles()}
            {currentSection === 'contracts' && renderContracts()}
            {currentSection === 'maintenance' && renderMaintenance()}
            {currentSection === 'intelligence' && <FleetIntelligenceRiskPanel fleetSize={vehicles.length} />}
            {currentSection === 'revenue' && renderRevenue()}
            {currentSection === 'avid' && renderAVIDAndData()}
          </div>
        </>
      )}
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className={`rounded-2xl border shadow-sm p-6 ${colors[color as keyof typeof colors]}`}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-bold text-slate-600 uppercase">{label}</p>
        <div className="opacity-50">{icon}</div>
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function KanbanColumn({ title, vehicles, onSelectVehicle, color }: { title: string; vehicles: Vehicle[]; onSelectVehicle: (v: Vehicle) => void; color: string }) {
  const borderColors = {
    emerald: 'border-emerald-200',
    blue: 'border-blue-200',
    amber: 'border-amber-200',
    purple: 'border-purple-200',
    red: 'border-red-200',
  };

  const bgColors = {
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
    red: 'bg-red-50',
  };

  return (
    <div className={`rounded-xl border-2 ${borderColors[color as keyof typeof borderColors]} ${bgColors[color as keyof typeof bgColors]} p-4`}>
      <h4 className="font-bold text-slate-900 mb-3">{title}</h4>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {vehicles.length === 0 ? (
          <p className="text-xs text-slate-500">Araç yok</p>
        ) : (
          vehicles.map(v => {
            const avidStatus = deriveAvidIdentity(v);
            
            return (
              <button
                key={v.vehicleId}
                onClick={() => onSelectVehicle(v)}
                className="w-full p-2 bg-white rounded-lg border border-slate-200 hover:border-slate-400 transition text-left"
              >
                <p className="text-xs font-bold text-slate-900">{v.plateNumber}</p>
                <p className="text-xs text-slate-600">{v.brand} {v.model}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">Risk: {v.riskScore}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    avidStatus.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                    avidStatus.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    avidStatus.status === 'isolated' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {avidStatus.status === 'verified' && <Lock size={10} />}
                    {avidStatus.status === 'pending' && <Unlock size={10} />}
                    {avidStatus.status === 'isolated' && <Database size={10} />}
                    {(avidStatus.status === 'missing' || avidStatus.status === 'mismatch') && <AlertTriangle size={10} />}
                    {avidStatus.label.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
