/**
 * Risk Label Helper Functions
 * Standardizes risk tier classification and Turkish labels across the dashboard
 * 
 * Thresholds:
 *  0-34: LOW (Düşük)
 *  35-49: MID (Orta)
 *  50-59: HIGH (Yüksek)
 *  ≥60: CRITICAL (Kritik)
 */

export type RiskTier = 'LOW' | 'MID' | 'HIGH' | 'CRITICAL';

/**
 * Determines risk tier based on risk score
 */
export function getRiskTier(score: number): RiskTier {
  if (score >= 60) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 35) return 'MID';
  return 'LOW';
}

/**
 * Returns Turkish label for risk tier
 * Examples: 'Düşük', 'Orta', 'Yüksek', 'Kritik'
 */
export function getRiskTierLabelTR(tier: RiskTier): string {
  const labels: Record<RiskTier, string> = {
    'LOW': 'Düşük',
    'MID': 'Orta',
    'HIGH': 'Yüksek',
    'CRITICAL': 'Kritik',
  };
  return labels[tier];
}

/**
 * Returns Turkish prefix for risk tier
 * Examples: 'Düşük risk', 'Orta risk', 'Yüksek risk', 'Kritik risk'
 */
export function getRiskPrefixTR(tier: RiskTier): string {
  return `${getRiskTierLabelTR(tier)} risk`;
}

/**
 * Returns Tailwind CSS classes for risk tier badge colors
 */
export function getRiskTierColorClasses(tier: RiskTier): string {
  const colors: Record<RiskTier, string> = {
    'LOW': 'bg-emerald-100 text-emerald-800',
    'MID': 'bg-amber-100 text-amber-800',
    'HIGH': 'bg-orange-100 text-orange-800',
    'CRITICAL': 'bg-rose-100 text-rose-800',
  };
  return colors[tier];
}

/**
 * Returns background color class for risk tier
 */
export function getRiskTierBgColor(tier: RiskTier): string {
  const colors: Record<RiskTier, string> = {
    'LOW': 'bg-emerald-100',
    'MID': 'bg-amber-100',
    'HIGH': 'bg-orange-100',
    'CRITICAL': 'bg-rose-100',
  };
  return colors[tier];
}

/**
 * Returns text color class for risk tier
 */
export function getRiskTierTextColor(tier: RiskTier): string {
  const colors: Record<RiskTier, string> = {
    'LOW': 'text-emerald-800',
    'MID': 'text-amber-800',
    'HIGH': 'text-orange-800',
    'CRITICAL': 'text-rose-800',
  };
  return colors[tier];
}
