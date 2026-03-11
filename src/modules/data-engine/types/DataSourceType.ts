/**
 * Data Source Type Definition
 *
 * Explicit classification for intelligence feed origin.
 * Supports multi-institutional, multi-channel data ingestion.
 */

/**
 * Data source classification for feed origin tracking.
 *
 * Supports multi-institutional, multi-channel intelligence ingestion.
 * Each source type has distinct data characteristics and reliability profiles.
 *
 * Extensible for future source categories (not hardcoded enums).
 */
export type DataSourceType =
  | 'SERVICE'           // Authorized service centers, repair shops
  | 'INSURANCE'         // Insurance companies, claims systems
  | 'FLEET'             // Fleet management operators
  | 'EXPERT_SYSTEM'     // Internal expert/recommendation engines
  | 'PARTS_NETWORK'     // Parts suppliers, inventory systems
  | 'TELEMATICS'        // Vehicle telematics, OBD systems
  | 'MANUFACTURER'      // OEM service records, bulletins
  | 'DEALER'            // Authorized dealer networks
  | 'THIRD_PARTY_SERVICE' // External vendors, API partners
  | 'OTHER';            // Catch-all for non-standard sources
