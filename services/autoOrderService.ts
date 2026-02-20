export type SignalLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReorderSuggestion {
    id: string;
    category: string;
    velocitySignal: SignalLevel;
    recommendedRange: string;
    seasonalityLabel: 'Kış' | 'Yaz' | 'Genel';
    confidenceScore: number; // 0-100
}

/**
 * Auto Order Signal Service
 * Generates inventory signals based on historical patterns without leaking raw stock numbers.
 */
export const generateReorderSuggestions = (params: { tenantId: string }): ReorderSuggestion[] => {
    const { tenantId } = params;
    
    // Deterministic mock generation based on tenantId
    const seed = tenantId.length;
    
    const categories = [
        "Fren Balataları", "Yağ Filtreleri", "Hava Filtreleri", "Motor Yağları",
        "Ateşleme Bujileri", "Silecek Süpürgeleri", "Antifriz & Sıvılar", 
        "Debriyaj Setleri", "Amortisörler", "Triger Kayışları"
    ];

    return categories.map((cat, index) => {
        const hash = (seed + index) % 3;
        const velocity: SignalLevel = hash === 0 ? 'HIGH' : hash === 1 ? 'MEDIUM' : 'LOW';
        
        // Mock range logic
        const min = 5 + (seed % 5) + index;
        const max = min + 5 + (index % 3);
        
        return {
            id: `sug-${tenantId.substring(0, 3)}-${index}`,
            category: cat,
            velocitySignal: velocity,
            recommendedRange: `${min}-${max} adet`,
            seasonalityLabel: index % 4 === 0 ? 'Kış' : index % 7 === 0 ? 'Yaz' : 'Genel',
            confidenceScore: 70 + (index * 2) + (seed % 10)
        };
    });
};
