import React, { useState, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, CheckCircle, AlertTriangle, Info, XCircle, Check, X, ArrowRight } from 'lucide-react';
import { getNotifications } from '../services/dataService';
import { NotificationItem, ViewState } from '../types';

interface HeaderProps {
    onNavigate: (view: ViewState, id?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Fetch notifications on mount
    getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: NotificationItem) => {
      // Mark as read
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      
      // Close dropdown
      setShowNotifications(false);

      // Navigate if target exists
      if (notification.targetView) {
          onNavigate(notification.targetView, notification.targetId);
      }
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'CRITICAL': return <XCircle size={18} className="text-white" />;
        case 'WARNING': return <AlertTriangle size={18} className="text-white" />;
        case 'SUCCESS': return <CheckCircle size={18} className="text-white" />;
        default: return <Info size={18} className="text-white" />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
        case 'CRITICAL': return 'bg-rose-500 shadow-rose-200';
        case 'WARNING': return 'bg-amber-500 shadow-amber-200';
        case 'SUCCESS': return 'bg-emerald-500 shadow-emerald-200';
        default: return 'bg-blue-500 shadow-blue-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-20 shadow-sm">
      
      {/* Search Bar */}
      <div className="relative w-96">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Vehicle ID ile ara..." 
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notifications Dropdown */}
        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-full transition-all duration-200 ${showNotifications ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {showNotifications && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Bildirimler</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">{unreadCount} okunmamış mesajınız var</p>
                            </div>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded transition-colors">
                                    <Check size={14} /> Tümünü Okundu Say
                                </button>
                            )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer flex gap-4 group ${!n.read ? 'bg-slate-50/60' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${getColorClass(n.type)}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-semibold truncate pr-2 ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h4>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                                            </div>
                                            <p className={`text-xs leading-relaxed line-clamp-2 ${!n.read ? 'text-slate-700' : 'text-slate-500'}`}>{n.message}</p>
                                            
                                            {n.targetView && (
                                                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                                    Detayları Görüntüle <ArrowRight size={10} />
                                                </div>
                                            )}
                                        </div>
                                        {!n.read && (
                                            <div className="self-center w-2 h-2 bg-emerald-500 rounded-full shrink-0 shadow-sm shadow-emerald-200"></div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <Bell size={32} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Yeni bildiriminiz bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                            <button className="text-xs font-bold text-slate-600 hover:text-slate-900 w-full py-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                Geçmiş Bildirimleri Görüntüle
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-lg transition-colors group">
          <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                AO
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900">ABC Oto Kiralama</p>
            <p className="text-[10px] text-slate-500 group-hover:text-slate-600 font-medium">Kurumsal Yönetici</p>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600" />
        </button>
      </div>
    </header>
  );
};