/**
 * Vehicle Intelligence Module - Reason Codes
 * Explainability layer: generates reason codes explaining why metrics have specific values
 */

export type ReasonCode = {
  code: string;
  severity: 'info' | 'warn' | 'high';
  message: string;
  meta?: Record<string, any>;
};

export type ReasonCodes = {
  trustIndex: ReasonCode[];
  reliabilityIndex: ReasonCode[];
  maintenanceDiscipline: ReasonCode[];
  structuralRisk: ReasonCode[];
  mechanicalRisk: ReasonCode[];
  insuranceRisk: ReasonCode[];
};

/**
 * Build reason codes for all metrics and indexes
 * Explains WHY each metric has its value
 */
export function buildReasonCodes(input: {
  odometerAnomaly: boolean;
  rollbackSeverity: number;
  volatilityScore: number;
  serviceGapScore: number;
  serviceDiscipline?: {
    timeGapScore: number;
    kmGapScore: number;
    regularityScore: number;
    disciplineScore: number;
    daysSinceLastService?: number;
    estimatedKmSinceLastService?: number;
  };
  structuralRisk: number;
  mechanicalRisk: number;
  insuranceRisk: number;
  obdIntelligence?: {
    totalFaultCount: number;
    uniqueFaultCodes: number;
    categoryBreakdown: Record<string, number>;
    highestSeverity: 'low' | 'medium' | 'high';
    repeatedFaults: string[];
    severityScore: number;
  };
  insuranceDamageCorrelation?: {
    claimCount: number;
    damageCount: number;
    matchedEvents: number;
    mismatchType: 'none' | 'claims_without_damage' | 'damage_without_claims';
    correlationScore: number;
  };
  dataCounts: {
    km: number;
    service: number;
    obd: number;
    insurance: number;
    damage: number;
  };
}): ReasonCodes {
  const reasons: ReasonCodes = {
    trustIndex: [],
    reliabilityIndex: [],
    maintenanceDiscipline: [],
    structuralRisk: [],
    mechanicalRisk: [],
    insuranceRisk: [],
  };

  // TRUST INDEX REASONS
  if (input.odometerAnomaly || input.rollbackSeverity > 40) {
    reasons.trustIndex.push({
      code: 'KM_ANOMALY',
      severity: 'high',
      message: 'Kilometer artışında anormallik tespit edildi',
      meta: { rollbackSeverity: input.rollbackSeverity },
    });
  }

  if (input.dataCounts.km === 0) {
    reasons.trustIndex.push({
      code: 'MISSING_KM_DATA',
      severity: 'warn',
      message: 'KM verisi eksik - güvenilirlik değerlendirilemedi',
      meta: { kmCount: 0 },
    });
  }

  if (input.volatilityScore > 70) {
    reasons.trustIndex.push({
      code: 'HIGH_KM_VOLATILITY',
      severity: 'warn',
      message: 'KM artışında tutarsızlık - hatalı ölçümler olabilir',
      meta: { volatilityScore: input.volatilityScore },
    });
  }

  // RELIABILITY INDEX REASONS
  if (input.mechanicalRisk > 50 || input.dataCounts.obd > 0) {
    reasons.reliabilityIndex.push({
      code: 'OBD_FAULTS',
      severity: 'warn',
      message: `${input.dataCounts.obd} adet OBD hatası kaydedildi`,
      meta: { obdCount: input.dataCounts.obd, mechanicalRisk: input.mechanicalRisk },
    });
  }

  if (input.dataCounts.service === 0) {
    reasons.reliabilityIndex.push({
      code: 'NO_SERVICE_HISTORY',
      severity: 'warn',
      message: 'Servis geçmişi bulunamadı - güvenilirlik veri eksikliğinde',
      meta: { serviceCount: 0 },
    });
  }

  if (input.serviceGapScore > 60) {
    reasons.reliabilityIndex.push({
      code: 'SERVICE_GAP',
      severity: 'warn',
      message: 'Bakım aralıkları standartları aşıyor',
      meta: { serviceGapScore: input.serviceGapScore },
    });
  }

  // MAINTENANCE DISCIPLINE REASONS - Enhanced with new serviceDiscipline metrics
  if (input.serviceDiscipline) {
    const sd = input.serviceDiscipline;

    // Service overdue (>365 days since last service)
    if (sd.daysSinceLastService !== undefined && sd.daysSinceLastService > 365) {
      reasons.maintenanceDiscipline.push({
        code: 'SERVICE_OVERDUE',
        severity: 'high',
        message: `Bakım ber ${sd.daysSinceLastService} gün gecikmeli`,
        meta: { daysSinceLastService: sd.daysSinceLastService },
      });
    }

    // Irregular service pattern (low regularity score)
    if (sd.regularityScore < 40) {
      reasons.maintenanceDiscipline.push({
        code: 'IRREGULAR_SERVICE_PATTERN',
        severity: 'warn',
        message: 'Bakım aralıkları tutarsız - düzensiz bakım deseni',
        meta: { regularityScore: sd.regularityScore },
      });
    }

    // High km since last service
    if (
      sd.estimatedKmSinceLastService !== undefined &&
      sd.estimatedKmSinceLastService > 20000
    ) {
      reasons.maintenanceDiscipline.push({
        code: 'HIGH_KM_SINCE_SERVICE',
        severity: 'warn',
        message: `Son bakımdan sonra ${sd.estimatedKmSinceLastService} km kat edildi`,
        meta: { estimatedKmSinceLastService: sd.estimatedKmSinceLastService },
      });
    }

    // Low discipline score overall
    if (sd.disciplineScore < 40) {
      reasons.maintenanceDiscipline.push({
        code: 'LOW_DISCIPLINE_SCORE',
        severity: 'high',
        message: 'Genel bakım disiplini çok düşük',
        meta: { disciplineScore: sd.disciplineScore },
      });
    }
  }

  // Insufficient service history
  if (input.dataCounts.service < 2) {
    reasons.maintenanceDiscipline.push({
      code: 'INSUFFICIENT_SERVICE_HISTORY',
      severity: 'warn',
      message: 'Bakım geçmişi yetersiz - değerlendirme sınırlı',
      meta: { serviceCount: input.dataCounts.service },
    });
  }

  if (input.odometerAnomaly) {
    reasons.maintenanceDiscipline.push({
      code: 'ODOMETER_ANOMALY',
      severity: 'warn',
      message: 'Kilometre artışında anormallik - bakım planlaması etkilenmiş olabilir',
      meta: { isAnomaly: true },
    });
  }

  // STRUCTURAL RISK REASONS
  if (input.structuralRisk > 70) {
    reasons.structuralRisk.push({
      code: 'HIGH_DAMAGE_RISK',
      severity: 'high',
      message: 'Yapısal hasar riski yüksek',
      meta: { structuralRisk: input.structuralRisk },
    });
  }

  if (input.dataCounts.damage > 5) {
    reasons.structuralRisk.push({
      code: 'MULTIPLE_DAMAGE_RECORDS',
      severity: 'warn',
      message: `${input.dataCounts.damage} hasar kaydı tespit edildi`,
      meta: { damageCount: input.dataCounts.damage },
    });
  }

  if (input.dataCounts.damage === 0) {
    reasons.structuralRisk.push({
      code: 'NO_DAMAGE_DATA',
      severity: 'info',
      message: 'Hasar kaydı yok - zayıf taraf olarak değerlendirildi',
      meta: { damageCount: 0 },
    });
  }

  // MECHANICAL RISK REASONS
  if (input.mechanicalRisk > 50) {
    reasons.mechanicalRisk.push({
      code: 'HIGH_MECHANICAL_RISK',
      severity: 'high',
      message: 'Mekanik sorun riski yüksek',
      meta: { mechanicalRisk: input.mechanicalRisk },
    });
  }

  if (input.dataCounts.obd > 3) {
    reasons.mechanicalRisk.push({
      code: 'MULTIPLE_OBD_FAULTS',
      severity: 'warn',
      message: `${input.dataCounts.obd} OBD hatası belirtisi`,
      meta: { obdCount: input.dataCounts.obd },
    });
  }

  // OBD INTELLIGENCE REASONS - New structured OBD analysis
  if (input.obdIntelligence) {
    const obd = input.obdIntelligence;

    // High OBD severity
    if (obd.highestSeverity === 'high') {
      reasons.mechanicalRisk.push({
        code: 'HIGH_OBD_SEVERITY',
        severity: 'high',
        message: 'Kritik OBD arıza kategorisi tespit edildi',
        meta: { highestSeverity: obd.highestSeverity },
      });
    }

    // Repeated fault codes
    if (obd.repeatedFaults.length > 0) {
      reasons.mechanicalRisk.push({
        code: 'REPEATED_FAULT_CODES',
        severity: 'warn',
        message: `${obd.repeatedFaults.length} tekrarlayan OBD hatası tespit edildi`,
        meta: { repeatedCount: obd.repeatedFaults.length, faultCodes: obd.repeatedFaults },
      });
    }

    // Engine faults specifically
    if (obd.categoryBreakdown.engine > 0) {
      reasons.mechanicalRisk.push({
        code: 'ENGINE_FAULT_PRESENT',
        severity: 'warn',
        message: `Motor arızası tespit edildi (${obd.categoryBreakdown.engine} olay)`,
        meta: { engineFaultCount: obd.categoryBreakdown.engine },
      });
    }

    // Transmission faults
    if (obd.categoryBreakdown.transmission > 0) {
      reasons.mechanicalRisk.push({
        code: 'TRANSMISSION_FAULT_PRESENT',
        severity: 'high',
        message: `Şanzıman arızası tespit edildi (${obd.categoryBreakdown.transmission} olay)`,
        meta: { transmissionFaultCount: obd.categoryBreakdown.transmission },
      });
    }
  }

  // INSURANCE RISK REASONS
  if (input.insuranceRisk > 50) {
    reasons.insuranceRisk.push({
      code: 'CLAIM_HISTORY',
      severity: 'warn',
      message: 'Sigorta talep geçmişi veya sorun kaydı mevcut',
      meta: { insuranceRisk: input.insuranceRisk },
    });
  }

  if (input.dataCounts.insurance > 3) {
    reasons.insuranceRisk.push({
      code: 'MULTIPLE_CLAIMS',
      severity: 'warn',
      message: `${input.dataCounts.insurance} sigorta işlemi kaydedildi`,
      meta: { insuranceCount: input.dataCounts.insurance },
    });
  }

  if (input.dataCounts.insurance === 0) {
    reasons.insuranceRisk.push({
      code: 'NO_INSURANCE_DATA',
      severity: 'info',
      message: 'Sigorta verisi yok - risk değerlendirildi',
      meta: { insuranceCount: 0 },
    });
  }

  // INSURANCE + DAMAGE CORRELATION REASONS
  if (input.insuranceDamageCorrelation) {
    const corr = input.insuranceDamageCorrelation;

    // Unified reasonCode for any mismatch (always added)
    if (corr.mismatchType !== 'none') {
      const reasonSeverity = corr.correlationScore >= 50 ? 'high' : 'warn';
      reasons.trustIndex.push({
        code: 'INSURANCE_DAMAGE_MISMATCH',
        severity: reasonSeverity,
        message: 'Sigorta ve hasar kayıtları arasında tutarsızlık tespit edildi',
        meta: {
          mismatchType: corr.mismatchType,
          correlationScore: corr.correlationScore,
          claimCount: corr.claimCount,
          damageCount: corr.damageCount,
        },
      });
    }

    if (corr.mismatchType === 'claims_without_damage') {
      reasons.insuranceRisk.push({
        code: 'CLAIM_WITHOUT_DAMAGE_RECORD',
        severity: 'warn',
        message: 'Sigorta kaydı var ancak hasar kaydı eşleşmiyor',
        meta: {
          claimCount: corr.claimCount,
          damageCount: corr.damageCount,
          matchedEvents: corr.matchedEvents,
        },
      });
      reasons.trustIndex.push({
        code: 'INSURANCE_CLAIM_MISMATCH',
        severity: 'warn',
        message: 'Sigorta ve hasar kayıtları uyuşmuyor - güvenilirlik sorunu',
        meta: {
          mismatchType: corr.mismatchType,
          claimCount: corr.claimCount,
          damageCount: corr.damageCount,
        },
      });
    }

    if (corr.mismatchType === 'damage_without_claims') {
      reasons.structuralRisk.push({
        code: 'DAMAGE_WITHOUT_CLAIM',
        severity: 'warn',
        message: 'Hasar kaydı var ancak sigorta kaydı bulunamadı',
        meta: {
          damageCount: corr.damageCount,
          claimCount: corr.claimCount,
          matchedEvents: corr.matchedEvents,
        },
      });
      reasons.trustIndex.push({
        code: 'UNREPORTED_DAMAGE',
        severity: 'warn',
        message: 'Bildirilmemiş hasar kaydı - güvenilirlik sorunu',
        meta: {
          mismatchType: corr.mismatchType,
          damageCount: corr.damageCount,
          claimCount: corr.claimCount,
        },
      });
    }

    if (corr.correlationScore >= 50) {
      reasons.insuranceRisk.push({
        code: 'INSURANCE_DAMAGE_MISMATCH_HIGH',
        severity: 'high',
        message: 'Yüksek sigorta-hasar uyuşmazlığı tespit edildi',
        meta: {
          correlationScore: corr.correlationScore,
          mismatchType: corr.mismatchType,
          claimCount: corr.claimCount,
          damageCount: corr.damageCount,
        },
      });
    }

    // PHASE 2.6(B): Enhanced trust impact reason codes
    if (corr.mismatchType !== 'none') {
      // Penalty severity based on type and correlation
      const penaltySeverity =
        corr.mismatchType === 'damage_without_claims'
          ? 'high'
          : corr.correlationScore >= 50
            ? 'high'
            : 'warn';

      reasons.trustIndex.push({
        code: 'INSURANCE_DAMAGE_INCONSISTENCY',
        severity: penaltySeverity,
        message: 'Sigorta-hasar tutarsızlığı güven puanını düşürmektedir',
        meta: {
          mismatchType: corr.mismatchType,
          correlationScore: corr.correlationScore,
          claimCount: corr.claimCount,
          damageCount: corr.damageCount,
        },
      });
    }

    // Cross-domain suspicion will be added separately when km anomaly is also present
    // (handled in a new combined check)
  }

  // PHASE 2.6(B): Cross-domain suspicion (KM anomaly + Insurance-Damage mismatch)
  if (input.odometerAnomaly && input.insuranceDamageCorrelation?.mismatchType !== 'none') {
    reasons.trustIndex.push({
      code: 'CROSS_DOMAIN_SUSPICION',
      severity: 'high',
      message: 'KM anomaly ve sigorta-hasar uyuşmazlığı birlikte tespit edildi - yüksek risk',
      meta: {
        kmAnomaly: true,
        mismatchType: input.insuranceDamageCorrelation?.mismatchType,
        rollbackSeverity: input.rollbackSeverity,
        correlationScore: input.insuranceDamageCorrelation?.correlationScore,
      },
    });
  }

  return reasons;
}
