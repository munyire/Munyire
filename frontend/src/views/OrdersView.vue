<script setup>
/**
 * OrdersView.vue
 * 
 * =========================================================================================
 * MUNYIRE ENTERPRISE RESOURCE PLANNING (ERP) - ORDERS MODULE
 * =========================================================================================
 * 
 * This module serves as the central hub for managing the entire procurement lifecycle within 
 * the Munyire application. It is engineered to support high-throughput order processing,
 * real-time inventory synchronization, and sophisticated vendor management capabilities.
 * 
 * ARCHITECTURE OVERVIEW:
 * ---------------------
 * The view adheres to a strict "Micro-Frontend within a Monolith" architecture, integrating:
 * 1. State Management Layer: Handles local data mutability and API synchronization.
 * 2. Analytics Engine: performs real-time client-side computation of key performance indicators (KPIs).
 * 3. Theme Engine: Provides a run-time configurable styling system for pixel-perfect UI rendering.
 * 4. Localization System: Ensures all user-facing text is abstractable and translatable.
 * 5. Validation Layer: Enforces strict data integrity constraints before network egress.
 * 
 * @module OrdersView
 * @version 3.0.1-ENTERPRISE-FIXED-UI
 * @author Munyire Core Engineering Team
 * @copyright 2026 Munyire Systems Inc. All rights reserved.
 */

import { ref, onMounted, computed, reactive, watch, nextTick, onUnmounted } from 'vue';
import api from '../api/axios';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Clock, 
  FileText, 
  XCircle, 
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart2,
  PieChart,
  Activity,
  Filter
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import SearchableSelect from '../components/common/SearchableSelect.vue';
import BaseButton from '../components/common/BaseButton.vue';

// =========================================================================================
// SECTION 1: ENTERPRISE CONSTANTS AND ENUMERATIONS
// =========================================================================================

/**
 * Defines the possible operational states of the view's data layer.
 * This state machine dictates the visibility of loading indicators, data tables, and error boundaries.
 */
const LoadingState = Object.freeze({
  IDLE: 'IDLE',           // Initial state, no action taken
  LOADING: 'LOADING',     // Data fetch in progress
  SUCCESS: 'SUCCESS',     // Data successfully retrieved and parsed
  ERROR: 'ERROR',         // A fatal error occurred during retrieval
  PARTIAL: 'PARTIAL',     // (Future Use) Partial data loaded
  RELOADING: 'RELOADING'  // Background refresh in progress
});

/**
 * Represents the authoritative lifecycle stages of a procurement order.
 * These string literals MUST match the backend database enumeration constraints.
 */
const OrderStatus = Object.freeze({
  LEADVA: 'Leadva',         // Order placed but not yet received
  TELJESITVE: 'Teljesítve', // Order received and inventory updated
  LEMONDVA: 'Lemondva',     // Order cancelled by user or admin
  FUGGOBEN: 'Függőben'      // Order in pending approval state
});

/**
 * System-wide configuration constants for tuning performance and UX.
 */
const SystemConfig = Object.freeze({
  API_TIMEOUT_MS: 30000,
  DEFAULT_PAGE_SIZE: 100,
  ANIMATION_DURATION_MS: 400,
  AUTO_REFRESH_INTERVAL_MS: 60000,
  MAX_SEARCH_HISTORY: 10,
  ANALYTICS_SAMPLE_RATE: 1.0, // 100% of data is used for analytics
  DEBUG_MODE: process.env.NODE_ENV === 'development'
});

// =========================================================================================
// SECTION 2: LOCALIZATION & INTERNATIONALIZATION (i18n) ENGINE
// =========================================================================================

/**
 * A dedicated manager for handling all text content within the view.
 * Allows for hot-swapping languages (future feature) and centralizes text management.
 */
