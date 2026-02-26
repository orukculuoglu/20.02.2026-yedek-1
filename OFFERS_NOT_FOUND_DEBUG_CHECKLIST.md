# ROOT CAUSE ANALYSIS - "Bu parça için teklif bulunamadı" Hatası

**Tarih:** 26 Şubat 2026  
**Sorun:** UI'de seçilen parça için teklifler görünmüyor  
**Şüphe:** partMasterId mismatch (Kim ne gönderiyor?)

---

## 🔍 KESIN DİYAGNOZ KONTROLLİ

Tarayıcı konsolunu açıp (F12 → Console) bu sırayla kontrol et:

### KONTROL 1: Network Request (Hangi ID gönderiliyor?)

**Yapılacak:** Veri&Analiz > Teklifler tabına git, "Fren Balatası Ön" seç, F12 açılıysa Network tab'ı check et.

**Ara:** `/api/effective-offers` istekleri

**Bak:**
```
GET /api/effective-offers?partMasterId=????&institutionId=INST-001
```

**BÜYÜKçeKLİ**: Soru işareti yerine ne var?
- `partMasterId=PM-0001` → ✅ DOĞRU
- `partMasterId=BRAKE_PAD_FRONT_001` → ❌ YANLIŞSAK (SKU gönderiliyor)
- `partMasterId=undefined` → ❌ KRITIK BUG

### KONTROL 2: Browser Console (Hangi log mesajları çıkıyor?)

**Yapılacak:** Seç > Console'da aşağıdaki log'ları ara:

```
[EffectiveOffers] Fetching recommendation for part=PM-0001
[EffectiveOffers] Attempting server computation via API...
[EffectiveOffers] ✓ Server computation received successfully
```

**Mesajı göremiyorsan:**
- `[EffectiveOffers] Demo mode (...), will compute locally` → API disable
- Hiç mesaj yok → OffersPanel component çalışmıyor30 saniye bekle, tekrar kontrol et.)

### KONTROL 3: Server Network Log (Sunucu ne dönüyor?)

**Network tab'da** `/api/effective-offers` isteğine çift tıkla, **Response** bölmesini aç:

**Eğer başarılı (200):**
```json
{
  "success": true,
  "data": {
    "part_master_id": "PM-0001",
    "best": { "offer_id": "OFF-001", ... },
    "alternatives": [...]
  }
}
```

**Eğer bestfail (404/500):**
```
// Network error mesajı
```

**Eğer success: true ama best: null:**
```json
{
  "success": true,
  "data": {
    "best": null,
    "alternatives": []
  }
}
```

← **ÖNEMLİ**: Bu, teklifler seed'de için o parça ID'siyle kayıt yok anlamına geliyor!

---

## 🎯 MUHTEMEL SEBEPLER (Tespit Sırası)

### Sebep 1️⃣: partMasterId olarak SKU gönderiliyor ❌

**Belirti:**
- Network'te görülen param: `partMasterId=BRAKE_PAD_FRONT_001`
- Server filter: `MOCK_OFFERS.filter(o => o.part_master_id === 'BRAKE_PAD_FRONT_001')` → boş

**Doğru ID:** `PM-0001` olması gerekli

**Dosya:** `components/OffersPanel.tsx` line 40

**Şu anda:**
```typescript
console.log('[OffersUI] Loading offers:', {
  partMasterId: selectedPart.partMasterId,  // ← Burası ne?
  institutionId,
  tenantId,
});
```

**Fix:** Eğer `selectedPart.partMasterId` SKU döndürüyorsa, bunun yerine `selectedPart.id` kullan veya `partMasterBuilder`da doğru alan değişmiş olabilir.

---

### Sebep 2️⃣: Offers seed'de sadece ilk 3 parça var ❌

**Belirti:**
- PM-0001, PM-0002, PM-0003: teklifler mevcut
- PM-0004 ve üstü: `offers.length === 0`

**Kontrol:** [src/mocks/offers.seed.ts](src/mocks/offers.seed.ts) line 7-164

**Gördüğün şey:**
```
BRAKE_PAD_FRONT_001 (PM-0001) → 3 teklif (OFF-001, OFF-002, OFF-003) ✅
FILTER_OIL_001 (PM-0002) → 3 teklif (OFF-004, OFF-005, OFF-006) ✅
SPARK_PLUG_001 (PM-0003) → 4 teklif (OFF-007-010) ✅
(Diğer 21 parça) → Hiç teklif ❌
```

**Fix:** Tüm 24 parça için teklifler gerekli ("Fren Balatası Ön" test ettiğinden sorun değil)

---

### Sebep 3️⃣: apiClient.getEffectiveOffers() hala boş dönüyor 🔴

**Belirti:**
- Console: `[EffectiveOffers] Demo mode (...), will compute locally`
- Sonra `[EffectiveOffers] No offers found for part=PM-0001`

