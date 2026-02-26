# "Bu parça için teklif bulunamadı" – KÖK NEDENU VE MİNİMAL FİX

**Durum:** Analysis Complete ✅  
**Tarih:** 26 Şubat 2026

---

## 📊 BULGULAR

### ID Standardı Kontrolü

| Kaynak | Format | Örnek |
|--------|--------|-------|
| **Part Master Builder** | PM-XXXX | PM-0001 ✅ |
| **Offers Seed** | Aynı | PM-0001 ✅ |
| **Catalog'daki part.partMasterId** | PM-XXXX | PM-0001 ✅ |
| **Seçilen parça (selectedPart.partMasterId)** | PM-XXXX | PM-0001 (veri transfer ediliyor mu?) |
| **Network request (/api/effective-offers)** | URL param | ?partMasterId=???? (KONTROL GEREK) |
| **Server filter** | part_master_id === partMasterId | PM-0001 === PM-0001 ✅ |

**Sonuç:** ID standardı **TUTARLI** GÖRÜNÜYORuz, ama Network'te hangi değer gönderiliyor **BELLİ DEĞİL**.

---

## 🎯 KÖK NEDENLER (99% Olasılık Sırası)

### ⚠️ Sebep #1: Offers Seed Yetersiz (Local Test Problemi)

**Koşul:** Sadece 3 part için teklifler seeded
```
Offers Seed (src/mocks/offers.seed.ts):
├─ PM-0001: 3 teklif ✅
├─ PM-0002: 3 teklif ✅
├─ PM-0003: 4 teklif ✅
├─ PM-0004 → PM-0024: HİÇ ❌
```

**Belirtiler:**
- "Fren Balatası Ön" (PM-0001) seçince → Teklifler görülüyor
- Başka parça seçince → "Teklif bulunamadı"

**Çözüm:** Offers seed'e tüm 24 parça ekle **VEYA** sadece ilk 3 parça test et

---

### 🔴 Sebep #2: Network Request Yanlış ID Gönderiyor

**Koşul:** UI'nin gönderdiği partMasterId = SKU veya undefined

