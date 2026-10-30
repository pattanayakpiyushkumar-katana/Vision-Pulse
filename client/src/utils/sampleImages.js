// Generates high-fidelity base64 SVG data-URIs representing realistic multi-domain inspection assets
function svgToDataUrl(svgString) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
}

export const SAMPLE_DATASETS = {
  MANUFACTURING_QC: {
    title: 'PCB SMT Line #4 - Micro-controller IC Solder & Trace Inspection',
    domain_category: 'MANUFACTURING_QC',
    analysis_mode: 'Deep Defect & Root-Cause Audit',
    operator_notes: 'Verify clearance around 48-pin QFP processor and ground plane solder mask integrity.',
    preview_description: 'High-density PCB with QFP IC pins showing solder bridging and trace oxidation.',
    image_data_url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#064e3b" />
        <defs>
          <pattern id="pcb-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="none" stroke="#047857" stroke-width="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#pcb-grid)" />
        
        <!-- PCB Traces -->
        <g stroke="#10b981" stroke-width="4" fill="none">
          <path d="M 50 100 L 200 100 L 250 150 L 350 150" />
          <path d="M 50 150 L 180 150 L 230 200 L 350 200" />
          <path d="M 50 200 L 160 200 L 210 250 L 350 250" />
          <path d="M 450 150 L 550 150 L 600 100 L 750 100" />
          <path d="M 450 200 L 570 200 L 620 250 L 750 250" />
          <path d="M 400 450 L 400 550" />
          <path d="M 350 450 L 300 500 L 200 500" />
          <path d="M 450 450 L 500 500 L 600 500" />
        </g>

        <!-- IC Chip Body -->
        <rect x="320" y="160" width="160" height="160" rx="6" fill="#18181b" stroke="#52525b" stroke-width="3" />
        <circle cx="340" cy="180" r="5" fill="#a1a1aa" />
        <text x="400" y="245" fill="#f4f4f5" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">STM32-H743</text>
        <text x="400" y="265" fill="#71717a" font-family="monospace" font-size="10" text-anchor="middle">REV 4.2C | 98402-TX</text>

        <!-- IC Pins (Left & Right) -->
        <g fill="#cbd5e1">
          <rect x="300" y="180" width="20" height="6" rx="1" />
          <rect x="300" y="200" width="20" height="6" rx="1" />
          <rect x="300" y="220" width="20" height="6" rx="1" />
          <rect x="300" y="240" width="20" height="6" rx="1" />
          <rect x="300" y="260" width="20" height="6" rx="1" />
          <rect x="300" y="280" width="20" height="6" rx="1" />

          <rect x="480" y="180" width="20" height="6" rx="1" />
          <rect x="480" y="200" width="20" height="6" rx="1" />
          <rect x="480" y="220" width="20" height="6" rx="1" />
          <rect x="480" y="240" width="20" height="6" rx="1" />
          <rect x="480" y="260" width="20" height="6" rx="1" />
          <rect x="480" y="280" width="20" height="6" rx="1" />
        </g>

        <!-- DEFECT 1: Solder Bridge between Pin 14-15 (Right side) -->
        <ellipse cx="488" cy="230" rx="9" ry="16" fill="#94a3b8" stroke="#f43f5e" stroke-width="2.5" />
        <!-- Callout Marker -->
        <circle cx="488" cy="230" r="28" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="4,4" />
        <rect x="530" y="210" width="160" height="36" rx="4" fill="#881337" fill-opacity="0.9" stroke="#fda4af" stroke-width="1.5" />
        <text x="540" y="232" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">DEFECT: Solder Bridge</text>

        <!-- DEFECT 2: Trace Oxidation (Bottom Left) -->
        <circle cx="170" cy="450" r="45" fill="#ca8a04" fill-opacity="0.4" stroke="#eab308" stroke-width="2" />
        <circle cx="170" cy="450" r="50" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,5" />
        <rect x="60" y="490" width="160" height="34" rx="4" fill="#78350f" fill-opacity="0.9" stroke="#fde68a" stroke-width="1.5" />
        <text x="70" y="511" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">ANOMALY: Surface Rust</text>

        <!-- Silkscreen OCR Text -->
        <text x="50" y="50" fill="#f8fafc" font-family="monospace" font-size="16" font-weight="bold">VISIONPULSE SMT TEST HARNESS // LOT: M-708</text>
        <text x="50" y="70" fill="#a7f3d0" font-family="monospace" font-size="12">QC-PASS: 09/24 | VOLTAGE: 3.3V DC | IPC-A-610 CLASS 3</text>
      </svg>
    `)
  },

  INFRASTRUCTURE_SAFETY: {
    title: 'Bridge Pier Sector B-7 Girder Structural Integrity Scan',
    domain_category: 'INFRASTRUCTURE_SAFETY',
    analysis_mode: 'Standard Anomaly Detection',
    operator_notes: 'Check lower gusset plate for tensile micro-fractures under cyclic rail load.',
    preview_description: 'Structural steel I-beam with fatigue crack and surface oxidation.',
    image_data_url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#1e293b" />
        
        <!-- Concrete Background Texture -->
        <rect x="40" y="40" width="720" height="520" fill="#334155" stroke="#475569" stroke-width="4" />
        
        <!-- Steel I-Beam Flange -->
        <rect x="120" y="100" width="560" height="80" fill="#64748b" stroke="#94a3b8" stroke-width="3" />
        <rect x="360" y="180" width="80" height="240" fill="#475569" stroke="#64748b" stroke-width="3" />
        <rect x="120" y="420" width="560" height="80" fill="#64748b" stroke="#94a3b8" stroke-width="3" />
        
        <!-- Gusset Plate with Rivets -->
        <polygon points="260,180 540,180 480,360 320,360" fill="#4b5563" stroke="#9ca3af" stroke-width="3" />
        
        <!-- Rivets -->
        <g fill="#d1d5db" stroke="#1f2937" stroke-width="1.5">
          <circle cx="300" cy="200" r="7" /><circle cx="340" cy="200" r="7" /><circle cx="380" cy="200" r="7" />
          <circle cx="420" cy="200" r="7" /><circle cx="460" cy="200" r="7" /><circle cx="500" cy="200" r="7" />
          <circle cx="340" cy="260" r="7" /><circle cx="380" cy="260" r="7" /><circle cx="420" cy="260" r="7" /><circle cx="460" cy="260" r="7" />
          <circle cx="360" cy="320" r="7" /><circle cx="400" cy="320" r="7" /><circle cx="440" cy="320" r="7" />
        </g>

        <!-- DEFECT 1: Longitudinal Fatigue Crack Line -->
        <path d="M 378 206 Q 365 240 372 275 T 355 310" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" />
        <circle cx="370" cy="255" r="45" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4" />
        <rect x="210" y="270" width="150" height="32" rx="4" fill="#991b1b" stroke="#f87171" stroke-width="1.5" />
        <text x="220" y="291" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">CRACK: 14.5 cm Fatigue</text>

        <!-- DEFECT 2: Flaking Rust on Lower Web -->
        <ellipse cx="580" cy="450" rx="55" ry="25" fill="#7c2d12" stroke="#ea580c" stroke-width="2" />
        <rect x="530" y="385" width="160" height="32" rx="4" fill="#7c2d12" stroke="#fdba74" stroke-width="1.5" />
        <text x="540" y="406" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">CORROSION: Delamination</text>

        <!-- Stenciled Reference Text -->
        <text x="140" y="145" fill="#f1f5f9" font-family="monospace" font-size="18" font-weight="bold">STRUCT-ID: BR-8809 // SECTOR B-7</text>
        <text x="140" y="465" fill="#cbd5e1" font-family="monospace" font-size="14">GAUGE: 44.20kN | ELEV: +18.4m | INSP: 2026-Q4</text>
      </svg>
    `)
  },

  WORKPLACE_HSE: {
    title: 'North Logistics Facility Zone 4 PPE & Egress Compliance',
    domain_category: 'WORKPLACE_HSE',
    analysis_mode: 'Safety & Compliance Check',
    operator_notes: 'Verify exit door clearance and high-vis apparel compliance in active forklift zone.',
    preview_description: 'Warehouse floor with unequipped workers and blocked emergency exit.',
    image_data_url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#0f172a" />
        
        <!-- Floor with Perspective Lines -->
        <polygon points="0,350 800,350 800,600 0,600" fill="#334155" />
        <!-- Yellow Forklift Lane Lines -->
        <line x1="200" y1="350" x2="50" y2="600" stroke="#facc15" stroke-width="8" stroke-dasharray="25,15" />
        <line x1="600" y1="350" x2="750" y2="600" stroke="#facc15" stroke-width="8" stroke-dasharray="25,15" />

        <!-- Emergency Exit Door (Right Background) -->
        <rect x="620" y="180" width="120" height="200" fill="#15803d" stroke="#22c55e" stroke-width="3" />
        <rect x="640" y="195" width="80" height="30" fill="#14532d" />
        <text x="680" y="215" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">EXIT 04</text>

        <!-- DEFECT 1: Obstructed Fire Exit (Stacked wooden pallets in front of exit) -->
        <rect x="610" y="310" width="130" height="30" fill="#78350f" stroke="#d97706" stroke-width="2" />
        <rect x="620" y="280" width="110" height="30" fill="#92400e" stroke="#f59e0b" stroke-width="2" />
        <rect x="630" y="250" width="90" height="30" fill="#b45309" stroke="#fbbf24" stroke-width="2" />
        <circle cx="675" cy="290" r="55" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="6,4" />
        <rect x="520" y="240" width="160" height="34" rx="4" fill="#991b1b" stroke="#fca5a5" stroke-width="1.5" />
        <text x="530" y="261" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">VIOLATION: Exit Blocked</text>

        <!-- DEFECT 2: Worker without High-Visibility Vest in Transit Lane -->
        <g transform="translate(300, 320)">
          <!-- Worker Head -->
          <circle cx="40" cy="20" r="14" fill="#fed7aa" stroke="#78350f" stroke-width="1.5" />
          <!-- Black Shirt (Missing High-Vis Vest) -->
          <path d="M 20 40 L 60 40 L 65 110 L 15 110 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
          <!-- Trousers -->
          <rect x="22" y="110" width="16" height="70" fill="#1e3a8a" />
          <rect x="42" y="110" width="16" height="70" fill="#1e3a8a" />
          <!-- Violation Ring -->
          <ellipse cx="40" cy="70" rx="45" ry="75" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="6,4" />
          <!-- Badge -->
          <rect x="-80" y="45" width="145" height="34" rx="4" fill="#7f1d1d" stroke="#f87171" stroke-width="1.5" />
          <text x="-70" y="66" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">NO PPE: High-Vis Vest</text>
        </g>

        <!-- Warehouse Signage -->
        <text x="60" y="80" fill="#f8fafc" font-family="sans-serif" font-size="18" font-weight="bold">WAREHOUSE NORTH // AISLE 04 TRANSIT ZONE</text>
        <text x="60" y="110" fill="#94a3b8" font-family="monospace" font-size="13">MAX LOAD: 2500 KG | SPEED LIMIT: 8 KM/H | HSE CODE 1910.36</text>
      </svg>
    `)
  },

  DOCUMENT_OCR_AUDIT: {
    title: 'Apex Supplies Commercial Invoice #INV-2026-9041 Audit',
    domain_category: 'DOCUMENT_OCR_AUDIT',
    analysis_mode: 'Document OCR & Verification',
    operator_notes: 'Verify invoice authorization stamp, signature presence, and totals reconciliation.',
    preview_description: 'Scanned commercial invoice with missing signature block and barcode defect.',
    image_data_url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#334155" />
        
        <!-- Scanned Paper Sheet with Slight Rotation & Shadow -->
        <rect x="100" y="30" width="600" height="540" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        
        <!-- Document Header -->
        <text x="140" y="80" fill="#0f172a" font-family="sans-serif" font-size="22" font-weight="bold">APEX INDUSTRIAL SUPPLIES LTD.</text>
        <text x="140" y="105" fill="#64748b" font-family="sans-serif" font-size="12">1400 TECH HUB PARKWAY, SUITE 800 // TAX ID: 88-1093491</text>
        
        <!-- Barcode (Top Right) -->
        <g transform="translate(520, 50)">
          <rect x="0" y="0" width="140" height="35" fill="#f8fafc" stroke="#e2e8f0" />
          <line x1="10" y1="5" x2="10" y2="30" stroke="#000" stroke-width="2" />
          <line x1="15" y1="5" x2="15" y2="30" stroke="#000" stroke-width="3" />
          <line x1="22" y1="5" x2="22" y2="30" stroke="#000" stroke-width="1" />
          <line x1="30" y1="5" x2="30" y2="30" stroke="#000" stroke-width="4" />
          <!-- Smudge Defect -->
          <circle cx="55" cy="18" r="14" fill="#000000" opacity="0.8" />
          <text x="10" y="48" fill="#475569" font-family="monospace" font-size="9">INV-2026-9041</text>
        </g>
        
        <line x1="140" y1="130" x2="660" y2="130" stroke="#e2e8f0" stroke-width="2" />

        <!-- Line Items Table -->
        <text x="140" y="160" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">ITEM DESCRIPTION</text>
        <text x="440" y="160" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">QTY</text>
        <text x="500" y="160" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">RATE</text>
        <text x="600" y="160" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">AMOUNT</text>
        <line x1="140" y1="170" x2="660" y2="170" stroke="#cbd5e1" stroke-width="1" />

        <text x="140" y="200" fill="#0f172a" font-family="sans-serif" font-size="12">1. Industrial Ball Bearings #120-SKU</text>
        <text x="445" y="200" fill="#0f172a" font-family="sans-serif" font-size="12">500</text>
        <text x="505" y="200" fill="#0f172a" font-family="sans-serif" font-size="12">$9.00</text>
        <text x="595" y="200" fill="#0f172a" font-family="sans-serif" font-size="12">$4,500.00</text>

        <text x="140" y="235" fill="#0f172a" font-family="sans-serif" font-size="12">2. Hydraulic Proportional Valve Assy</text>
        <text x="445" y="235" fill="#0f172a" font-family="sans-serif" font-size="12">12</text>
        <text x="495" y="235" fill="#0f172a" font-family="sans-serif" font-size="12">$720.00</text>
        <text x="595" y="235" fill="#0f172a" font-family="sans-serif" font-size="12">$8,640.00</text>

        <line x1="420" y1="260" x2="660" y2="260" stroke="#cbd5e1" stroke-width="1" />
        <text x="420" y="285" fill="#475569" font-family="sans-serif" font-size="12">SUBTOTAL:</text>
        <text x="595" y="285" fill="#0f172a" font-family="sans-serif" font-size="12">$13,140.00</text>
        <text x="420" y="310" fill="#475569" font-family="sans-serif" font-size="12">TAX (8.5%):</text>
        <text x="595" y="310" fill="#0f172a" font-family="sans-serif" font-size="12">$1,116.90</text>
        <line x1="420" y1="325" x2="660" y2="325" stroke="#0f172a" stroke-width="2" />
        <text x="420" y="350" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">TOTAL DUE:</text>
        <text x="585" y="350" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">$14,256.90</text>

        <!-- DEFECT 1: MISSING SIGNATURE (Empty red box) -->
        <rect x="420" y="410" width="220" height="85" fill="#fff1f2" stroke="#f43f5e" stroke-width="2" stroke-dasharray="5,5" />
        <text x="430" y="440" fill="#e11d48" font-family="sans-serif" font-size="12" font-weight="bold">MISSING SIGNATURE</text>
        <text x="430" y="460" fill="#be123c" font-family="sans-serif" font-size="10">Procurement Authorization Required</text>
        <text x="430" y="480" fill="#9f1239" font-family="sans-serif" font-size="9">Signatory: [BLANK] / Date: [UNMARKED]</text>

        <!-- Red Anomaly Callout -->
        <rect x="140" y="420" width="180" height="34" rx="4" fill="#881337" stroke="#fda4af" stroke-width="1.5" />
        <text x="150" y="441" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">OCR AUDIT: Missing Sign</text>
      </svg>
    `)
  },

  RETAIL_INVENTORY: {
    title: 'Aisle 4B Beverage & Snacks Tier 2 Planogram Audit',
    domain_category: 'RETAIL_INVENTORY',
    analysis_mode: 'Standard Anomaly Detection',
    operator_notes: 'Check shelf facings against Fall 2026 Planogram standard and identify stock gaps.',
    preview_description: 'Store shelf displaying beverage rows with missing facings and crushed box.',
    image_data_url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#1e293b" />
        
        <!-- Shelf Wall Background -->
        <rect x="60" y="40" width="680" height="520" fill="#475569" stroke="#334155" stroke-width="2" />
        
        <!-- Shelf Tier 1 (Top) -->
        <rect x="80" y="160" width="640" height="15" fill="#94a3b8" />
        <!-- Shelf Tier 2 (Middle - VOID HERE) -->
        <rect x="80" y="320" width="640" height="15" fill="#94a3b8" />
        <!-- Shelf Tier 3 (Bottom) -->
        <rect x="80" y="480" width="640" height="15" fill="#94a3b8" />

        <!-- Tier 1 Items (Full stock) -->
        <g fill="#0284c7">
          <rect x="100" y="90" width="40" height="70" rx="3" /><rect x="150" y="90" width="40" height="70" rx="3" />
          <rect x="200" y="90" width="40" height="70" rx="3" /><rect x="250" y="90" width="40" height="70" rx="3" />
          <rect x="300" y="90" width="40" height="70" rx="3" /><rect x="350" y="90" width="40" height="70" rx="3" />
          <rect x="400" y="90" width="40" height="70" rx="3" /><rect x="450" y="90" width="40" height="70" rx="3" />
          <rect x="500" y="90" width="40" height="70" rx="3" /><rect x="550" y="90" width="40" height="70" rx="3" />
        </g>

        <!-- Tier 2 Items: Stock on left, then EMPTY GAP in Center, then stock on right -->
        <g fill="#16a34a">
          <rect x="100" y="240" width="45" height="80" rx="3" /><rect x="160" y="240" width="45" height="80" rx="3" />
        </g>
        <!-- DEFECT 1: OUT-OF-STOCK GAP -->
        <rect x="230" y="235" width="220" height="85" fill="#fef2f2" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4" fill-opacity="0.3" />
        <rect x="260" y="260" width="160" height="34" rx="4" fill="#991b1b" stroke="#fca5a5" stroke-width="1.5" />
        <text x="270" y="281" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">OOS VOID: 4 Facings Gap</text>
        
        <g fill="#16a34a">
          <rect x="480" y="240" width="45" height="80" rx="3" /><rect x="540" y="240" width="45" height="80" rx="3" /><rect x="600" y="240" width="45" height="80" rx="3" />
        </g>

        <!-- Tier 3 Items: Left carton crushed -->
        <!-- DEFECT 2: Crushed packaging -->
        <polygon points="110,400 160,420 170,480 100,480" fill="#d97706" stroke="#ef4444" stroke-width="2.5" />
        <rect x="180" y="415" width="165" height="34" rx="4" fill="#78350f" stroke="#fde68a" stroke-width="1.5" />
        <text x="190" y="436" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold">DAMAGED: Crushed Carton</text>

        <!-- Signage -->
        <text x="80" y="70" fill="#f8fafc" font-family="sans-serif" font-size="18" font-weight="bold">AISLE 4B // PLANOGRAM: POG-2026-FALL</text>
      </svg>
    `)
  }
};

