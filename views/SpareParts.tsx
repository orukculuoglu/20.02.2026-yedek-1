
import React, { useState, useEffect } from 'react';
import { Search, Filter, Wrench, AlertTriangle, CheckCircle, Package, DollarSign, RefreshCw, ChevronRight, Server, Globe, Car, ArrowRight, MoreVertical, Eye, ShoppingCart, CalendarPlus, X, Box, Truck, Loader2, Check, Barcode, ClipboardList, Layers, Info, Cpu, Activity } from 'lucide-react';
import { getVehicleList, getVehicleOEMParts, addToMaintenancePlan, createERPOrder, getOemAlternativesForPart } from '../services/dataService';
import { VehicleProfile, OEMPart } from '../types';
import { BestOfferWidget } from '../components/BestOfferWidget';

interface SparePartsProps {
    preSelectedVehicleId?: string | null;
}

export const SpareParts: React.FC<SparePartsProps> = ({ preSelectedVehicleId }) => {
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProfile | null>(null);
  const [parts, setParts] = useState<OEMPart[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPartDetail, setSelectedPartDetail] = useState<OEMPart | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // OEM Alternatives Tab State
  const [oemAlternatives, setOemAlternatives] = useState<any[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'details' | 'alternatives'>('details');

  useEffect(() => {
    getVehicleList().then(list => {
        setVehicles(list);
        if (preSelectedVehicleId) {
            const target = list.find(v => v.vehicle_id === preSelectedVehicleId);
            if (target) setSelectedVehicle(target);
        } else if (!selectedVehicle && list.length > 0) {
            setSelectedVehicle(list[0]);
        }
    });
  }, [preSelectedVehicleId]);

  useEffect(() => {
    if (selectedVehicle) {
        setLoadingParts(true);
        getVehicleOEMParts(selectedVehicle.vehicle_id).then(data => {
            setParts(data);
            setLoadingParts(false);
        });
    }
  }, [selectedVehicle]);

  // Fetch OEM alternatives when part detail modal opens
  useEffect(() => {
    if (detailModalOpen && selectedPartDetail && selectedVehicle) {
        setLoadingAlternatives(true);
        setActiveDetailsTab('details'); // Reset to details tab
        
        getOemAlternativesForPart(selectedPartDetail.oemCode, selectedVehicle.brand)
            .then((result: any) => {
                if (result?.success && result?.alternatives) {
                    setOemAlternatives(result.alternatives);
                    console.log('[SpareParts] Loaded OEM alternatives:', result.alternatives.length);
                } else {
                    setOemAlternatives([]);
                    console.warn('[SpareParts] No OEM alternatives found');
                }
            })
            .catch((error: any) => {
                console.error('[SpareParts] Error loading OEM alternatives:', error);
                setOemAlternatives([]);
            })
            .finally(() => {
                setLoadingAlternatives(false);
            });
    }
  }, [detailModalOpen, selectedPartDetail, selectedVehicle]);

  const handleOpenDetail = (part: OEMPart) => {
      setSelectedPartDetail(part);
      setDetailModalOpen(true);
      setActionSuccess(null);
  };

  const handleAddToMaintenance = async (part: OEMPart) => {
      if (!selectedVehicle) return;
      setActionLoading('MAINTENANCE');
      try {
          await new Promise(r => setTimeout(r, 800));
          const result = await addToMaintenancePlan(selectedVehicle.vehicle_id, part);
          setActionSuccess(result.message);
      } finally {
          setActionLoading(null);
      }
  };

  const PartDetailModal = () => {
      if (!detailModalOpen || !selectedPartDetail || !selectedVehicle) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <Package size={20} className="text-emerald-400" /> RepXpert Teknik Kartı
                    </h3>
                    <button onClick={() => setDetailModalOpen(false)} className="hover:bg-slate-700 p-1.5 rounded transition-colors"><X size={20} /></button>
                </div>
                
                {/* Tab Navigation */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-4">
                    <button
                        onClick={() => setActiveDetailsTab('details')}
                        className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${
                            activeDetailsTab === 'details'
                                ? 'border-emerald-500 text-emerald-700'
                                : 'border-transparent text-slate-600 hover:text-slate-800'
                        }`}
                    >
                        Detaylar
                    </button>
                    <button
                        onClick={() => setActiveDetailsTab('alternatives')}
                        className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors relative ${
                            activeDetailsTab === 'alternatives'
                                ? 'border-emerald-500 text-emerald-700'
                                : 'border-transparent text-slate-600 hover:text-slate-800'
                        }`}
                    >
                        Eşdeğer Parçalar
                        {oemAlternatives.length > 0 && (
                            <span className="absolute -top-1 right-0 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {oemAlternatives.length}
                            </span>
                        )}
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    {activeDetailsTab === 'details' ? (
                        <div className="space-y-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                                <Layers size={32} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800">{selectedPartDetail.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-sm font-mono font-bold flex items-center gap-1">
                                        <Barcode size={12} /> {selectedPartDetail.oemCode}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">RepXpert Doğrulandı</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-slate-800">{selectedPartDetail.price.toLocaleString()} ₺</p>
                            <span className={`inline-block mt-1 px-3 py-1 rounded text-xs font-bold ${selectedPartDetail.stock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {selectedPartDetail.stock ? 'STOKTA VAR' : 'TÜKENDİ'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h5 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2"><ClipboardList size={16} className="text-slate-500" /> Teknik Özellikler</h5>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Üretici</span><span className="font-medium">{selectedPartDetail.brand}</span></div>
                                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Kategori</span><span className="font-medium">{selectedPartDetail.category}</span></div>
                                <div className="flex justify-between"><span>Motor Kodu</span><span className="font-bold text-emerald-600">{selectedVehicle.engine_code}</span></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                                 <div className="p-3 rounded border bg-amber-50 border-amber-100 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-full text-amber-600 shadow-sm"><Info size={16} /></div>
                                     <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase">
                                         Vites Tipi Kontrolü: Bu araç {selectedVehicle.transmission} olarak tanımlanmıştır. Doğru parça seçildiğinden emin olun.
                                     </p>
                                 </div>
                            </div>
                            <BestOfferWidget
                              partMasterId={selectedPartDetail.oemCode || ''}
                              institutionId="INST-001"
                              tenantId="LENT-CORP-DEMO"
                              compact={false}
                            />
                        </div>
                    </div>
                        </div>
                    ) : (
                        // Alternatives Tab
                        <div className="space-y-4">
                            {loadingAlternatives ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <Loader2 size={32} className="animate-spin text-emerald-600 mb-3" />
                                    <p className="font-medium">Eşdeğer Parçalar Yükleniyor...</p>
                                </div>
                            ) : oemAlternatives.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <Package size={32} className="mb-3 text-slate-300" />
                                    <p className="font-medium">Bu parça için eşdeğer bulunamadı</p>
                                </div>
                            ) : (
                                oemAlternatives.map((alt, idx) => {
                                    const gradeColors: any = {
                                        'OEM': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                                        'OES': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                                        'AFTERMARKET_A': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                                        'AFTERMARKET_B': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
                                    };
                                    const colors = gradeColors[alt.quality_grade] || gradeColors['AFTERMARKET_B'];
                                    
                                    return (
                                        <div key={alt.id} className="p-4 border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-slate-800 text-sm">{alt.aftermarket_brand}</h5>
                                                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{alt.aftermarket_part_number}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded text-xs font-bold border whitespace-nowrap ${colors.bg} ${colors.text} ${colors.border}`}>
                                                    {alt.quality_grade.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-500 mb-1">Uyumluluk Skoru</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                                                    style={{ width: `${alt.compatibility_score}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-800">{alt.compatibility_score}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold hover:bg-emerald-100 transition-colors whitespace-nowrap">
                                                    Seç
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                    <div className="border-t border-slate-100 px-6 py-4">
                        {actionSuccess ? (
                             <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                                 <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                                 <p className="font-bold text-sm">İşlem Başarılı: {actionSuccess}</p>
                             </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleAddToMaintenance(selectedPartDetail)} disabled={!!actionLoading} className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50">
                                    {actionLoading === 'MAINTENANCE' ? <Loader2 size={24} className="animate-spin text-blue-600 mb-2" /> : <CalendarPlus size={24} className="text-slate-400 mb-2" />}
                                    <span className="font-bold text-slate-700 text-sm">Bakım Planına Ekle</span>
                                </button>
                                <button onClick={() => alert('Sipariş talebi ERP iletildi.')} className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                                    <ShoppingCart size={24} className="text-slate-400 mb-2" />
                                    <span className="font-bold text-slate-700 text-sm">Sipariş / Teklif İste</span>
                                </button>
                            </div>
                        )}
                    </div>
            </div>
        </div>
      );
  }

  const filteredVehicles = vehicles.filter(v => 
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicle_id.includes(searchTerm)
  );

  return (
    <div className="h-[calc(100vh-64px)] flex animate-in fade-in duration-500">
      {/* Sidebar - Vehicle Selector */}
      <div className="w-1/3 min-w-[320px] bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Teknik Parça Analizi</h2>
            <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="ID veya Model ara..." 
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filteredVehicles.map(vehicle => (
                <div 
                    key={vehicle.vehicle_id} 
                    onClick={() => setSelectedVehicle(vehicle)} 
                    className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'bg-emerald-50/50 border-l-4 border-l-emerald-500' : ''}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}><Car size={20} /></div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{vehicle.brand} {vehicle.model}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-1 rounded border border-blue-100 uppercase">{vehicle.engine_code}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1 rounded border border-slate-200 uppercase truncate">{vehicle.transmission.split(' ')[0]}</span>
                            </div>
                        </div>
                        {selectedVehicle?.vehicle_id === vehicle.vehicle_id && <ChevronRight size={16} className="text-emerald-500" />}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Content - Parts List */}
      <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
        {selectedVehicle ? (
            <>
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-800">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1.5 shadow-sm">
                                <Cpu size={14} /> {selectedVehicle.engine_code}
                            </span>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 shadow-sm ${selectedVehicle.transmission.includes('DSG') ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                <Activity size={14} /> {selectedVehicle.transmission}
                            </span>
                        </div>
                        <p className="text-emerald-600 text-sm font-bold flex items-center gap-2 mt-1">
                             <Check size={16} /> RepXpert (Schaeffler) Canlı Veri Akışı Bağlı
                        </p>
                    </div>
                    <button onClick={() => setLoadingParts(true)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
                        <RefreshCw size={16} className={loadingParts ? 'animate-spin' : ''} /> Verileri Güncelle
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    {loadingParts ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                             <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
                             <p className="font-medium">Katalog Verileri Alınıyor...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Kategori</th>
                                        <th className="px-6 py-4">Vites Uyumu</th>
                                        <th className="px-6 py-4">Set No (OEM)</th>
                                        <th className="px-6 py-4">Parça Tanımı</th>
                                        <th className="px-6 py-4">Üretici</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parts.map(part => {
                                        const isTransmissionRel = part.category?.toLowerCase().includes('şanzıman') || part.category?.toLowerCase().includes('debriyaj');
                                        return (
                                            <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{part.category}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isTransmissionRel ? (
                                                         <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 uppercase">Tam Uyumlu</span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 uppercase">Standart</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">{part.oemCode}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-bold text-slate-800">{part.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-medium">SafeCore™ %{part.matchScore} Teknik Eşleşme</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-600">{part.brand}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleOpenDetail(part)} className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 text-xs font-bold rounded shadow-sm transition-all">Detay</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                <Wrench size={48} className="mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-slate-600">Araç Seçimi Bekleniyor</h3>
                <p className="text-sm text-center">Analiz verilerini görüntülemek için sol menüden bir araç seçiniz veya yeni bir sorgulama yapınız.</p>
            </div>
        )}
      </div>
      <PartDetailModal />
    </div>
  );
};
