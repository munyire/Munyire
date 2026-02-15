<script setup>
import { computed, ref, watch, nextTick } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  period: { type: String, default: '' },
  columns: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  summaryLabel: { type: String, default: 'Összesen' },
  summaryValue: { type: String, default: '' },
  extraSummaries: { type: Array, default: () => [] },
  showSignature: { type: Boolean, default: true },
  companyName: { type: String, default: 'Munyire – Munkaruhakezelő Rendszer' },
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// ===== IFRAME-BASED PRINT =====
// This approach prints ONLY the document content in a clean iframe,
// completely isolated from the main application UI.
const handlePrint = () => {
  const printContent = document.getElementById('print-document');
  if (!printContent) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>${props.title} – ${props.companyName}</title>
  <style>
    /* ===== PAGE SETUP ===== */
    @page {
      size: A4;
      margin: 1.5cm 1.5cm 2.5cm 1.5cm;
    }

    /* ===== BASE STYLES ===== */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a1a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ===== DOCUMENT HEADER ===== */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10pt;
      border-bottom: 2pt solid #1e3a8a;
      margin-bottom: 14pt;
    }

    .doc-logo {
      display: flex;
      align-items: center;
      gap: 8pt;
    }

    .logo-icon {
      width: 32pt;
      height: 32pt;
      background: #1e3a8a;
      color: white;
      border-radius: 4pt;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14pt;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .company-name {
      font-weight: 700;
      font-size: 11pt;
      color: #1e3a8a;
    }

    .doc-date {
      font-size: 7.5pt;
      color: #666;
    }

    .doc-ref {
      text-align: right;
      font-size: 7.5pt;
      color: #666;
    }

    .doc-ref strong {
      display: block;
      font-size: 8pt;
      color: #333;
    }

    /* ===== TITLE SECTION ===== */
    .doc-title-section {
      text-align: center;
      margin-bottom: 14pt;
    }

    .doc-title {
      font-size: 16pt;
      font-weight: 800;
      color: #1a1a1a;
      margin: 0 0 3pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }

    .doc-subtitle {
      font-size: 10pt;
      color: #444;
      margin: 0 0 2pt;
    }

    .doc-period {
      font-size: 9pt;
      color: #666;
      margin: 0;
      font-style: italic;
    }

    /* ===== SUMMARY ===== */
    .doc-summary {
      background: #f5f7fa;
      border: 1pt solid #d0d5dd;
      border-radius: 3pt;
      padding: 8pt 12pt;
      margin-bottom: 14pt;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 2pt 0;
    }

    .summary-row.main {
      font-weight: 700;
      font-size: 11pt;
      padding-bottom: 5pt;
      border-bottom: 1pt solid #d0d5dd;
      margin-bottom: 3pt;
    }

    .summary-label { color: #444; }
    .summary-val { color: #1a1a1a; font-weight: 600; }

    /* ===== DATA TABLE ===== */
    .doc-table-wrapper {
      margin-bottom: 14pt;
    }

    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }

    .doc-table th {
      background: #e8ecf1;
      padding: 5pt 6pt;
      text-align: left;
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      color: #333;
      border-bottom: 1.5pt solid #999;
    }

    .doc-table td {
      padding: 4pt 6pt;
      border-bottom: 0.5pt solid #ddd;
      color: #1a1a1a;
    }

    .doc-table tbody tr:nth-child(even) {
      background: #f9fafb;
    }

    .doc-table tfoot td {
      padding: 5pt 6pt;
      font-weight: 700;
      border-top: 1.5pt solid #1e3a8a;
      background: #e8ecf1;
    }

    .row-num {
      width: 28pt;
      text-align: center;
      color: #888;
      font-size: 8pt;
    }

    .footer-label {
      text-align: right;
      padding-right: 10pt !important;
    }

    .footer-value {
      font-weight: 700;
      white-space: nowrap;
    }

    .text-right { text-align: right; }

    /* ===== PAGE BREAK: keep rows together ===== */
    .doc-table tr {
      page-break-inside: avoid;
    }

    .doc-table thead {
      display: table-header-group;
    }

    .doc-table tfoot {
      display: table-footer-group;
    }

    /* ===== SIGNATURE ===== */
    .doc-signature {
      display: flex;
      justify-content: space-between;
      margin-top: 40pt;
      padding-top: 10pt;
      page-break-inside: avoid;
    }

    .signature-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 160pt;
    }

    .signature-line {
      width: 100%;
      border-bottom: 0.5pt solid #333;
      margin-bottom: 4pt;
      height: 34pt;
    }

    .signature-label {
      font-size: 7.5pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }

    /* ===== FOOTER ===== */
    .doc-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 20pt;
      padding-top: 6pt;
      border-top: 0.5pt solid #ccc;
      font-size: 7pt;
      color: #999;
    }

    .doc-footer-center {
      text-align: center;
    }

    /* ===== DOCUMENT ID ===== */
    .doc-id {
      font-size: 7pt;
      color: #aaa;
      text-align: center;
      margin-top: 6pt;
      font-family: 'Courier New', monospace;
    }

    /* ===== LEGAL TEXT ===== */
    .doc-legal {
      margin-top: 14pt;
      padding: 6pt 10pt;
      border: 0.5pt solid #ddd;
      border-radius: 2pt;
      font-size: 7pt;
      color: #888;
      line-height: 1.4;
      page-break-inside: avoid;
    }

    /* ===== EMPTY STATE ===== */
    .doc-empty {
      text-align: center;
      padding: 20pt;
      color: #999;
      font-style: italic;
    }
  </style>
