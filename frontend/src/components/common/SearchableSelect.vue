<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
    // Expected format: [{ label: 'Display Name', value: 1, ... }]
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
    searchQuery.value = ''; // Reset search on open
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

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="searchable-select" ref="containerRef">
    <label v-if="label" class="select-label">{{ label }}</label>
    
    <div class="select-trigger" :class="{ 'is-open': isOpen, 'is-disabled': disabled }" @click="toggleDropdown">
      <span v-if="selectedLabel" class="selected-text">{{ selectedLabel }}</span>
      <span v-else class="placeholder">{{ placeholder }}</span>
      <span class="arrow">▼</span>
    </div>

    <div v-if="isOpen" class="dropdown-menu">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Keresés..." 
          ref="searchInput"
          @click.stop
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
  </div>
</template>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
  font-family: 'Inter', sans-serif;
  margin-bottom: 1rem;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.select-trigger {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  min-height: 42px;
}

.select-trigger:hover:not(.is-disabled) {
  border-color: #3b82f6;
}

.select-trigger.is-open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-trigger.is-disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.placeholder {
  color: #9ca3af;
}

.selected-text {
  color: #111827;
  font-weight: 500;
}

.arrow {
  font-size: 0.8rem;
  color: #6b7280;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  overflow: hidden;
}

.search-box {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-box input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
  font-size: 0.9rem;
}

.search-box input:focus {
  border-color: #3b82f6;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.option-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.1s;
  color: #374151;
}

.option-item:hover {
  background-color: #f3f4f6;
}

.option-item.is-selected {
  background-color: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}
</style>
