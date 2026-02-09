<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/layout/Sidebar.vue';

const route = useRoute();
const isGuest = computed(() => route.meta.guest === true);

// Mobile detection
const isMobile = ref(false);
const sidebarOpen = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024;
  if (!isMobile.value) {
    sidebarOpen.value = false;
  }
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<template>
  <div class="app-container">
    <!-- Mobile Header - Only shown on mobile when logged in -->
    <header v-if="!isGuest && isMobile" class="mobile-header">
      <div class="mobile-header-content">
        <button @click="toggleSidebar" class="menu-btn" aria-label="Menü">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="mobile-title">Munyire</h1>
        <div class="placeholder"></div>
      </div>
    </header>

    <!-- Sidebar - Hidden on mobile by default, shown when toggled -->
    <Sidebar 
      v-if="!isGuest" 
      :is-mobile="isMobile" 
      :is-open="sidebarOpen" 
      @close="closeSidebar"
    />

    <!-- Overlay for mobile sidebar -->
    <div 
      v-if="isMobile && sidebarOpen" 
      class="sidebar-overlay" 
      @click="closeSidebar"
    ></div>

    <!-- Main Content -->
    <main :class="['main-content', { 'mobile': isMobile, 'guest': isGuest }]">
      <div class="content-wrapper">
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
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

/* Mobile Header */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--color-surface);
  z-index: 200;
  box-shadow: var(--shadow-md);
  transition: background-color 0.3s ease;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}

.menu-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #1e3a8a;
  border-radius: 8px;
  transition: background 0.2s;
}

.menu-btn:hover {
  background: var(--color-sidebar-hover);
}

.mobile-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
}

.placeholder {
  width: 40px;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
  backdrop-filter: blur(2px);
}

/* Main Content */
.main-content {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

.main-content.mobile:not(.guest) {
  margin-top: 56px;
}

.content-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 12px 12px 12px 0;
}

.main-content.mobile .content-wrapper {
  padding: 8px;
}

.main-content.guest .content-wrapper {
  padding: 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Global Responsive Typography */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  html {
    font-size: 13px;
  }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-surface);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* Mobile scrollbar */
@media (max-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
}
</style>