</head>
<body>
  ${printContent.innerHTML}
</body>
</html>`);
  iframeDoc.close();

  // Wait for iframe to render, then print
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Remove iframe after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 300);
  };
};

const handleClose = () => {
  emit('close');
};

// Generate unique document reference number
const docRef = computed(() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `MNY-${y}${m}${d}-${h}${min}`;
});

// Number of pages estimation for display
const pageEstimate = computed(() => {
  const rowsPerPage = 30;
  return Math.max(1, Math.ceil(props.data.length / rowsPerPage));
});
</script>

<template>
  <!-- Overlay -->
  <Teleport to="body">
    <div v-if="visible" class="print-overlay" @click.self="handleClose">
      <div class="print-preview">
        <!-- Preview toolbar (never printed — isolated iframe) -->
        <div class="preview-toolbar">
          <div class="toolbar-left">
            <h3>Nyomtatási előnézet</h3>
            <span class="toolbar-info">{{ data.length }} tétel · ~{{ pageEstimate }} oldal</span>
          </div>
          <div class="toolbar-actions">
            <button class="toolbar-btn print-btn" @click="handlePrint">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Nyomtatás
            </button>
            <button class="toolbar-btn close-btn" @click="handleClose">✕</button>
          </div>
        </div>

        <!-- Printable content (this HTML is extracted into the iframe) -->
        <div class="print-document" id="print-document">
          <!-- Document Header -->
          <div class="doc-header">
            <div class="doc-logo">
              <div class="logo-icon">M</div>
              <div class="logo-text">
                <span class="company-name">{{ companyName }}</span>
                <span class="doc-date">Generálva: {{ currentDate }}</span>
              </div>
            </div>
            <div class="doc-ref">
              <strong>{{ docRef }}</strong>
              <span>Hivatkozási szám</span>
            </div>
          </div>

          <!-- Document Title -->
          <div class="doc-title-section">
            <h1 class="doc-title">{{ title }}</h1>
            <p v-if="subtitle" class="doc-subtitle">{{ subtitle }}</p>
            <p v-if="period" class="doc-period">Időszak: {{ period }}</p>
          </div>

          <!-- Summary Section -->
          <div v-if="summaryValue" class="doc-summary">
            <div class="summary-row main">
              <span class="summary-label">{{ summaryLabel }}</span>
              <span class="summary-val">{{ summaryValue }}</span>
            </div>
            <div v-for="(extra, idx) in extraSummaries" :key="idx" class="summary-row">
              <span class="summary-label">{{ extra.label }}</span>
              <span class="summary-val">{{ extra.value }}</span>
            </div>
          </div>

          <!-- Data Table -->
          <div v-if="columns.length > 0 && data.length > 0" class="doc-table-wrapper">
            <table class="doc-table">
              <thead>
                <tr>
                  <th class="row-num">#</th>
                  <th v-for="col in columns" :key="col.key" :class="col.align || ''">
                    {{ col.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in data" :key="index">
                  <td class="row-num">{{ index + 1 }}</td>
                  <td v-for="col in columns" :key="col.key" :class="col.align || ''">
                    {{ row[col.key] }}
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="summaryValue">
                <tr>
                  <td :colspan="columns.length" class="footer-label">{{ summaryLabel }}</td>
                  <td class="footer-value">{{ summaryValue }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div v-else-if="columns.length > 0" class="doc-empty">
            <p>Nincs adat a kiválasztott időszakra.</p>
          </div>

          <!-- Slot for custom content -->
          <slot></slot>

          <!-- Legal notice -->
          <div class="doc-legal">
            Ez a dokumentum a {{ companyName }} által generált hivatalos bizonylat.
            A dokumentum sorszáma: {{ docRef }}.
            A nyomtatás dátuma: {{ currentDate }}.
            A dokumentumban szereplő adatok a generálás időpontjában érvényes állapotot tükrözik.
            Bármely kérdés esetén kérjük, hivatkozzon a fenti sorszámra.
          </div>

          <!-- Signature Section -->
          <div v-if="showSignature" class="doc-signature">
            <div class="signature-block">
              <div class="signature-line"></div>
              <span class="signature-label">Készítette</span>
            </div>
            <div class="signature-block">
              <div class="signature-line"></div>
              <span class="signature-label">Jóváhagyta</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="doc-footer">
            <span>{{ companyName }}</span>
            <span class="doc-footer-center">{{ docRef }}</span>
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ===== Overlay & Preview Container ===== */
.print-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 2rem;
}

.print-preview {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 850px;
  width: 100%;
  overflow: hidden;
}

/* ===== Preview Toolbar ===== */
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.toolbar-left {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.preview-toolbar h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.toolbar-info {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-weight: 500;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.print-btn {
  background: #1e3a8a;
  color: white;
}

.print-btn:hover {
  background: #1e40af;
}

.close-btn {
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.125rem;
  padding: 0.5rem 0.75rem;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* ===== Printable Document (Preview styling) ===== */
.print-document {
  padding: 2.5rem;
  color: #1a1a1a;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
}

/* --- Header --- */
.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #1e3a8a;
  margin-bottom: 1.5rem;
}

.doc-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #1e3a8a;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-weight: 700;
  font-size: 1rem;
  color: #1e3a8a;
}

.doc-date {
  font-size: 0.75rem;
  color: #64748b;
}

.doc-ref {
  text-align: right;
  font-size: 0.75rem;
  color: #64748b;
}

.doc-ref strong {
  display: block;
  font-size: 0.8125rem;
  color: #333;
}

/* --- Title Section --- */
.doc-title-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.doc-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.doc-subtitle {
  font-size: 1rem;
  color: #444;
  margin: 0 0 0.25rem;
}

.doc-period {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  font-style: italic;
}

/* --- Summary --- */
.doc-summary {
  background: #f5f7fa;
  border: 1px solid #d0d5dd;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.summary-row.main {
  font-weight: 700;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d0d5dd;
  margin-bottom: 0.25rem;
}

.summary-label { color: #444; }
.summary-val { color: #1a1a1a; font-weight: 600; }

/* --- Table --- */
.doc-table-wrapper {
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
}

.doc-table th {
  background: #e8ecf1;
  padding: 0.5rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #333;
  border-bottom: 2px solid #999;
}

.doc-table td {
  padding: 0.375rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1a1a1a;
}

.doc-table tbody tr:nth-child(even) { background: #f9fafb; }
.doc-table tbody tr:hover { background: #f1f5f9; }

.doc-table tfoot td {
  padding: 0.5rem;
  font-weight: 700;
  border-top: 2px solid #1e3a8a;
  background: #e8ecf1;
}

.row-num {
  width: 32px;
  text-align: center;
  color: #888;
  font-size: 9pt;
}

.footer-label {
  text-align: right;
  padding-right: 1rem !important;
}

.footer-value {
  font-weight: 700;
  white-space: nowrap;
}

.text-right { text-align: right; }

/* --- Empty state --- */
.doc-empty {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}

/* --- Legal Notice --- */
.doc-legal {
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  color: #94a3b8;
  line-height: 1.4;
}

/* --- Signature --- */
.doc-signature {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 1rem;
}

.signature-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180px;
}

.signature-line {
  width: 100%;
  border-bottom: 1px solid #333;
  margin-bottom: 0.5rem;
  height: 40px;
}

.signature-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* --- Footer --- */
.doc-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.6875rem;
  color: #94a3b8;
}

.doc-footer-center {
  text-align: center;
}
</style>
