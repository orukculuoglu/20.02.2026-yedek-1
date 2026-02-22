/**
 * Veri Motoru – Endeks Üretimi (V0)
 * Demo/simülasyon veri ile çalışan basit ama deterministik endeks hesaplaması
 */

export interface IndexResult {
  overallRisk: number;
  durabilityIndex: number;
  costPressureIndex: number;
  supplyStressIndex: number;
  confidence: number;
  reasons: string[];
}

export interface ComputeIndexInput {
  mileage?: number;
  region?: {
    city?: string;
    district?: string;
  };
  vehicle?: {
    brand?: string;
    model?: string;
  };
  parts?: Array<{
    category?: string;
    brand?: string;
    price?: number;
  }>;
}

export function computeIndexes(input: ComputeIndexInput): IndexResult {
  const reasons: string[] = [];

  // Calculate confidence based on input field completion
  const fieldsCount = [
    input.mileage ? 1 : 0,
    input.region?.city ? 1 : 0,
    input.region?.district ? 1 : 0,
    input.vehicle?.brand ? 1 : 0,
    input.vehicle?.model ? 1 : 0,
    (input.parts?.length ?? 0) > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  const totalFields = 6;
  const confidence = Math.round((fieldsCount / totalFields) * 100);

  // Durability Index (decreases with mileage)
  let durabilityIndex = 85;
  if (input.mileage) {
    // Degrade by 1 point per 10,000 km
    const degradation = Math.floor(input.mileage / 10000) * 1;
    durabilityIndex = Math.max(20, 85 - degradation);
    
    if (input.mileage > 150000) {
      reasons.push(`Yüksek kilometre (${input.mileage.toLocaleString()} km) parça ömrünü ciddi şekilde azaltmaktadır.`);
    } else if (input.mileage > 100000) {
      reasons.push(`Kilometre sayısı (${input.mileage.toLocaleString()} km) kritik eşiğe yaklaşmaktadır.`);
    }
  }

  // Cost Pressure Index (increases with parts price and variety)
  let costPressureIndex = 30;
  if (input.parts && input.parts.length > 0) {
    const averagePrice = input.parts.reduce((sum, p) => sum + (p.price ?? 0), 0) / input.parts.length;
    const varietyFactor = Math.min(input.parts.length * 5, 40); // Up to 40 points for variety
    const priceFactor = Math.min(averagePrice / 100, 30); // Up to 30 points for avg price
    costPressureIndex = Math.min(100, 30 + varietyFactor + priceFactor);

    if (averagePrice > 3000) {
      reasons.push(`Yüksek birim parça maliyetleri (ort. ${averagePrice.toFixed(0)} ₺) işletme maliyetini artırmaktadır.`);
    }
    if (input.parts.length > 5) {
      reasons.push(`Geniş yedek parça çeşitliliği (${input.parts.length} kategori) envanter yönetimini karmaşık hale getirmektedir.`);
    }
  }

  // Supply Stress Index (demo parameter: simulates low stock scenario)
  let supplyStressIndex = 35;
  if (input.region?.city === 'İstanbul') {
    // Higher supply stress in Istanbul due to demo scenario
    supplyStressIndex = 60;
    reasons.push(`İstanbul bölgesinde tedarik stok seviyeleri kritik seviyede bulunmaktadır.`);
  } else if (input.region?.city === 'Ankara') {
    supplyStressIndex = 45;
  } else if (input.region?.city === 'İzmir') {
    supplyStressIndex = 40;
  } else if (input.region?.city) {
    supplyStressIndex = 38;
  }

  // Adjust supply stress based on parts count
  if (input.parts && input.parts.length > 10) {
    supplyStressIndex = Math.min(100, supplyStressIndex + 15);
  }

  // Overall Risk (composite of all factors)
  let overallRisk = Math.round(
    (100 - durabilityIndex) * 0.35 +
    costPressureIndex * 0.25 +
    supplyStressIndex * 0.40
  );
  overallRisk = Math.min(100, Math.max(0, overallRisk));

  // Add brand-specific risk notes
  if (input.vehicle?.brand === 'Ford') {
    overallRisk = Math.min(100, overallRisk + 8);
    reasons.push(`${input.vehicle.brand} markaları tarihsel olarak şanzıman sorunları göstermektedir.`);
  } else if (input.vehicle?.brand === 'BMW') {
    reasons.push(`${input.vehicle.brand} modelleri bileşen çeşitliliği nedeniyle yüksek bakım maliyetine maruz kalabilir.`);
  }

  // Add region-specific notes
  if (input.region?.district) {
    reasons.push(`${input.region.city || 'Seçili'} ilinin ${input.region.district} ilçesinde bölgesel talepte değişim gözlenmektedir.`);
  }

  // Ensure we have at least 3 reasons
  if (reasons.length === 0) {
    reasons.push(`Genel teknisyen bakım programı önerilmektedir.`);
  }
  if (reasons.length === 1) {
    reasons.push(`Sayısal veri eksikliği nedeniyle tam analiz yapmak mümkün olmamıştır.`);
  }
  if (reasons.length < 3) {
    reasons.push(`Periyodik endeks güncellemesi ile daha kesin öngörüler alınabilecektir.`);
  }

  return {
    overallRisk,
    durabilityIndex,
    costPressureIndex,
    supplyStressIndex,
    confidence,
    reasons: reasons.slice(0, 6), // Limit to 6 reasons max
  };
}