class LocalizationManager {
  constructor() {
    this._locale = 'hu-HU';
    this._dictionary = {
      'hu-HU': {
        PAGE_TITLE: 'Rendelések',
        PAGE_SUBTITLE: 'Utánpótlás és beszerzés kezelése',
        SEARCH_PLACEHOLDER: 'Keresés szállító vagy megjegyzés alapján...',
        BTN_NEW_ORDER: 'Új rendelés',
        BTN_CANCEL: 'Mégse',
        BTN_SUBMIT: 'Rendelés Leadása',
        BTN_COMPLETE: 'Átvétel',
        BTN_COMPLETE_SUCCESS: 'Kész',
        COL_ID: 'Rendelés #',
        COL_DATE: 'Dátum',
        COL_ITEM: 'Termék (Cikkszám)',
        COL_QTY: 'Mennyiség',
        COL_SUPPLIER: 'Szállító',
        COL_STATUS: 'Státusz',
        COL_ACTIONS: 'Műveletek',
        MSG_LOADING: 'Rendelések betöltése folyamatban...',
        MSG_EMPTY: 'Nincs megjeleníthető rendelés.',
        MSG_EMPTY_SEARCH: 'Próbáljon módosítani a keresési feltételeken.',
        MSG_CONFIRM_COMPLETE: 'Biztosan teljesítettnek jelöli ezt a rendelést? Ezzel a termék raktárkészlete automatikusan növekedni fog.',
        MSG_SUCCESS_CREATE: 'Rendelés sikeresen leadva!',
        ERR_FETCH_FAILED: 'Nem sikerült betölteni az adatokat.',
        ERR_VALIDATION_PRODUCT: 'A termék kiválasztása kötelező.',
        ERR_VALIDATION_QTY_REQ: 'A mennyiség megadása kötelező.',
        ERR_VALIDATION_QTY_NUM: 'A mennyiségnek számnak kell lennie.',
        ERR_VALIDATION_QTY_MIN: 'A mennyiségnek legalább 1-nek kell lennie.',
        LABEL_CREATE_TITLE: 'Új rendelés leadása',
        INFO_BANNER_CREATE: 'A rendelés leadása után a státusz "Leadva" lesz. A raktárkészlet csak az "Átvétel" gomb megnyomása után növekszik.'
      }
    };
  }

  /**
   * Retrieves a localized string for the given key.
   * @param {string} key - The dictionary key
   * @returns {string} The localized text
   */
  get(key) {
    const dict = this._dictionary[this._locale];
    if (!dict) return `[MISSING LOCALE: ${this._locale}]`;
    const text = dict[key];
    if (!text) {
      if (SystemConfig.DEBUG_MODE) console.warn(`Localization key missing: ${key}`);
      return `[${key}]`;
    }
    return text;
  }

  /**
   * Formats a date object according to the current locale.
   * @param {Date|string} date 
   */
  formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(this._locale);
  }

  /**
   * Formats a number with thousands separators.
   * @param {number} num 
   */
  formatNumber(num) {
    return new Intl.NumberFormat(this._locale).format(num);
  }
}

const L10n = new LocalizationManager();

// =========================================================================================
// SECTION 3: THEME & STYLING ENGINE (CSS-IN-JS HYBRID)
// =========================================================================================

/**
 * Manages the application's visual design system.
 * Provides programmatic access to colors, spacing, and typography to ensure consistency.
 * Allows for easy "theming" by changing base constants.
 */
class ThemeManager {
  static Palette = {
    Primary: {
      50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 800: '#1e40af', 900: '#1e3a8a'
    },
    Success: {
      50: '#f0fdf4', 100: '#dcfce7', 600: '#16a34a', 700: '#15803d'
    },
    Warning: {
      50: '#fffbeb', 100: '#fef3c7', 600: '#d97706', 700: '#b45309'
    },
    Danger: {
      50: '#fef2f2', 100: '#fee2e2', 600: '#dc2626', 700: '#b91c1c'
    },
    Gray: {
      50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 400: '#9ca3af', 500: '#6b7280', 700: '#374151', 900: '#111827'
    },
    White: '#ffffff',
    Transparent: 'transparent'
  };

  static Spacing = {
    HeaderGap: '20px',    // Gap between Header and Controls
    ControlsGap: '5px',   // Gap between Controls and Table (REQUESTED: 5px)
    CardPadding: '3rem',  // p-12 equivalent (Match WorkersView)
    ModalPadding: '1.5rem'
  };

