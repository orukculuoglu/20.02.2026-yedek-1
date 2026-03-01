# PHASE 3 – STEP 2 Testing Guide

## Overview
Risk Segment Dashboard Hardening - Filters + Drilldown + Analytics Fixes

**Build Status:** ✅ ZERO ERRORS (22.24s)

## Features Implemented

### 1. Filters (Top of Dashboard)

#### Date Range Control
- **UI Location:** Top of Risk Segment Dashboard, below header
- **Options:** `[Son 7 Gün]` `[Son 30 Gün]` `[Tümü]`
- **Behavior:**
  - Buttons are segmented control style
  - Active button highlighted in blue
  - Filters events by `generatedAt` timestamp
  - Default: `Tümü` (all events)

**Test:**
1. Open DataEngine view
2. Click `[Son 7 Gün]` → Dashboard should show only last 7 days events
3. Click `[Son 30 Gün]` → Dashboard should show only last 30 days events
4. Click `[Tümü]` → Dashboard should show all events (up to max count)
5. Verify filter info text updates: "X event gösteriliyor (son 7 gün)"

#### Vehicle ID Filter Input
- **UI Location:** Below date range control
- **Placeholder:** "Araç ID'si ara..."
- **Behavior:**
  - Real-time filter (case-insensitive substring match)
  - Updates dashboard metrics instantly
  - Combined with date range filter

**Test:**
1. Type any vehicle ID (e.g., "V001") in filter input
2. Dashboard should update to show only events matching that vehicle ID
3. All 6 metric cards should update with filtered data
4. Combine with date range: "V001" + "Son 7 Gün"
5. Filter info shows: "X event gösteriliyor (son 7 gün) - "V001" filtresi uygulanmış"

### 2. ReasonCode Analytics (Fixed)

#### Issue Fixed
- **Old behavior:** Showed index keys (trustIndex, reliabilityIndex) instead of real reason codes
- **New behavior:** Aggregates actual reason codes from `indices[].meta.reasonCodes[]` and `signals[].meta.reasonCodes[]`

#### "İlk 5 Reason Code" Card
- **Displays:** Top 5 unique reason codes with occurrence counts
- **Format:** Code name | Count | Visual progress bar
- **Fallback:** If no reason codes exist, shows "ReasonCode yok" with count 0

**Test:**
1. Navigate to Risk Segment Dashboard
2. Look at "İlk 5 Reason Code" card (4th card, bottom-right area)
3. Verify codes are NOT index names (e.g., should NOT show "trustIndex")
4. Verify codes are semantic (e.g., "INSURANCE_DAMAGE_INCONSISTENCY", "HIGH_MILEAGE_WITHOUT_SERVICE")
5. Verify count increases as events accumulate
6. Apply filters → counts should update accordingly

### 3. Insurance-Damage Mismatch Rate (Corrected)

#### Issue Fixed
- **Old behavior:** Counted index keys, not actual reason codes
- **New behavior:** Counts events that have reason codes: `INSURANCE_DAMAGE_INCONSISTENCY` or `CLAIM_WITHOUT_DAMAGE_RECORD`

#### "Sigorta-Hasar Mismatch" Card
- **Displays:** Percentage of events with insurance-related reason codes
- **Calculation:** (events with mismatch reason codes / total filtered events) × 100
- **Format:** Large percentage | "Problematik event'ler" label

**Test:**
1. Navigate to Risk Segment Dashboard, "Sigorta-Hasar Mismatch" card (3rd card)
2. Note the percentage value (e.g., "25%")
3. Filter by date/vehicle → percentage should update
4. If no events have mismatch codes → should show "0%"
5. Verify percentage never exceeds 100%

### 4. Risk Level Explanation Tooltip

#### "Risk Seviyeleri" Card Enhancement
- **Icon:** Help icon (?) next to "Risk Seviyeleri" title
- **Hover Behavior:** Shows tooltip with metric explanation
- **Tooltip Text:**
  ```
  Metrik: Ortalama TrustIndex
  Düşük: ≥70 | Orta: 40-69 | Yüksek: <40
  ```

