import { AftermarketOrder, OrderStatus, LogisticsFeedItem, AftermarketProductCard } from '../types';

// Initial mock orders
let orders: AftermarketOrder[] = [
    { id: 'ORD-2026-001', createdAt: 'Bugün 10:30', customer: 'LENT İç Operasyon', region: 'İstanbul / Şişli', items: [{ sku: 'SKU-8821', name: 'LuK RepSet 2CT', qty: 5, brand: 'Schaeffler' }], total: 114250, status: 'DELIVERED', etaMinutes: undefined, vehiclePlate: undefined },
    { id: 'ORD-2026-002', createdAt: 'Bugün 09:15', customer: 'LENT İç Operasyon', region: 'İstanbul / Kuruçeşme', items: [{ sku: 'SKU-9942', name: 'Brembo Ön Disk', qty: 8, brand: 'Brembo' }], total: 19600, status: 'SHIPPED', etaMinutes: 45, vehiclePlate: '34 VMS 228' },
    { id: 'ORD-2026-003', createdAt: 'Dün 16:45', customer: 'LENT İç Operasyon', region: 'Ankara / Çankaya', items: [{ sku: 'SKU-1102', name: 'Varta 72Ah Akü', qty: 3, brand: 'Varta' }], total: 9600, status: 'PREPARING', etaMinutes: undefined, vehiclePlate: undefined },
    { id: 'ORD-2026-004', createdAt: 'Dün 14:20', customer: 'LENT İç Operasyon', region: 'İzmir / Karşıyaka', items: [{ sku: 'SKU-5521', name: 'Castrol Edge 5W30', qty: 12, brand: 'Castrol' }], total: 11400, status: 'PENDING', etaMinutes: undefined, vehiclePlate: undefined },
];

let nextOrderId = 5;
let nextVehicleId = 1;

const MOCK_VEHICLES = ['34 VMS 228', '06 AB 991', '35 PS 745', '16 MM 321', '20 TR 654'];
const statusProgression: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED'];

export const aftermarketOpsStore = {
    /**
     * Tüm siparişleri getir
     */
    async getOrders(): Promise<AftermarketOrder[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve([...orders]), 50);
        });
    },

    /**
     * Inventory item'dan sipariş oluştur
     */
    async createOrderFromSuggestion(
        inventoryItem: AftermarketProductCard,
        qty: number,
        region: string,
        orderType: 'SALES' | 'PROCUREMENT' = 'SALES',
        source: 'LENT' | 'ERP' = 'LENT',
        explanation: string = 'Satış Siparişi'
    ): Promise<AftermarketOrder> {
        return new Promise(resolve => {
            setTimeout(() => {
                const newOrder: AftermarketOrder = {
                    id: `ORD-2026-${String(nextOrderId).padStart(3, '0')}`,
                    createdAt: 'Az önce',
                    customer: orderType === 'PROCUREMENT' ? 'LENT İç Operasyon' : 'LENT İç Operasyon',
                    region: region,
                    items: [
                        {
                            sku: inventoryItem.sku,
                            name: inventoryItem.name,
                            qty: qty,
                            brand: inventoryItem.brand
                        }
                    ],
                    total: qty * inventoryItem.price,
                    status: 'PENDING',
                    etaMinutes: undefined,
                    vehiclePlate: undefined,
                    orderType: orderType,
                    source: source,
                    explanation: explanation
                };
                nextOrderId++;
                orders.push(newOrder);
                resolve(newOrder);
            }, 100);
        });
    },

    /**
     * Sipariş durumunu ilerlet: PENDING → PREPARING → SHIPPED → DELIVERED
     */
    async advanceOrderStatus(orderId: string): Promise<AftermarketOrder> {
        return new Promise(resolve => {
            setTimeout(() => {
                const orderIdx = orders.findIndex(o => o.id === orderId);
                if (orderIdx === -1) throw new Error('Sipariş bulunamadı');

                const order = orders[orderIdx];
                const currentIdx = statusProgression.indexOf(order.status);
                
                if (currentIdx < statusProgression.length - 1) {
                    const nextStatus = statusProgression[currentIdx + 1];
                    order.status = nextStatus;

                    if (nextStatus === 'SHIPPED') {
                        order.etaMinutes = Math.floor(Math.random() * 90) + 30; // 30-120 dakika
                        order.vehiclePlate = MOCK_VEHICLES[nextVehicleId % MOCK_VEHICLES.length];
                        nextVehicleId++;
                    }

                    if (nextStatus === 'DELIVERED') {
                        order.etaMinutes = undefined;
                    }
                }

                resolve({ ...order });
            }, 100);
        });
    },

    /**
     * Lojistik feed: SHIPPED siparişleri göster
     */
    async getLogisticsFeed(): Promise<LogisticsFeedItem[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                const shippedOrders = orders.filter(o => o.status === 'SHIPPED');
                const feed: LogisticsFeedItem[] = shippedOrders.map(o => ({
                    plate: o.vehiclePlate || 'N/A',
                    route: `Depo Çıkışı → ${o.region}`,
                    etaMinutes: o.etaMinutes || 0,
                    orderId: o.id
                }));
                resolve(feed);
            }, 50);
        });
    },

    /**
     * İstatistikler (KPI'lar için)
     */
    async getOperationalStats() {
        return new Promise(resolve => {
            setTimeout(() => {
                const pendingPreparingCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length;
                const shippedCount = orders.filter(o => o.status === 'SHIPPED').length;
                const deliveredTotal = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total, 0);
                
                resolve({
                    pendingAndPreparingCount: pendingPreparingCount,
                    shippedCount: shippedCount,
                    deliveredTotal: deliveredTotal
                });
            }, 50);
        });
    }
};
