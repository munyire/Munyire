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
      'MSG_CONFIRM_CANCEL': 'Biztosan lemondja ezt a rendelést?',
      'BTN_CANCEL_ORDER': 'Lemondás',
      'MSG_SUCCESS_CANCEL': 'Rendelés sikeresen lemondva!',
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
    return 'btn btn-primary new-order-btn flex items-center gap-2 bg-blue-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all';
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
const showConfirmModal = ref(false);
const orderToComplete = ref(null);
const showCancelModal = ref(false);
const orderToCancel = ref(null);
const showMessageModal = ref(false);
const messageModalType = ref('success'); // 'success' | 'error'
const messageModalText = ref('');

const createForm = reactive({
  Cikkszam: null,
  Mennyiseg: 10,
  Szallito: 'WorkWear Kft.',
  Megjegyzes: ''
});

const uiState = reactive({
  isSubmitting: false,
  completingId: null,
  cancellingId: null,
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
      messageModalText.value = L10n.get('MSG_SUCCESS_CREATE');
      messageModalType.value = 'success';
      showMessageModal.value = true;
      showCreateModal.value = false;
    }
  } catch (error) {
    console.error('Submit failed:', error);
    messageModalText.value = 'Hiba: ' + (error.response?.data?.message || 'Ismeretlen hiba');
    messageModalType.value = 'error';
    showMessageModal.value = true;
  } finally {
    uiState.isSubmitting = false;
  }
};

const handleOpenConfirmModal = (orderId) => {
  orderToComplete.value = orderId;
  showConfirmModal.value = true;
};

const handleConfirmComplete = async () => {
  if (!orderToComplete.value) return;

  uiState.completingId = orderToComplete.value;
  showConfirmModal.value = false;

  try {
    await api.patch(`/rendelesek/${orderToComplete.value}/complete`);
    const order = items.value.find(o => o.RendelesID === orderToComplete.value);
    if (order) order.Statusz = OrderStatus.TELJESITVE;
  } catch (error) {
    console.error('Complete failed:', error);
    messageModalText.value = 'Hiba az átvételnél.';
    messageModalType.value = 'error';
    showMessageModal.value = true;
  } finally {
    uiState.completingId = null;
    orderToComplete.value = null;
  }
};

const handleOpenCancelModal = (orderId) => {
  orderToCancel.value = orderId;
  showCancelModal.value = true;
};

