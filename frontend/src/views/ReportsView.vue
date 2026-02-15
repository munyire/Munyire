<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import { 
  FileText, 
  TrendingUp, 
  Package, 
  Calendar,
  ChevronDown,
  Download,
  Printer
} from 'lucide-vue-next';
import PrintTemplate from '../components/PrintTemplate.vue';

const loading = ref(true);
const activeTab = ref('monthly'); // monthly, yearly, halfyear, inventory

// Date filters
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const selectedYear = ref(currentYear);
const selectedMonth = ref(currentMonth);
const selectedHalf = ref(1);

// Report data
const monthlyData = ref({ expenses: [], totalExpense: 0 });
const yearlyData = ref({ totalExpense: 0, monthlyBreakdown: {} });
const halfYearData = ref({ totalExpense: 0, monthlyBreakdown: {}, half: 1 });
const inventoryData = ref({ totalValue: 0, valueByType: {}, itemCount: 0 });

// Available years for filter
const availableYears = computed(() => {
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }
  return years;
});

// Month names
const monthNames = [
  'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
  'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
];

const fetchMonthlyExpenses = async () => {
  try {
    const response = await api.get(`/reports/expenses/monthly?year=${selectedYear.value}&month=${selectedMonth.value}`);
    monthlyData.value = response.data;
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
  }
};

const fetchYearlyExpenses = async () => {
  try {
    const response = await api.get(`/reports/expenses/yearly?year=${selectedYear.value}`);
    yearlyData.value = response.data;
  } catch (error) {
    console.error('Error fetching yearly expenses:', error);
  }
};

const fetchHalfYearExpenses = async () => {
  try {
    const response = await api.get(`/reports/expenses/half-year?year=${selectedYear.value}&half=${selectedHalf.value}`);
    halfYearData.value = response.data;
  } catch (error) {
    console.error('Error fetching half-year expenses:', error);
  }
};

const fetchInventoryValue = async () => {
  try {
    const response = await api.get('/reports/inventory-value');
    inventoryData.value = response.data;
  } catch (error) {
    console.error('Error fetching inventory value:', error);
  }
};

const loadActiveReport = () => {
  switch (activeTab.value) {
    case 'monthly':
      fetchMonthlyExpenses();
      break;
    case 'yearly':
      fetchYearlyExpenses();
      break;
    case 'halfyear':
      fetchHalfYearExpenses();
      break;
    case 'inventory':
      fetchInventoryValue();
      break;
  }
};

const setTab = (tab) => {
  activeTab.value = tab;
  loadActiveReport();
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('hu-HU');
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('hu-HU');
};

// Generate chart data for yearly report
const yearlyChartData = computed(() => {
  const data = [];
  for (let i = 1; i <= 12; i++) {
    const value = yearlyData.value.monthlyBreakdown[i] || 0;
    const maxValue = Math.max(...Object.values(yearlyData.value.monthlyBreakdown || {}), 1);
    data.push({
      month: monthNames[i - 1].substring(0, 3),
      value,
      percentage: maxValue > 0 ? (value / maxValue) * 100 : 0
    });
  }
  return data;
});

// Generate chart data for half-year report
const halfYearChartData = computed(() => {
  const startMonth = selectedHalf.value === 1 ? 1 : 7;
  const endMonth = selectedHalf.value === 1 ? 6 : 12;
  const data = [];
  
  const maxValue = Math.max(...Object.values(halfYearData.value.monthlyBreakdown || {}), 1);
  
  for (let i = startMonth; i <= endMonth; i++) {
    const value = halfYearData.value.monthlyBreakdown[i] || 0;
    data.push({
      month: monthNames[i - 1].substring(0, 3),
      value,
      percentage: maxValue > 0 ? (value / maxValue) * 100 : 0
    });
  }
  return data;
});

// Inventory type breakdown sorted by value
const inventoryTypeList = computed(() => {
  return Object.entries(inventoryData.value.valueByType || {})
    .sort((a, b) => b[1].value - a[1].value);
});

// ===== PRINT FUNCTIONALITY =====
const showPrintPreview = ref(false);

const printTitle = computed(() => {
  switch (activeTab.value) {
    case 'monthly': return 'Havi kiadási kimutatás';
    case 'yearly': return 'Éves költségösszesítő';
    case 'halfyear': return 'Féléves kimutatás';
    case 'inventory': return 'Készletleltár';
    default: return 'Jelentés';
  }
});