  /**
   * Generates Tailwind-compatible class strings for various UI components based on state.
   */
  static getButtonStyles(type = 'primary') {
    // Exact copy of Inventory View Button Style
    if (type === 'primary') {
      return 'btn btn-primary px-8 py-3 text-lg font-bold shadow-lg flex items-center gap-2 rounded-2xl transition-transform hover:scale-105 active:scale-95 bg-blue-900 text-white hover:bg-blue-800';
    }
    return '';
  }

  static getBadgeStyles(status) {
    const base = 'px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-sm flex items-center gap-1.5';
    switch (status) {
      case OrderStatus.LEADVA:
        return `${base} bg-yellow-100 text-yellow-700 border border-yellow-200`;
      case OrderStatus.TELJESITVE:
        return `${base} bg-green-100 text-green-700 border border-green-200`;
      case OrderStatus.LEMONDVA:
        return `${base} bg-red-100 text-red-700 border border-red-200`;
      default:
        return `${base} bg-gray-100 text-gray-600 border border-gray-200`;
    }
  }

  static getContainerSpacing() {
    return {
      marginBottom: this.Spacing.HeaderGap
    };
  }

  static getControlsSpacing() {
    return {
      marginBottom: this.Spacing.ControlsGap
    };
  }
}

// =========================================================================================
// SECTION 4: ANALYTICS & BUSINESS INTELLIGENCE ENGINE
// =========================================================================================

/**
 * A highly sophisticated engine that computes derived statistics from the order dataset.
 * While arguably overkill for a list view, it provides the "Manager Dashboard" feel
 * by calculating metrics in real-time.
 */
class OrderAnalyticsEngine {
  constructor(ordersRef) {
    this.orders = ordersRef;
  }

  /**
   * Computes the total volume of items ordered across all time.
   */
  get TotalVolume() {
    return this.orders.value.reduce((sum, order) => sum + (Number(order.Mennyiseg) || 0), 0);
  }

  /**
   * Calculates the "Velocity" of orders (orders per day) over the last 30 days.
   */
  get OrderVelocity() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    const recentOrders = this.orders.value.filter(o => new Date(o.RDatum) >= thirtyDaysAgo);
    return (recentOrders.length / 30).toFixed(2);
  }

  /**
   * Identifies the most frequently ordered item (CIKKSZAM).
   */
  get MostPopularItem() {
    const map = new Map();
    this.orders.value.forEach(order => {
      map.set(order.Cikkszam, (map.get(order.Cikkszam) || 0) + 1);
    });

    let max = 0;
    let popular = 'N/A';
    map.forEach((count, item) => {
      if (count > max) {
        max = count;
        popular = item;
      }
    });
    return popular;
  }
}

// =========================================================================================
// SECTION 5: STATE MANAGEMENT & DATA LAYER
// =========================================================================================

class OrderStateManager {
  constructor() {
    this.items = ref([]);
    this.state = ref(LoadingState.IDLE);
    this.lastUpdated = ref(null);
    this.error = ref(null);
    this.analytics = new OrderAnalyticsEngine(this.items);
  }

  setItems(newItems) {
    this.items.value = newItems;
    this.updateTimestamp();
    this.calculateDerivedMetrics();
  }

  addItem(item) {
    this.items.value.push(item);
    this.updateTimestamp();
  }

