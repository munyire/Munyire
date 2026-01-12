<script setup>
import { X } from 'lucide-vue-next';

defineProps({
  show: Boolean,
  title: String
});

defineEmits(['close']);
</script>

<template>
  <transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-wrapper" @click.self="$emit('close')">
        <div class="modal-container glass-panel">
          <div class="modal-header flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold m-0">{{ title }}</h3>
            <button @click="$emit('close')" class="close-btn p-1 rounded hover:bg-gray-100">
              <X size="20" />
            </button>
          </div>

          <div class="modal-body mb-6">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer flex justify-end gap-3">
            <slot name="footer">
              <button class="btn btn-secondary" @click="$emit('close')">Bezárás</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(4px);
}

.modal-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-container {
  width: 100%;
  max-width: 600px; /* Default width */
  padding: 1.5rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;
}

.modal-header h3 {
  color: var(--color-text);
}

/* Transitions */
.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
