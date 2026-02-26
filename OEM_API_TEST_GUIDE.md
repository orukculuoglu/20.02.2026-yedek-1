# OEM Canonicalization Engine - API Test Guide

## Quick Start

The OEM engine is now live on mock server port 3001. Below are executable API calls to test the full workflow.

---

## 1️⃣ GET OEM CATALOG

### Search all BMW parts

```bash
curl -X GET "http://localhost:3001/api/oem/catalog?brand=BMW" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": "CAT-BMW-001",
      "oem_brand": "BMW",
      "oem_part_number": "34 11 6 789 123",
      "part_name": "Brake Pad Front Left",
      "category": "BRAKE_SYSTEM",
      "vehicle_fitment": [
        {
          "make": "BMW",
          "model": "320i",
          "year_from": 2015,
          "year_to": 2021,
          "engine": "2.0L N20",
          "transmission": "Automatic"
        }
      ],
      "attributes": {
        "material": "Sintered Metal",
        "thickness_mm": "14.5",
        "width_mm": "123"
      },
      "last_updated": "2025-02-01T00:00:00.000Z",
      "source": "API"
    },
    ...more BMW parts
  ],
  "count": 4,
  "timestamp": "2025-02-27T..."
}
```

### Search for brake parts

```bash
curl -X GET "http://localhost:3001/api/oem/catalog?query=brake" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "items": [
    // All parts with "brake" in name or PN
  ],
  "count": 8
}
```

### Combined search: BMW + filter

```bash
curl -X GET "http://localhost:3001/api/oem/catalog?brand=BMW&query=brake" \
  -H "Content-Type: application/json"
```

**Response:** BMW brake parts only (2 results)

---

## 2️⃣ POST OEM INGEST (Create Canonical Parts)

### Ingest single BMW brake pad

```bash
curl -X POST "http://localhost:3001/api/oem/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "CAT-BMW-001",
        "oem_brand": "BMW",
        "oem_part_number": "34 11 6 789 123",
        "part_name": "Brake Pad Front Left",
        "category": "BRAKE_SYSTEM",
        "vehicle_fitment": [
          {
            "make": "BMW",
            "model": "320i",
            "year_from": 2015,
            "year_to": 2021,
            "engine": "2.0L N20",
            "transmission": "Automatic"
          }
        ],
        "attributes": {
          "material": "Sintered Metal",
          "thickness_mm": "14.5"
        },
        "last_updated": "2025-02-01T00:00:00.000Z",
        "source": "API"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "created_parts": 1,
  "created_mappings": 1,
  "stats": {
    "created": 1,
    "mapped": 1,
    "errors": 0
  },
  "timestamp": "2025-02-27T14:30:45.123Z"
}
```

#### What Was Generated Internally:

1. **PartMasterPart** (PM-01000):
   - SKU: "BRAKE_PAD_FRONT_001"
   - quality_default: "OEM"
   - canonical_hash: sha256("BMW|34116789123")
   - mapping_status: "AUTO" (or "REVIEW")
   - oem_source: { brand: "BMW", part_number: "34 11 6 789 123", catalog_date: "..." }

2. **OemAftermarketMap**:
   - Linked to PM-01000
   - Found 4 aftermarket candidates from MOCK_CROSSREF:
     - Bosch BP-BMW-320-FRONT (OES, 95% confidence) ✅ HIGH
     - Brembo BRM-SERIES-BM (OEM, 95% confidence) ✅ HIGH
     - Textar TX-2354201 (OES, 95% confidence) ✅ HIGH
     - ATE AT-13646201321 (OES, 95% confidence) ✅ HIGH
   - status: "AUTO" (all confidence >= 90)

### Ingest multiple parts (batch)

```bash
curl -X POST "http://localhost:3001/api/oem/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { BMW brake pad... },
      { VW oil filter... },
      { Ford spark plug... },
      { Mercedes shock... },
      ...10 total items
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "created_parts": 10,
  "created_mappings": 10,
  "stats": {
    "created": 10,
    "mapped": 10,
    "errors": 0
  }
}
```