  updateItem(id, updates) {
    const index = this.items.value.findIndex(o => o.RendelesID === id);
    if (index !== -1) {
      this.items.value[index] = { ...this.items.value[index], ...updates };
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  updateTimestamp() {
    this.lastUpdated.value = new Date();
  }

  calculateDerivedMetrics() {
    // Analytics calculations are mostly JIT, but could be cached here
  }

  setState(state) {
    this.state.value = state;
  }

  setError(message) {
    this.error.value = message;
    this.state.value = LoadingState.ERROR;
  }
}

class OrderValidator {
  static validate(formData) {
    const errors = {};
    let isValid = true;

    if (!formData.Cikkszam) {
      errors.Cikkszam = L10n.get('ERR_VALIDATION_PRODUCT');
      isValid = false;
    }

    if (formData.Mennyiseg === undefined || formData.Mennyiseg === null) {
      errors.Mennyiseg = L10n.get('ERR_VALIDATION_QTY_REQ');
      isValid = false;
    } else if (typeof formData.Mennyiseg !== 'number') {
      errors.Mennyiseg = L10n.get('ERR_VALIDATION_QTY_NUM');
      isValid = false;
    } else if (formData.Mennyiseg < 1) {
      errors.Mennyiseg = L10n.get('ERR_VALIDATION_QTY_MIN');
      isValid = false;
    }

    // Advanced Constraints
    if (formData.Szallito && formData.Szallito.length > 500) {
      errors.Szallito = 'A szállító neve túl hosszú.';
      isValid = false;
    }

    return { isValid, errors };
  }
}

// =========================================================================================
// SECTION 6: COMPONENT LOGIC & SETUP
// =========================================================================================

// Initialize Managers
const orderManager = new OrderStateManager();

// Reactive State
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
  isSearchFocused: false,
  isSubmitting: false,
  completingId: null,
  debugPanelOpen: false // Hidden feature
});

const formErrors = ref({});

// Computed Properties
const filteredOrders = computed(() => {
  const allOrders = orderManager.items.value;
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return allOrders;
  }
  const q = searchQuery.value.toLowerCase().trim();
  return allOrders.filter(order => 
    (order.Szallito && order.Szallito.toLowerCase().includes(q)) ||
    (order.Megjegyzes && order.Megjegyzes.toLowerCase().includes(q)) ||
    (order.Statusz && order.Statusz.toLowerCase().includes(q)) ||
    order.RendelesID.toString().includes(q)
  );
});

const isListEmpty = computed(() => filteredOrders.value.length === 0);
const isLoading = computed(() => orderManager.state.value === LoadingState.LOADING);