**Sebep:** API call fail ediyor veya VITE_USE_REAL_API hata koda takılı

**Dosya:** `services/apiClient.ts` line 257-295

**Check edilen kod:**
```typescript
export async function getEffectiveOffers(
  partMasterId: string,
  institutionId: string
): Promise<OfferRecommendation | null> {
  const config = createApiConfig();
  const endpoint = `/effective-offers?...`;
  
  if (isRealApiEnabled()) {
    try {
      console.log('[EffectiveOffers] Attempting server computation via API...');
      const response = await apiGet(endpoint, config);
      
      if (response?.success === true && response?.data) {
        console.log('[EffectiveOffers] ✓ Server computation received successfully');
        return response.data as OfferRecommendation;  // ← Burada dönemiyorsa...
      }
      
      console.warn('[EffectiveOffers] Invalid response structure...');
      return null;
    }
    catch (error) {
      console.error('[EffectiveOffers] API call failed...', error);  // ← Buraya baş
      return null;
    }
  }
  
  console.log('[EffectiveOffers] Demo mode...');
  return null;
}
```

**Fix:** Console error göremiyorsan ve "Demo mode" mesajı çıkıyorsa: `.env` dosyasında `VITE_USE_REAL_API=true` yok

---

### Sebep 4️⃣: Server endpoint hata dönüyor 🔴

**Belirti:**
- Network: status 500 veya 404
- Response: hatı mesajı

**Dosya:** `src/mocks/server.ts` line 364

**Kod:**
```typescript
const partOffers = MOCK_OFFERS.filter(o => o.part_master_id === partMasterId);
```

**Check:** MOCK_OFFERS import edildi mi?

```typescript
const { MOCK_OFFERS } = await import('../../mocks/offers.seed');
```

**Eğer `'../../mocks/offers.seed'` import şeması sevil yolda yok:**
- ✅ Doğru yol: `../../mocks/` veya `../src/mocks/` (proje yapısına göre)
- ❌ Yanlış yol: `import from 'offers.seed'` (path yok)

---

## 📋 KONTROLİ YAPMAN İÇİN FORM

```
1. Network Request:
   [ ] partMasterId nedir? ________________
   [ ] İstek başarılı mı (200)? ________________

2. Server Response:
   [ ] success: true mi? ________________
   [ ] data.best mevcut mu? ________________
   [ ] data.best null mu? ________________

3. Console Log:
   [ ] "Server computation received" mesajı var mı? ________________
   [ ] "Demo mode" mesajı var mı? ________________
   [ ] Error mesajı var mı? ________________

4. Offers Seed:
   [ ] PM-0001 için kaç teklif var? ________________
   [ ] part_master_id format nedir? ________________

5. Sonuç:
   Müsebep numarası: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5-UNKNOWN ]
```

---

## 🛠️ MINIMAL PATCH'LER

### Patch A: Eğer Sebep 1️⃣ ise (SKU yerine ID gönderiliyor)

**Dosya:** `components/OffersPanel.tsx` line 40

**ŞIMDI (Yanlış):**
```typescript
const rec = await getEffectiveOffersForPart(
  selectedPart.partMasterId,  // ← SKU döndürüyor mu?
  institutionId,
  tenantId
);
```

**SONRA (Doğru - Kontrol et):**
```typescript
// İlk: selectedPart yapısını kontrol et
console.log('[DEBUG] selectedPart:', selectedPart);
// Eğer { partMasterId: "PM-0001", ... } ise DOĞRU
// Eğer { partMasterId: "BRAKE_PAD_FRONT_001", ... } ise yanlış

// Çözüm: OffersPanel'a doğru ID geçir
const rec = await getEffectiveOffersForPart(
  selectedPart.partMasterId,  // ← Bu "PM-0001" olmalı!
  institutionId,
  tenantId
);
```

**VEYA eğer selectedPart.partMasterId yanlışıysa, DataEngine.tsx'da fix et:**

**Dosya:** `views/DataEngine.tsx` line 1035

```typescript
// SEÇILI PARÇA GÖRÜNTÜLENDİğĞİnde
{selectedPart && (
  <OffersPanel
    selectedPart={selectedPart}
    institutionId="INST-001"
    tenantId="LENT-CORP-DEMO"
  />
)}
```

**Check:** `selectedPart` nereden geliyor? `setSelectedPart(part)`'ta `part` nereden?

```typescript
.map((part) => (
  <button
    onClick={() => setSelectedPart(part)}  // ← Bu 'part' catalog'dan mı?
```

Evet, catalog'dan. O zaman `part.partMasterId` doğru olmalı (PM-0001 format).

---

### Patch B: Eğer Sebep 3️⃣ ise (Demo mode çalışıyor ama hiç teklif yok)

**Dosya:** `services/dataService.ts` line 1686-1693

