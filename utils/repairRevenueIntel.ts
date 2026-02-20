import { ServiceWorkOrder } from '../types';

// 17.02.2026 - Demo Maliyet ve Meta Veri Eşleşmeleri
const DEMO_COST_MAP: Record<string, number> = {
  "Fren Balatası": 1800,
  "Triger Seti": 5200,
  "Yağ Bakımı": 2100,
  "Lastik Değişimi": 8500,
  "İşçilik": 350,
};

const DEMO_PART_META: Record<string, { brand: string; category: string }> = {
  "Fren Balatası": { brand: "Brembo", category: "Fren" },
  "Triger Seti": { brand: "Gates", category: "Motor" },
  "Yağ Bakımı": { brand: "Castrol", category: "Periyodik" },
  "Lastik Değişimi": { brand: "Michelin", category: "Lastik" },
  "İşçilik": { brand: "SERVICE", category: "İşçilik" },
};

export interface RepairRevenueIntel {
  revenueTotal: number;
  costTotal: number;
  profitTotal: number;
  marginPct: number;
  itemsSold: number;
  partItems: number;
  laborItems: number;
  topBrandsByProfit: Array<{ brand: string; profit: number; revenue: number; items: number; marginPct: number }>;
  topCategoriesByItems: Array<{ category: string; items: number; revenue: number }>;
}

export const computeRepairRevenueIntel = (workOrders: ServiceWorkOrder[]): RepairRevenueIntel => {
  let revenueTotal = 0;
  let costTotal = 0;
  let partItems = 0;
  let laborItems = 0;

  const brandStats: Record<string, { profit: number; revenue: number; items: number }> = {};
  const categoryStats: Record<string, { items: number; revenue: number }> = {};

  workOrders.forEach(wo => {
    (wo.diagnosisItems || []).forEach(item => {
      const revenue = item.signalCost || 0;
      const cost = DEMO_COST_MAP[item.item] || (revenue * 0.85);
      const profit = revenue - cost;
      const meta = DEMO_PART_META[item.item] || { brand: "Bilinmeyen", category: "Diğer" };

      revenueTotal += revenue;
      costTotal += cost;
      if (item.type === 'PART') partItems++; else laborItems++;

      // Brand Aggregation
      if (!brandStats[meta.brand]) brandStats[meta.brand] = { profit: 0, revenue: 0, items: 0 };
      brandStats[meta.brand].profit += profit;
      brandStats[meta.brand].revenue += revenue;
      brandStats[meta.brand].items += 1;

      // Category Aggregation
      if (!categoryStats[meta.category]) categoryStats[meta.category] = { items: 0, revenue: 0 };
      categoryStats[meta.category].items += 1;
      categoryStats[meta.category].revenue += revenue;
    });
  });

  const profitTotal = revenueTotal - costTotal;
  const marginPct = revenueTotal > 0 ? (profitTotal / revenueTotal) * 100 : 0;

  const topBrandsByProfit = Object.entries(brandStats)
    .map(([brand, stat]) => ({
      brand,
      profit: stat.profit,
      revenue: stat.revenue,
      items: stat.items,
      marginPct: stat.revenue > 0 ? (stat.profit / stat.revenue) * 100 : 0
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const topCategoriesByItems = Object.entries(categoryStats)
    .map(([category, stat]) => ({
      category,
      items: stat.items,
      revenue: stat.revenue
    }))
    .sort((a, b) => b.items - a.items)
    .slice(0, 5);

  return {
    revenueTotal,
    costTotal,
    profitTotal,
    marginPct,
    itemsSold: partItems + laborItems,
    partItems,
    laborItems,
    topBrandsByProfit,
    topCategoriesByItems
  };
};