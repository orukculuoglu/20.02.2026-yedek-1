
import React, { useState, useEffect } from 'react';
import { 
  Globe, Building, Package, Search, ChevronRight, 
  MapPin, Star, Truck, ShieldCheck, Zap, Info, Loader2 
} from 'lucide-react';
import { getB2BNetwork } from '../services/dataService';
import { B2BNetworkState, Supplier, B2BPart } from '../types';

export default function B2BNetwork() {
  const [network, setNetwork] = useState<B2BNetworkState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getB2BNetwork().then(data => {
      setNetwork(data);
      if (data.suppliers.length > 0) {
        setSelectedSupplierId(data.suppliers[0].id);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
        <p className="font-bold text-sm">B2B Parça Ağı Yükleniyor...</p>
      </div>
    );
  }

  if (!network) return null;

  const selectedSupplier = network.suppliers.find(s => s.id === selectedSupplierId);
  const connectedPartIds = network.edges
    .filter(e => e.supplierId === selectedSupplierId)
    .map(e => e.partId);

  const filteredParts = network.parts.filter(p => {
    const isConnected = connectedPartIds.includes(p.id);
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    return isConnected && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 bg-slate-50/50">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 pb-0">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tedarikçi Düğümleri</p>
            <h3 className="text-2xl font-bold text-slate-800">{network.suppliers.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Building size={20}/></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kayıtlı Parçalar</p>
            <h3 className="text-2xl font-bold text-slate-800">{network.parts.length}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Package size={20}/></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktif Bağlantılar</p>
            <h3 className="text-2xl font-bold text-slate-800">{network.edges.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Globe size={20}/></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Panel: Suppliers */}
        <div className="w-80 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Zap size={16} className="text-indigo-600" /> Tedarikçi Ağı
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {network.suppliers.map(sup => (
              <div 
                key={sup.id}
                onClick={() => setSelectedSupplierId(sup.id)}
                className={`p-4 cursor-pointer transition-all hover:bg-slate-50 group ${selectedSupplierId === sup.id ? 'bg-indigo-50/50 border-r-4 border-indigo-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700">{sup.name}</h5>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                    <Star size={10} fill="currentColor" /> {sup.score}%
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                  <span className="flex items-center gap-1"><MapPin size={10} /> {sup.city}</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">{sup.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Inventory */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {selectedSupplier ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{selectedSupplier.name} Envanteri</h4>
                  <p className="text-[10px] text-slate-500 font-medium">B2B Node ID: {selectedSupplier.id}</p>
                </div>
                <div className="relative w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Parça, Marka veya SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredParts.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest sticky top-0 z-10 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Parça / SKU</th>
                        <th className="px-6 py-3">Kategori</th>
                        <th className="px-6 py-3">Termin</th>
                        <th className="px-6 py-3">Stok</th>
                        <th className="px-6 py-3 text-right">Birim Fiyat</th>
                        <th className="px-6 py-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredParts.map(part => {
                        const edge = network.edges.find(e => e.supplierId === selectedSupplierId && e.partId === part.id);
                        return (
                          <tr key={part.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 text-xs">{part.name}</div>
                              <div className="text-[9px] font-mono text-slate-400 mt-0.5">{part.sku} • {part.brand}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{part.category}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600">
                                <Truck size={12} /> {edge?.leadDays} Gün
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                                <span className="text-xs font-bold text-slate-700">{part.stock} Adet</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs font-black text-slate-900">{part.price?.toLocaleString()} ₺</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition-colors">
                                Sipariş İste
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                    <Package size={48} className="opacity-10 mb-4" />
                    <p className="text-sm font-medium">Bu kriterlere uygun parça bulunamadı.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Building size={48} className="opacity-10 mb-4" />
              <p className="text-sm font-medium">Parça listesi için bir tedarikçi düğümü seçin.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Information Footer */}
      <div className="mx-6 mb-6 p-4 bg-indigo-900 text-indigo-100 rounded-2xl flex items-start gap-4 shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Globe size={80}/></div>
        <div className="p-2 bg-white/10 rounded-xl shrink-0"><Info size={20} className="text-indigo-400" /></div>
        <div className="relative z-10">
          <h5 className="font-bold text-sm mb-1">SafeCore Supply Intelligence v2.0</h5>
          <p className="text-[11px] text-indigo-300 leading-relaxed max-w-4xl">
            Tedarikçi ağındaki fiyat ve stok sinyalleri anlık asenkron akışla (Websocket) güncellenmektedir. 
            Fiyatlar piyasa koşullarına göre dinamik maskeleme içerebilir. Sipariş onayı için ERP üzerinden mühürlü talep iletilmelidir.
          </p>
        </div>
      </div>
    </div>
  );
}