---

## 3️⃣ GET PART MASTER CATALOG

### Retrieve canonical parts (single source of truth)

```bash
curl -X GET "http://localhost:3001/api/part-master/catalog" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "parts": [],
  "message": "Part Master Catalog (canonical). Use POST /api/oem/ingest to populate.",
  "timestamp": "2025-02-27T..."
}
```

**Note:** In production, this would return all canonical PartMasterPart objects. In mock mode, ingest populates in-memory storage.

---

## 4️⃣ GET OEM MAPPING

### Retrieve aftermarket alternatives for OEM part

```bash
curl -X GET "http://localhost:3001/api/oem-mapping?oemPartNumber=34116789123" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "OEM mappings created during ingest. Use POST /api/oem/ingest to generate.",
  "timestamp": "2025-02-27T..."
}
```

**Note:** In production, would return:
```json
{
  "success": true,
  "mapping": {
    "map_id": "MAP-abc123def456",
    "oem_part_number": "34116789123",
    "oem_brand": "BMW",
    "canonical_part_master_id": "PM-01000",
    "matches": [
      {
        "candidate_id": "CAND-12345678",
        "brand": "Bosch",
        "aftermarket_part_number": "BP-BMW-320-FRONT",
        "quality_grade": "OES",
        "confidence": 95,
        "evidence": ["crossref_database_match"]
      },
      ...more aftermarket options
    ],
    "status": "AUTO",
    "created_at": "2025-02-27T...",
    "updated_at": "2025-02-27T..."
  }
}
```

---

## 📊 REAL WORKFLOW EXAMPLE

### Step 1: Search for BMW parts
```bash
GET /api/oem/catalog?brand=BMW
→ Found 4 parts (brake pads, brake disc, filters, etc.)
```

### Step 2: Select one to ingest
```json
{
  "oem_brand": "BMW",
  "oem_part_number": "34 11 6 789 123",
  "part_name": "Brake Pad Front Left",
  "category": "BRAKE_SYSTEM"
}
```

### Step 3: Ingest it
```bash
POST /api/oem/ingest
→ Creates PM-01000 (PartMasterPart)
→ Creates OemAftermarketMap with 4 candidates
→ status: AUTO (confidence 95 > 90)
```

### Step 4: Engine output
```typescript
// Generated PartMasterPart
{
  partMasterId: "PM-01000",
  partGroup: "Brake System",
  sku: "BRAKE_PAD_FRONT_001",
  oem_source: {
    brand: "BMW",
    part_number: "34 11 6 789 123"
  },
  quality_default: "OEM",
  mapping_status: "AUTO",
  aftermarketRefs: [
    { brand: "Bosch", sku: "BP-BMW-320-FRONT", qualityTier: "OES" },
    { brand: "Brembo", sku: "BRM-SERIES-BM", qualityTier: "OEM" },
    { brand: "Textar", sku: "TX-2354201", qualityTier: "OES" },
    { brand: "ATE", sku: "AT-13646201321", qualityTier: "OES" }
  ]
}
```

### Step 5: Available in all modules
- **Bakım Merkezi**: Can see all brake pad alternatives (OEM + aftermarket)
- **Aftermarket Yönetimi**: Can find which OEM part this aftermarket matches
- **Data Engine**: Can aggregate pricing/availability across quality tiers
- **Supplier Offers**: Can use PM-01000 as canonical part ID

---

## 🔍 DETAILED MAPPING EXAMPLE

### Input: OEM Part BMW Brake Pad
```json
{
  "oem_brand": "BMW",
  "oem_part_number": "34 11 6 789 123"
}
```

### Process:
1. Normalize PN: "34 11 6 789 123" → "34116789123"
2. Generate hash: sha256("BMW|34116789123")
3. Check crossRef DB for matches
4. Found in MOCK_CROSSREF:
   - Bosch BP-BMW-320-FRONT
   - Brembo BRM-SERIES-BM  
   - Textar TX-2354201
   - ATE AT-13646201321
