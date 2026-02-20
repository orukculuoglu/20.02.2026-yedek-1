import React, { useState, useEffect } from 'react';
import { 
    Database, Globe, Key, Shield, Server, Lock, Hash, 
    ShieldAlert, FileLock2, AlertCircle, EyeOff, CheckCircle, 
    RefreshCcw, Plus, Trash2, Building, Network, ShieldCheck, 
    ArrowRight, Copy, Check, Loader2, Fingerprint, Activity,
    History, Terminal, Cpu, Brain, Code2, Eye, GitBranch,
    Settings2, Save, Unlock, MonitorCheck, Siren, Ban, Zap, Layers,
    ActivitySquare, BarChart3, Gauge, Thermometer, Radio, Signal,
    DollarSign, User, ShieldX, ListChecks, Fingerprint as AuditIcon,
    ShieldBan, ZapOff, Play, ShieldEllipsis, MoreVertical,
    Info, ChevronRight
} from 'lucide-react';
import { getSlaMetrics, getUsageStatsByTenant, getUserActivityMetrics } from '../services/dataService';
import { getAccessAuditLogs, getApiKeys, createApiKey, revokeApiKey, getCurrentUserSecurity } from '../services/securityService';
import { SlaMetric, TenantStats, AccessAuditLog, ApiKeyMetadata } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'health' | 'usage' | 'audit' | 'api'>('usage'); // Default to usage to show signals
  const [slaData, setSlaData] = useState<SlaMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AccessAuditLog[]>([]);
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  const currentUser = getCurrentUserSecurity();

  useEffect(() => {
    setLoading(true);
    const promises = [];
    if (activeTab === 'health') promises.push(getSlaMetrics().then(setSlaData));
    if (activeTab === 'usage') promises.push(getUsageStatsByTenant().then(setTenantStats), getUserActivityMetrics().then(setUserActivity));
    if (activeTab === 'audit') promises.push(getAccessAuditLogs().then(setAuditLogs));
    if (activeTab === 'api') promises.push(getApiKeys().then(setApiKeys));
    
    Promise.all(promises).finally(() => setLoading(false));
  }, [activeTab]);

  const handleCreateKey = async () => {
      if (!newKeyLabel) return;
      setIsCreatingKey(true);
      await new Promise(r => setTimeout(r, 1000));
      await createApiKey(newKeyLabel);
      const updatedKeys = await getApiKeys();
      setApiKeys(updatedKeys);
      setNewKeyLabel('');
      setIsCreatingKey(false);
  };

  const handleRevokeKey = async (id: string) => {
      if (window.confirm('Bu API anahtarını iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
          await revokeApiKey(id);
          const updatedKeys = await getApiKeys();
          setApiKeys(updatedKeys);
      }
  };

  const ApiManagementTab = () => (
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                      <Key size={24} className="text-cyan-600" /> API ve Entegrasyon Yönetimi
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Dış sistemlerin, <strong>bağlam sınırlı olay bildirimlerini (Context-bound event notification)</strong> güvenli şekilde alması için entegrasyon anahtarları.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-xs">
                  <ShieldCheck size={16} /> SSL Pinning Active
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Yeni Anahtar Oluştur</h4>
                      <div className="flex gap-3">
                          <input 
                            type="text" 
                            placeholder="Anahtar etiketi (örn: ERP Projesi)" 
                            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                            value={newKeyLabel}
                            onChange={(e) => setNewKeyLabel(e.target.value)}
                          />
                          <button 
                            onClick={handleCreateKey}
                            disabled={isCreatingKey || !newKeyLabel}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                          >
                              {isCreatingKey ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                              Oluştur
                          </button>
                      </div>
                  </div>

                  <div className="space-y-3">
                      {apiKeys.map(key => (
                          <div key={key.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-cyan-200 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded-lg ${key.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                      <Key size={20} />
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <p className="font-bold text-slate-800">{key.label}</p>
                                          {key.status === 'ACTIVE' ? (
                                              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black border border-emerald-100 uppercase">Active</span>
                                          ) : (
                                              <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-black border border-rose-100 uppercase">Revoked</span>
                                          )}
                                      </div>
                                      <p className="text-xs font-mono text-slate-400 mt-0.5">{key.key}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-6">
                                  <div className="text-right">
                                      <p className="text-[10px] text-slate-400 font-bold uppercase">Son Kullanım</p>
                                      <p className="text-xs text-slate-700 font-medium">{key.lastUsed}</p>
                                  </div>
                                  {key.status === 'ACTIVE' && (
                                      <button 
                                        onClick={() => handleRevokeKey(key.id)}
                                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                        title="İptal Et"
                                      >
                                          <ShieldBan size={18} />
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                      <h4 className="font-bold mb-4 flex items-center gap-2"><Lock size={18} className="text-cyan-400"/> Güvenlik Notları</h4>
                      <ul className="space-y-3">
                          {[
                              'Anahtarlarınızı asla istemci tarafında saklamayın.',
                              'Her entegrasyon için ayrı bir anahtar tanımlayın.',
                              'Şüpheli eylemde anahtarı anında pasife alın.'
                          ].map((text, i) => (
                              <li key={i} className="flex gap-3 text-xs text-slate-400 leading-relaxed">
                                  <div className="mt-1 w-1 h-1 bg-cyan-500 rounded-full shrink-0"></div>
                                  {text}
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                      <p className="text-xs font-bold text-blue-700 uppercase mb-2">WebHook Durumu</p>
                      <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-900 font-medium">ERP Listener</span>
                          <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><Radio size={14}/> ONLINE</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const UsageMetricsTab = () => (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-6">
                <div className="p-5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                    <BarChart3 size={40} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Kurumsal Kullanım ve Davranış Analizi</h3>
                    <p className="text-sm text-slate-500 mt-1">{tenantStats?.name} (Tenant ID: {tenantStats?.id})</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Toplam Limit</p>
                    <p className="text-lg font-bold">{tenantStats?.planLimit.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl text-emerald-800">
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Kalan Hak</p>
                    <p className="text-lg font-bold">{(tenantStats?.planLimit! - tenantStats?.totalQueries!).toLocaleString()}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity size={18} className="text-blue-500"/> Kullanıcı Aktivite Dağılımı</h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userActivity} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="queries" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={30}>
                                {userActivity.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1e293b' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-6">
                {/* BEHAVIORAL HEALTH CARD */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <Fingerprint size={14} className="text-emerald-500"/> Davranışsal Sağlık Sinyali
                    </h4>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Sinyal Varyansı (Entropy)</span>
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">YÜKSEK (Organik)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{width: '92%'}}></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Korelasyon Riski</span>
                            <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">DÜŞÜK</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{width: '12%'}}></div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] leading-relaxed text-slate-500 mt-2">
                            <Info size={12} className="inline mr-1 mb-0.5 text-blue-500" />
                            Sistem, sorgu aralıklarındaki zaman varyansını (mekanik sinyal tespiti) ve segment yoğunlaşmasını (pattern matching) izlemektedir.
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
                    <h4 className="text-amber-900 font-bold text-sm mb-2 flex items-center gap-2"><ShieldAlert size={16}/> Limit Tahmini</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">Mevcut kullanım hızıyla, ayın 22. gününde kurum kotasının dolması öngörülmektedir.</p>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
        <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">LENT+ Kontrol Merkezi</h2>
            <p className="text-slate-500 mt-2 font-medium">Multi-tenant yönetimi, API güvenliği ve davranışsal analitik.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] tracking-[0.2em] shadow-2xl">
            <Building size={16} className="text-emerald-400" /> INST: {currentUser.institutionId}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="space-y-2">
            {[
                { id: 'usage', label: 'Kullanım & Analiz', icon: BarChart3 },
                { id: 'api', label: 'API & Entegrasyon', icon: Key },
                { id: 'audit', label: 'Erişim Logları', icon: AuditIcon },
                { id: 'security', label: 'Politika & KVKK', icon: Shield },
                { id: 'health', label: 'Sistem Sağlığı', icon: ActivitySquare },
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-6 py-4 rounded-2xl flex items-center justify-between font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-xl translate-x-2' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <tab.icon size={18} />
                        {tab.label}
                    </div>
                    {activeTab === tab.id && <ChevronRight size={16} />}
                </button>
            ))}
        </div>

        <div className="lg:col-span-3">
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={40} className="animate-spin text-slate-300 mb-4" />
                    <p className="font-bold text-sm">Güvenli Kasadan Veriler Alınıyor...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-12 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[2rem] border border-emerald-100">
                                    <ShieldCheck size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">Veri Güvenliği ve Gizlilik Politikası</h3>
                                    <p className="text-sm text-slate-500 mt-1">Global standartlarda (GDPR/KVKK) tasarımsal gizlilik.</p>
                                </div>
                            </div>
                            {/* Static content for security policy */}
                            <div className="p-6 border border-slate-200 rounded-3xl hover:border-emerald-200 transition-colors">
                                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><AuditIcon size={18} className="text-emerald-500"/> Anonimleştirme</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">VIN verileri SHA-256 algoritması ve kurumsal gizli tuzlar (salt) ile geri döndürülemez şekilde hash'lenir.</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'api' && <ApiManagementTab />}
                    {activeTab === 'audit' && (
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 animate-in slide-in-from-right-4 duration-300 overflow-hidden flex flex-col">
                             <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <AuditIcon size={24} className="text-orange-600" /> Immutable Yetki Denetim Logları
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Sistem kararları değiştirilemez ve silinemez bir yapıda kayıt altına alınır.</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Zaman / IP</th>
                                            <th className="px-6 py-4">Erişimci</th>
                                            <th className="px-6 py-4">İşlem / Kaynak</th>
                                            <th className="px-6 py-4 text-center">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {auditLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-700">{log.timestamp}</p>
                                                    <p className="text-[10px] text-slate-400">{log.ipAddress}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-slate-800">{log.userEmail}</p>
                                                    <p className="text-[10px] text-slate-400">ID: {log.userId}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{log.action}</span>
                                                        <ArrowRight size={10} className="text-slate-300" />
                                                        <span className="font-bold text-slate-700">{log.resource}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-[6px] font-black uppercase text-[9px] ${log.status === 'GRANTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'health' && <div className="p-8 text-center text-slate-400 italic">Sistem sağlık verileri yükleniyor...</div>}
                    {activeTab === 'usage' && <UsageMetricsTab />}
                </>
            )}
        </div>
      </div>
    </div>
  );
};