<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger, outline
    validator: (value) => ['primary', 'secondary', 'danger', 'outline'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: Boolean,
  loading: Boolean
});
</script>

<template>
  <button 
    :type="type" 
    class="base-button" 
    :class="[`variant-${variant}`, { 'is-loading': loading, 'is-disabled': disabled }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner">↻</span>
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}

.base-button:active {
  transform: translateY(1px);
}

/* Primary */
.variant-primary {
  background-color: #3b82f6;
  color: white;
}
.variant-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

/* Secondary */
.variant-secondary {
  background-color: #6b7280;
  color: white;
}
.variant-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

/* Danger */
.variant-danger {
  background-color: #ef4444;
  color: white;
}
.variant-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

/* Outline */
.variant-outline {
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
}
.variant-outline:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

/* Disabled State */
.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