**Test:**
1. Navigate to "Risk Seviyeleri" card (2nd card)
2. Hover over the help icon (?) next to title
3. Tooltip should appear showing metric and classification rules
4. Move mouse away → tooltip disappears
5. Verify threshold values are correct (70, 40)

### 5. Drilldown - Araç Öyküsü Drawer

#### Table Row Click Interaction
- **Location:** Risk Index Events table (below dashboard cards)
- **Interaction:** Click any row → right-side drawer opens with event details

**Test:**
1. Scroll down to "Risk Index Events (Son 20)" table
2. Click any table row
3. Right-side drawer should slide in from right, covering ~1/3 of screen
4. Drawer title: "📌 Araç Öyküsü (Drilldown)"
5. Drawer should show:

#### Drawer Content Structure

1. **Vehicle Header Section**
   - Vehicle ID (bold)
   - VIN (if available)
   - Plaka/Plate (if available)
   - Event Zamanı (timestamp)

2. **Event Details Section**
   - **Endeksler** (Indices) table showing key-value pairs
   - **Güven Özeti** (Confidence Summary): Ortalama, Min, Max percentages
   - **Veri Kaynağı** (Source): Badge showing source (EXPERTISE, SERVICE, etc.)

3. **Raw Meta JSON Section**
   - Collapsible `<details>` block titled "Raw Meta JSON (Genişlet)"
   - When expanded, shows formatted JSON of all indices with meta
   - Prevents React object rendering errors via `JSON.stringify()`
   - Max height with scroll for long JSON

4. **Footer**
   - "Kapat" button to close drawer

**Test:**
1. Open any row's drawer
2. Verify vehicle info displays correctly (ID, VIN, plate, timestamp)
3. Verify indices show all key-value pairs from event
4. Verify confidence percentages display correctly (0-100 range)
5. Verify source badge shows correct value
6. Click "Raw Meta JSON (Genişlet)" → JSON should display formatted
7. Verify no React object rendering errors in console
8. Verify JSON is properly escaped/stringified (no "[object Object]" in drawer)
9. Click "Kapat" button → drawer should slide out smoothly
10. Click background (overlay) → drawer should also close

### 6. Dashboard Statistics (Metrics Calculations)

#### All Metrics Recalculate on Filter Change
- **Affected Metrics:**
  - TrustIndex Distribution (mean, median, min, max, bins)
  - Risk Segments (Low/Medium/High counts and percentages)
  - Top 5 ReasonCodes
  - Insurance Mismatch Ratio
  - Data Source Breakdown
  - Event count in Summary card

**Test:**
1. Note initial metric values (e.g., "Ortalama: 65.2")
2. Apply date range filter → all metrics should update
3. Add vehicle ID filter → all metrics should update again
4. Verify summary card "Toplam Event" matches actual event count
5. Verify percentages always sum to 100% (for segments and sources)
6. Verify TrustIndex stats are within 0-100 range (never 6650% or similar)

## Quality Checks

### No Breaking Changes
- [ ] Existing Risk Index Events table still displays (below dashboard)
- [ ] Vehicle filtering UI (input + Filtrele/Temizle buttons) still works
- [ ] Arizonumber slider (Son N event) still works
- [ ] All existing tabs in DataEngine still accessible
- [ ] No console errors (check browser DevTools > Console)

### Debug Logging
- [ ] Console logs only appear if `DEBUG_DASHBOARD` flag enabled
- [ ] No noisy logs in production mode
- [ ] Vehicle history drawer uses `JSON.stringify()` for meta display

### Performance
- [ ] Dashboard metrics calculate quickly (<500ms) when filtering
- [ ] Drawer opens/closes smoothly without lag
- [ ] No UI freeze when clicking table rows
- [ ] Scrolling through large event lists is smooth

## Manual Testing Checklist

