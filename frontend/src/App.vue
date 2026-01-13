<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/layout/Sidebar.vue';

const route = useRoute();
const isGuest = computed(() => route.meta.guest === true);
</script>

<template>
  <div class="app-container flex min-h-screen bg-white">
    <Sidebar v-if="!isGuest" />
    
    <main class="flex-1 flex flex-col min-w-0 w-full overflow-hidden relative">
      <div class="flex-1 overflow-auto p-0">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style>
.app-container {
  font-family: 'Inter', sans-serif;
}

* {
  font-family: 'Inter', sans-serif;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
