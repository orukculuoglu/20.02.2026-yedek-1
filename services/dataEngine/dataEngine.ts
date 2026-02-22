/**
 * Merkezi Veri Motoru Servisi
 * 
 * Anonim veri toplamak için merkezi depo
 * - In-memory storage (mock)
 * - Backend bağlantısı yok
 * - PII tutulmuyor
 * 
 * Rotalar:
 * 1. Parça arama → logSearchIntent()
 * 2. Sipariş ERP/LENT → logOrderExecution()
 */

import { SearchIntentLog, OrderExecutionLog, DataEngineStats } from './dataModels';

// ============================================
// MERKEZI IN-MEMORY DEPO
// ============================================

class DataEngine {
  private searchIntentLogs: SearchIntentLog[] = [];
  private orderExecutionLogs: OrderExecutionLog[] = [];

  /**
   * Parça arama intentini kaydet
   * 
   * @param data Arama verisi (PII olmayan)
   */
  public logSearchIntent(data: Omit<SearchIntentLog, 'id' | 'timestamp'>): void {
    const log: SearchIntentLog = {
      ...data,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.searchIntentLogs.push(log);
    console.log('[DataEngine] Search Intent logged:', log);
  }

  /**
   * Sipariş yürütümünü kaydet
   * 
   * @param data Sipariş verisi (PII olmayan)
   */
  public logOrderExecution(data: Omit<OrderExecutionLog, 'id' | 'timestamp'>): void {
    const log: OrderExecutionLog = {
      ...data,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.orderExecutionLogs.push(log);
    console.log('[DataEngine] Order Execution logged:', log);
  }

  /**
   * Belirtilen tarih aralığındaki arama intentlerini getir
   */
  public getSearchIntentsByDateRange(startDate: Date, endDate: Date): SearchIntentLog[] {
    return this.searchIntentLogs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  /**
   * Belirtilen tarih aralığındaki siparişleri getir
   */
  public getOrdersByDateRange(startDate: Date, endDate: Date): OrderExecutionLog[] {
    return this.orderExecutionLogs.filter(log =>
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  /**
   * Belirli bir OEM kodunun popülarite skoru
   * (Kaç arama ve sipariş yapıldı)
   */
  public getOEMPopularity(oem: string): { searchCount: number; orderCount: number } {
    const searchCount = this.searchIntentLogs.filter(log => log.oem === oem).length;
    const orderCount = this.orderExecutionLogs.filter(log => log.oem === oem).length;
    return { searchCount, orderCount };
  }

  /**
   * Belirli bir şehire göre istatistikler
   */
  public getStatsByCity(city: string): {
    searchIntents: number;
    orders: number;
    topOEMs: string[];
  } {
    const citySearches = this.searchIntentLogs.filter(log => log.city === city);
    const cityOrders = this.orderExecutionLogs.filter(log => log.city === city);

    // En çok aranan OEM kodlarını bul
    const oemCounts: { [key: string]: number } = {};
    citySearches.forEach(log => {
      oemCounts[log.oem] = (oemCounts[log.oem] || 0) + 1;
    });

    const topOEMs = Object.entries(oemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([oem]) => oem);

    return {
      searchIntents: citySearches.length,
      orders: cityOrders.length,
      topOEMs
    };
  }

  /**
   * Tüm istatistikleri getir
   */
  public getStats(): DataEngineStats {
    const ordersFromLent = this.orderExecutionLogs.filter(log => log.source === 'LENT').length;
    const ordersFromERP = this.orderExecutionLogs.filter(log => log.source === 'ERP').length;

    return {
      totalSearchIntents: this.searchIntentLogs.length,
      totalOrders: this.orderExecutionLogs.length,
      ordersFromLent,
      ordersFromERP,
      searchIntentLogs: this.searchIntentLogs,
      orderExecutionLogs: this.orderExecutionLogs
    };
  }

  /**
   * Son N arama intentini getir
   */
  public getRecentSearchIntents(count: number = 10): SearchIntentLog[] {
    return this.searchIntentLogs.slice(-count).reverse();
  }

  /**
   * Son N siparişi getir
   */
  public getRecentOrders(count: number = 10): OrderExecutionLog[] {
    return this.orderExecutionLogs.slice(-count).reverse();
  }

  /**
   * Veri temizle (debug/test için)
   */
  public clearLogs(): void {
    this.searchIntentLogs = [];
    this.orderExecutionLogs = [];
    console.warn('[DataEngine] All logs cleared');
  }

  /**
   * Benzersiz ID oluştur
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const dataEngine = new DataEngine();

// Export türleri ve servisi
export type { SearchIntentLog, OrderExecutionLog, DataEngineStats } from './dataModels';