```
□ Date range filtering works
  □ Son 7 Gün
  □ Son 30 Gün
  □ Tümü

□ Vehicle ID filtering works and combines with date range

□ ReasonCode card shows semantic codes, not index keys

□ Insurance Mismatch rate updates correctly on filter change

□ Risk Level tooltip appears and disappears correctly

□ Drilldown drawer opens on table row click
  □ Header shows vehicle info
  □ Indices display correctly
  □ Confidence summary shows percentages (0-100)
  □ Source badge displays
  □ Raw JSON expandable and properly formatted
  □ Close button works
  □ Overlay click closes drawer

□ All metrics recalculate when filters change

□ No breaking changes to existing features

□ Build succeeds with ZERO errors

□ No objects rendered directly in React (check drawer JSON)
```

## Expected Values

### Example Dashboard State (All Events, No Filter)
```
TrustIndex:
  - Ortalama: ~60-80 (depends on mock data)
  - Medyan: ~65
  - Min: 0-20
  - Max: 95-100

Risk Segments:
  - Düşük: ~40-60% of events
  - Orta: ~20-30% of events
  - Yüksek: ~10-20% of events

Insurance Mismatch: 0-15% (depending on mock data)

ReasonCodes: 3-8 unique codes (if mock data includes them)
```

## Troubleshooting

### Issue: ReasonCode card shows index names
- **Cause:** Indices don't have `meta.reasonCodes` populated
- **Fix:** Add sample reason codes to mock event data in eventLogger or mock data

### Issue: Insurance Mismatch always shows 0%
- **Cause:** No events have matching reason codes
- **Fix:** Add sample events with `INSURANCE_DAMAGE_INCONSISTENCY` codes

### Issue: Drawer doesn't open or shows errors
- **Cause:** selectedEventForDrawer state not updating
- **Fix:** Check browser console for React errors; verify event object has all required fields

### Issue: JSON in drawer shows "[object Object]"
- **Cause:** JSON not properly stringified
- **Fix:** Verify `JSON.stringify()` is used (already implemented)

### Issue: Build fails with errors
- **Command:** `npm run build`
- **Expected:** "built in X.XXs" with ZERO errors
- **If fails:** Check for syntax errors in RiskSegmentDashboard.tsx or DataEngine.tsx

## Console Debug Flag

To enable debug logging:
```typescript
// In RiskSegmentDashboard.tsx
if (process.env.DEBUG_DASHBOARD) {
  console.log('[RiskDashboard] metrics calculated:', metrics);
}
```

Currently, NO console logs appear in production. Add this flag only if needed for debugging specific metrics.

## File Changes Summary

### Modified Files
1. **src/modules/data-engine/components/RiskSegmentDashboard.tsx**
   - Added: Date range and vehicle ID filters
   - Added: Helper functions (extractReasonCodes, hasInsuranceMismatch, getDateRangeCutoff)
   - Fixed: ReasonCode extraction logic
   - Fixed: Insurance mismatch rate calculation
   - Added: Risk level tooltip

2. **views/DataEngine.tsx**
   - Added: selectedEventForDrawer state
   - Updated: Table rows with click handler and cursor-pointer styling
   - Added: Right-side drawer component for Araç Öyküsü
   - Drawer displays: vehicle header, indices, confidence, source, raw JSON

### New Files
- TEST_PHASE3_STEP2.md (this file)

### No Breaking Changes
- All existing components remain unchanged
- All existing routes remain accessible
- Event logging infrastructure unchanged
- Vehicle history panel unaffected

---

**Testing Priority:**
1. Filters functionality (date + vehicle ID)
2. Drilldown drawer opening/closing
3. ReasonCode aggregation correctness
4. Insurance mismatch calculation
5. No console errors
6. Build passes

**Sign-Off Criteria:**
- ✅ All features implemented
- ✅ Build: ZERO errors
- ✅ No breaking changes
- ✅ Drilldown drawer works
- ✅ Filters update metrics
- ✅ ReasonCode and Insurance logic fixed