const printPeriod = computed(() => {
  switch (activeTab.value) {
    case 'monthly': return `${selectedYear.value}. ${monthNames[selectedMonth.value - 1]}`;
    case 'yearly': return `${selectedYear.value}. év`;
    case 'halfyear': return `${selectedYear.value}. ${selectedHalf.value === 1 ? 'I.' : 'II.'} félév`;
    case 'inventory': return 'Aktuális állapot';
    default: return '';
  }
});

const printColumns = computed(() => {
  switch (activeTab.value) {
    case 'monthly':
      return [
        { key: 'KiadasDatum', label: 'Dátum' },
        { key: 'DolgozoNev', label: 'Dolgozó' },
        { key: 'Fajta', label: 'Ruha fajta' },
        { key: 'Mennyiseg', label: 'Mennyiség' },
        { key: 'Ar', label: 'Egységár', align: 'text-right' },
        { key: 'Total', label: 'Összesen', align: 'text-right' },
      ];
    case 'yearly':
    case 'halfyear':
      return [
        { key: 'month', label: 'Hónap' },
        { key: 'value', label: 'Kiadás', align: 'text-right' },
      ];
    case 'inventory':
      return [
        { key: 'type', label: 'Fajta' },
        { key: 'quantity', label: 'Mennyiség' },
        { key: 'value', label: 'Érték', align: 'text-right' },
      ];
    default: return [];
  }
});

const printData = computed(() => {
  switch (activeTab.value) {
    case 'monthly':
      return monthlyData.value.expenses.map(item => ({
        KiadasDatum: formatDate(item.KiadasDatum),
        DolgozoNev: item.DolgozoNev,
        Fajta: item.Fajta,
        Mennyiseg: `${item.Mennyiseg} db`,
        Ar: `${formatCurrency(item.Ar)} Ft`,
        Total: `${formatCurrency(item.Total)} Ft`,
      }));
    case 'yearly':
      return monthNames.map((name, i) => ({
        month: name,
        value: `${formatCurrency(yearlyData.value.monthlyBreakdown[i + 1] || 0)} Ft`,
      }));
    case 'halfyear': {
      const startM = selectedHalf.value === 1 ? 0 : 6;
      const endM = selectedHalf.value === 1 ? 6 : 12;
      return monthNames.slice(startM, endM).map((name, i) => ({
        month: name,
        value: `${formatCurrency(halfYearData.value.monthlyBreakdown[startM + i + 1] || 0)} Ft`,
      }));
    }
    case 'inventory':
      return inventoryTypeList.value.map(([type, data]) => ({
        type,
        quantity: `${data.quantity} db`,
        value: `${formatCurrency(data.value)} Ft`,
      }));
    default: return [];
  }
});

const printSummaryValue = computed(() => {
  switch (activeTab.value) {
    case 'monthly': return `${formatCurrency(monthlyData.value.totalExpense)} Ft`;
    case 'yearly': return `${formatCurrency(yearlyData.value.totalExpense)} Ft`;
    case 'halfyear': return `${formatCurrency(halfYearData.value.totalExpense)} Ft`;
    case 'inventory': return `${formatCurrency(inventoryData.value.totalValue)} Ft`;
    default: return '';
  }
});

const printExtraSummaries = computed(() => {
  const currentData = activeTab.value === 'monthly' ? monthlyData.value 
    : activeTab.value === 'yearly' ? yearlyData.value 
    : activeTab.value === 'halfyear' ? halfYearData.value 
    : null;
  
  if (!currentData) {
    if (activeTab.value === 'inventory') {
      return [{ label: 'Különböző tételek', value: `${inventoryData.value.itemCount} db` }];
    }
    return [];
  }
  
  const extras = [];
  if (currentData.issuedExpense !== undefined) {
    extras.push({ label: 'Kiadott ruhák értéke', value: `${formatCurrency(currentData.issuedExpense)} Ft` });
  }
  if (currentData.inventoryValue !== undefined) {
    extras.push({ label: 'Raktárkészlet értéke', value: `${formatCurrency(currentData.inventoryValue)} Ft` });
  }
  if (currentData.pendingOrdersValue) {
    extras.push({ label: 'Szállításban', value: `${formatCurrency(currentData.pendingOrdersValue)} Ft` });
  }
  return extras;
});

const openPrintPreview = () => {
  showPrintPreview.value = true;
};

const closePrintPreview = () => {
  showPrintPreview.value = false;
};

