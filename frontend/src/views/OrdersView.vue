<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import api from '../api/axios';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Calendar,
  FileText,
  XCircle,
  Info,
  TrendingUp,
  Activity,
  Filter
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import SearchableSelect from '../components/common/SearchableSelect.vue';
import BaseButton from '../components/common/BaseButton.vue';

const LoadingState = Object.freeze({
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
});

const OrderStatus = Object.freeze({
  LEADVA: 'Leadva',
  TELJESITVE: 'Teljesítve',
  LEMONDVA: 'Lemondva',
});

const L10n = {
  get(key) {
    const dict = {
      'PAGE_TITLE': 'Rendelések',
      'PAGE_SUBTITLE': 'Utánpótlás és beszerzés kezelése',
      'SEARCH_PLACEHOLDER': 'Keresés szállító vagy megjegyzés alapján...',
      'BTN_NEW_ORDER': 'Új rendelés',
      'BTN_CANCEL': 'Mégse',
      'BTN_SUBMIT': 'Rendelés Leadása',
      'BTN_COMPLETE': 'Átvétel',
      'BTN_COMPLETE_SUCCESS': 'Kész',
      'COL_ID': 'Rendelés #',
      'COL_DATE': 'Dátum',
      'COL_ITEM': 'Termék',
      'COL_QTY': 'Mennyiség',
      'COL_SUPPLIER': 'Szállító',
      'COL_STATUS': 'Státusz',
      'COL_ACTIONS': 'Műveletek',
      'MSG_LOADING': 'Rendelések betöltése...',
      'MSG_EMPTY': 'Nincs megjeleníthető rendelés.',
      'MSG_CONFIRM_COMPLETE': 'Biztosan teljesítettnek jelöli ezt a rendelést?',
      'MSG_SUCCESS_CREATE': 'Rendelés sikeresen leadva!',
      'ERR_FETCH_FAILED': 'Nem sikerült betölteni az adatokat.',
    };
    return dict[key] || key;
  },
  formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('hu-HU');
  },
  formatNumber(num) {
    return new Intl.NumberFormat('hu-HU').format(num);
  }
};

class ThemeManager {
  static getButtonStyles() {
    return 'btn btn-primary flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all';
  }

  static getBadgeStyles(status) {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case OrderStatus.LEADVA:
        return `${base} bg-yellow-100 text-yellow-700`;
      case OrderStatus.TELJESITVE:
        return `${base} bg-green-100 text-green-700`;
      case OrderStatus.LEMONDVA:
        return `${base} bg-red-100 text-red-700`;
      default:
        return `${base} bg-gray-100 text-gray-600`;
    }
  }
}

const items = ref([]);
const state = ref(LoadingState.IDLE);
const error = ref(null);

const searchQuery = ref('');
const clothesOptions = ref([]); 
const showCreateModal = ref(false);

const createForm = reactive({
  Cikkszam: null,
  Mennyiseg: 10,
  Szallito: 'WorkWear Kft.',
  Megjegyzes: ''
});

const uiState = reactive({
  isSubmitting: false,
  completingId: null,
});

const formErrors = ref({});

const filteredOrders = computed(() => {
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return items.value;
  }
  const q = searchQuery.value.toLowerCase().trim();
  return items.value.filter(order => 
    (order.Szallito && order.Szallito.toLowerCase().includes(q)) ||
    (order.Megjegyzes && order.Megjegyzes.toLowerCase().includes(q)) ||
    order.RendelesID.toString().includes(q)
  );
});

const isListEmpty = computed(() => filteredOrders.value.length === 0);
const isLoading = computed(() => state.value === LoadingState.LOADING);

const initializeView = async () => {
  state.value = LoadingState.LOADING;
  try {
    const [ordersResponse, clothesResponse] = await Promise.all([
      api.get('/rendelesek'),
      api.get('/ruhak')
    ]);

    if (ordersResponse.data) items.value = ordersResponse.data;

    if (clothesResponse.data) {
      clothesOptions.value = clothesResponse.data.map(item => ({
        label: `${item.Fajta} - ${item.Szin} (${item.Meret})`,
        value: item.Cikkszam,
      }));
    }

    state.value = LoadingState.SUCCESS;
  } catch (err) {
    console.error('Error:', err);
    error.value = L10n.get('ERR_FETCH_FAILED');
    state.value = LoadingState.ERROR;
  }
};

const handleOpenCreateModal = () => {
  Object.assign(createForm, {
    Cikkszam: null,
    Mennyiseg: 10,
    Szallito: 'WorkWear Kft.',
    Megjegyzes: ''
  });
  formErrors.value = {};
  showCreateModal.value = true;
};

