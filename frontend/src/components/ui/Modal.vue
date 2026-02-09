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
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button @click="$emit('close')" class="close-btn" aria-label="Bezárás">
              <X size="20" />
            </button>
          </div>

          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer">
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
  padding: 1rem;
}

.modal-wrapper {
  width: 100%;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.modal-container {
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 2rem);
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
  flex-shrink: 0;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 0.625rem;
  background: white;
  color: #4b5563;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-secondary:hover {
  background: #f3f4f6;
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

/* Mobile */
@media (max-width: 640px) {
  .modal-mask {
    padding: 0;
    align-items: flex-end;
  }
  
  .modal-wrapper {
    align-items: flex-end;
  }
  
  .modal-container {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 1.5rem 1.5rem 0 0;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  .modal-header {
    padding: 1rem 1.25rem;
  }
  
  .modal-body {
    padding: 1.25rem;
  }
  
  .modal-footer {
    padding: 1rem 1.25rem;
    flex-direction: column-reverse;
  }
  
  .modal-footer :deep(button) {
    width: 100%;
    justify-content: center;
  }
}

/* Small Mobile */
@media (max-width: 380px) {
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-title {
    font-size: 1rem;
  }
}
</style>