// ===== CSV EXPORT =====
const exportCSV = () => {
  const cols = printColumns.value;
  const rows = printData.value;
  
  if (cols.length === 0 || rows.length === 0) return;
  
  // BOM for UTF-8 Excel compatibility
  let csv = '\uFEFF';
  
  // Header row
  csv += cols.map(c => `"${c.label}"`).join(';') + '\n';
  
  // Data rows
  rows.forEach(row => {
    csv += cols.map(c => `"${(row[c.key] || '').toString().replace(/"/g, '""')}"`).join(';') + '\n';
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const tabNames = {
    monthly: 'havi_kiadas',
    yearly: 'eves_kiadas',
    halfyear: 'feleves_kiadas',
    inventory: 'keszlet_ertek'
  };
  link.download = `munyire_${tabNames[activeTab.value]}_${selectedYear.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

onMounted(() => {
  loading.value = true;
  Promise.all([
    fetchMonthlyExpenses(),
    fetchYearlyExpenses(),
    fetchHalfYearExpenses(),
    fetchInventoryValue()
  ]).finally(() => {
    loading.value = false;
  });
});
</script>

<template>
  <div class="reports-container">
    <!-- Header Card -->
    <div class="header-card">
      <h1 class="header-title">Jelentések</h1>
      <p class="header-subtitle">Statisztikák és kimutatások</p>
      <div class="header-actions">
        <button class="action-btn print-action" @click="openPrintPreview">
          <Printer size="18" />
          <span>Nyomtatás</span>
        </button>
        <button class="action-btn export-action" @click="exportCSV">
          <Download size="18" />
          <span>CSV Export</span>
        </button>
      </div>
    </div>

    <!-- Report Type Tabs -->
    <div class="tabs-container">
      <button 
        @click="setTab('monthly')" 
        class="tab-btn" 
        :class="{ active: activeTab === 'monthly' }"
      >
        <Calendar size="18" />
        <span>Havi kiadások</span>
      </button>
      <button 
        @click="setTab('yearly')" 
        class="tab-btn" 
        :class="{ active: activeTab === 'yearly' }"
      >
        <TrendingUp size="18" />
        <span>Éves kiadások</span>
      </button>
      <button 
        @click="setTab('halfyear')" 
        class="tab-btn" 
        :class="{ active: activeTab === 'halfyear' }"
      >
        <FileText size="18" />
        <span>Féléves kiadások</span>
      </button>
      <button 
        @click="setTab('inventory')" 
        class="tab-btn" 
        :class="{ active: activeTab === 'inventory' }"
      >
        <Package size="18" />
        <span>Készlet érték</span>
      </button>
    </div>

    <!-- Monthly Expenses Report -->
    <div v-if="activeTab === 'monthly'" class="report-section">
      <div class="report-card">
        <div class="report-header">
          <h2 class="report-title">Havi kiadások</h2>
          <div class="filters">
            <select v-model="selectedYear" @change="fetchMonthlyExpenses" class="filter-select">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <select v-model="selectedMonth" @change="fetchMonthlyExpenses" class="filter-select">
              <option v-for="(name, index) in monthNames" :key="index" :value="index + 1">{{ name }}</option>
            </select>
          </div>
        </div>

        <!-- Summary Card -->
        <div class="summary-card">
          <div class="summary-item total">
            <span class="summary-label">Összes kiadás</span>
            <span class="summary-value">{{ formatCurrency(monthlyData.totalExpense) }} Ft</span>
            <div class="expense-breakdown" v-if="monthlyData.issuedExpense || monthlyData.inventoryValue || monthlyData.pendingOrdersValue">
              <span class="breakdown-item">Kiadott: {{ formatCurrency(monthlyData.issuedExpense || 0) }} Ft</span>
              <span class="breakdown-item">Raktár: {{ formatCurrency(monthlyData.inventoryValue || 0) }} Ft</span>
              <span class="breakdown-item pending">Szállításban: {{ formatCurrency(monthlyData.pendingOrdersValue || 0) }} Ft</span>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-label">Tételszám</span>
            <span class="summary-value">{{ monthlyData.expenses.length }} db</span>
          </div>
        </div>

        <!-- Expenses Table -->
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Dátum</th>
                <th>Dolgozó</th>
                <th>Ruha fajta</th>
                <th>Mennyiség</th>
                <th>Egységár</th>
                <th>Összesen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in monthlyData.expenses" :key="index">
                <td>{{ formatDate(item.KiadasDatum) }}</td>
                <td>{{ item.DolgozoNev }}</td>
                <td>{{ item.Fajta }}</td>
                <td>{{ item.Mennyiseg }} db</td>
                <td>{{ formatCurrency(item.Ar) }} Ft</td>
                <td class="font-semibold">{{ formatCurrency(item.Total) }} Ft</td>
              </tr>
              <tr v-if="monthlyData.expenses.length === 0">
                <td colspan="6" class="empty-cell">Nincs adat a kiválasztott időszakra.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Yearly Expenses Report -->
    <div v-if="activeTab === 'yearly'" class="report-section">
      <div class="report-card">
        <div class="report-header">
          <h2 class="report-title">Éves kiadások</h2>
          <div class="filters">
            <select v-model="selectedYear" @change="fetchYearlyExpenses" class="filter-select">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>

        <!-- Summary Card -->
        <div class="summary-card">
          <div class="summary-item total">
            <span class="summary-label">Éves összes kiadás</span>
            <span class="summary-value">{{ formatCurrency(yearlyData.totalExpense) }} Ft</span>
            <div class="expense-breakdown" v-if="yearlyData.issuedExpense || yearlyData.inventoryValue || yearlyData.pendingOrdersValue">
              <span class="breakdown-item">Kiadott: {{ formatCurrency(yearlyData.issuedExpense || 0) }} Ft</span>
              <span class="breakdown-item">Raktár: {{ formatCurrency(yearlyData.inventoryValue || 0) }} Ft</span>
              <span class="breakdown-item pending">Szállításban: {{ formatCurrency(yearlyData.pendingOrdersValue || 0) }} Ft</span>
            </div>
          </div>
        </div>

        <!-- Monthly Breakdown Chart -->
        <div class="chart-container">
          <h3 class="chart-title">Havi bontás</h3>
          <div class="bar-chart">
            <div v-for="item in yearlyChartData" :key="item.month" class="bar-item">
              <div class="bar-wrapper">
                <div class="bar" :style="{ height: item.percentage + '%' }"></div>
              </div>
              <span class="bar-label">{{ item.month }}</span>
              <span class="bar-value">{{ formatCurrency(item.value) }} Ft</span>
            </div>
          </div>
        </div>

        <!-- Monthly Table -->
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Hónap</th>
                <th>Kiadás</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(name, index) in monthNames" :key="index">
                <td>{{ name }}</td>
                <td class="font-semibold">{{ formatCurrency(yearlyData.monthlyBreakdown[index + 1] || 0) }} Ft</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Half-Year Expenses Report -->
    <div v-if="activeTab === 'halfyear'" class="report-section">
      <div class="report-card">
        <div class="report-header">
          <h2 class="report-title">Féléves kiadások</h2>
          <div class="filters">
            <select v-model="selectedYear" @change="fetchHalfYearExpenses" class="filter-select">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <select v-model="selectedHalf" @change="fetchHalfYearExpenses" class="filter-select">
              <option :value="1">I. félév (Jan-Jún)</option>
              <option :value="2">II. félév (Júl-Dec)</option>
            </select>
          </div>
        </div>

        <!-- Summary Card -->
        <div class="summary-card">
          <div class="summary-item total">
            <span class="summary-label">Féléves összes kiadás</span>
            <span class="summary-value">{{ formatCurrency(halfYearData.totalExpense) }} Ft</span>
            <div class="expense-breakdown" v-if="halfYearData.issuedExpense || halfYearData.inventoryValue || halfYearData.pendingOrdersValue">
              <span class="breakdown-item">Kiadott: {{ formatCurrency(halfYearData.issuedExpense || 0) }} Ft</span>
              <span class="breakdown-item">Raktár: {{ formatCurrency(halfYearData.inventoryValue || 0) }} Ft</span>
              <span class="breakdown-item pending">Szállításban: {{ formatCurrency(halfYearData.pendingOrdersValue || 0) }} Ft</span>
            </div>
          </div>
        </div>

        <!-- Monthly Breakdown Chart -->
        <div class="chart-container">
          <h3 class="chart-title">Havi bontás</h3>
          <div class="bar-chart half-year">
            <div v-for="item in halfYearChartData" :key="item.month" class="bar-item">
              <div class="bar-wrapper">
                <div class="bar" :style="{ height: item.percentage + '%' }"></div>
              </div>
              <span class="bar-label">{{ item.month }}</span>
              <span class="bar-value">{{ formatCurrency(item.value) }} Ft</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inventory Value Report -->
    <div v-if="activeTab === 'inventory'" class="report-section">
      <div class="report-card">
        <div class="report-header">
          <h2 class="report-title">Készlet érték</h2>
        </div>

        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="summary-card large">
            <div class="summary-item total">
              <span class="summary-label">Teljes készlet érték</span>
              <span class="summary-value">{{ formatCurrency(inventoryData.totalValue) }} Ft</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-item">
              <span class="summary-label">Különböző tételek</span>
              <span class="summary-value">{{ inventoryData.itemCount }} db</span>
            </div>
          </div>
        </div>

        <!-- Type Breakdown Table -->
        <div class="table-wrapper">
          <h3 class="section-title">Érték fajtánként</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Fajta</th>
                <th>Mennyiség</th>
                <th>Érték</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="[type, data] in inventoryTypeList" :key="type">
                <td>{{ type }}</td>
                <td>{{ data.quantity }} db</td>
                <td class="font-semibold">{{ formatCurrency(data.value) }} Ft</td>
              </tr>
              <tr v-if="inventoryTypeList.length === 0">
                <td colspan="3" class="empty-cell">Nincs készlet adat.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Print Preview Modal -->
    <PrintTemplate
      :visible="showPrintPreview"
      :title="printTitle"
      :period="printPeriod"
      :columns="printColumns"
      :data="printData"
      :summary-value="printSummaryValue"
      :extra-summaries="printExtraSummaries"
      @close="closePrintPreview"
    />
  </div>
</template>

<style scoped>
.reports-container {
  padding: 12px 12px 12px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header Card */
.header-card {
  background-color: var(--color-surface);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: background-color 0.3s ease;
}

.header-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.025em;
  line-height: 1;
  transition: color 0.3s ease;
}

.header-subtitle {
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.print-action {
  background: #1e3a8a;
  color: white;
}

.print-action:hover {
  background: #1e40af;
  transform: translateY(-1px);
}

.export-action {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.export-action:hover {
  background: var(--color-surface);
  transform: translateY(-1px);
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  background: var(--color-surface);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.9375rem;
}

.tab-btn:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.tab-btn.active {
  background: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
}

/* Report Section */
.report-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.report-card {
  background: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  transition: background-color 0.3s ease;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.report-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.filters {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.9375rem;
  cursor: pointer;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Summary Card */
.summary-card {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.summary-card.large {
  flex: 1;
  min-width: 250px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-grid .summary-card {
  margin-bottom: 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-item.total {
  flex: 1;
}

.expense-breakdown {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.breakdown-item {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
}

.breakdown-item.pending {
  background: rgba(255, 193, 7, 0.2);
  color: rgba(255, 235, 59, 0.95);
}

.summary-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.summary-value {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
}

.summary-item.total .summary-value {
  font-size: 2.25rem;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  margin: -1rem;
  padding: 1rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.data-table th {
  background: var(--color-bg);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.data-table tr:hover td {
  background: var(--color-bg);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.font-semibold {
  font-weight: 600;
}

.empty-cell {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

.section-title {
  margin: 1.5rem 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Chart */
.chart-container {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: var(--color-bg);
  border-radius: 1.5rem;
}

.chart-title {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  gap: 0.5rem;
}

.bar-chart.half-year {
  justify-content: center;
  gap: 2rem;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 80px;
}

.bar-wrapper {
  width: 100%;
  height: 150px;
  background: var(--color-surface);
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;
}

.bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 0.5rem 0.5rem 0 0;
  transition: height 0.5s ease;
  min-height: 4px;
}

.bar-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.bar-value {
  font-size: 0.75rem;
  color: var(--color-text);
  text-align: center;
}

/* Tablet Breakpoint */
@media (max-width: 1024px) {
  .header-title {
    font-size: 3rem;
  }
  
  .header-subtitle {
    font-size: 1.25rem;
  }
  
  .tabs-container {
    gap: 0.5rem;
  }
  
  .tab-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
  .reports-container {
    padding: 8px;
    gap: 1rem;
  }
  
  .header-card {
    padding: 1.5rem 1rem;
    border-radius: 1.5rem;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .tabs-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tab-btn {
    width: 100%;
    justify-content: center;
  }
  
  .report-card {
    border-radius: 1.5rem;
    padding: 1rem;
  }
  
  .report-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filters {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .summary-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .summary-value {
    font-size: 1.5rem;
  }
  
  .summary-item.total .summary-value {
    font-size: 1.75rem;
  }
  
  .bar-chart {
    height: 150px;
  }
  
  .bar-wrapper {
    height: 100px;
  }
  
  .data-table {
    font-size: 0.875rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .header-title {
    font-size: 1.75rem;
  }
  
  .bar-item {
    max-width: 40px;
  }
  
  .bar-value {
    font-size: 0.625rem;
  }
  
  .bar-label {
    font-size: 0.625rem;
  }
}
</style>