const handleSubmitOrder = async () => {
  uiState.isSubmitting = true;
  try {
    const payload = {
      Cikkszam: createForm.Cikkszam,
      Mennyiseg: Number(createForm.Mennyiseg),
      Szallito: createForm.Szallito,
      Megjegyzes: createForm.Megjegyzes
    };

    const response = await api.post('/rendelesek', payload);
    
    if (response.data) {
      items.value.push(response.data);
      alert(L10n.get('MSG_SUCCESS_CREATE'));
      showCreateModal.value = false;
    }
  } catch (error) {
    console.error('Submit failed:', error);
    alert('Hiba: ' + (error.response?.data?.message || 'Ismeretlen hiba'));
  } finally {
    uiState.isSubmitting = false;
  }
};

const handleCompleteOrder = async (orderId) => {
  if (!confirm(L10n.get('MSG_CONFIRM_COMPLETE'))) return;

  uiState.completingId = orderId;

  try {
    await api.patch(`/rendelesek/${orderId}/complete`);
    const order = items.value.find(o => o.RendelesID === orderId);
    if (order) order.Statusz = OrderStatus.TELJESITVE;
  } catch (error) {
    console.error('Complete failed:', error);
    alert('Hiba az átvételnél.');
  } finally {
    uiState.completingId = null;
  }
};

onMounted(() => {
  initializeView();
});
</script>

<template>
  <div class="orders-container">
    <!-- Header -->
    <section class="header-section">
      <div class="header-card">
        <h1 class="page-title">{{ L10n.get('PAGE_TITLE') }}</h1>
        <p class="page-subtitle">{{ L10n.get('PAGE_SUBTITLE') }}</p>
      </div>
    </section>

    <!-- Controls -->
    <section class="controls-section">
      <div class="controls-wrapper">
        <div class="search-box">
          <Search size="20" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="L10n.get('SEARCH_PLACEHOLDER')" 
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
            <XCircle size="18" />
          </button>
        </div>

        <button @click="handleOpenCreateModal" :class="ThemeManager.getButtonStyles()">
          <Plus size="20" />
          <span>{{ L10n.get('BTN_NEW_ORDER') }}</span>
        </button>
      </div>
    </section>

    <!-- Data Table -->
    <section class="data-section">
      <div class="data-card">
        <!-- Loading -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ L10n.get('MSG_LOADING') }}</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-state">
          <AlertCircle size="48" />
          <h3>Hiba történt</h3>
          <p>{{ error }}</p>
          <button @click="initializeView" class="btn-retry">Újrapróbálkozás</button>
        </div>

        <!-- Table -->
        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ L10n.get('COL_ID') }}</th>
                <th>{{ L10n.get('COL_DATE') }}</th>
                <th>{{ L10n.get('COL_ITEM') }}</th>
                <th>{{ L10n.get('COL_QTY') }}</th>
                <th>{{ L10n.get('COL_SUPPLIER') }}</th>
                <th>{{ L10n.get('COL_STATUS') }}</th>
                <th class="actions-col">{{ L10n.get('COL_ACTIONS') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.RendelesID">
                <td>
                  <span class="order-id">#{{ order.RendelesID }}</span>
                </td>
                <td>
                  <div class="date-cell">
                    <Calendar size="14" />
                    <span>{{ L10n.formatDate(order.RDatum) }}</span>
                  </div>
                </td>
                <td class="font-medium">{{ order.Cikkszam }}</td>
                <td>
                  <span class="qty">{{ L10n.formatNumber(order.Mennyiseg) }} db</span>
                </td>
                <td>
                  <div class="supplier-cell">
                    <Truck size="14" />
                    <span>{{ order.Szallito || 'Nincs megadva' }}</span>
                  </div>
                </td>
                <td>
                  <span :class="ThemeManager.getBadgeStyles(order.Statusz)">
                    {{ order.Statusz }}
                  </span>
                </td>
                <td class="actions-col">
                  <button 
                    v-if="order.Statusz === 'Leadva'" 
                    @click="handleCompleteOrder(order.RendelesID)" 
                    class="btn-complete"
                    :disabled="uiState.completingId === order.RendelesID"
                  >
                    <div v-if="uiState.completingId === order.RendelesID" class="btn-spinner"></div>
                    <CheckCircle v-else size="16" />
                    <span>{{ L10n.get('BTN_COMPLETE') }}</span>
                  </button>
                  <span v-else class="status-done">
                    <CheckCircle size="14" />
                    {{ L10n.get('BTN_COMPLETE_SUCCESS') }}
                  </span>
                </td>
              </tr>

              <tr v-if="isListEmpty && !isLoading">
                <td colspan="7" class="empty-cell">
                  <FileText size="48" />
                  <p>{{ L10n.get('MSG_EMPTY') }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Create Modal -->
    <Modal 
      :show="showCreateModal" 
      :title="L10n.get('BTN_NEW_ORDER')" 
      @close="showCreateModal = false"
    >
      <template #body>
        <div class="create-form">
          <div class="info-banner">
            <Info size="20" />
            <p>A rendelés leadása után a státusz "Leadva" lesz. A raktárkészlet csak az "Átvétel" gomb megnyomása után növekszik.</p>
          </div>

          <div class="form-group">
            <label class="form-label">
              <ShoppingCart size="16" />
              Termék
            </label>
            <SearchableSelect 
              :items="clothesOptions" 
              v-model="createForm.Cikkszam" 
              placeholder="Válassz terméket..."
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <TrendingUp size="16" />
                Mennyiség
              </label>
              <div class="input-with-unit">
                <input type="number" v-model="createForm.Mennyiseg" min="1" class="form-input" />
                <span class="unit">db</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <Truck size="16" />
                Szállító
              </label>
              <input type="text" v-model="createForm.Szallito" placeholder="Pl. WorkWear Kft." class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <FileText size="16" />
              Megjegyzés
            </label>
            <input type="text" v-model="createForm.Megjegyzes" placeholder="Pl. Sürgős beszerzés..." class="form-input" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateModal = false">
            {{ L10n.get('BTN_CANCEL') }}
          </button>
          <button 
            class="btn-primary" 
            @click="handleSubmitOrder"
            :disabled="uiState.isSubmitting"
          >
            {{ L10n.get('BTN_SUBMIT') }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.orders-container {
  padding: 12px 12px 12px 0;
  width: 100%;
}

/* Header */
.header-card {
  background: white;
  border-radius: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 900;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;
}

.page-subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0;
  font-size: 1.125rem;
  font-weight: 500;
}

/* Controls */
.controls-section {
  margin-bottom: 1.5rem;
}

.controls-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border-radius: 1rem;
  padding: 0.875rem 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  flex: 1;
  max-width: 450px;
  position: relative;
}

.search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.9375rem;
  color: #374151;
}

.clear-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: #ef4444;
  background: #fef2f2;
}