5. Calculate confidence: 95 (crossref is highly reliable)
6. Determine workflow: confidence 95 >= 90 → AUTO approval

### Output: OemAftermarketMap
```json
{
  "map_id": "MAP-abc123def456",
  "oem_part_number": "34116789123",
  "canonical_part_master_id": "PM-01000",
  "matches": [
    { "brand": "Bosch", "quality_grade": "OES", "confidence": 95 },
    { "brand": "Brembo", "quality_grade": "OEM", "confidence": 95 },
    { "brand": "Textar", "quality_grade": "OES", "confidence": 95 },
    { "brand": "ATE", "quality_grade": "OES", "confidence": 95 }
  ],
  "status": "AUTO",
  "confidence_threshold": 70
}
```

---

## ✅ VALIDATION CHECKLIST

Use this checklist to validate the OEM implementation:

### Data Models
- [ ] OemCatalogItem defined (oem_brand, oem_part_number, fitment array)
- [ ] AftermarketCandidate defined (confidence, evidence, quality_grade)
- [ ] OemAftermarketMap defined (matches, status workflow)
- [ ] PartMasterPart extensions added (oem_source, canonical_hash, mapping_status)

### Engine Functions
- [ ] normalizeOemPartNumber("34 11 6 789 123") returns "34116789123"
- [ ] generateCanonicalSku() produces deterministic SKU
- [ ] createCanonicalHash() produces same hash for same input
- [ ] buildPartMasterFromOem() creates valid PartMasterPart
- [ ] detectAftermarketCandidates() finds crossRef matches
- [ ] buildOemAftermarketMap() correctly sets status (AUTO vs REVIEW)
- [ ] batchIngestOemCatalog() processes multiple items

### Mock Data
- [ ] oemCatalog.seed.ts has 30+ OEM parts
- [ ] crossRef.seed.ts has 100+ mappings
- [ ] All parts have fitment data
- [ ] Various quality grades represented

### APIs
- [ ] GET /api/oem/catalog works (returns OemCatalogItem array)
- [ ] POST /api/oem/ingest works (creates PartMaster + Map)
- [ ] GET /api/part-master/catalog works (returns canonical parts)
- [ ] GET /api/oem-mapping works (retrieves mapping)

### TypeScript
- [ ] 0 compilation errors
- [ ] All imports resolve
- [ ] Types properly exported

---

## 🎯 SUCCESS CRITERIA

✅ **OEM Catalog Search**: Can find parts by brand/name  
✅ **OEM Ingest**: Creates canonical PartMasterId (PM-XXXXX)  
✅ **Deterministic SKU**: Same input = same SKU always  
✅ **Deduplication**: canonical_hash prevents duplicates  
✅ **Confidence Scoring**: Confidence >= 90 = AUTO, < 90 = REVIEW  
✅ **Cross-Reference**: Finds 2-4 aftermarket options per OEM part  
✅ **Workflow Status**: AUTO/REVIEW/APPROVED/REJECTED workflow ready  
✅ **Quality Grades**: OEM, OES, AFTERMARKET_A, AFTERMARKET_B  
✅ **TypeScript**: 0 errors  
✅ **API Live**: All 4 endpoints responsive  

---

## 🐛 TROUBLESHOOTING

### Issue: API returns 404
→ Start mock server: `npm run dev:mock-server`

### Issue: "No mappings found"
→ Post OEM items to ingest first: `POST /api/oem/ingest`

### Issue: Confidence < 70
→ Check crossRef.seed.ts for OEM→Aftermarket mappings
→ Add more mappings for your OEM part numbers

### Issue: TypeScript errors
→ Run `tsc --noEmit` to see full error trace
→ Check fitments have partId and vehiclePlatform

---

## 📌 NOTES

- **Mock Mode**: All data in-memory (lost on server restart)
- **Production**: Replace seed with real DB + connector APIs
- **Scaling**: Batch ingest optimized for 100+ parts/request
- **Determinism**: All operations are deterministic (reproducible)
- **Audit Trail**: created_at, updated_at tracked on all entities