const handleConfirmCancel = async () => {
  if (!orderToCancel.value) return;

  uiState.cancellingId = orderToCancel.value;
  showCancelModal.value = false;

  try {
    await api.patch(`/rendelesek/${orderToCancel.value}/cancel`);
    const order = items.value.find(o => o.RendelesID === orderToCancel.value);
    if (order) order.Statusz = OrderStatus.LEMONDVA;
    messageModalText.value = L10n.get('MSG_SUCCESS_CANCEL');
    messageModalType.value = 'success';
    showMessageModal.value = true;
  } catch (error) {
    console.error('Cancel failed:', error);
    messageModalText.value = 'Hiba a lemondás során.';
    messageModalType.value = 'error';
    showMessageModal.value = true;
  } finally {
    uiState.cancellingId = null;
    orderToCancel.value = null;
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
                <th>Megjegyzés</th>
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
                <td class="font-medium">
                  <template v-if="order.Ruha">
                    {{ order.Ruha.Fajta }} - {{ order.Ruha.Szin }} ({{ order.Ruha.Meret }})
                  </template>
                  <template v-else>
                    {{ order.Cikkszam }}
                  </template>
                </td>
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
                  <span class="megjegyzes">{{ order.Megjegyzes || '-' }}</span>
                </td>
                <td>
                  <span :class="ThemeManager.getBadgeStyles(order.Statusz)">
                    {{ order.Statusz }}
                  </span>
                </td>
                <td class="actions-col">
                  <div class="action-buttons">
                    <button 
                      v-if="order.Statusz === 'Leadva'" 
                      @click="handleOpenConfirmModal(order.RendelesID)" 
                      class="btn-complete"
                      :disabled="uiState.completingId === order.RendelesID"
                    >
                      <div v-if="uiState.completingId === order.RendelesID" class="btn-spinner"></div>
                      <CheckCircle v-else size="16" />
                      <span>{{ L10n.get('BTN_COMPLETE') }}</span>
                    </button>
                    <button 
                      v-if="order.Statusz === 'Leadva'" 
                      @click="handleOpenCancelModal(order.RendelesID)" 
                      class="btn-cancel-order"
                      :disabled="uiState.cancellingId === order.RendelesID"
                    >
                      <div v-if="uiState.cancellingId === order.RendelesID" class="btn-spinner"></div>
                      <XCircle v-else size="16" />
                      <span>{{ L10n.get('BTN_CANCEL_ORDER') }}</span>
                    </button>
                    <span v-if="order.Statusz === 'Teljesítve'" class="status-done">
                      <CheckCircle size="14" />
                      {{ L10n.get('BTN_COMPLETE_SUCCESS') }}
                    </span>
                    <span v-if="order.Statusz === 'Lemondva'" class="status-cancelled">
                      <XCircle size="14" />
                      Lemondva
                    </span>
                  </div>
                </td>
              </tr>

              <tr v-if="isListEmpty && !isLoading">
                <td colspan="8" class="empty-cell">
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

    <!-- Confirm Modal -->
    <Modal 
      :show="showConfirmModal" 
      title="Rendelés lezárása" 
      @close="showConfirmModal = false"
    >
      <template #body>
        <div class="confirm-content">
          <div class="confirm-icon-wrapper">
             <AlertCircle size="48" class="text-amber-500" />
          </div>
          <p class="confirm-title">{{ L10n.get('MSG_CONFIRM_COMPLETE') }}</p>
          <p class="confirm-subtitle">A készlet automatikusan növekedni fog a megadott mennyiséggel.</p>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showConfirmModal = false">
            {{ L10n.get('BTN_CANCEL') }}
          </button>
          <button 
            class="btn-primary btn-confirm" 
            @click="handleConfirmComplete"
            :disabled="uiState.completingId === orderToComplete"
          >
            <div v-if="uiState.completingId === orderToComplete" class="btn-spinner"></div>
            <span v-else>{{ L10n.get('BTN_COMPLETE') }}</span>
          </button>
        </div>
      </template>
    </Modal>

    <!-- Cancel Modal -->
    <Modal 
      :show="showCancelModal" 
      title="Rendelés lemondása" 
      @close="showCancelModal = false"
    >
      <template #body>
        <div class="confirm-content">
          <div class="confirm-icon-wrapper" style="background: #fee2e2; color: #dc2626;">
             <XCircle size="48" />
          </div>
          <p class="confirm-title">{{ L10n.get('MSG_CONFIRM_CANCEL') }}</p>
          <p class="confirm-subtitle">A lemondott rendelés nem állítható vissza és nem teljesíthető.</p>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCancelModal = false">
            {{ L10n.get('BTN_CANCEL') }}
          </button>
          <button 
            class="btn-danger" 
            @click="handleConfirmCancel"
            :disabled="uiState.cancellingId === orderToCancel"
          >
            <div v-if="uiState.cancellingId === orderToCancel" class="btn-spinner"></div>
            <span v-else>{{ L10n.get('BTN_CANCEL_ORDER') }}</span>
          </button>
        </div>
      </template>
    </Modal>

    <!-- Message Modal (Success/Error) -->
    <Modal 
      :show="showMessageModal" 
      :title="messageModalType === 'success' ? 'Sikeresen' : 'Hiba'" 
      @close="showMessageModal = false"
    >
      <template #body>
        <p>{{ messageModalText }}</p>
      </template>
      <template #footer>
        <button class="btn-primary" @click="showMessageModal = false">Rendben</button>
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
  background: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s ease;
}

.page-title {
  font-size: 3rem;
  font-weight: 900;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.025em;
  transition: color 0.3s ease;
}

.page-subtitle {
  color: var(--color-text-muted);
  margin: 0.5rem 0 0;
  font-size: 1.125rem;
  font-weight: 500;
  transition: color 0.3s ease;
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
  background: var(--color-surface);
  border-radius: 1rem;
  padding: 0.75rem 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  flex: 1;
  max-width: 450px;
  position: relative;
  height: 52px;
  box-sizing: border-box;
}

.search-box:focus-within {
  border-color: var(--color-primary);
}

.search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.9375rem;
  color: var(--color-text);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
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
  background: rgba(239, 68, 68, 0.1);
}

.new-order-btn {
  padding: 0.75rem 1.5rem;
  height: 52px;
  box-sizing: border-box;
  white-space: nowrap;
}


/* Data Section */
.data-card {
  background: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  min-height: 400px;
  transition: background-color 0.3s ease;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
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
  color: #ef4444;
  text-align: center;
}

.error-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.error-state p {
  color: var(--color-text-muted);
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
  background: var(--color-bg);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.data-table tr:hover td {
  background: var(--color-bg);
}

.order-id {
  background: var(--color-bg);
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
}

.font-medium {
  font-weight: 500;
}

.qty {
  font-weight: 700;
  color: var(--color-text);
}

.supplier-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
}

.actions-col {
  text-align: right;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
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
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.status-cancelled {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-cancel-order {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  color: #dc2626;
  padding: 0.5rem 1rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #fecaca;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-order:hover:not(:disabled) {
  background: #dc2626;
  color: white;
}

.btn-cancel-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  padding: 0.625rem 1.5rem;
  border-radius: 0.625rem;
  background: #dc2626;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.megjegyzes {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-style: italic;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.empty-cell {
  text-align: center;
  padding: 4rem;
  color: var(--color-text-muted);
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
  background: var(--color-sidebar-active);
  padding: 1rem;
  border-radius: 0.75rem;
  border-left: 4px solid var(--color-primary);
  color: var(--color-sidebar-active-text);
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
  color: var(--color-text);
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.9375rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: all 0.2s;
  width: 100%;
}

.form-input:focus {
  outline: none;
  background: var(--color-surface);
  border-color: var(--color-primary);
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
  color: var(--color-text-muted);
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
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: 600;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-secondary:hover {
  background: var(--color-sidebar-hover);
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


/* Confirm Modal */
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 0;
}

.confirm-icon-wrapper {
  background: #fef3c7;
  color: #d97706;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.confirm-subtitle {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.5;
  max-width: 300px;
}

.btn-confirm {
  background-color: #16a34a !important;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #15803d !important;
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