/* Data Section */
.data-card {
  background: white;
  border-radius: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  min-height: 400px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #1e3a8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: #dc2626;
  text-align: center;
}

.error-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.error-state p {
  color: #6b7280;
  margin: 0;
}

.btn-retry {
  background: #dc2626;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #b91c1c;
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
  background: #f9fafb;
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.data-table tr:hover td {
  background: #f9fafb;
}

.order-id {
  background: #f3f4f6;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.font-medium {
  font-weight: 500;
}

.qty {
  font-weight: 700;
  color: #111827;
}

.supplier-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.actions-col {
  text-align: right;
  white-space: nowrap;
}

.btn-complete {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.5rem 1rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #bbf7d0;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-complete:hover:not(:disabled) {
  background: #16a34a;
  color: white;
}

.btn-complete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.status-done {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
}

.empty-cell {
  text-align: center;
  padding: 4rem;
  color: #9ca3af;
}

.empty-cell svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Create Form */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-banner {
  display: flex;
  gap: 0.75rem;
  background: #eff6ff;
  padding: 1rem;
  border-radius: 0.75rem;
  border-left: 4px solid #1e40af;
  color: #1e40af;
  font-size: 0.875rem;
}

.info-banner svg {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-banner p {
  margin: 0;
  line-height: 1.5;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  font-size: 0.9375rem;
  background: #f9fafb;
  transition: all 0.2s;
  width: 100%;
}

.form-input:focus {
  outline: none;
  background: white;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.input-with-unit {
  position: relative;
}

.input-with-unit .form-input {
  padding-right: 3rem;
}

.unit {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 0.625rem;
  background: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  border-radius: 0.625rem;
  background: #1e3a8a;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tablet */
@media (max-width: 1024px) {
  .page-title {
    font-size: 2.5rem;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .orders-container {
    padding: 8px;
  }
  
  .header-card {
    padding: 1.5rem 1rem;
    border-radius: 1.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 0.9375rem;
  }
  
  .controls-wrapper {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-box {
    max-width: none;
    width: 100%;
    padding: 0.75rem 1rem;
  }
  
  .data-card {
    padding: 1rem;
    border-radius: 1.5rem;
  }
  
  .table-wrapper {
    margin: -0.5rem;
    padding: 0.5rem;
  }
  
  .data-table {
    min-width: 800px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .modal-footer button {
    width: 100%;
    justify-content: center;
  }
}
</style>
