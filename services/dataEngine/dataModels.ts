/**
 * Veri Motoru - Anonim Veri Modelleri
 * 
 * KURAL: PII (Personally Identifiable Information) ASLA tutulmayacak
 * - Kullanıcı ID/Adı: YOK
 * - Firma/Servis Adı: YOK
 * - Kişi Bilgisi: YOK
 * 
 * SADECE:
 * - OEM Parça kodları
 * - Araç modeli bilgisi
 * - Lokasyon (şehir/ilçe)
 * - İşlem türü ve zaman
 */

/**
 * Parça Arama İntenti Log
 * Kullanıcı bir parça aradığında tetiklenir
 */
export interface SearchIntentLog {
  id?: string;
  oem: string;                          // OEM parça kodu (anonim)
  vehicleModel: string;                 // Araç modeli (ör: "BMW 320i")
  city: string;                         // Şehir
  district: string;                     // İlçe
  lentStockAvailable: boolean;           // Lent'te bu parça var mı?
  timestamp: Date;                      // Arama zamanı
}

/**
 * Sipariş Yürütme Log
 * Sipariş ERP'ye düştüğünde veya LENT'ten geçtiğinde tetiklenir
 */
export interface OrderExecutionLog {
  id?: string;
  oem: string;                          // OEM parça kodu (anonim)
  vehicleModel: string;                 // Araç modeli (ör: "BMW 320i")
  city: string;                         // Şehir
  district: string;                     // İlçe
  source: 'LENT' | 'ERP';               // Sipariş kaynağı
  quantity: number;                     // Sipariş miktarı
  unitPrice: number;                    // Birim fiyat (₺)
  timestamp: Date;                      // Sipariş zamanı
}

/**
 * Veri Motoru İstatistikleri
 * Toplu raporlama için
 */
export interface DataEngineStats {
  totalSearchIntents: number;
  totalOrders: number;
  ordersFromLent: number;
  ordersFromERP: number;
  searchIntentLogs: SearchIntentLog[];
  orderExecutionLogs: OrderExecutionLog[];
}
