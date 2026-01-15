<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/layout/Sidebar.vue';

const route = useRoute();
const isGuest = computed(() => route.meta.guest === true);
</script>

<template>
  <div class="app-layout">
    <Sidebar v-if="!isGuest" />
    
    <main class="main-content" :class="{ 'is-guest': isGuest }">
      <div class="content-wrapper" :class="{ 'no-padding': isGuest }">
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
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: 'Inter', sans-serif;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.content-wrapper {
  flex: 1;
  overflow: auto;
  padding: 2rem;
}

.content-wrapper.no-padding {
  padding: 0;
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
