// PHASE 3 ARCHITECTURAL SEPARATION GUIDE
// ════════════════════════════════════════════════════════════════════════════════

/*
WHY PHASE 3 STAYS SEPARATE FROM NORMALIZATION AND IDENTITY CREATION

Common Confusion Point:
  "If we're evaluating identity binding, shouldn't we also normalize the payload
   and create canonical entities?"

Answer: NO. Here's why.

════════════════════════════════════════════════════════════════════════════════

RESPONSIBILITY SEPARATION

Phase 1: Core Object Model
  ├─ Define canonical entity structures
  ├─ Define stable, versioned models
  └─ Purpose: Vocabulary for downstream use

Phase 2: Feed Intake Layer
  ├─ Validate feed structure and field presence
  ├─ Detect missing/malformed data
  ├─ Purpose: "Is this feed structurally valid?"
  └─ OUTPUT: DataEngineIntakeResult (ACCEPTED / ACCEPTED_WITH_WARNINGS / REJECTED)

Phase 3: Identity Resolution Binding ← YOU ARE HERE
  ├─ Evaluate identity context quality
  ├─ Assess issuer/scope/environment compatibility
  ├─ Validate temporal identity validity
  ├─ Apply trust-aware policy
  ├─ Purpose: "Can we trust this identity for downstream binding?"
  └─ OUTPUT: DataEngineIdentityBindingResult (BOUND / BOUND_WITH_LIMITATIONS / REJECTED / QUARANTINED / UNRESOLVED)

Phase 4: Normalization Layer (Next)
  ├─ Transform payload to canonical format
  ├─ Enrich with reference context
  ├─ Generate canonical entity representations
  ├─ Resolve ambiguous fields
  ├─ Purpose: "How should this feed be represented canonically?"
  └─ INPUT: Accepted feed + Bound identity context (from Phase 3)
  └─ OUTPUT: Canonical entity ready for graph attachment

Later Phases: Graph, Indexing, Signals
  ├─ Attach entities to intelligence graph
  ├─ Create indexes for querying
  ├─ Detect patterns and signals
  └─ Power business products and decisions

════════════════════════════════════════════════════════════════════════════════

EXAMPLE: SERVICE CENTER MAINTENANCE FEED

PHASE 2 INTAKE EVALUATION:
  Input:  DataEngineFeedCandidate
  Check:  "Is the structure valid?"
  Result: "ACCEPTED - has all required fields, timestamps valid, payload complete"

PHASE 3 BINDING EVALUATION:
  Input:  DataEngineIntakeResult + Identity Context
  Check:  "Is the identity context trustworthy for binding?"
  Result: "BOUND - issuer matches, environment compatible, not expired, trust adequate"

PHASE 4 NORMALIZATION:
  Input:  Bound result + accepted feed payload
  Check:  "How should this be canonicalized?"
  Example normalizations:
    • Map workOrderStatus: 'COMPLETED' → CanonicalWorkStatus.COMPLETE
    • Parse repairCodes: [...] → CanonicalRepairCode[]
    • Normalize timestamps to unified timezone
    • Create CanonicalServiceEvent entity
    • Link to identity context from Phase 3
  Result: CanonicalServiceEvent ready for graph nodes

════════════════════════════════════════════════════════════════════════════════

WHY NOT COLLAPSE PHASES?

If we merged Phase 3 + Phase 4:
  ❌ Binding logic (identity quality) mixed with normalization logic
  ❌ Phase 2 → Direct to normalization (no binding evaluation)
  ❌ Can't reuse binding evaluation separate from normalization
  ❌ Hard to test binding decisions independently
  ❌ Impossible to use pure identity binding in other contexts
  ❌ Violations of Single Responsibility Principle
  ❌ Difficult to maintain and debug

By keeping phases separate:
  ✅ Each phase has clear, testable responsibility
  ✅ Identity binding logic is reusable
  ✅ Easy to test binding decisions independently
  ✅ Normalization only happens on bound feeds
  ✅ Clear contract between phases (DataEngineIdentityBindingResult)
  ✅ Each phase can evolve independently
  ✅ Easy to bypass normalization and use binding result directly for other purposes

════════════════════════════════════════════════════════════════════════════════

CONCRETE EXAMPLE: TELEMATICS DIAGNOSTIC FEED

Goal: Ingest vehicle diagnostic telemetry from ConnectedCar provider

PHASE 2 (INTAKE):
  ✓ Receives: raw diagnostic JSON from vehicle telematics system
  ✓ Validates: structure, timestamp format, required fields present
  ✓ Outcome: ACCEPTED_WITH_WARNINGS (minor schema version warning)
  ✓ Question answered: "Is the structure of this telemetry valid?"

PHASE 3 (BINDING):
  ✓ Receives: accepted intake result + identity context
  ✓ Evaluates: identity issued by ConnectedCar, environment matches, not expired
  ✓ Assessment: LOW_TRUST_BINDING (newer provider) but MEDIUM trust level acceptable
  ✓ Outcome: BOUND_WITH_LIMITATIONS
  ✓ Question answered: "Can we trust the identity binding for this diagnostic?"

PHASE 4 (NORMALIZATION):
  ✓ Receives: binding result + original payload
  ✓ Transforms:
      • P0171 fault code → CanonicalFaultCode (FUEL_SYSTEM_TOO_LEAN)
      • Engine temp 183°F → 83.8°C (unified metric)
      • Timestamp 2026-03-11T14:25:00Z → already ISO 8601, clean
      • Create CanonicalDiagnosticEvent with vehicle identity reference
  ✓ Outcome: CanonicalDiagnosticEvent entity + reference to bound identity
  ✓ Question answered: "How should this diagnostic be represented consistently?"

PHASE 5+ (GRAPH ATTACHMENT):
  ✓ Receives: canonical entity + binding context
  ✓ Actions:
      • Create GraphNode(type: "DIAGNOSTIC_EVENT")
      • Link to VehicleNode via bound identityId
      • Attach metadata: source=TELEMATICS, trustLevel=MEDIUM, boundAt=2026-03-11
      • Enable indexing and querying
  ✓ Later processing: Detect patterns, calculate reliability scores, etc.

════════════════════════════════════════════════════════════════════════════════

KEY INSIGHT: PHASE 3 OUTPUT IS PHASE 4 INPUT

Phase 3 does NOT:
  ❌ Know how to normalize payloads
  ❌ Know canonical entity schemas
  ❌ Make field mapping decisions
  ❌ Create entities
  ❌ Enrich with derived context

Phase 3 DOES:
  ✅ Evaluate identity quality
  ✅ Produce binding status and reasoning
  ✅ Identify limitations and concerns
  ✅ Create audit trail for binding decision

Phase 4 then USES the binding result from Phase 3:
  • Knows it can safely normalize this feed
  • Understands any identity limitations
  • Can decide what metadata to carry forward
  • Creates entities with confidence based on binding outcome

Example Phase 4 logic:
  ```
  if (bindingResult.status === 'BOUND') {
    // Full normalization, full confidence
    return normalizeWithFullContext(feed, bindingResult);
  } else if (bindingResult.status === 'BOUND_WITH_LIMITATIONS') {
    // Normalize but flag limitations
    const canonical = normalizeWithContext(feed, bindingResult);
    canonical.metadata.bindingLimitations = bindingResult.limitationDescription;
    return canonical;
  } else if (bindingResult.status === 'QUARANTINED') {
    // Hold for manual review before normalizing
    return null; // Signal not ready for downstream
  }
  ```

════════════════════════════════════════════════════════════════════════════════

WHY IDENTITY BINDING MUST NOT CREATE IDENTITIES

Phase 3 evaluates identity binding quality.
Phase 3 does NOT create identities.

Why?

1. SEPARATION OF CONCERNS
   • Identity creation is a separate system responsibility
   • Binding evaluation is evaluation, not creation
   • Confusing the two creates architectural debt

2. MULTIPLE IDENTITY SOURCES
   • Anonymous Vehicle Identity Layer creates identities
   • Feeds provide pre-existing identities
   • Binding evaluates provided identities
   • Phase 3 cannot create new identities; that would duplicate effort
   • Phase 3 cannot change/remap identities; that's out of scope

3. AUDIT TRAIL
   • Where did the identityId come from?
   • Created by intake layer (no, intake just validates presence)
   • Created by binding layer? (NO - binding only evaluates)
   • Provided by feed source (YES - binding receives it)
   → Identity chain must be traceable to source

4. BUSINESS LOGIC SEPARATION
   • "Should we create a new identity for this?" = Business question
   • "Is the provided identity trustworthy?" = Binding question
   • Different concerns, different ownership

Phase 3's contract with feeds is:
  "You provide identityId. I evaluate whether it's trustworthy for binding.
   I do NOT create, generate, or remap identities."

════════════════════════════════════════════════════════════════════════════════

VIN RESOLUTION IS ALSO NOT PHASE 3 RESPONSIBILITY

Phase 3 does NOT:
  ❌ Resolve VIN to identityId
  ❌ Look up vehicle from VIN
  ❌ Create identity from VIN
  ❌ Validate VIN authenticity

Why?

1. VIN RESOLUTION IS BUSINESS LOGIC
   • How to resolve VIN depends on business requirements
   • What to do if VIN can't be resolved = product decision
   • Phase 3 is technical identity binding evaluation

2. PHASE 3 OPERATES ON PROVIDED IDENTITY
   • Feed provides identityId
   • Phase 3 evaluates it
   • VIN might exist in payload but is payload data, not identity context
   • VIN resolution would be Phase 4+ responsibility (normalization)
   • Or could be handled by upstream if feed doesn't have identityId

3. PRECEDENT AND CLARITY
   • Anonymous Identity Layer created the identities
   • Feeds reference them
   • Binding evaluates them
   • Later phases canonicalize them
   • This is clean and clear

Incorrect flow:
  Feed → Phase 2 intake → Phase 3 binding (with VIN lookup) → Phase 4 normalization

Correct flow:
  Feed → Phase 2 intake → Phase 3 binding (no VIN lookup) → Phase 4 normalization

════════════════════════════════════════════════════════════════════════════════

SUMMARY: WHAT PHASE 3 IS AND ISN'T

IS:
  ✓ Identity quality evaluation
  ✓ Trust assessment
  ✓ Issuer/scope/environment compatibility checking
  ✓ Temporal validity verification
  ✓ Binding decision logic
  ✓ Deterministic and auditable
  ✓ Policy-configurable
  ✓ Source-aware

IS NOT:
  ✗ Identity creation
  ✗ Identity resolution
  ✗ VIN lookup
  ✗ Payload normalization
  ✗ Canonical entity generation
  ✗ Data enrichment
  ✗ Graph building
  ✗ Index preparation
  ✗ Signal detection
  ✗ Business decision logic

════════════════════════════════════════════════════════════════════════════════

GOVERNANCE PRINCIPLE

If a team asks: "Can we use Phase 3 to [do X]?"

Decision tree:
  1. Is [X] about evaluating identity quality?
     → YES: Belongs in Phase 3
     → NO: Continue

  2. Does [X] require decision logic about what to do with the feed?
     → YES: Phase 3 decision policy can handle it
     → NO: Continue

  3. Does [X] involve creating, generating, or enriching data?
     → YES: Does NOT belong in Phase 3
     → NO: Continue

  4. Does [X] require knowledge of other systems, external services, or business context?
     → YES: Does NOT belong in Phase 3 (but policy can be configured for it)
     → NO: Phase 3 can answer it

Example applications:
  ✓ "Can we evaluate identity binding for this feed?" → Phase 3
  ✓ "Should we quarantine this stale identity?" → Phase 3 policy decision
  ✓ "What limitations does this binding have?" → Phase 3 output
  ✗ "Should we create a new identity?" → NOT Phase 3
  ✗ "What is this VIN?" → NOT Phase 3
  ✗ "How should we normalize this payload?" → NOT Phase 3 (it's Phase 4)
  ✗ "Should we attach this to the graph?" → NOT Phase 3 (it's Phase 5)

════════════════════════════════════════════════════════════════════════════════

TECHNICAL RESULT: CLEAN ARCHITECTURE

Phase 1 (Models) ← stable vocabulary
   ↓
Phase 2 (Intake) ← structural validation
   ↓
Phase 3 (Binding) ← this phase, identity quality evaluation
   ↓   (offers: DataEngineIdentityBindingResult)
   ↓
Phase 4 (Normalization) ← entity canonicalization
   ↓   (inputs: binding result)
   ↓
Phase 5+ (Intelligence) ← graph, indexing, signals

Each phase:
  • Has clear scope
  • Knows its inputs
  • Produces clear outputs
  • Doesn't reach into other phases' concerns
  • Can evolve independently
  • Easy to test in isolation

════════════════════════════════════════════════════════════════════════════════
*/