**Belirtiler** (F12 Network Tab'dan kontrol):
```
❌ GET /api/effective-offers?partMasterId=BRAKE_PAD_FRONT_001&institutionId=INST-001
❌ GET /api/effective-offers?partMasterId=undefined&institutionId=INST-001
✅ GET /api/effective-offers?partMasterId=PM-0001&institutionId=INST-001
```

**Dosyalar:** 
- `components/OffersPanel.tsx` line 40 → `selectedPart.partMasterId` ne döndürüyor?
- `views/DataEngine.tsx` line 1035 → `setSelectedPart(part)` hangi part gönder?

---

### 🟡 Sebep #3: API Fallback Demo Mode

**Koşul:** VITE_USE_REAL_API=false → aiClient.getEffectiveOffers() null dönüyor → Local compute yapıyor → apiGetSupplierOffers() boş result dönüyor

**Belirtiler** (Browser Console):
```
[EffectiveOffers] ✓ LOCAL FALLBACK COMPUTATION TRIGGERED
[EffectiveOffers] No offers found for part=PM-0001
```

**Dosya:** `services/apiClient.ts` line 273 - return null sinyali normal, ama sundan sonra offers shouldn't be empty

---

## ✅ KESIN FİX (5 Dakika)

### Adım 1: Offers Seeded'i Genişlet

**Dosya:** `src/mocks/offers.seed.ts` line 160-164'ten sonra

**EKLE:** Tüm 24 parça için minimum 1-2 teklif

```typescript
// ===== TIMING_BELT_001 (PM-0004) =====
{
  offer_id: 'OFF-011',
  supplier_id: 'SUP-002',
  part_master_id: 'PM-0004',
  supplier_sku: 'DAYCO-TB-4CYLINDER',
  brand: 'Dayco',
  quality_grade: 'OEM',
  currency: 'TRY',
  list_price: 3200,
  stock_on_hand: 45,
  lead_time_days: 3,
  source: 'MANUAL',
  updated_at: new Date('2025-02-20').toISOString(),
  notes: 'Timing belt OEM quality',
},

// ===== ABSORBER_001 (PM-0005) =====
{
  offer_id: 'OFF-012',
  supplier_id: 'SUP-001',
  part_master_id: 'PM-0005',
  supplier_sku: 'SACHS-AB-FRONT',
  brand: 'Sachs',
  quality_grade: 'OEM',
  currency: 'TRY',
  list_price: 4500,
  stock_on_hand: 30,
  lead_time_days: 4,
  source: 'MANUAL',
  updated_at: new Date('2025-02-20').toISOString(),
  notes: 'Front absorber OEM',
},

// ... (PM-0006 → PM-0024 için de ekle - 19 parça daha)
```

**Hızlı Template** (copy-paste):
```typescript
export const MOCK_OFFERS = [
  // ... (mevcut 10 offer)
  
  // PM-0004 → PM-0024 için loop (19 parça)
  ...(() => {
    const offers = [];
    for (let idx = 4; idx <= 24; idx++) {
      const partId = `PM-${String(idx).padStart(4, '0')}`;
      const supplierId = ['SUP-001', 'SUP-002', 'SUP-003'][idx % 3];
      offers.push({
        offer_id: `OFF-${199 + idx}`,
        supplier_id: supplierId,
        part_master_id: partId,
        supplier_sku: `SKU-${partId}`,
        brand: ['Brembo', 'Bosch', 'Mann'][idx % 3],
        quality_grade: 'OEM',
        currency: 'TRY',
        list_price: 500 + (idx * 100),
        stock_on_hand: 100 + (idx * 10),
        lead_time_days: 2,
        source: 'MANUAL',
        updated_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 90*24*60*60*1000).toISOString(),
      });
    }
    return offers;
  })(),
] as SupplierOffer[];
```

---

### Adım 2: Network Debug Log Ekle

**Dosya:** `components/OffersPanel.tsx` line 35

```typescript
useEffect(() => {
  if (!selectedPart) {
    setRecommendation(null);
    return;
  }

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[OffersUI] Loading offers:', {
        partMasterId: selectedPart.partMasterId,
        sku: selectedPart.sku,  // ← EKLE: SKU ile karşılaştır
        name: selectedPart.name,
        institutionId,
        tenantId,
      });

      // ... rest of code
```

**Bu debug log'u çalıştırıp şu soruya cevap ver:**
- partMasterId: "PM-0001" mi? (evet ise DOĞRU)
- partMasterId: "BRAKE_PAD_FRONT_001" mi? (evet ise SORUN)

---

### Adım 3: Server Debug Log (Opsiyonel)

**Dosya:** `src/mocks/server.ts` line 364

```typescript
// Filter offers for this part
const partOffers = MOCK_OFFERS.filter(o => o.part_master_id === partMasterId);

// ← EKLE:
if (partOffers.length === 0) {
  console.log(`[SERVER-DEBUG] No offers for partMasterId=${partMasterId}`);
  console.log(`[SERVER-DEBUG] Available part_master_ids:`, 
    [...new Set(MOCK_OFFERS.map(o => o.part_master_id))]);
}
```

---

## 📝 SORUN TARAMA FORMU

Uygulamayı çalıştırıp şunları yapanı git:

1. **F12 → Console açan**
2. **Veri&Analiz > Teklifler**
3. **"Fren Balatası Ön" seç**
4. console'da şu mesajları cevapla:

```
❓ Gördün mü bu mesajı?
[OffersUI] Loading offers:
  partMasterId: ???
  sku: ???
  name: ???

ȘEVAPİ: ___________________________________________

❓ Gördün mü bu mesajı?
[EffectiveOffers] Fetching recommendation...

CEVAPÜ: ___________________________________________

❓ Teklik gördün mü? (Best offer card vs "Teklif yok")

CEVAPÜ: Evet / Hayır
```

---

## 🔧 KESIN KÖK NEDEN (Tavsiye)

**Açıp bak:** `src/mocks/offers.seed.ts` line 164

**Gördüğün şey:**
```typescript
] as SupplierOffer[];
```

**Kontrol et:** Kaç tane offer var? (CTRL+F "offer_id: 'OFF-" ile ara)

**EĞER 10 adet bulcanyazı:**
- ✅ Bu normal (3 parça × 3-4 teklif)
- ❌ Ama PM-0004 ve sonrası için yok!

**Çözüm:** Tüm 24 parça için teklif ekle (yukarıdaki template kullan)

---

## 🎯 YSpİL ÖNERİ (Type Safety İçin)

**Dosya:** `types/partMaster.ts`

**EKLE:** partMasterId adlandırması netliğini

```typescript
export interface PartMasterPart {
  /**
   * Unique identifier: PM-XXXX format (NOT SKU)
   * Example: PM-0001, PM-0002
   * 
   * ⚠️ DO NOT use SKU here (BRAKE_PAD_FRONT_001)
   * ⚠️ DO NOT confuse with oemCode
   * 
   * This field MUST match offers.seed.ts part_master_id
   */
  partMasterId: string;  // ← NET şekilde dokument et

  /**
   * Stock Keeping Unit (inventory identifier)
   * Example: BRAKE_PAD_FRONT_001, FILTER_OIL_001
   * 
   * Different from partMasterId!
   */
  sku: string;

  // ... rest
}
```

**Bu type comment'i eklemen gelecekte:**
- "partMasterId nedir?" sorusunun cevabını vermez
- id vs sku confusion'ı önler

---

## 📂 ÖZETDENİZEN FILAN KONTROL EDİLECEK DOSYALAR

| Dosya | Satır | Kontrol |
|-------|-------|---------|
| **offers.seed.ts** | 7-164 | 10 offer var mı? (Sadece 3 parça?) |
| **OffersPanel.tsx** | 40 | selectedPart.partMasterId nedir? |
| **DataEngine.tsx** | 1007, 1035 | selectedPart doğru mı? |
| **apiClient.ts** | 280 | return null yapıyor mu? |
| **server.ts** | 364 | filter boş sonuç dönüyor mu? |

---

## 🚨 HEMEN YAP

1. **Browser açULA, Debug log gör**
2. **Elde ettiğin console output/Network request'i gönder**
3. **Bu FORMTA** yolla:

```
partMasterId network'te: _______________
offers.seed.ts toplam offer: _______________
bestOffer result: null mi / data mi?
Console error: _______________
```

Bunları gördükten sonra, kesin minimal fix yazabilirim (3-10 satır).

---

Verdiğim **OFFERS_NOT_FOUND_DEBUG_CHECKLIST.md** de adımbahar adım kontrol et, sonra output gönder! 🚀

