/**
 * Vehicle Intelligence Module - Insight Generator
 * Generates human-readable insights from vehicle data
 */

import type { VehicleAggregate } from './types';

export function generateInsight(aggregate: VehicleAggregate): string {
  const { derived, indexes, dataSources } = aggregate;
  const insights: string[] = [];

  // CRITICAL ALERTS
  if (derived.odometerAnomaly) {
    insights.push(
      '🚨 **UYARI**: Kilometre sayacı anomalisi tespit edildi - olası veri manipülasyonu veya cihaz arızası.'
    );
  }

  // STRUCTURAL RISK
  if (derived.structuralRisk > 70) {
    insights.push(
      '⚠️ **Yüksek Yapısal Risk**: Araç geçmiş hasar kaydı önemli risk taşımaktadır. Kapsamlı bir ön muayene tavsiye edilir.'
    );
  } else if (derived.structuralRisk > 40) {
    insights.push(
      '⚠️ **Orta Yapısal Risk**: Geçmiş hasarlar gözlemlendi. Uzman muayene önerilir.'
    );
  }

  // MECHANICAL RISK
  if (derived.mechanicalRisk > 70) {
    insights.push(
      '⚠️ **Yüksek Mekanik Risk**: Birden fazla arıza kodu tespit edildi. Derhal bakım önerilir.'
    );
  } else if (derived.mechanicalRisk > 40) {
    insights.push(
      '⚠️ **Orta Mekanik Risk**: Bazı arıza kodları kaydedilmiş. Yakın zamanda bakım gerekli olabilir.'
    );
  }

  // SERVICE GAPS
  if (derived.serviceGapScore > 70) {
    insights.push(
      '⚠️ **Bakım Geçişleri**: Uzun bakım aralıkları tespit edildi. Sistematik bakım gereklidir.'
    );
  }

  // INSURANCE RISK
  if (derived.insuranceRisk > 60) {
    insights.push(
      '⚠️ **Sigorta Riski**: Geçmiş sigorta talepleri veya poliçe iptal kayıtları mevcut.'
    );
  }

  // POSITIVE SIGNALS
  if (
    derived.structuralRisk < 20 &&
    derived.mechanicalRisk < 20 &&
    derived.serviceGapScore < 30
  ) {
    insights.push('✅ Araç iyi durumda. Düzenli bakım yapılmış izlenimi vermektedir.');
  }

  // DATA COMPLETENESS
  const dataSourcesCount = Object.values(dataSources).filter((arr) => arr.length > 0).length;
  if (dataSourcesCount < 3) {
    insights.push(
      `ℹ️ Veri eksikliği: Yalnızca ${dataSourcesCount}/5 veri kaynağından bilgi toplanabildi. Değerlendirme sınırlıdır.`
    );
  }

  // TRUST INDEX
  if (indexes.trustIndex < 40) {
    insights.push(
      `🔴 **Düşük Güven Indeksi (${indexes.trustIndex}/100)**: Araç hakkında verilerde tutarsızlıklar veya kırmızı bayraklar bulunmaktadır.`
    );
  } else if (indexes.trustIndex < 70) {
    insights.push(
      `🟡 **Orta Güven Indeksi (${indexes.trustIndex}/100)**: Araç hakkında bazı endişeler vardır. Ek inceleme tavsiye edilir.`
    );
  } else {
    insights.push(
      `🟢 **Yüksek Güven Indeksi (${indexes.trustIndex}/100)**: Araç güvenilir görünmektedir.`
    );
  }

  // Combine insights
  if (insights.length === 0) {
    return 'Araç hakkında yeterli bilgi yok. Lütfen daha fazla veri sağlayınız.';
  }

  return insights.join('\n\n');
}

/**
 * Generate a brief status badge text (one-liner)
 */
export function generateStatusBadge(
  trustIndex: number,
  structuralRisk: number,
  mechanicalRisk: number,
  odometerAnomaly: boolean
): string {
  if (odometerAnomaly) {
    return '🚨 Anomali Tespit Edildi';
  }

  if (structuralRisk > 70 || mechanicalRisk > 70) {
    return '⚠️ Yüksek Risk';
  }

  if (structuralRisk > 40 || mechanicalRisk > 40) {
    return '🟡 Orta Risk';
  }

  if (trustIndex > 80) {
    return '🟢 İyi Durumda';
  }

  if (trustIndex > 60) {
    return '🟡 Kabul Edilebilir';
  }

  return '🔴 Şüpheli';
}

/**
 * Generate a summary sentence for dashboard display
 */
export function generateSummaryLine(
  trustIndex: number,
  reliabilityIndex: number,
  damagCount: number,
  serviceCount: number
): string {
  const parts: string[] = [];

  parts.push(`Güven: ${trustIndex}/100`);
  parts.push(`Güvenilirlik: ${reliabilityIndex}/100`);

  if (damagCount > 0) {
    parts.push(`${damagCount} Hasar Kaydı`);
  }

  if (serviceCount > 0) {
    parts.push(`${serviceCount} Hizmet Kaydı`);
  }

  return parts.join(' • ');
}
