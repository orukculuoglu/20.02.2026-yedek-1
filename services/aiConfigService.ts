
import { AiPromptConfig } from '../types';

/**
 * SafeCore AI Configuration Vault
 * Bu veriler normalde şifrelenmiş bir DB veya Vault'tan (örn. HashiCorp Vault) çekilir.
 * Kod içinde açık metin olarak bulunmazlar.
 */

const MOCK_AI_VAULT: AiPromptConfig[] = [
    {
        id: 'cfg-001',
        taskName: 'RISK_ANALYSIS',
        activeVersion: 'v2.4.1-stable',
        model: 'gemini-3-pro-preview',
        temperature: 0.2,
        promptTemplate: 'Aracın anonim verilerini kullanarak bölgesel risk katsayılarını hesapla ve Tramer verileriyle çaprazla...',
        updatedAt: '15.05.2024',
        isEncrypted: true,
        // Fix: Added missing properties required by AiPromptConfig interface
        monthlyTokenLimit: 1000000,
        costPerQuery: 0.05
    },
    {
        id: 'cfg-002',
        taskName: 'PART_LIFE',
        activeVersion: 'v1.1.0-alpha',
        model: 'gemini-3-flash-preview',
        temperature: 0.1,
        promptTemplate: 'Belirtilen KM ve motor kodu ({engine_code}) için aşınma eğrisini SafeCore standartlarında öngör...',
        updatedAt: '20.05.2024',
        isEncrypted: true,
        // Fix: Added missing properties required by AiPromptConfig interface
        monthlyTokenLimit: 1000000,
        costPerQuery: 0.02
    },
    {
        id: 'cfg-003',
        taskName: 'VALUATION',
        activeVersion: 'v3.0.2',
        model: 'gemini-3-pro-preview',
        temperature: 0.4,
        promptTemplate: 'Sahibinden.com canlı veri akışı ile SafeCore kütüphanesindeki emsal araçların reel satış bedellerini karşılaştır...',
        updatedAt: '22.05.2024',
        isEncrypted: true,
        // Fix: Added missing properties required by AiPromptConfig interface
        monthlyTokenLimit: 1000000,
        costPerQuery: 0.05
    }
];

export const getAiConfigs = async (): Promise<AiPromptConfig[]> => {
    // Simülasyon: Yetki kontrolü ve veriyi getirme
    return [...MOCK_AI_VAULT];
};

export const rotateAiModel = async (configId: string, newModel: string): Promise<boolean> => {
    const cfg = MOCK_AI_VAULT.find(c => c.id === configId);
    if (cfg) {
        cfg.model = newModel;
        cfg.updatedAt = new Date().toLocaleDateString('tr-TR');
        return true;
    }
    return false;
};

export const getPromptByTask = (task: AiPromptConfig['taskName']): string => {
    const cfg = MOCK_AI_VAULT.find(c => c.taskName === task);
    return cfg ? cfg.promptTemplate : "";
};