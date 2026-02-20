
import React from 'react';
import { 
    ShieldCheck, Lock, EyeOff, Brain, Scale, FileText, 
    CheckCircle2, AlertTriangle, Database, Fingerprint, 
    Smartphone, Printer, Download, Car, Zap, ShieldAlert,
    UserMinus, FileLock2, Network, Info, Layers, Gavel, Building2
} from 'lucide-react';

export const Kvkk: React.FC = () => {
    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Hukuki Statü ve Uyumluluk Çerçevesi</h2>
                    <p className="text-slate-500 mt-2 font-medium">Altyapı Sağlayıcı Bildirimi ve Sorumluluk Sınırları</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 font-bold shadow-sm">
                        <Printer size={18} /> Yazdır
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 font-bold shadow-lg shadow-slate-900/20">
                        <Download size={18} /> Yasal Metni İndir
                    </button>
                </div>
            </div>

            {/* LEGAL STATUS DISCLAIMER BANNER */}
            <div className="mb-10 p-6 bg-slate-50 rounded-2xl border-l-4 border-slate-900 flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                    <Gavel size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-sm">Hukuki Statü Bildirimi: Altyapı Sağlayıcı</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        LENT+ SafeCore™ platformu, KVKK ve GDPR kapsamında <strong>"Veri Sorumlusu" (Data Controller) değildir</strong>. 
                        Platform, sadece anonim olay sinyallerinin iletimini sağlayan tarafsız bir teknolojik altyapı sunmaktadır. 
                        Kişisel verilerin hukuki dayanağı, aydınlatma yükümlülüğü ve rıza yönetimi münhasıran hizmeti kullanan <strong>Kurumların (Kiracıların)</strong> sorumluluğundadır.
                    </p>
                </div>
            </div>

            {/* Hero Vision Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-10 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-slate-200 text-xs font-bold uppercase tracking-widest mb-6">
                        <ShieldCheck size={14} /> Zero-Knowledge Architecture
                    </div>
                    <h1 className="text-3xl font-bold mb-6 leading-tight">Anonim Olay İşleme Altyapısı</h1>
                    <p className="text-slate-400 leading-relaxed max-w-3xl text-lg font-medium">
                        Platformumuz, ham verilerin işlenmediği, saklanmadığı ve paylaşılmadığı bir olay sinyal ağıdır. Sistem, kimliği belirli veya belirlenebilir gerçek kişilere ilişkin hiçbir veriyi (Personal Data) bünyesinde barındırmaz. Tüm akış, bağlamla sınırlı sinyallerden ibarettir.
                    </p>
                </div>
            </div>

            {/* Key Principles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                
                {/* 1. Controller Rejection */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-6">
                        <UserMinus size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Veri Sorumlusu Sıfatının Reddi</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Platform, üzerinde akan sinyallerin içeriğinden bağımsızdır. Kullanıcı yönetimi, kimlik doğrulama ve verinin hukuka uygunluk denetimi, ilgili Kurumun (Tenant) yetki ve sorumluluk alanındadır. Platformun rolü, veri işleyen (Data Processor) dahi olmayıp, salt iletişim altyapısı sağlamaktır.
                    </p>
                </div>

                {/* 2. Raw Data Prohibition */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-6">
                        <FileLock2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Ham Veri İşleme Yasağı</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Platform mimarisi, "Ham Veri" (Raw Data) girişini ve depolanmasını teknik olarak reddeder. Sisteme giren her türlü girdi, kaynağında anonimleştirilmiş olay sinyaline dönüştürülür. Geriye dönük kimlik inşası (Re-identification) sistem tasarımı gereği imkansızdır.
                    </p>
                </div>

                {/* 3. Tenant Liability */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-6">
                        <Building2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Kurumsal Mülkiyet ve Sorumluluk</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Her kurum (Tenant), kendi oluşturduğu olay sinyallerinin ve kendi kullanıcılarının tek sahibidir. Platform, kurumlar arası bir veri havuzu değildir. Bir kurumun ürettiği sinyal, başka bir kurum tarafından görülemez veya işlenemez (İzolasyon İlkesi).
                    </p>
                </div>

                {/* 4. Purpose Limitation */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-6">
                        <Lock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Amaçla Sınırlılık İlkesi</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Olay sinyalleri, sadece üretildikleri teknik bağlam (örn. risk hesaplama) içerisinde geçerlidir. Bu sinyallerin başka amaçlarla birleştirilmesi, profilleme yapılması veya üçüncü taraflara aktarılması, sistemin kullanım koşullarına ve mimarisine aykırıdır.
                    </p>
                </div>

            </div>

            {/* Detailed Clauses */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-10 mb-16">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                    <Scale size={20} className="text-slate-400" />
                    <h3 className="text-xl font-bold text-slate-800">Yasal Beyan ve Taahhütler</h3>
                </div>
                
                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1.5 w-2 h-2 bg-slate-400 rounded-full shrink-0"></div>
                        <div>
                            <h4 className="font-bold text-slate-700 text-sm">Altyapısal Nötr'lük</h4>
                            <p className="text-slate-500 mt-1 leading-relaxed text-xs">Platform, iletilen sinyallerin doğruluğunu, hukuka uygunluğunu veya içeriğini denetlemez. Sinyal trafiği şifreli tüneller üzerinden, içeriği görüntülenemez şekilde (Opaque Transmission) sağlanır.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1.5 w-2 h-2 bg-slate-400 rounded-full shrink-0"></div>
                        <div>
                            <h4 className="font-bold text-slate-700 text-sm">Veri Saklamama Taahhüdü</h4>
                            <p className="text-slate-500 mt-1 leading-relaxed text-xs">Sistem "Stateless" (Durumsuz) mimari prensibiyle çalışır. İşlenen olay sinyalleri, işlem tamamlandığı anda bellekten silinir. Kalıcı veritabanlarında kişisel veri tutulmaz.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1.5 w-2 h-2 bg-slate-400 rounded-full shrink-0"></div>
                        <div>
                            <h4 className="font-bold text-slate-700 text-sm">Sınır Aşan Veri Transferi Yasağı</h4>
                            <p className="text-slate-500 mt-1 leading-relaxed text-xs">Platform üzerinden kurumlar arası veri transferi yapılamaz. API anahtarları sadece bağlam sınırlı bildirim almak içindir, veri çekmek için kullanılamaz.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Sign-off */}
            <div className="text-center pb-24">
                <div className="inline-flex items-center gap-6 bg-slate-50 px-10 py-5 rounded-3xl border border-slate-200">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-800 shadow-sm border border-slate-100">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">AutoData SafeCore™ Infrastructure</p>
                        <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-[0.1em]">Uyumluluk Departmanı</p>
                    </div>
                </div>
                <p className="mt-6 text-slate-400 text-[10px] font-medium max-w-lg mx-auto leading-relaxed">
                    Bu metin, platformun teknik mimarisinin hukuki yansımasıdır. Kullanım Koşulları ve Hizmet Sözleşmesi'nin ayrılmaz bir parçasıdır.
                </p>
            </div>
        </div>
    );
};
