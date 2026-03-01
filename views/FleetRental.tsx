import React, { useState, useEffect } from 'react';
import { listFleets, listVehicles, listContracts, createContract, getVehicleSummary, setContext, getContext, getFleetPolicy, updateFleetPolicy, listServiceRedirects, createServiceRedirect, createWorkOrder, getWorkOrder, updateWorkOrder, addLineItem, applyCost, updateFleetPolicyWithCosts, requestApproval, approveWorkOrder, rejectWorkOrder } from '../services/fleetRentalService';
import type { Fleet, Vehicle, RentalContract, CreateContractPayload, VehicleSummary, FleetPolicy, ServiceRedirect, WorkOrder, WorkOrderLineItem } from '../types/fleetRental';

export default function FleetRental() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Role-based access control
  const [role, setRole] = useState<'admin' | 'ops' | 'viewer'>('ops');

  // Tab state
  const [activeTab, setActiveTab] = useState<'vehicles' | 'contracts' | 'summary'>('vehicles');

  // Vehicle Summary state (V2.1)
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

  // Debug: Track why buttons are disabled
  const getButtonDisabledReason = (): string | null => {
    if (role === 'viewer') return 'Viewer rolü';
    if (!selectedFleet) return 'Filo seçilmedi';
    if (!selectedVehicleId) return 'Araç seçilmedi';
    return null;
  };

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
    dailyRate: 1000,
    monthlyRate: 22000,
    kmLimit: 10000,
    depositAmount: 50000,
  });

  // Update service context when role changes
  useEffect(() => {
    if (selectedFleet) {
      setContext(selectedFleet.fleetId, role);
    }
  }, [selectedFleet, role]);

  // Load all fleets on mount
  useEffect(() => {
    const loadFleets = async () => {
      setLoading(true);
      setError(null);
      setApiStatus(s => ({ ...s, fleet: 'loading' }));
      try {
        const data = await listFleets();
        setFleets(data);
        setApiStatus(s => ({ ...s, fleet: 'ok' }));
        if (data.length > 0) {
          setSelectedFleet(data[0]);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[FleetRental] Failed to load fleets:', errorMsg);
        setApiStatus(s => ({ ...s, fleet: 'error' }));
        setError(`Failed to load fleets: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    loadFleets();
  }, []);

  // Load vehicles and contracts when fleet changes
  useEffect(() => {
    if (!selectedFleet) return;

    const loadFleetData = async () => {
      setLoading(true);
      setError(null);
      setApiStatus(s => ({ ...s, vehicles: 'loading', contracts: 'loading' }));
      try {
        const [vehiclesData, contractsData] = await Promise.all([
          listVehicles(selectedFleet.fleetId),
          listContracts(selectedFleet.fleetId),
        ]);
        setVehicles(vehiclesData);
        setContracts(contractsData);
        setApiStatus(s => ({ ...s, vehicles: 'ok', contracts: 'ok' }));
        // Auto-select first vehicle for summary tab
        if (vehiclesData.length > 0) {
          setSelectedVehicleId(vehiclesData[0].vehicleId);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[FleetRental] Failed to load fleet data:', errorMsg);
        setApiStatus(s => ({ ...s, vehicles: 'error', contracts: 'error' }));
        setError(`Failed to load fleet data: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    loadFleetData();
  }, [selectedFleet]);

  // Load vehicle summary when selectedVehicleId changes or activeTab becomes 'summary'
  useEffect(() => {
    if (!selectedVehicleId || activeTab !== 'summary') return;

    const loadSummary = async () => {
      setSummaryLoading(true);
      try {
        const summary = await getVehicleSummary(selectedVehicleId);
        setVehicleSummary(summary);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[FleetRental] Failed to load vehicle summary:', errorMsg);
        setError(`Failed to load vehicle summary: ${errorMsg}`);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [selectedVehicleId, activeTab]);

  // Load fleet policy and service redirects (V2.2)
  useEffect(() => {
    if (!selectedVehicleId || !selectedFleet) return;

    const loadV2Data = async () => {
      try {
        const policy = await getFleetPolicy(selectedFleet.fleetId);
        setFleetPolicy(policy);

        const redirects = await listServiceRedirects(selectedVehicleId);
        setServiceRedirects(redirects);

        // Update form default based on policy
        setRedirectForm(f => ({ ...f, applyStatusChange: policy.autoSetServicedOnRedirect }));
      } catch (err) {
        console.error('[FleetRental] Failed to load V2.2 data:', err);
      }
    };

    loadV2Data();
  }, [selectedVehicleId, selectedFleet]);

  // Safe arrays for null safety (must be BEFORE filter functions)
  const safeFleets = fleets ?? [];
  const safeVehicles = vehicles ?? [];
  const safeContracts = contracts ?? [];
  const safeWorkOrders: WorkOrder[] = [];

  // Filter functions - using safe arrays
  const filteredFleets = safeFleets.filter((f) =>
    f.name.toLowerCase().includes(searchFleet.toLowerCase())
  );

  const filteredVehicles = safeVehicles.filter(
    (v) =>
      v.brand.toLowerCase().includes(searchVehicle.toLowerCase()) ||
      v.model.toLowerCase().includes(searchVehicle.toLowerCase()) ||
      v.plateNumber.includes(searchVehicle)
  );

  const filteredContracts = safeContracts.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchContract.toLowerCase()) ||
      c.contractId.includes(searchContract)
  );

  // Handle contract creation
  const handleCreateContract = async () => {
    if (!selectedFleet) return;

    // Role check: viewer cannot create contracts
    if (role === 'viewer') {
      setError('Viewer role cannot create contracts');
      return;
    }

    if (
      !contractForm.vehicleId ||
      !contractForm.customerName ||
      !contractForm.startDate ||
      !contractForm.endDate
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createContract(selectedFleet.fleetId, contractForm);
      // Reload contracts
      const updatedContracts = await listContracts(selectedFleet.fleetId);
      setContracts(updatedContracts);
      setShowContractForm(false);
      // Reset form
      setContractForm({
        vehicleId: '',
        customerName: '',
        startDate: '',
        endDate: '',
        dailyRate: 1000,
        monthlyRate: 22000,
        kmLimit: 10000,
        depositAmount: 50000,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[FleetRental] Failed to create contract:', errorMsg);
      setError(`Failed to create contract: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // V2.2 Handlers
  const handleOpenRedirectModal = (servicePointId: string) => {
    setRedirectModal({ open: true, selectedServicePointId: servicePointId });
  };

  const handleCreateRedirect = async () => {
    if (!selectedVehicleId || !selectedFleet) {
      setError('Lütfen filo ve araç seçiniz');
      return;
    }

    if (!redirectModal.selectedServicePointId) {
      setError('Servis noktası seçiniz');
      return;
    }

    setLoading(true);
    try {
      const response = await createServiceRedirect(selectedVehicleId, {
        servicePointId: redirectModal.selectedServicePointId,
        reason: redirectForm.reason,
        note: redirectForm.note,
        redirectType: 'RoutineMaintenance',
        applyStatusChange: redirectForm.applyStatusChange,
      });

      // Show toast (V2.6 - Now creates appointment)
      setToast({ show: true, message: 'Randevu oluşturuldu' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);

      // Reload redirects
      const updatedRedirects = await listServiceRedirects(selectedVehicleId);
      setServiceRedirects(updatedRedirects);

      // Reload summary
      const updatedSummary = await getVehicleSummary(selectedVehicleId);
      setVehicleSummary(updatedSummary);

      // Close modal and reset form
      setRedirectModal({ open: false, selectedServicePointId: null });
      setRedirectForm({ reason: 'Maintenance', note: '', applyStatusChange: fleetPolicy?.autoSetServicedOnRedirect || false });
    } catch (err) {
      setError(`Yönlendirme başarısız: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFleetPolicy = async () => {
    if (!selectedFleet || !fleetPolicy) return;

    setLoading(true);
    try {
      const updatedPolicy = await updateFleetPolicy(selectedFleet.fleetId, {
        autoSetServicedOnRedirect: !fleetPolicy.autoSetServicedOnRedirect,
      });
      setFleetPolicy(updatedPolicy);
      setRedirectForm(f => ({ ...f, applyStatusChange: updatedPolicy.autoSetServicedOnRedirect }));
    } catch (err) {
      setError(`Failed to update fleet policy: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // V2.3 - Handle create work order from redirect
  const handleCreateWorkOrder = async (redirectId: string) => {
    setWorkOrderCreating({ ...workOrderCreating, [redirectId]: true });
    try {
      await createWorkOrder(redirectId);
      setToast({ show: true, message: 'İş Emri oluşturuldu' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);

      // Reload redirects to update workOrderId field
      if (selectedVehicleId) {
        const updatedRedirects = await listServiceRedirects(selectedVehicleId);
        setServiceRedirects(updatedRedirects);
      }
    } catch (err) {
      setError(`Failed to create work order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setWorkOrderCreating({ ...workOrderCreating, [redirectId]: false });
    }
  };

  // V2.4 - Open work order detail
  const handleOpenWorkOrderDetail = async (workOrderId: string) => {
    try {
      const workOrder = await getWorkOrder(workOrderId);
      setSelectedWorkOrder(workOrder);
      setSelectedWorkOrderId(workOrderId);
      setWorkOrderDetailModal(true);
    } catch (err) {
      setError(`Failed to load work order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // V2.4 - Add line item to work order
  const handleAddLineItem = async () => {
    if (!selectedWorkOrderId) return;
    try {
      const result = await addLineItem(selectedWorkOrderId, newLineItem);
      setToast({ show: true, message: `Kalem eklendi (Toplam: ₺${result.totalAmount})` });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);

      // Reload work order details
      const updatedWorkOrder = await getWorkOrder(selectedWorkOrderId);
      setSelectedWorkOrder(updatedWorkOrder);

      // Reset form
      setNewLineItem({ type: 'Labor', description: '', qty: 1, unitPrice: 0, currency: 'TRY' });
    } catch (err) {
      setError(`Failed to add line item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // V2.4 - Update work order status
  const handleUpdateWorkOrderStatus = async (status: 'Open' | 'InProgress' | 'Closed') => {
    if (!selectedWorkOrderId) return;
    try {
      const updated = await updateWorkOrder(selectedWorkOrderId, { status });
      setSelectedWorkOrder(updated);
      setToast({ show: true, message: 'Durum güncellenindi' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);

      // If cost was applied (OnClose mode), refresh vehicle summary
      if (updated.costApplied && selectedVehicleId) {
        const updatedSummary = await getVehicleSummary(selectedVehicleId);
        setVehicleSummary(updatedSummary);
      }
    } catch (err) {
      setError(`Failed to update work order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // V2.4 - Apply work order cost (Manual mode) with V2.5 approval gates
  const handleApplyCost = async () => {
    if (!selectedWorkOrderId) return;
    try {
      const result = await applyCost(selectedWorkOrderId);
      setToast({ show: true, message: `Maliyet işlendi (ID: ${result.costId})` });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);

      // Reload work order and vehicle summary
      const updated = await getWorkOrder(selectedWorkOrderId);
      setSelectedWorkOrder(updated);

      if (selectedVehicleId) {
        const updatedSummary = await getVehicleSummary(selectedVehicleId);
        setVehicleSummary(updatedSummary);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      // Check for 409 Conflict errors (approval required, status issues)
      if (errorMessage.includes('409') || errorMessage.includes('Approval') || errorMessage.includes('Closed')) {
        setError(`Maliyet işlenemedi: ${errorMessage}`);
      } else {
        setError(`Maliyet işleme hatası: ${errorMessage}`);
      }
    }
  };

  // V2.5 - Handle breakdown incident (BreakdownIncident redirect)
  const handleBreakdownIncident = async () => {
    if (!selectedVehicleId) {
      setError('Önce bir araç seçiniz');
      return;
    }
    if (!breakdownForm.symptom) {
      setError('Semptom gereklidir');
      return;
    }
    if (!breakdownForm.severity) {
      setError('Şiddet seçiniz');
      return;
    }
    if (!breakdownForm.selectedServicePointId) {
      setError('Servis noktası seçiniz');
      return;
    }

    try {
      const redirect = await createServiceRedirect(selectedVehicleId, {
        servicePointId: breakdownForm.selectedServicePointId,
        redirectType: 'BreakdownIncident',
        reason: 'Breakdown',
        incident: {
          incidentId: 'INC-' + Math.random().toString(36).substr(2, 9),
          title: breakdownForm.title || 'Ani Arıza',
          symptom: breakdownForm.symptom,
          severity: breakdownForm.severity as 'Low' | 'Medium' | 'High',
          occurredAt: new Date().toISOString(),
          locationCity: breakdownForm.locationCity,
        },
        applyStatusChange: false,
      });

      setToast({ show: true, message: `Arıza bildirimi oluşturuldu (Randevu: ${redirect.appointmentId})` });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);

      // Reset form and close modal
      setShowBreakdownModal(false);
      setBreakdownForm({
        incidentId: 'INC-' + Math.random().toString(36).substr(2, 9),
        title: '',
        symptom: '',
        severity: 'Medium',
        locationCity: '',
        selectedServicePointId: null,
      });

      // Reload redirects
      const updated = await listServiceRedirects(selectedVehicleId);
      setServiceRedirects(updated);
    } catch (err) {
      setError(`Arıza bildirimi başarısız: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    }
  };

  // V2.5 - Request approval
  const handleRequestApproval = async () => {
    if (!selectedWorkOrderId) return;
    try {
      await requestApproval(selectedWorkOrderId);
      const updated = await getWorkOrder(selectedWorkOrderId);
      setSelectedWorkOrder(updated);
      setToast({ show: true, message: 'Onay isteği gönderildi' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    } catch (err) {
      setError(`Failed to request approval: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // V2.5 - Approve work order
  const handleApproveWorkOrder = async (approvedExtraTotal?: number) => {
    if (!selectedWorkOrderId) return;
    try {
      await approveWorkOrder(selectedWorkOrderId, { approvedExtraTotal });
      const updated = await getWorkOrder(selectedWorkOrderId);
      setSelectedWorkOrder(updated);
      setToast({ show: true, message: 'İş emri onaylandı' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    } catch (err) {
      setError(`Failed to approve: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // V2.5 - Reject work order
  const handleRejectWorkOrder = async (note: string) => {
    if (!selectedWorkOrderId) return;
    try {
      await rejectWorkOrder(selectedWorkOrderId, note);
      const updated = await getWorkOrder(selectedWorkOrderId);
      setSelectedWorkOrder(updated);
      setToast({ show: true, message: 'İş emri reddedildi' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    } catch (err) {
      setError(`Failed to reject: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // KPI calculations
  const kpis = {
    totalFleets: safeFleets.length,
    selectedFleetVehicles: safeVehicles.length,
    activeVehicles: safeVehicles.filter((v) => v.status === 'ACTIVE').length,
    maintenanceVehicles: safeVehicles.filter((v) => v.status === 'MAINTENANCE').length,
    activeContracts: safeContracts.filter((c) => c.status === 'ACTIVE').length,
    draftContracts: safeContracts.filter((c) => c.status === 'DRAFT').length,
    monthlyRevenue: safeContracts
      .filter((c) => c.status === 'ACTIVE')
      .reduce((sum, c) => sum + c.monthlyRate, 0),
    avgRiskScore:
      safeVehicles.length > 0
        ? Math.round(
            safeVehicles.reduce((sum, v) => sum + (Math.random() * 100), 0) / safeVehicles.length
          )
        : 0,
  };

  // Status badge helper
  const getStatusClass = (status: string) => {
    const baseClass =
      'px-2 py-1 rounded text-xs font-medium inline-block text-white';
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return `${baseClass} bg-green-600`;
      case 'SERVICED':
        return `${baseClass} bg-blue-600`;
      case 'DRAFT':
        return `${baseClass} bg-yellow-600`;
      case 'COMPLETED':
        return `${baseClass} bg-gray-600`;
      case 'MAINTENANCE':
        return `${baseClass} bg-orange-600`;
      default:
        return `${baseClass} bg-gray-600`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Filo Kiralama Yönetimi</h1>
        <p className="text-gray-600">Filo aracı ve kiralama sözleşmelerini yönetin</p>
      </div>

      {/* Diagnostics Panel */}
      <div className="mb-4 bg-gray-100 border border-gray-300 rounded p-3 text-xs">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div><span className="font-semibold">Tenant:</span> {selectedFleet?.fleetId || 'None'}</div>
            <div><span className="font-semibold">Role:</span> {role}</div>
            <div><span className="font-semibold">API Status:</span> Fleet={apiStatus.fleet} | Vehicles={apiStatus.vehicles} | Contracts={apiStatus.contracts}</div>
          </div>
          <div className="flex gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'ops' | 'viewer')}
              className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
            >
              <option value="admin">Admin</option>
              <option value="ops">Ops</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Main layout: 3 panels */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel: Fleets */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filoler ({fleets.length})</h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Filo ara..."
              value={searchFleet}
              onChange={(e) => setSearchFleet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredFleets.length === 0 ? (
              <div className="text-gray-500 text-sm p-3 text-center">Filo bulunamadı</div>
            ) : (
              filteredFleets.map((fleet) => (
                <button
                  key={fleet.fleetId}
                  onClick={() => setSelectedFleet(fleet)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                    selectedFleet?.fleetId === fleet.fleetId
                      ? 'bg-blue-500 text-white font-medium'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{fleet.name}</div>
                  <div className="text-xs opacity-75">{fleet.fleetId}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center Panel: Vehicles & Contracts */}
        <div className="col-span-6 bg-white rounded-lg shadow p-4">
          {!selectedFleet ? (
            <div className="text-center text-gray-500 py-8">Lütfen bir filo seçin</div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedFleet.name}
              </h2>

              {/* Tabs */}
              <div className="flex border-b mb-4">
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className={`px-4 py-2 font-medium transition ${
                    activeTab === 'vehicles'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Araçlar ({vehicles.length})
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 font-medium transition ${
                    activeTab === 'summary'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Araç Özeti
                </button>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`px-4 py-2 font-medium transition ${
                    activeTab === 'contracts'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sözleşmeler ({contracts.length})
                </button>
              </div>

              {/* Vehicles Tab */}
              {activeTab === 'vehicles' && (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Araç ara..."
                      value={searchVehicle}
                      onChange={(e) => setSearchVehicle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredVehicles.length === 0 ? (
                      <div className="text-gray-500 text-sm p-3 text-center">Araç bulunamadı</div>
                    ) : (
                      filteredVehicles.map((vehicle) => (
                        <button
                          key={vehicle.vehicleId}
                          onClick={() => {
                            setSelectedVehicleId(vehicle.vehicleId);
                            setActiveTab('summary');
                          }}
                          className={`w-full text-left p-3 rounded border transition ${
                            selectedVehicleId === vehicle.vehicleId
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900">
                              {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </div>
                            <span className={getStatusClass(vehicle.status)}>
                              {vehicle.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Plaka: {vehicle.plateNumber}</div>
                            <div>Km: {Number(vehicle.currentMileage ?? 0).toLocaleString('tr-TR')}</div>
                            <div>Sonraki Bakım: {vehicle.nextMaintenanceDate}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Vehicle Summary Tab (V2.1) */}
              {activeTab === 'summary' && (
                <>
                  {!selectedVehicleId ? (
                    <div className="text-center text-gray-500 py-8">Araç seçin</div>
                  ) : summaryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : vehicleSummary ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {/* A) Araç Bilgisi */}
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Araç Bilgisi</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-600">VIN:</span> <span className="font-mono">{vehicleSummary.vin}</span></div>
                          <div><span className="text-gray-600">Plaka:</span> {vehicleSummary.plateNumber}</div>
                          <div><span className="text-gray-600">Marka:</span> {vehicleSummary.brand}</div>
                          <div><span className="text-gray-600">Model:</span> {vehicleSummary.model}</div>
                          <div><span className="text-gray-600">Yıl:</span> {vehicleSummary.year}</div>
                          <div><span className="text-gray-600">Durum:</span> <span className={getStatusClass(vehicleSummary.status)}>{vehicleSummary.status}</span></div>
                          <div className="col-span-2"><span className="text-gray-600">Mileage:</span> {Number(vehicleSummary.currentMileage ?? 0).toLocaleString('tr-TR')} km</div>
                        </div>
                      </div>

                      {/* B) Risk Özeti */}
                      {(() => {
                        const safeRisk = vehicleSummary?.risk ?? { score: 0, flags: [], level: 'Unknown' };
                        return (
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Risk Özeti</h3>
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600">Risk Skoru:</span>
                            <span className="text-lg font-bold text-orange-600">{Number(safeRisk.score ?? 0)}</span>
                            <span className="text-xs text-gray-600">/ 100</span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${Math.min(Number(safeRisk.score ?? 0), 100)}%` }}></div>
                          </div>
                        </div>
                        {(safeRisk.flags ?? []).length > 0 && (
                          <div className="text-xs space-y-1">
                            {(safeRisk.flags ?? []).map((flag: string, idx: number) => (
                              <div key={idx} className="text-red-700 bg-red-50 px-2 py-1 rounded">⚠ {flag}</div>
                            ))}
                          </div>
                        )}
                      </div>
                        );
                      })()} 

                      {/* C) Bakım Durumu */}
                      {(() => {
                        const safeMaintenance = vehicleSummary?.maintenance ?? { nextMaintenanceKm: 0, nextMaintenanceDate: '', upcoming: false, recent: [] };
                        return (
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Bakım Durumu</h3>
                        <div className="text-sm space-y-2 mb-3">
                          <div><span className="text-gray-600">Sonraki Bakım (Km):</span> {Number(safeMaintenance.nextMaintenanceKm ?? 0).toLocaleString('tr-TR')}</div>
                          <div><span className="text-gray-600">Sonraki Bakım (Tarih):</span> {safeMaintenance.nextMaintenanceDate}</div>
                          {safeMaintenance.upcoming && (
                            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-2 py-1 rounded text-xs">
                              ⏰ Yakında Bakım Yapılacak
                            </div>
                          )}
                        </div>
                        {(safeMaintenance.recent ?? []).length > 0 && (
                          <>
                            <div className="text-xs font-semibold text-gray-700 mb-2">Son 3 Bakım Kaydı:</div>
                            {(safeMaintenance.recent ?? []).map((mnt: any, idx: number) => (
                              <div key={idx} className="bg-white p-2 rounded border border-gray-300 text-xs mb-1">
                                <div><span className="text-gray-600">Tarih:</span> {mnt.serviceDate}</div>
                                <div><span className="text-gray-600">Km:</span> {Number(mnt.mileageAtService ?? 0).toLocaleString('tr-TR')}</div>
                                <div><span className="text-gray-600">Tür:</span> {mnt.serviceType}</div>
                                {mnt.incurredCost && <div><span className="text-gray-600">Maliyet:</span> {Number(mnt.incurredCost ?? 0).toLocaleString('tr-TR')} ₺</div>}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                        );
                      })()} 

                      {/* D) Maliyet Özeti */}
                      {(() => {
                        const safeCosts = vehicleSummary?.costs ?? { last30DaysTotal: 0, breakdown: [] };
                        return (
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Maliyet Özeti (Son 30 Gün)</h3>
                        <div className="text-lg font-bold text-blue-600 mb-3">{Number(safeCosts.last30DaysTotal ?? 0).toLocaleString('tr-TR')} ₺</div>
                        {(safeCosts.breakdown ?? []).length > 0 && (
                          <div className="space-y-1 text-xs">
                            {(safeCosts.breakdown ?? []).map((cost: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-gray-600">{cost.category}:</span>
                                <span className="font-medium">{Number(cost.amount ?? 0).toLocaleString('tr-TR')} ₺</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                        );
                      })()} 

                      {/* E) Parça Önerileri */}
                      {(() => {
                        const safeParts = vehicleSummary?.parts ?? { topParts: [] };
                        return (
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Parça Önerileri (Top 3)</h3>
                        {(safeParts.topParts ?? []).length === 0 ? (
                          <div className="text-gray-500 text-xs">Parça önerisi bulunamadı</div>
                        ) : (
                          <div className="space-y-2">
                            {(safeParts.topParts ?? []).map((part: any, idx: number) => (
                              <div key={idx} className="bg-white p-2 rounded border border-gray-300 text-xs">
                                <div className="font-medium">{part.partName}</div>
                                {part.oem && <div><span className="text-gray-600">OEM:</span> {part.oem}</div>}
                                <div><span className="text-gray-600">Miktar:</span> {part.recommendedQty}</div>
                                <div><span className="text-gray-600">Confidence:</span> {(part.confidence * 100).toFixed(0)}%</div>
                                {part.topOffer && (
                                  <div className="bg-blue-50 mt-1 p-1 rounded">
                                    <div><span className="text-gray-600">Tedarikçi:</span> {part.topOffer.supplierName}</div>
                                    <div><span className="text-gray-600">Fiyat:</span> {Number(part.topOffer.price ?? 0).toLocaleString('tr-TR')} {part.topOffer.currency}</div>
                                    {part.topOffer.etaDays && <div><span className="text-gray-600">Gün:</span> {part.topOffer.etaDays}</div>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                        );
                      })()} 

                      {/* F) Servis Noktaları */}
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-gray-900">Yönlendirme İşlemleri (V2.5)</h3>
                        </div>
                        <div className="flex gap-2 mb-4">
                          {/* Bakım İçin Yönlendir Button */}
                          <div className="flex-1 relative group">
                            <button
                              onClick={() => setRedirectModal({ open: true, selectedServicePointId: null })}
                              disabled={role === 'viewer' || !selectedFleet || !selectedVehicleId || loading}
                              title={getButtonDisabledReason() || ''}
                              className={`w-full text-xs px-3 py-2 rounded transition font-semibold flex items-center justify-center gap-1 ${
                                role === 'viewer' || !selectedFleet || !selectedVehicleId
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              🔧 Bakım İçin Yönlendir
                              {getButtonDisabledReason() && (
                                <span className="text-lg">ℹ️</span>
                              )}
                            </button>
                            {getButtonDisabledReason() && (
                              <div className="absolute left-0 top-10 bg-gray-900 text-white text-xs p-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10">
                                {getButtonDisabledReason()}
                              </div>
                            )}
                          </div>

                          {/* Arıza Bildir Button */}
                          <div className="flex-1 relative group">
                            <button
                              onClick={() => setShowBreakdownModal(true)}
                              disabled={role === 'viewer' || !selectedFleet || !selectedVehicleId || loading}
                              title={getButtonDisabledReason() || ''}
                              className={`w-full text-xs px-3 py-2 rounded transition font-semibold flex items-center justify-center gap-1 ${
                                role === 'viewer' || !selectedFleet || !selectedVehicleId
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              ⚠️ Arıza Bildir
                              {getButtonDisabledReason() && (
                                <span className="text-lg">ℹ️</span>
                              )}
                            </button>
                            {getButtonDisabledReason() && (
                              <div className="absolute left-0 top-10 bg-gray-900 text-white text-xs p-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10">
                                {getButtonDisabledReason()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* G) Servis Noktaları */}
                      {(() => {
                        const safeRecommendedServicePoints = (vehicleSummary?.service?.recommendedServicePoints ?? []);
                        return (
                          <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-3">Servis Noktaları</h3>
                            {safeRecommendedServicePoints.length === 0 ? (
                              <div className="text-gray-500 text-xs">Önerilen servis noktası bulunamadı</div>
                            ) : (
                              <div className="space-y-2">
                                {safeRecommendedServicePoints.map((sp, idx) => (
                                  <div key={idx} className="bg-white p-2 rounded border border-gray-300 text-xs">
                                    <div className="flex justify-between mb-1">
                                      <div className="font-medium">{sp.name}</div>
                                      <span className={`px-1 py-0.5 rounded text-white text-xs ${sp.type === 'Authorized' ? 'bg-green-600' : 'bg-gray-600'}`}>
                                        {sp.type}
                                      </span>
                                    </div>
                                    <div><span className="text-gray-600">Şehir:</span> {sp.city}</div>
                                    {sp.phone && <div><span className="text-gray-600">Tel:</span> {sp.phone}</div>}
                                    <button
                                      onClick={() => handleOpenRedirectModal(sp.servicePointId)}
                                      disabled={role === 'viewer'}
                                      className={`mt-1 text-xs px-2 py-1 rounded transition ${
                                        role === 'viewer'
                                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                          : 'bg-blue-500 text-white hover:bg-blue-600'
                                      }`}
                                    >
                                      Yönlendir (V2.2)
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* G) Son Servis Yönlendirmeleri (V2.2) */}
                      {serviceRedirects.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-3">Son Servis Yönlendirmeleri</h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {serviceRedirects.slice(-5).map((redirect) => (
                              <div key={redirect.redirectId} className="bg-white p-3 rounded border border-gray-200 text-xs">
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium">{redirect.servicePointName}</span>
                                  <span className="text-gray-600">{redirect.reason}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 mb-2">
                                  <span>{new Date(redirect.createdAt).toLocaleDateString('tr-TR')}</span>
                                  <span>{redirect.applyStatusChange ? '✓ Status' : '○ No Status'}</span>
                                </div>
                                {/* V2.3 - Work Order buttons */}
                                <div className="flex gap-2 mt-2">
                                  {!redirect.workOrderId ? (
                                    <button
                                      onClick={() => handleCreateWorkOrder(redirect.redirectId)}
                                      disabled={workOrderCreating[redirect.redirectId] || role === 'viewer'}
                                      className="flex-1 px-2 py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                    >
                                      {workOrderCreating[redirect.redirectId] ? '...' : 'İş Emri Aç'}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => navigator && redirect.workOrderId && handleOpenWorkOrderDetail(redirect.workOrderId)}
                                      className="flex-1 px-2 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition"
                                    >
                                      İş Emrine Git
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">Özet bulunamadı</div>
                  )}
                </>
              )}

              {/* Redirect Modal (V2.2) */}
              {redirectModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Bakım Yönlendirmesi</h2>
                    
                    <div className="space-y-4">
                      {/* Service Point Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Servis Noktası *</label>
                        {vehicleSummary?.service?.recommendedServicePoints && vehicleSummary.service.recommendedServicePoints.length > 0 ? (
                          <select
                            value={redirectModal.selectedServicePointId || ''}
                            onChange={(e) => setRedirectModal({ ...redirectModal, selectedServicePointId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Servis noktası seçin...</option>
                            {vehicleSummary.service.recommendedServicePoints.map((sp) => (
                              <option key={sp.servicePointId} value={sp.servicePointId}>
                                {sp.name} ({sp.city})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
                            Henüz servis noktası tanımlı değil
                          </div>
                        )}
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sebep</label>
                        <select
                          value={redirectForm.reason}
                          onChange={(e) => setRedirectForm({ ...redirectForm, reason: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Maintenance">Periyodik Bakım</option>
                          <option value="Breakdown">Arıza</option>
                          <option value="Risk">Risk</option>
                          <option value="Other">Diğer</option>
                        </select>
                      </div>

                      {/* Note */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Not (İsteğe Bağlı)</label>
                        <textarea
                          value={redirectForm.note}
                          onChange={(e) => setRedirectForm({ ...redirectForm, note: e.target.value })}
                          placeholder="Ek bilgi ekleyin..."
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>

                      {/* Auto Status Change */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="autoStatus"
                          checked={redirectForm.applyStatusChange}
                          onChange={(e) => setRedirectForm({ ...redirectForm, applyStatusChange: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="autoStatus" className="ml-2 text-sm text-gray-700">
                          Yönlendirme sonrası aracı Serviced yap
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => setRedirectModal({ open: false, selectedServicePointId: null })}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleCreateRedirect}
                        disabled={loading || !redirectModal.selectedServicePointId}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded transition"
                      >
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fleet Policy Section (V2.2) - at top of Araç Özeti */}
              {activeTab === 'summary' && selectedVehicleId && fleetPolicy && (
                <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Yönlendirme sonrası otomatik Serviced yap</label>
                    <button
                      onClick={handleToggleFleetPolicy}
                      disabled={role === 'viewer' || loading}
                      className={`w-12 h-6 rounded-full transition ${
                        fleetPolicy.autoSetServicedOnRedirect ? 'bg-green-500' : 'bg-gray-300'
                      } ${role === 'viewer' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition ${fleetPolicy.autoSetServicedOnRedirect ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                </div>
              )}

              {/* V2.4 Work Order Detail Modal */}
              {workOrderDetailModal && selectedWorkOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">İş Emri: {selectedWorkOrder.workOrderId}</h2>
                      <button
                        onClick={() => setWorkOrderDetailModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                      >
                        ✕
                      </button>
                    </div>

                    {/* V2.6 - Origin Display */}
                    {selectedWorkOrder.origin && (
                      <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                        <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">Kaynak Bilgisi</h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-blue-700">Kaynak:</span>
                            <div className="font-bold text-blue-900">
                              {selectedWorkOrder.origin.channel === 'FleetRental' && '🚗 Filo Kiralama'}
                              {selectedWorkOrder.origin.channel === 'Individual' && '👤 Bireysel'}
                              {selectedWorkOrder.origin.channel === 'Dealer' && '🏪 Galeri'}
                            </div>
                          </div>
                          <div>
                            <span className="text-blue-700">Geliş Modu:</span>
                            <div className="font-bold text-blue-900">
                              {selectedWorkOrder.origin.arrivalMode === 'Appointment' && '📅 Randevu'}
                              {selectedWorkOrder.origin.arrivalMode === 'WalkIn' && '🚶 Alışveriş'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Dropdown */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                      <select
                        value={selectedWorkOrder.status}
                        onChange={(e) => handleUpdateWorkOrderStatus(e.target.value as 'Open' | 'InProgress' | 'Closed')}
                        disabled={role === 'viewer'}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="Open">Açık</option>
                        <option value="InProgress">Devam Ediyor</option>
                        <option value="Closed">Kapalı</option>
                      </select>
                    </div>

                    {/* Line Items */}
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">Kalemler</h3>
                      <div className="bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                        {selectedWorkOrder.lineItems && selectedWorkOrder.lineItems.length > 0 ? (
                          <div className="space-y-1">
                            {selectedWorkOrder.lineItems.map((item) => (
                              <div key={item.lineId} className="text-xs bg-white p-2 rounded border border-gray-200">
                                <div className="font-medium">{item.description}</div>
                                <div className="text-gray-600">
                                  {item.qty} x {item.unitPrice} {item.currency} = {(item.qty * item.unitPrice).toFixed(2)} {item.currency}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 p-2">Kalem yok</div>
                        )}
                      </div>
                    </div>

                    {/* Add Line Item Form */}
                    {role !== 'viewer' && (
                      <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Kalem Ekle</h4>
                        <div className="space-y-2">
                          <select
                            value={newLineItem.type}
                            onChange={(e) => setNewLineItem({ ...newLineItem, type: e.target.value as 'Labor' | 'Part' })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="Labor">İşçilik</option>
                            <option value="Part">Parça</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Açıklama"
                            value={newLineItem.description}
                            onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <div className="grid grid-cols-3 gap-1">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={newLineItem.qty}
                              onChange={(e) => setNewLineItem({ ...newLineItem, qty: parseInt(e.target.value) || 1 })}
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                            <input
                              type="number"
                              placeholder="Birim Fiyat"
                              value={newLineItem.unitPrice}
                              onChange={(e) => setNewLineItem({ ...newLineItem, unitPrice: parseFloat(e.target.value) || 0 })}
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                            <select
                              value={newLineItem.currency}
                              onChange={(e) => setNewLineItem({ ...newLineItem, currency: e.target.value as any })}
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                            >
                              <option value="TRY">TRY</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                            </select>
                          </div>
                          <button
                            onClick={handleAddLineItem}
                            className="w-full px-2 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition"
                          >
                            + Kalem Ekle
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Total Amount and Cost Status */}
                    <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Toplam Tutar:</span>
                        <span className="text-sm font-bold">{(selectedWorkOrder.totalAmount || 0).toFixed(2)} {selectedWorkOrder.currency || 'TRY'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Maliyet Durumu:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${selectedWorkOrder.costApplied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {selectedWorkOrder.costApplied ? '✓ İşlendi' : '○ İşlenmedi'}
                        </span>
                      </div>
                    </div>

                    {/* Cost Apply Button (Manual Mode) */}
                    {role !== 'viewer' && !selectedWorkOrder.costApplied && fleetPolicy?.costApplyMode === 'Manual' && (
                      <button
                        onClick={handleApplyCost}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition"
                      >
                        Maliyeti İşle
                      </button>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={() => setWorkOrderDetailModal(false)}
                      className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}

              {/* V2.5 Breakdown Incident Modal */}
              {showBreakdownModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">⚠️ Arıza Bildirimi</h2>
                      <button
                        onClick={() => setShowBreakdownModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      {/* Service Point Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Servis Noktası *</label>
                        {vehicleSummary?.service?.recommendedServicePoints && vehicleSummary.service.recommendedServicePoints.length > 0 ? (
                          <select
                            value={breakdownForm.selectedServicePointId || ''}
                            onChange={(e) => setBreakdownForm({ ...breakdownForm, selectedServicePointId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">Servis noktası seçin...</option>
                            {vehicleSummary.service.recommendedServicePoints.map((sp) => (
                              <option key={sp.servicePointId} value={sp.servicePointId}>
                                {sp.name} ({sp.city})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
                            Henüz servis noktası tanımlı değil
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arıza Başlığı</label>
                        <input
                          type="text"
                          placeholder="örn: Motor arızası"
                          value={breakdownForm.title}
                          onChange={(e) => setBreakdownForm({ ...breakdownForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semptom * (zorunlu)</label>
                        <textarea
                          placeholder="Arızanın semptomlarını açıklayınız"
                          value={breakdownForm.symptom}
                          onChange={(e) => setBreakdownForm({ ...breakdownForm, symptom: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şiddet</label>
                        <select
                          value={breakdownForm.severity}
                          onChange={(e) => setBreakdownForm({ ...breakdownForm, severity: e.target.value as 'Low' | 'Medium' | 'High' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="Low">Düşük</option>
                          <option value="Medium">Orta</option>
                          <option value="High">Yüksek</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yer (Şehir)</label>
                        <input
                          type="text"
                          placeholder="örn: İstanbul"
                          value={breakdownForm.locationCity}
                          onChange={(e) => setBreakdownForm({ ...breakdownForm, locationCity: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleBreakdownIncident}
                        disabled={!breakdownForm.symptom || !breakdownForm.severity || !breakdownForm.selectedServicePointId}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
                      >
                        Arızayı Bildir
                      </button>
                      <button
                        onClick={() => setShowBreakdownModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Toast Notification */}
              {toast.show && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
                  {toast.message}
                </div>
              )}
              {activeTab === 'contracts' && (
                <>
                  <div className="mb-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Sözleşme ara..."
                      value={searchContract}
                      onChange={(e) => setSearchContract(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setShowContractForm(!showContractForm)}
                      disabled={role === 'viewer'}
                      className={`px-4 py-2 rounded text-sm font-medium transition ${
                        role === 'viewer'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {showContractForm ? 'İptal' : 'Yeni'}
                    </button>
                  </div>

                  {/* Contract Form */}
                  {showContractForm && (
                    <div className="bg-blue-50 p-4 rounded mb-4 border border-blue-200">
                      <h3 className="font-semibold text-sm mb-3 text-gray-900">
                        Yeni Kiralama Sözleşmesi
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Araç</label>
                          <select
                            value={contractForm.vehicleId}
                            onChange={(e) =>
                              setContractForm({ ...contractForm, vehicleId: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Araç seçin</option>
                            {vehicles.map((v) => (
                              <option key={v.vehicleId} value={v.vehicleId}>
                                {v.brand} {v.model} - {v.plateNumber}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Müşteri Adı
                          </label>
                          <input
                            type="text"
                            value={contractForm.customerName}
                            onChange={(e) =>
                              setContractForm({
                                ...contractForm,
                                customerName: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-gray-700 font-medium mb-1">
                              Başlangıç Tarihi
                            </label>
                            <input
                              type="date"
                              value={contractForm.startDate}
                              onChange={(e) =>
                                setContractForm({ ...contractForm, startDate: e.target.value })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-medium mb-1">
                              Bitiş Tarihi
                            </label>
                            <input
                              type="date"
                              value={contractForm.endDate}
                              onChange={(e) =>
                                setContractForm({ ...contractForm, endDate: e.target.value })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-gray-700 font-medium mb-1">
                              Günlük Ücret (₺)
                            </label>
                            <input
                              type="number"
                              value={contractForm.dailyRate}
                              onChange={(e) =>
                                setContractForm({
                                  ...contractForm,
                                  dailyRate: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-medium mb-1">
                              Aylık Ücret (₺)
                            </label>
                            <input
                              type="number"
                              value={contractForm.monthlyRate}
                              onChange={(e) =>
                                setContractForm({
                                  ...contractForm,
                                  monthlyRate: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Km Limiti
                          </label>
                          <input
                            type="number"
                            value={contractForm.kmLimit}
                            onChange={(e) =>
                              setContractForm({ ...contractForm, kmLimit: parseInt(e.target.value) })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Teminat (₺)
                          </label>
                          <input
                            type="number"
                            value={contractForm.depositAmount}
                            onChange={(e) =>
                              setContractForm({
                                ...contractForm,
                                depositAmount: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        <button
                          onClick={handleCreateContract}
                          disabled={loading}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
                        >
                          {loading ? 'Kaydediliyor...' : 'Sözleşme Oluştur'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Contracts List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredContracts.length === 0 ? (
                      <div className="text-gray-500 text-sm p-3 text-center">
                        Sözleşme bulunamadı
                      </div>
                    ) : (
                      filteredContracts.map((contract) => (
                        <div
                          key={contract.contractId}
                          className="bg-gray-50 p-3 rounded border border-gray-200 text-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900">
                              {contract.customerName}
                            </div>
                            <span className={getStatusClass(contract.status)}>
                              {contract.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Sözleşme: {contract.contractId}</div>
                            <div>
                              Tarih: {contract.startDate} → {contract.endDate}
                            </div>
                            <div>
                              Aylık Ücret: {Number(contract.monthlyRate ?? 0).toLocaleString('tr-TR')} ₺
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Panel: KPIs */}
        <div className="col-span-3 space-y-4">
          {/* KPI Card 1 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm font-medium mb-1">Toplam Filoler</div>
            <div className="text-3xl font-bold text-blue-600">{kpis.totalFleets}</div>
          </div>

          {/* KPI Card 2 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm font-medium mb-1">
              {selectedFleet ? 'Seçili Filo Araçları' : 'Araçlar'}
            </div>
            <div className="text-3xl font-bold text-green-600">
              {kpis.selectedFleetVehicles}
            </div>
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <div>✓ Aktif: {kpis.activeVehicles}</div>
              <div>⚠ Bakım: {kpis.maintenanceVehicles}</div>
            </div>
          </div>

          {/* KPI Card 3 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm font-medium mb-1">Kiralama Sözleşmeleri</div>
            <div className="text-3xl font-bold text-purple-600">
              {kpis.activeContracts}
            </div>
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <div>✓ Aktif: {kpis.activeContracts}</div>
              <div>✏ Taslak: {kpis.draftContracts}</div>
            </div>
          </div>

          {/* KPI Card 4 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm font-medium mb-1">Aylık Gelir</div>
            <div className="text-3xl font-bold text-green-700">
              {Number(kpis.monthlyRevenue ?? 0).toLocaleString('tr-TR')}
            </div>
            <div className="text-xs text-gray-600 mt-2">₺</div>
          </div>

          {/* KPI Card 5 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-600 text-sm font-medium mb-1">Ortalama Risk Skoru</div>
            <div className="text-3xl font-bold text-orange-600">{kpis.avgRiskScore}</div>
            <div className="text-xs text-gray-600 mt-2">/ 100</div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-900 font-medium mb-2">Bilgi</div>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Filoları soldan seçin</li>
              <li>• Araç ve sözleşmeleri göz atın</li>
              <li>• Yeni sözleşme oluşturun</li>
              <li>• KPI\'ları takip edin</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading state overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-700">Yükleniyor...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

