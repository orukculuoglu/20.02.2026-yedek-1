# OFFERS NOT FOUND – HIZA BÜL GÜNÜNDÜRİLMELİ

**TL;DR Kökü:** partMasterId doğru, ama birisi 3 parça dışındaki 21 parça için offer seed'ememiş

---

## 🎯 3 MUTLAKA BULMAK GEREKKLİ KONTROL

### 1️⃣ Network Request (F12 > Network)

`/api/effective-offers?partMasterId=` sonrası ne yazıyor?

- ✅ `...&partMasterId=PM-0001` → Doğru yol
- ❌ `...&partMasterId=BRAKE_PAD_FRONT_001` → SKU gönderiliyor (BUG)
- ❌ `...&partMasterId=undefined` → Kritik hata

**Hangisini gördüysen, onu söyle.**

---

### 2️⃣ Offers Seed Size

`src/mocks/offers.seed.ts` içinde kaç `offer_id` var? (CTRL+F `offer_id:`)

- ✅ 10+ → PM-0001, PM-0002, PM-0003 için teklifler var
- ❌ 10 exactly → Sadece 3 parça için var, PM-0004+ yok

**Doğru şekilde say.**

---

### 3️⃣ Best Offer Card

UI'de gördüğün sonuç:

- ✅ "En İyi Teklif" altında: supplier adı, fiyat, puan → Doğru
- ❌ "Bu parça için teklif bulunamadı" → offers.seed'e bakılması gerek

---

## 🔧 ETKİLİ MİNİMAL FİX (3 Seçenek)

### Option A: Seed'i Genişlet (Best)

**Dosya:** `src/mocks/offers.seed.ts` line 163 sonrası

**Ekle:** PM-0004 → PM-0024 için 21 teklif (veya döngü ile auto-generate)

```typescript
// Çabuk template:
] as SupplierOffer[];

// ← ÖNCEKİ SATIRDİ, ALTaANDAN BAŞLA:
// Defolate fix: Add seed offers for PM-0004 to PM-0024
export const MOCK_OFFERS_EXTENDED = () => {
  const baseOffers = MOCK_OFFERS as any[];
  for (let i = 4; i <= 24; i++) {
    const pm = `PM-${String(i).padStart(4, '0')}`;
    baseOffers.push({
      offer_id: `OFF-${200 + i}`,
      supplier_id: ['SUP-001', 'SUP-002', 'SUP-003'][i % 3],
      part_master_id: pm,
      supplier_sku: `MOCK-${pm}`,
      brand: ['Brembo', 'Bosch', 'Mann'][i % 3],
      quality_grade: 'OEM',
      currency: 'TRY',
      list_price: 1000 + (i * 50),
      stock_on_hand: 50 + (i * 5),
      lead_time_days: 2,
      source: 'MANUAL',
      updated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 90*24*60*60*1000).toISOString(),
    });
  }
  return baseOffers;
};

export const MOCK_OFFERS = MOCK_OFFERS_EXTENDED() as SupplierOffer[];
```

**Sonra:** `server.ts` ve `dataService.ts`'de MOCK_OFFERS import'ü kullanılan yerler otomatik olarak 24 parça için de offer görecek.

---

### Option B: Sadece Kontrol Kısmını Açıklaştır

Eğer SADECE 3 parça test etmek istiyorsan:

**Dosya:** `components/OffersPanel.tsx` line 55 (error handling)

```typescript
if (rec.best) {
  console.log('[OffersUI] ✓ Best offer loaded:', rec.best.offer_id);
}
if (!rec.best && rec.alternatives.length === 0) {
  // Sepet: Sadece PM-0001, PM-0002, PM-0003 için teklifler seed'len
  console.error('[OffersUI] ⚠️ No offers. Seeded only for PM-0001 to PM-0003. Select one of those, or add more to offers.seed.ts');
}
setRecommendation(rec);
```

---

### Option C: Dış kaynaklı Offers Load (İleri)

Real API'den offers'ı getir, mock'a güvenme.

```typescript
// services/apiClient.ts'e ekle:
export async function getOffersByPart(partMasterId: string): Promise<SupplierOffer[]> {
  const endpoint = `/supplier-offers?partMasterId=${encodeURIComponent(partMasterId)}`;
  try {
    return await apiGet<SupplierOffer[]>(endpoint, createApiConfig());
  } catch (error) {
    // Fallback to MOCK
    const { MOCK_OFFERS } = await import('../src/mocks/offers.seed');
    return MOCK_OFFERS.filter(o => o.part_master_id === partMasterId);
  }
}
```

---

## 📋 HEMEN YAPILACAK (5 DAKİKA)

```yaml
1. Uygulama çalıştır:
   npm run dev
   
2. Tarayıcı açt (localhost:3002):
   F12 → Console
   
3. Veri&Analiz > Teklifler
   
4. "Fren Balatası Ön" seç
   
5. Console'da gördüğün ilk satırı kopyala:
   "[OffersUI] Loading offers: ..."
   
6. Network tab'ta şu URL'i görüp Not:
   "?partMasterId=??? &institutionId=..."
   
7. Bana gönder:
   - Network URL
   - Console log
   - Ekran görüntüsü
```

---

## ✨ BONUS TIP (Type-Safety)

**Dosya:** `types/partMaster.ts`

```typescript
interface PartMasterPart {
  /** UNIQUE ID: PM-XXXX format (NOT SKU!) */
  partMasterId: string;
  
  /** Stock Keeping Unit: BRAKE_PAD_FRONT_001 format */
  sku: string;
  
  // ... rest
}
```

Bu comment'i ekle, gelecekte "partMasterId ne?" confusion'ı önler.

---

## 🎬 HA İŞİN ÖZÜ

**Problem:** 
- Seed'de 10 offer (PM-0001, PM-0002, PM-0003 için)
- Catalog'da 24 part (PM-0001 → PM-0024)
- PM-0004 onwards → offers yok → "Bu parça için teklif bulunamadı"

**Çözüm:** 
- PM-0004 → PM-0024 için offers add et
- VEYA sadece PM-0001-0003 test et
- VEYA real API'den fetch et

**Seç birini, 10 dakika sonra çözüm!** 🚀

