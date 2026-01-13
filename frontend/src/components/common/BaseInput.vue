<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  disabled: Boolean,
  required: Boolean
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="base-input">
    <label v-if="label" class="input-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-field"
      :class="{ 'is-disabled': disabled }"
    />
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  font-family: 'Inter', sans-serif;
}

.input-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
}

.input-field {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
  background-color: #fff;
  color: #111827;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field.is-disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  color: #6b7280;
}
</style>
