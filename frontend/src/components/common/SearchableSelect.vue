<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Válassz...'
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const searchQuery = ref('');
const containerRef = ref(null);
const isMobile = ref(false);

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('click', handleClickOutside);
});

const selectedLabel = computed(() => {
  if (!props.modelValue) return '';
  const found = props.items.find(i => i.value === props.modelValue);
  return found ? found.label : '';
});

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items;
  const q = searchQuery.value.toLowerCase();
  return props.items.filter(item => 
    item.label.toLowerCase().includes(q)
  );
});

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
  }
};

const selectItem = (item) => {
  emit('update:modelValue', item.value);
  emit('change', item);
  isOpen.value = false;
  searchQuery.value = '';
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};
</script>

<template>
  <div class="searchable-select" ref="containerRef">
    <label v-if="label" class="select-label">{{ label }}</label>
    
    <div 
      class="select-trigger" 
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }" 
      @click="toggleDropdown"
    >
      <span v-if="selectedLabel" class="selected-text">{{ selectedLabel }}</span>
      <span v-else class="placeholder">{{ placeholder }}</span>
      <span class="arrow" :class="{ 'is-open': isOpen }">▼</span>
    </div>

    <!-- Desktop Dropdown -->
    <div v-if="isOpen && !isMobile" class="dropdown-menu">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Keresés..." 
          @click.stop
          autocomplete="off"
        />
      </div>
      <ul class="options-list">
        <li 
          v-for="item in filteredItems" 
          :key="item.value" 
          @click="selectItem(item)"
          class="option-item"
          :class="{ 'is-selected': item.value === modelValue }"
        >
          {{ item.label }}
        </li>
        <li v-if="filteredItems.length === 0" class="no-results">
          Nincs találat.
        </li>
      </ul>
    </div>

    <!-- Mobile Bottom Sheet -->
    <div v-if="isOpen && isMobile" class="mobile-overlay" @click="closeDropdown">
      <div class="mobile-sheet" @click.stop>
        <div class="mobile-sheet-header">
          <span class="mobile-sheet-title">{{ placeholder }}</span>
          <button @click="closeDropdown" class="mobile-close-btn">✕</button>
        </div>
        <div class="mobile-search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Keresés..." 
            autocomplete="off"
            autofocus
          />
        </div>
        <ul class="mobile-options-list">
          <li 
            v-for="item in filteredItems" 
            :key="item.value" 
            @click="selectItem(item)"
            class="mobile-option-item"
            :class="{ 'is-selected': item.value === modelValue }"
          >
            <span class="option-text">{{ item.label }}</span>
            <span v-if="item.value === modelValue" class="check-mark">✓</span>
          </li>
          <li v-if="filteredItems.length === 0" class="mobile-no-results">
            Nincs találat.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9375rem;
}

.select-trigger {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--color-bg);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  min-height: 48px;
}

.select-trigger:hover:not(.is-disabled) {
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.select-trigger.is-open {
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.select-trigger.is-disabled {
  background-color: var(--color-bg);
  cursor: not-allowed;
  opacity: 0.7;
}

.placeholder {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.selected-text {
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5rem;
  line-height: 1.4;
}

.arrow {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.arrow.is-open {
  transform: rotate(180deg);
}

/* Desktop Dropdown */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
}

.search-box {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.search-box input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  outline: none;
  font-size: 0.9375rem;
  background: var(--color-bg);
  color: var(--color-text);
}

.search-box input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  outline: none;
}

.options-list {
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
  max-height: 240px;
  overflow-y: auto;
}

.option-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--color-text);
  font-size: 0.9375rem;
}

.option-item:hover {
  background-color: var(--color-bg);
}

.option-item.is-selected {
  background-color: var(--color-sidebar-active);
  color: var(--color-sidebar-active-text);
  font-weight: 600;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}

/* Mobile Bottom Sheet */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mobile-sheet {
  background: var(--color-surface);
  width: 100%;
  max-height: 70vh;
  border-radius: 1.25rem 1.25rem 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.mobile-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.mobile-sheet-title {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-text);
}

.mobile-close-btn {
  background: var(--color-bg);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.mobile-close-btn:hover {
  background: var(--color-sidebar-hover);
  color: var(--color-text);
}

.mobile-search-box {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.mobile-search-box input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  outline: none;
  font-size: 16px; /* Prevents zoom on iOS */
  background: var(--color-bg);
  color: var(--color-text);
}

.mobile-search-box input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  outline: none;
}

.mobile-options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.mobile-option-item {
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--color-text);
  font-size: 1rem;
  border-bottom: 1px solid var(--color-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-option-item:last-child {
  border-bottom: none;
}

.mobile-option-item:hover,
.mobile-option-item.is-selected {
  background-color: var(--color-bg);
}

.mobile-option-item.is-selected {
  color: var(--color-primary);
  font-weight: 600;
}

.option-text {
  flex: 1;
  padding-right: 0.5rem;
}

.check-mark {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 1.125rem;
}

.mobile-no-results {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}

/* Scrollbar styling */
.options-list::-webkit-scrollbar,
.mobile-options-list::-webkit-scrollbar {
  width: 6px;
}

.options-list::-webkit-scrollbar-thumb,
.mobile-options-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

/* Mobile adjustments for the trigger */
@media (max-width: 768px) {
  .select-trigger {
    padding: 0.75rem 1rem;
    min-height: 44px;
  }
  
  .placeholder,
  .selected-text {
    font-size: 0.9375rem;
  }
}
</style>