**Korunan Kod (Fallback local computation):**
```typescript
// Step 2.1: Fetch all offers for this part
const offersResponse = await apiGetSupplierOffers(partMasterId, tenantId);
const offers = Array.isArray(offersResponse) ? offersResponse : [];

if (offers.length === 0) {
  console.log(`[EffectiveOffers] No offers found for part=${partMasterId}`);
  return {
    part_master_id: partMasterId,
    best: null,
    alternatives: [],
    timestamp: new Date().toISOString(),
  };
}
```

**DEBUG EKLE:** Şunu basıp offers gör:

```typescript
// Step 2.1: Fetch all offers for this part
const offersResponse = await apiGetSupplierOffers(partMasterId, tenantId);

// ✅ DEBUG: Tamamen neler geliyor?
console.log('[DEBUG] offersResponse:', offersResponse);
console.log('[DEBUG] offersResponse type:', Array.isArray(offersResponse), typeof offersResponse);

const offers = Array.isArray(offersResponse) ? offersResponse : [];
console.log('[DEBUG] offers after filter:', offers.length, offers);

if (offers.length === 0) {
  console.log(`[EffectiveOffers] ❌ No offers found for part=${partMasterId}`);
  // ...
}
```

**Bu konsol outputu önemli** - gönder bana, ondan test edebilirim.

---

### Patch C: Eğer Sebep 4️⃣ ise (Server endpoint hata)

**Dosya:** `src/mocks/server.ts` line 340-390

**DEBUG EKLE:**

```typescript
else if (method === 'GET' && path.includes('/api/effective-offers')) {
    const url = new URL(`http://dummy${path}`);
    const partMasterId = url.searchParams.get('partMasterId');
    const institutionId = url.searchParams.get('institutionId') || 'INST-001';
    
    console.log(`[DEBUG SERVER] /api/effective-offers?partMasterId=${partMasterId}&institutionId=${institutionId}`);
    
    // Load mock data
    const { MOCK_OFFERS } = await import('../../mocks/offers.seed');
    const { MOCK_SUPPLIERS } = await import('../../mocks/suppliers.seed');
    const { MOCK_PRICE_RULES } = await import('../../mocks/priceRules.seed');
    const { computeOfferRecommendation } = await import('../../services/effectiveOfferEngine');
    
    console.log(`[DEBUG SERVER] MOCK_OFFERS count: ${MOCK_OFFERS.length}`);
    console.log(`[DEBUG SERVER] MOCK_OFFERS sample part_master_id values:`, 
      [...new Set(MOCK_OFFERS.map(o => o.part_master_id))].slice(0, 5));
    
    if (!partMasterId) {
        res.writeHead(400);
        res.end(JSON.stringify({
            success: false,
            message: 'Missing partMasterId parameter',
            timestamp: new Date().toISOString(),
        }));
        return;
    }
    
    // Filter offers for this part
    const partOffers = MOCK_OFFERS.filter(o => o.part_master_id === partMasterId);
    const suppliersMap = new Map(MOCK_SUPPLIERS.map(s => [s.supplierId, s]));
    const rules = MOCK_PRICE_RULES.filter(r => r.institution_id === institutionId);
    
    console.log(`[DEBUG SERVER] partOffers count: ${partOffers.length}`);
    console.log(`[DEBUG SERVER] rules count: ${rules.length}`);
    
    // Compute recommendation
    const recommendation = computeOfferRecommendation(
        partOffers,
        rules,
        suppliersMap,
        partMasterId,
        institutionId
    );
    
    console.log(`[DEBUG SERVER] recommendation.best:`, recommendation.best?.offer_id || 'none');
    
    res.writeHead(200);
    res.end(JSON.stringify({
        success: true,
        data: recommendation,
        timestamp: new Date().toISOString(),
    }));
}
```

---

## 📊 SONUÇ

| Sebep | Belirti | Fix | Dosya:Satır |
|-------|---------|-----|-------------|
| 1 | SKU gönderiliyor | partMasterId kontrol et | OffersPanel.tsx:40 |
| 2 | Sadece 3 part var | Tüm 24'ü seed'e ekle | offers.seed.ts:1-164 |
| 3 | Demo mode, boş offers | API debug, import kontrol | apiClient.ts:257-295 |
| 4 | Server 500/404 hatı | Import path fix | server.ts:340-390 |
| 5 | Başka | Paylaş debug output | - |

---

## 🚀 HEMEN SONRA YAPILACAKLAR

1. Uygulamayı başlat: `npm run dev`
2. F12 aç → Console
3. Veri&Analiz > Teklifler git
4. "Fren Balatası Ön" seç
5. Console outputu tam olarak paylaş
6. Network tab'ta `/api/effective-offers` isteğinin:
   - URL (query params)
   - Response body
   Bunları gönder, ben de şu anda bulur, minimal fix yazarım.