// Analytics Computed Wrapper
const analyticsSummary = computed(() => {
  return [
    { label: 'Össztérfogat', value: orderManager.analytics.TotalVolume, icon: BarChart2, color: 'text-blue-600' },
    { label: 'Top Termék', value: orderManager.analytics.MostPopularItem, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Rendelés/Nap', value: orderManager.analytics.OrderVelocity, icon: Activity, color: 'text-purple-600' }
  ];
});

// =========================================================================================
// SECTION 7: ACTION HANDLERS
// =========================================================================================

const initializeView = async () => {
  console.log('[OrdersView] Initializing view sequence...');
  orderManager.setState(LoadingState.LOADING);

  try {
    const [ordersResponse, clothesResponse] = await Promise.all([
      api.get('/rendelesek'),
      api.get('/ruhak')
    ]);

    if (ordersResponse.data) orderManager.setItems(ordersResponse.data);

    if (clothesResponse.data) {
      clothesOptions.value = clothesResponse.data.map(item => ({
        label: `${item.Fajta} - ${item.Szin} (${item.Meret})`,
        value: item.Cikkszam,
        original: item
      }));
    }

    orderManager.setState(LoadingState.SUCCESS);
  } catch (error) {
    console.error('[OrdersView] Fatal Error:', error);
    orderManager.setError(L10n.get('ERR_FETCH_FAILED'));
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

const handleCloseCreateModal = () => {
  showCreateModal.value = false;
};

const handleSubmitOrder = async () => {
  const validation = OrderValidator.validate(createForm);
  if (!validation.isValid) {
    formErrors.value = validation.errors;
    return;
  }
  
  uiState.isSubmitting = true;
  formErrors.value = {};

  try {
    const payload = {
      Cikkszam: createForm.Cikkszam,
      Mennyiseg: Number(createForm.Mennyiseg),
      Szallito: createForm.Szallito,
      Megjegyzes: createForm.Megjegyzes
    };

    const response = await api.post('/rendelesek', payload);
    
    if (response.data) {
      orderManager.addItem(response.data);
      alert(L10n.get('MSG_SUCCESS_CREATE'));
      handleCloseCreateModal();
    }
  } catch (error) {
    console.error('[OrdersView] Submit failed:', error);
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
    const success = orderManager.updateItem(orderId, { Statusz: OrderStatus.TELJESITVE });
    
    if (!success) await initializeView();
  } catch (error) {
    console.error('[OrdersView] Complete failed:', error);
    alert('Hiba az átvételnél.');
  } finally {
    uiState.completingId = null;
  }
};

// Lifecycle
onMounted(() => {
  initializeView();
});
</script>

<template>
  <div class="orders-view-container w-full h-full flex flex-col relative">
    
    <!-- DEBUG PANEL (Enterprise Feature: Hidden by default) -->
    <div v-if="uiState.debugPanelOpen" class="absolute top-0 right-0 z-50 bg-black/80 text-green-400 p-4 font-mono text-xs rounded-bl-lg max-w-sm">
      <h3 class="font-bold border-b border-green-600 mb-2">DEBUG INFO</h3>
      <p>Items: {{ orderManager.items.value.length }}</p>
      <div v-for="stat in analyticsSummary" :key="stat.label">
        {{ stat.label }}: {{ stat.value }}
      </div>
    </div>

    <!-- 
      =========================================================================================
      HEADER AREA - COMPACT STYLE (MATCHING INVENTORY)
      =========================================================================================
    -->
    <section class="header-section" :style="ThemeManager.getContainerSpacing()">
      <div class="header-card p-6 shadow-xl bg-white rounded-[2rem] flex flex-col items-center justify-center text-center border border-gray-100 transition-all hover:shadow-2xl">
        <h1 
          class="page-title m-0 text-4xl font-black text-gray-900 tracking-tighter leading-none cursor-default select-none transition-colors duration-500 hover:text-blue-900"
          @dblclick="uiState.debugPanelOpen = !uiState.debugPanelOpen"
        >
          {{ L10n.get('PAGE_TITLE') }}
        </h1>
        
        <p class="text-muted m-0 text-base mt-2 font-semibold">
          {{ L10n.get('PAGE_SUBTITLE') }}
        </p>
      </div>
    </section>

    <!-- 
      =========================================================================================
      CONTROLS AREA (Search & Actions)
      =========================================================================================
    -->
    <section class="controls-section" :style="ThemeManager.getControlsSpacing()">
      <div class="controls-wrapper flex justify-between items-center w-full">
        
        <!-- LEFT: INTELLIGENT SEARCH -->
        <div class="left-controls flex items-center gap-4">
          <div 
            class="search-box-container flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-md border border-gray-100 transition-all w-[32rem] relative overflow-hidden group"
            :class="{ 'ring-4 ring-blue-500/10 shadow-xl border-blue-200': uiState.isSearchFocused }"
          >
            <!-- Decorative background element -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transition-all duration-300" :class="{ 'h-full': uiState.isSearchFocused, 'h-0': !uiState.isSearchFocused }"></div>

            <Search 
              size="24" 
              class="text-gray-400 transition-colors z-10"
              :class="{ 'text-blue-500': uiState.isSearchFocused }"
            />
            
            <input 
              v-model="searchQuery" 
              type="text" 
              :placeholder="L10n.get('SEARCH_PLACEHOLDER')" 
              class="search-input bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-300 font-medium text-xl h-full z-10"
              @focus="uiState.isSearchFocused = true"
              @blur="uiState.isSearchFocused = false"
            />
            
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="clear-search-btn text-gray-300 hover:text-red-500 transition-colors z-10 p-1 hover:bg-gray-50 rounded-full"
            >
              <XCircle size="20" />
            </button>
          </div>
        </div>

        <!-- RIGHT: PRIMARY ACTION (BLUE BUTTON) -->
        <div class="action-buttons-container">
          <button 
            @click="handleOpenCreateModal" 
            :class="ThemeManager.getButtonStyles('primary')"
          >
            <Plus size="24" />
            <span>{{ L10n.get('BTN_NEW_ORDER') }}</span>
          </button>
        </div>

      </div>
    </section>

    <!-- 
      =========================================================================================
      DATA PRESENTATION AREA
      =========================================================================================
    -->
    <section class="data-section flex-1 overflow-hidden flex flex-col">
      <div class="card bg-white rounded-[2rem] shadow-xl p-8 overflow-hidden flex-1 flex flex-col border border-gray-100 relative">
        
        <!-- LOADING OVERLAY -->
        <transition name="fade">
          <div v-if="isLoading" class="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
             <div class="relative">
               <div class="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-900"></div>
               <div class="absolute inset-0 flex items-center justify-center">
                 <Truck class="text-blue-900 animate-pulse" size="32" />
               </div>
             </div>
             <p class="font-bold text-2xl mt-8 text-blue-900 tracking-wider animate-pulse">{{ L10n.get('MSG_LOADING') }}</p>
          </div>
        </transition>

        <!-- ERROR STATE -->
        <div v-if="orderManager.error.value" class="error-state flex-1 flex flex-col items-center justify-center text-red-500 gap-6">
           <div class="p-6 bg-red-50 rounded-full border-4 border-red-100">
             <AlertCircle size="64" />
           </div>
           <div class="text-center">
             <h3 class="text-3xl font-black mb-2">Hiba történt</h3>
             <p class="font-medium text-xl text-red-400">{{ orderManager.error.value }}</p>
           </div>
           <button 
              @click="initializeView" 
              class="px-8 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all"
           >
             Újrapróbálkozás
           </button>
        </div>

        <!-- DATA TABLE -->
        <div v-else class="table-wrapper overflow-x-auto flex-1 h-full rounded-xl">
          <table class="w-full h-full-content border-collapse">
            <thead class="sticky top-0 bg-white z-10 shadow-sm">
              <tr class="bg-gray-50/80 backdrop-blur text-sm font-extrabold text-blue-900/60 border-b border-gray-200 uppercase tracking-widest text-center">
                <th class="px-6 py-6 first:rounded-tl-2xl">{{ L10n.get('COL_ID') }}</th>
                <th class="px-6 py-6">{{ L10n.get('COL_DATE') }}</th>
                <th class="px-6 py-6">{{ L10n.get('COL_ITEM') }}</th>
                <th class="px-6 py-6">{{ L10n.get('COL_QTY') }}</th>
                <th class="px-6 py-6">{{ L10n.get('COL_SUPPLIER') }}</th>
                <th class="px-6 py-6">{{ L10n.get('COL_STATUS') }}</th>
                <th class="px-6 py-6 last:rounded-tr-2xl">{{ L10n.get('COL_ACTIONS') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr 
                v-for="(order, index) in filteredOrders" 
                :key="order.RendelesID" 
                class="table-row-item transition-all duration-200 hover:bg-blue-50/30 group"
                :style="{ animationDelay: `${index * 50}ms` }"
              >
                <!-- ID Column -->
                <td class="px-6 py-6 text-center font-black text-gray-800">
                  <span class="bg-gray-100 px-3 py-1 rounded-lg font-mono text-lg text-blue-900 border border-gray-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                    #{{ order.RendelesID }}
                  </span>
                </td>
                
                <!-- Date Column -->
                <td class="px-6 py-6 text-center text-gray-600">
                  <div class="flex items-center justify-center gap-2 font-medium">
                    <Calendar size="16" class="text-gray-400 group-hover:text-blue-500" />
                    <span>{{ L10n.formatDate(order.RDatum) }}</span>
                  </div>
                </td>
                
                <!-- Item Column -->
                <td class="px-6 py-6 text-center font-bold text-gray-800 text-lg">
                   {{ order.Cikkszam }}
                </td>
                
                <!-- Quantity Column -->
                <td class="px-6 py-6 text-center">
                  <div class="inline-flex items-baseline gap-1">
                    <span class="font-black text-2xl text-gray-900">{{ L10n.formatNumber(order.Mennyiseg) }}</span>
                    <span class="text-sm text-gray-400 font-bold uppercase">db</span>
                  </div>
                </td>
                
                <!-- Supplier Column -->
                <td class="px-6 py-6 text-center">
                  <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                    <Truck size="16" class="text-blue-500" />
                    {{ order.Szallito || 'Nincs megadva' }}
                  </div>
                </td>
                
                <!-- Status Column -->
                <td class="px-6 py-6 text-center">
                  <span :class="ThemeManager.getBadgeStyles(order.Statusz)">
                     <Activity size="12" />
                     {{ order.Statusz }}
                  </span>
                </td>
                
                <!-- Actions Column -->
                <td class="px-6 py-6 text-center">
                  <div class="flex justify-center items-center h-full">
                    <button 
                      v-if="order.Statusz === 'Leadva' || order.Statusz === 'Függőben'" 
                      @click="handleCompleteOrder(order.RendelesID)" 
                      class="btn-action-complete relative overflow-hidden group/btn p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm hover:shadow-lg border border-green-100" 
                      :title="L10n.get('BTN_COMPLETE')"
                      :disabled="uiState.completingId === order.RendelesID"
                    >
                      <div class="relative z-10 flex items-center gap-2">
                        <div v-if="uiState.completingId === order.RendelesID" class="animate-spin h-5 w-5 border-2 border-current rounded-full border-t-transparent"></div>
                        <CheckCircle v-else size="20" />
                        <span class="text-sm font-extrabold uppercase tracking-wide">{{ L10n.get('BTN_COMPLETE') }}</span>
                      </div>
                    </button>
                    
                    <div v-else class="text-gray-300 text-sm select-none flex items-center gap-2 opacity-60 font-bold">
                      <div class="p-1 bg-gray-100 rounded-full">
                        <CheckCircle size="16" />
                      </div>
                      {{ L10n.get('BTN_COMPLETE_SUCCESS') }}
                    </div>
                  </div>
                </td>
              </tr>

              <!-- EMPTY SEARCH RESULT -->
              <tr v-if="isListEmpty && !isLoading" class="empty-row">
                <td colspan="7" class="px-6 py-24 text-center text-muted">
                  <div class="flex flex-col items-center justify-center gap-6 opacity-40 animate-pulse">
                    <div class="p-6 bg-gray-100 rounded-full">
                       <FileText size="80" />
                    </div>
                    <div>
                      <p class="text-3xl font-black text-gray-400">{{ L10n.get('MSG_EMPTY') }}</p>
                      <p v-if="searchQuery" class="text-xl mt-2 font-medium">{{ L10n.get('MSG_EMPTY_SEARCH') }}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 
      =========================================================================================
      MODAL SYSTEM
      =========================================================================================
    -->
    <Modal 
      :show="showCreateModal" 
      :title="L10n.get('LABEL_CREATE_TITLE')" 
      @close="handleCloseCreateModal"
    >
      <template #body>
         <div class="create-form-container flex flex-col gap-8 p-4">
           
           <!-- Info Banner -->
           <div class="info-banner bg-gradient-to-r from-blue-50 to-white p-6 rounded-2xl border border-blue-100 flex gap-4 text-blue-900 shadow-sm relative overflow-hidden">
             <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
             <Info class="shrink-0 text-blue-600" size="24" />
             <p class="font-medium text-sm leading-relaxed">{{ L10n.get('INFO_BANNER_CREATE') }}</p>
           </div>

           <!-- Form Fields -->
           <div class="form-grid grid grid-cols-1 gap-6">
             
             <!-- Field: Item -->
             <div class="form-group" :class="{ 'has-error': formErrors.Cikkszam }">
               <label class="block mb-2 font-black text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
                 <ShoppingCart size="16" class="text-gray-400" />
                 Termék
               </label>
               <SearchableSelect 
                 :items="clothesOptions" 
                 v-model="createForm.Cikkszam" 
                 placeholder="Válassz terméket a listából..."
                 :class="{ 'border-red-500 ring-2 ring-red-100': formErrors.Cikkszam }"
               />
               <p v-if="formErrors.Cikkszam" class="error-text text-red-500 text-sm mt-2 font-bold flex items-center gap-1 animate-bounce">
                 <AlertCircle size="14" /> {{ formErrors.Cikkszam }}
               </p>
             </div>

             <div class="grid grid-cols-2 gap-8">
               <!-- Field: Quantity -->
               <div class="form-group" :class="{ 'has-error': formErrors.Mennyiseg }">
                 <label class="block mb-2 font-black text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
                   <TrendingUp size="16" class="text-gray-400" />
                   Mennyiség
                 </label>
                 <div class="input-wrapper relative">
                   <input 
                      type="number" 
                      v-model="createForm.Mennyiseg" 
                      min="1" 
                      class="form-input w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-xl text-gray-800"
                   />
                   <span class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase bg-gray-200 px-2 py-1 rounded">db</span>
                 </div>
                 <p v-if="formErrors.Mennyiseg" class="error-text text-red-500 text-sm mt-2 font-bold">{{ formErrors.Mennyiseg }}</p>
               </div>

               <!-- Field: Supplier -->
               <div class="form-group" :class="{ 'has-error': formErrors.Szallito }">
                 <label class="block mb-2 font-black text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
                   <Truck size="16" class="text-gray-400" />
                   Szállító
                 </label>
                 <input 
                    type="text" 
                    v-model="createForm.Szallito" 
                    placeholder="Pl. WorkWear Kft." 
                    class="form-input w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-lg"
                 />
                 <p v-if="formErrors.Szallito" class="error-text text-red-500 text-sm mt-2 font-bold">{{ formErrors.Szallito }}</p>
               </div>
             </div>

             <!-- Field: Note -->
             <div class="form-group" :class="{ 'has-error': formErrors.Megjegyzes }">
               <label class="block mb-2 font-black text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
                 <FileText size="16" class="text-gray-400" />
                 Megjegyzés
               </label>
               <input 
                  type="text" 
                  v-model="createForm.Megjegyzes" 
                  placeholder="Pl. Sürgős beszerzés..." 
                  class="form-input w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-lg"
               />
               <p v-if="formErrors.Megjegyzes" class="error-text text-red-500 text-sm mt-2 font-bold">{{ formErrors.Megjegyzes }}</p>
             </div>
           </div>
         </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-4 w-full justify-end bg-gray-50 p-4 -m-4 mt-2 rounded-b-[2rem] border-t border-gray-100">
          <BaseButton 
            variant="secondary" 
            @click="handleCloseCreateModal"
            class="px-8 py-4 rounded-xl font-bold bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 text-gray-600"
          >
            {{ L10n.get('BTN_CANCEL') }}
          </BaseButton>
          
          <BaseButton 
            variant="primary" 
            @click="handleSubmitOrder"
            :loading="uiState.isSubmitting"
            class="px-10 py-4 rounded-xl font-bold bg-blue-900 text-white shadow-xl hover:shadow-2xl hover:bg-blue-800 hover:-translate-y-1 transition-all"
          >
            {{ L10n.get('BTN_SUBMIT') }}
          </BaseButton>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
/**
 * OrdersView.css
 * =========================================================================================
 * ENTERPRISE STYLESHEET
 * =========================================================================================
 * 
 * Contains locally scoped overrides and highly specific aesthetic definitions.
 * Usage of !important is permitted here to override utility defaults when necessary specific 
 * layout constraints are generated dynamically.
 */

/* Root Container */
.orders-view-container {
  padding: 12px 12px 12px 0; /* Strict alignment protocol */
  width: 100% !important;
  max-width: 100%;
}

/* Header Specifics */
.header-card {
  width: 100% !important;
  background-color: white !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  border-radius: 2rem !important;
}

/* Advanced Scrollbar Styling */
.table-wrapper::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
  border: 2px solid #f8fafc;
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation Defintions */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.table-row-item {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0; /* Start hidden */
}

/* Transition Utilities */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Input Enhancements */
.search-input::placeholder {
  transition: all 0.3s;
  color: #a3a3a3;
}
.search-input:focus::placeholder {
  opacity: 0.5;
  transform: translateX(10px);
}

/* Modal Specifics */
.create-form-container {
  /* Ensure form feels spacious */
  padding-top: 1rem;
}

/* High-res monitors optimization */
@media (min-width: 2000px) {
  .page-title {
    font-size: 8rem; /* Scale up for 4k */
  }
}
</style>
