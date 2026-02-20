
import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Plus, Filter, Shield, MoreHorizontal, UserCheck, UserX, Key, Mail, Building, Loader2, X, Check, Trash2, Edit2, RotateCcw, Lock } from 'lucide-react';
import { getUsers, createUser, deleteUser, updateUser } from '../services/dataService';
import { getCurrentUserSecurity } from '../services/securityService';
import { UserProfile } from '../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER'>('ALL');
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null); // If null, it's adding mode
  const [activeActionId, setActiveActionId] = useState<string | null>(null); // For dropdown menu

  // Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Get Current Admin for Tenant Isolation
  const currentAdmin = getCurrentUserSecurity();

  const fetchUsers = () => {
    setLoading(true);
    getUsers().then(data => {
        // In a real backend, this filtering happens on the server.
        // Here we simulate Tenant Isolation.
        const tenantUsers = data.filter(u => u.institutionId === currentAdmin.institutionId);
        setUsers(tenantUsers);
        setLoading(false);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'ADMIN': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">ADMIN</span>;
          case 'MANAGER': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">YÖNETİCİ</span>;
          case 'ANALYST': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold border border-emerald-200">ANALİST</span>;
          default: return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">İZLEYİCİ</span>;
      }
  };

  const getAccessLevelIndicator = (level: number) => {
      return (
          <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-1.5 h-3 rounded-sm ${i <= level ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
              ))}
          </div>
      )
  };

  // --- ACTIONS ---

  const handleDelete = async (userId: string) => {
      if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
          try {
              await deleteUser(userId);
              setToast({ message: 'Kullanıcı başarıyla silindi.', type: 'success' });
              fetchUsers();
          } catch (e) {
              setToast({ message: 'Silme işlemi başarısız.', type: 'error' });
          }
      }
      setActiveActionId(null);
  };

  const handleToggleStatus = async (user: UserProfile) => {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      try {
          await updateUser(user.id, { status: newStatus });
          setToast({ message: `Kullanıcı durumu güncellendi: ${newStatus}`, type: 'success' });
          fetchUsers();
      } catch (e) {
          setToast({ message: 'Güncelleme başarısız.', type: 'error' });
      }
      setActiveActionId(null);
  };

  const handleResetPassword = async () => {
      // Simulation
      setToast({ message: 'Şifre sıfırlama bağlantısı e-posta ile gönderildi.', type: 'success' });
      setActiveActionId(null);
  };

  const openEditModal = (user: UserProfile) => {
      setEditingUser(user);
      setIsFormModalOpen(true);
      setActiveActionId(null);
  };

  const openAddModal = () => {
      setEditingUser(null);
      setIsFormModalOpen(true);
  };

  // --- SUB-COMPONENTS ---

  const UserFormModal = () => {
      const [formData, setFormData] = useState({
          name: editingUser?.name || '',
          email: editingUser?.email || '',
          department: editingUser?.department || '',
          role: (editingUser?.role || 'VIEWER') as 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER'
      });
      const [submitting, setSubmitting] = useState(false);

      if (!isFormModalOpen) return null;

      const handleSubmit = async () => {
          if (!formData.name || !formData.email || !formData.department) {
              alert('Lütfen tüm alanları doldurunuz.');
              return;
          }

          setSubmitting(true);
          try {
              if (editingUser) {
                  // Edit Mode
                  await updateUser(editingUser.id, formData);
                  setToast({ message: 'Kullanıcı bilgileri güncellendi.', type: 'success' });
              } else {
                  // Create Mode with Tenant Isolation
                  // Force the institutionId to be the same as the creator
                  const newUserPayload = {
                      ...formData,
                      institutionId: currentAdmin.institutionId,
                      accessLevel: formData.role === 'ADMIN' ? 5 : formData.role === 'MANAGER' ? 4 : formData.role === 'ANALYST' ? 3 : 1
                  };
                  await createUser(newUserPayload as any);
                  setToast({ message: 'Yeni kullanıcı başarıyla oluşturuldu.', type: 'success' });
              }
              setIsFormModalOpen(false);
              fetchUsers();
          } catch (e) {
              alert('İşlem sırasında bir hata oluştu.');
          } finally {
              setSubmitting(false);
          }
      };

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Users size={18} className="text-emerald-600" /> {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
                      </h3>
                      <button onClick={() => setIsFormModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      
                      {/* Tenant Indicator */}
                      <div className="text-xs bg-slate-100 text-slate-500 p-2 rounded border border-slate-200 flex items-center gap-2">
                          <Building size={12} />
                          <span>Kurum: <strong>{currentAdmin.institutionId}</strong> (Otomatik Atanır)</span>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="Örn: Mehmet Öz" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta Adresi</label>
                          <input 
                            type="email" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="mehmet@sirket.com" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Departman</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                                placeholder="Finans" 
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Erişim Rolü</label>
                              <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value as 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER'})}
                              >
                                  <option value="VIEWER">İzleyici</option>
                                  <option value="ANALYST">Analist</option>
                                  <option value="MANAGER">Yönetici</option>
                                  <option value="ADMIN">Admin</option>
                              </select>
                          </div>
                      </div>
                      
                      {!editingUser && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800">
                            <p className="font-bold mb-1 flex items-center gap-1"><Shield size={12} /> Güvenlik Notu</p>
                            Kullanıcıya geçici şifre e-posta ile iletilecektir. İlk girişte 2FA doğrulaması zorunludur.
                        </div>
                      )}

                      <div className="pt-2 flex gap-3">
                          <button onClick={() => setIsFormModalOpen(false)} className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">İptal</button>
                          <button 
                            onClick={handleSubmit} 
                            disabled={submitting}
                            className="flex-1 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                              {submitting && <Loader2 size={16} className="animate-spin" />}
                              {editingUser ? 'Güncelle' : 'Kullanıcıyı Oluştur'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )
  };

  // Click outside handler for dropdown
  const actionMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-8 relative">
      
      {/* Toast Notification */}
      {toast && (
          <div className={`fixed top-20 right-8 z-[60] px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {toast.type === 'success' ? <Check size={18} /> : <Shield size={18} />}
              <span className="text-sm font-medium">{toast.message}</span>
          </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Kullanıcı Yönetim Merkezi</h2>
            <p className="text-slate-500 mt-1">Sistem erişim yetkileri, personel listesi ve güvenlik politikaları.</p>
        </div>
        <button 
            onClick={openAddModal}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
        >
            <Plus size={18} /> Yeni Kullanıcı
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold text-slate-800">{users.length}</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Users size={20} /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Aktif Oturumlar</p>
                  <p className="text-2xl font-bold text-emerald-600">3</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><UserCheck size={20} /></div>
          </div>
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Onay Bekleyen</p>
                  <p className="text-2xl font-bold text-amber-500">1</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Key size={20} /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Admin Sayısı</p>
                  <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'ADMIN').length}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Shield size={20} /></div>
          </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                  type="text" 
                  placeholder="İsim, E-posta veya Departman ara..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
              <div className="relative">
                  <select 
                      className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-4 pr-10 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as any)}
                  >
                      <option value="ALL">Tüm Roller</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Yönetici</option>
                      <option value="ANALYST">Analist</option>
                      <option value="VIEWER">İzleyici</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
          </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible min-h-[400px] relative">
          {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Loader2 size={32} className="animate-spin mb-2 text-emerald-600" />
                  <p>Kullanıcı verileri yükleniyor...</p>
              </div>
          ) : (
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kullanıcı</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departman</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol & Yetki</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Veri Erişim Seviyesi</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} /> {user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                    <Building size={14} className="text-slate-400" />
                                    {user.department}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {getRoleBadge(user.role)}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="text-xs font-bold text-slate-600">Level {user.accessLevel}</div>
                                    {getAccessLevelIndicator(user.accessLevel)}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {user.status === 'ACTIVE' ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Aktif
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                        Pasif
                                    </div>
                                )}
                                <div className="text-[10px] text-slate-400 mt-1 ml-1">Son giriş: {user.lastLogin}</div>
                            </td>
                            <td className="px-6 py-4 text-right relative">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === user.id ? null : user.id); }}
                                    className={`p-2 rounded-lg transition-colors ${activeActionId === user.id ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                                
                                {activeActionId === user.id && (
                                    <div ref={actionMenuRef} className="absolute right-8 top-12 z-50 bg-white rounded-lg shadow-xl border border-slate-100 w-48 py-1 animate-in zoom-in-95 duration-100 origin-top-right">
                                        <button onClick={() => openEditModal(user)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                            <Edit2 size={14} /> Düzenle
                                        </button>
                                        <button onClick={() => handleToggleStatus(user)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                            {user.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                                            {user.status === 'ACTIVE' ? 'Pasife Al' : 'Aktif Et'}
                                        </button>
                                        <button onClick={handleResetPassword} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                            <Lock size={14} /> Şifre Sıfırla
                                        </button>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button onClick={() => handleDelete(user.id)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                            <Trash2 size={14} /> Sil
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
      </div>

      <UserFormModal />
    </div>
  );
};
