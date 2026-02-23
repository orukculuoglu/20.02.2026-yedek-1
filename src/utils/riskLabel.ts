/**
 * Centralized Risk Label Management
 * Single source of truth for risk tier classification, labels, and colors
 */

export type RiskTier = 'LOW' | 'MID' | 'HIGH' | 'CRITICAL';

/**
 * Determines risk tier based on score
 * 0-34: LOW (Düşük)
 * 35-49: MID (Orta)
 * 50-59: HIGH (Yüksek)
 * ≥60: CRITICAL (Kritik)
 */
export function getRiskTier(score: number): RiskTier {
  if (score >= 60) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 35) return 'MID';
  return 'LOW';
}

/**
 * Returns Turkish risk label
 * Examples: 'Düşük risk', 'Orta risk', 'Yüksek risk', 'Kritik risk'
 */
export function getRiskLabel(score: number): string {
  const tier = getRiskTier(score);

  switch (tier) {
    case 'CRITICAL':
      return 'Kritik risk';
    case 'HIGH':
      return 'Yüksek risk';
    case 'MID':
      return 'Orta risk';
    default:
      return 'Düşük risk';
  }
}

/**
 * Returns Tailwind text color class for risk tier
 * Examples: 'text-rose-600', 'text-amber-600', 'text-orange-500', 'text-emerald-600'
 */
export function getRiskColor(score: number): string {
  const tier = getRiskTier(score);

  switch (tier) {
    case 'CRITICAL':
      return 'text-rose-600';
    case 'HIGH':
      return 'text-amber-600';
    case 'MID':
      return 'text-orange-500';
    default:
      return 'text-emerald-600';
  }
}

/**
 * Returns Tailwind badge color classes (background + text)
 */
export function getRiskBadgeClasses(score: number): string {
  const tier = getRiskTier(score);

  switch (tier) {
    case 'CRITICAL':
      return 'bg-rose-100 text-rose-700';
    case 'HIGH':
      return 'bg-amber-100 text-amber-700';
    case 'MID':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
}

/**
 * Returns Tailwind background color only
 */
export function getRiskBgColor(score: number): string {
  const tier = getRiskTier(score);

  switch (tier) {
    case 'CRITICAL':
      return 'bg-rose-500';
    case 'HIGH':
      return 'bg-amber-500';
    case 'MID':
      return 'bg-orange-500';
    default:
      return 'bg-emerald-500';
  }
}
