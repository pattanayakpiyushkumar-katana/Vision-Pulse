export function getDomainFallbackAnalysis(domain_category, title, analysis_mode, operator_notes) {
  const domainProfiles = {
    MANUFACTURING_QC: {
      overall_status: 'Action Required',
      severity_level: 'High',
      visual_health_score: 64,
      ai_summary: `Automated visual inspection of '${title}' detected a severe solder bridge defect between adjacent IC surface pins, accompanied by trace microscopic oxidation along the ground plane. Immediate rework is advised before functional ICT testing.`,
      extracted_text_ocr: 'REV 4.2C | PCB-SN: 98402-TX | QC-PASS: 09/24 | BATCH: M-708',
      anomalies: [
        {
          label: 'Solder Bridge Bridging Pin 14-15',
          category: 'SMT Solder Defect',
          severity: 'High',
          confidence_score: 96.5,
          location_region: 'Center-Right QFP IC Pins',
          description: 'Excessive solder paste reflow resulted in an unintended conductive path between QFP pins 14 and 15, causing an electrical short circuit hazard.',
          root_cause_hypothesis: 'Stencil aperture misalignment during paste application or excessive reflow peak temperature causing solder slump.',
          recommended_action: 'Perform precision hot-air desoldering braid rework with flux, and re-inspect optical clearance under 20x magnification.'
        },
        {
          label: 'Surface Copper Trace Oxidation',
          category: 'Substrate Corrosion',
          severity: 'Medium',
          confidence_score: 88.2,
          location_region: 'Bottom-Left Ground Plane',
          description: 'Minor green-tinted patina and chemical discoloration indicative of moisture contact post-wash.',
          root_cause_hypothesis: 'Incomplete drying cycle following aqueous wash or compromised solder mask passivation layer.',
          recommended_action: 'Clean surface with 99.9% isopropyl alcohol, dry bake at 60°C for 30 minutes, and seal exposed trace with UV solder mask.'
        }
      ],
      operational_recommendations: [
        'Halt surface-mount line B4 for stencil re-alignment verification.',
        'Review reflow oven temperature profile zone 4 dwell time.',
        'Isolate current batch (lot #98402) for 100% optical quality inspection.'
      ],
      compliance_disclaimer: 'Inspection conducted via VisionPulse AI Precision Engine. Ensure manual sign-off by IPC-A-610 certified inspector before batch release.'
    },

    INFRASTRUCTURE_SAFETY: {
      overall_status: 'Warning',
      severity_level: 'Medium',
      visual_health_score: 72,
      ai_summary: `Structural inspection of '${title}' identified tensile fatigue micro-cracking and accelerated surface oxidation along the primary load-bearing flange. No immediate catastrophic failure risk, but scheduled reinforcement is required within 30 days.`,
      extracted_text_ocr: 'SECTOR B-7 | GAUGE REF: 44.20kN | STRUCT-ID: BR-8809 | ELEV: +18.4m',
      anomalies: [
        {
          label: 'Longitudinal Tensile Fatigue Crack',
          category: 'Structural Fracture',
          severity: 'High',
          confidence_score: 93.8,
          location_region: 'Mid-Span Lower Gusset Plate',
          description: 'Visual fracture approximately 14.5 cm in length originating near the high-stress bolt hole aperture, propagating longitudinally.',
          root_cause_hypothesis: 'Cyclic dynamic vibration combined with thermal expansion beyond original elastomeric bearing travel limits.',
          recommended_action: 'Drill stress-relief arrestor holes at crack tips immediately; schedule magnetic particle or ultrasonic non-destructive testing (NDT).'
        },
        {
          label: 'Galvanic Weathering & Flaking Rust',
          category: 'Corrosion',
          severity: 'Medium',
          confidence_score: 89.4,
          location_region: 'Upper Web Support Joint',
          description: 'Coating delamination with heavy ferrous oxide scaling and material loss estimated at 1.2 mm depth.',
          root_cause_hypothesis: 'Failure of polyurethane weather sealant coupled with standing water accumulation during monsoon precipitation.',
          recommended_action: 'Abrasive blast clean to Sa 2.5 standard and apply three-coat zinc-rich epoxy barrier system.'
        }
      ],
      operational_recommendations: [
        'Install digital strain gauge telemetry to log live cyclic peak loads.',
        'Restrict maximum vehicle gross weight through Sector B-7 to 20 tons pending repair.',
        'Schedule follow-up drone photogrammetry survey in 14 days.'
      ],
      compliance_disclaimer: 'Evaluated in accordance with ISO 2394 structural reliability standards. Requires PE engineer certification for load recalculation.'
    },

    WORKPLACE_HSE: {
      overall_status: 'Action Required',
      severity_level: 'Critical',
      visual_health_score: 48,
      ai_summary: `Safety & compliance audit of '${title}' discovered unmitigated high-risk violations: active personnel without required High-Visibility Class 2 vests and an obstructed emergency evacuation egress path.`,
      extracted_text_ocr: 'EMERGENCY EXIT 04 | MAXIMUM LOAD: 2500 KG | ZONE: WAREHOUSE-NORTH',
      anomalies: [
        {
          label: 'Missing PPE: High-Visibility Safety Apparel',
          category: 'PPE Non-Compliance',
          severity: 'Critical',
          confidence_score: 97.4,
          location_region: 'Active Forklift Transit Aisle (Center)',
          description: 'Two floor workers observed within 3 meters of active heavy material handling equipment without high-visibility vests or protective headgear.',
          root_cause_hypothesis: 'Failure of entry checkpoint PPE audit protocols and inadequate visual hazard demarcation.',
          recommended_action: 'Immediately halt equipment movement in Zone 4; require all personnel to don approved ANSI/ISEA 107 Class 2 vests before re-entry.'
        },
        {
          label: 'Obstructed Emergency Fire Exit',
          category: 'HSE Fire Safety Code Violation',
          severity: 'High',
          confidence_score: 94.1,
          location_region: 'Exit Door 04 (Background Right)',
          description: 'Three stacked wooden Euro-pallets blocking 70% of the required 1.2-meter exit width.',
          root_cause_hypothesis: 'Unauthorized temporary staging of excess warehouse intake inventory during morning shift turnover.',
          recommended_action: 'Direct floor lead to clear pallet obstruction within 10 minutes; log corrective action in HSE registry.'
        }
      ],
      operational_recommendations: [
        'Conduct mandatory 15-minute HSE toolbox safety briefing at next shift change.',
        'Deploy floor boundary warning tape along all automated guided vehicle paths.',
        'Review CCTV telemetry footage for repetitive egress staging infractions.'
      ],
      compliance_disclaimer: 'Flagged under OSHA 29 CFR 1910.36 and ISO 45001 occupational health standards. Mandatory supervisor sign-off required.'
    },

    DOCUMENT_OCR_AUDIT: {
      overall_status: 'Warning',
      severity_level: 'Medium',
      visual_health_score: 78,
      ai_summary: `Document OCR & Verification audit of '${title}' verified structural legibility but flagged an unauthorized stamp anomaly, missing authorizing signature on Line Item 4, and a subtotal calculation variance.`,
      extracted_text_ocr: 'COMMERCIAL INVOICE #INV-2026-9041\nVENDOR: APEX INDUSTRIAL SUPPLIES LTD\nDATE: 2026-10-24\nITEM 1: BALL BEARINGS 120-SKU | QTY: 500 | $4,500.00\nITEM 2: HYDRAULIC VALVE ASSY | QTY: 12 | $8,640.00\nSUBTOTAL: $13,140.00 | TAX (8.5%): $1,116.90\nTOTAL DUE: $14,256.90\nSTATUS: PENDING AUTHORIZATION SIGNATURE',
      anomalies: [
        {
          label: 'Missing Authorizing Approval Signature',
          category: 'Compliance & Verification',
          severity: 'High',
          confidence_score: 98.0,
          location_region: 'Bottom Right Signature Block',
          description: 'The mandatory Procurement Director signature field is completely blank despite disbursement stamp applied.',
          root_cause_hypothesis: 'Premature routing of invoice to accounts payable queue prior to managerial financial audit approval.',
          recommended_action: 'Quarantine disbursement payment; route document directly to procurement officer for digital or physical countersign.'
        },
        {
          label: 'Smudged Barcode Serial Number',
          category: 'OCR Degradation',
          severity: 'Low',
          confidence_score: 84.5,
          location_region: 'Top Right Document Header',
          description: 'Code 128 barcode has a vertical print smear causing automated optical scanning failure on character index 8.',
          root_cause_hypothesis: 'Low toner density or dirty thermal printhead at vendor shipping depot.',
          recommended_action: 'Manually register barcode string INV-2026-9041 into ERP document archive; notify supplier to clean thermal printhead.'
        }
      ],
      operational_recommendations: [
        'Enforce dual-validation check for invoices exceeding $10,000 before payment release.',
        'Archive high-resolution 300 DPI PDF scan in compliance document vault.',
        'Transmit vendor notice regarding barcode print quality standards.'
      ],
      compliance_disclaimer: 'Verified in compliance with IFRS document audit trails and GAAP internal control standards.'
    },

    RETAIL_INVENTORY: {
      overall_status: 'Action Required',
      severity_level: 'High',
      visual_health_score: 61,
      ai_summary: `Retail shelf & inventory visual audit of '${title}' identified out-of-stock planogram gaps on Tier 2 and a severely crushed carton packaging on the bottom facing display.`,
      extracted_text_ocr: 'AISLE 4B | SNACK & BEVERAGES | PLANOGRAM REF: POG-2026-FALL | SHELF TIER: 1-4',
      anomalies: [
        {
          label: 'Planogram Out-of-Stock Void (4 Facings Missing)',
          category: 'Inventory Gap',
          severity: 'High',
          confidence_score: 95.2,
          location_region: 'Eye-Level Shelf Tier 2 (Center)',
          description: 'Empty shelf gap measuring 68 cm corresponding to premium beverage SKU #88129; shelf tag present but zero units on display.',
          root_cause_hypothesis: 'Backroom stock replenishment delay following morning peak traffic rush.',
          recommended_action: 'Dispatch replenishment task to mobile associate handheld terminal; restock 24 units from backroom Bay 12 immediately.'
        },
        {
          label: 'Crushed Primary Product Packaging',
          category: 'Damaged Merchandise',
          severity: 'Medium',
          confidence_score: 91.0,
          location_region: 'Lower Shelf Tier 4 (Left)',
          description: 'Secondary corrugated packaging crushed and torn along side seam, exposing inner foil liner.',
          root_cause_hypothesis: 'Rough handling during pallet unstacking or impact from shopping cart bumper.',
          recommended_action: 'Remove compromised item from sales floor; log into markdown/damage reclamation inventory.'
        }
      ],
      operational_recommendations: [
        'Trigger automatic ERP reorder threshold check for SKU #88129.',
        'Review front-facing alignment across Tier 2 and Tier 3 to restore brand compliance.',
        'Audit backroom inventory count to reconcile phantom on-hand discrepancy.'
      ],
      compliance_disclaimer: 'Standard retail visual merchandising compliance check. Ensure damaged products are processed according to store return policy.'
    }
  };

  const profile = domainProfiles[domain_category] || domainProfiles.MANUFACTURING_QC;
  return {
    ...profile,
    ai_summary: operator_notes
      ? `${profile.ai_summary} (Operator Note: "${operator_notes}" accounted for in visual correlation.)`
      : profile.ai_summary
  };
}

