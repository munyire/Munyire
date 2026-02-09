<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/theme';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Shirt, 
  LogOut,
  MoveHorizontal,
  ShoppingCart,
  X,
  Sun,
  Moon
} from 'lucide-vue-next';

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const userRole = computed(() => authStore.getUserRole());
const userName = computed(() => authStore.user?.username || authStore.user?.Username || authStore.user?.nev || 'Felhasználó');
const userInitials = computed(() => {
  const name = userName.value;
  return name ? name.substring(0, 2).toUpperCase() : 'FE';
});
const userRoleLabel = computed(() => {
  const role = userRole.value;
  return role === 'Admin' ? 'Adminisztrátor' : role;
});

const isActive = (path) => route.path.startsWith(path);

const logout = () => {
  authStore.logout();
  emit('close');
  router.push('/login');
};

const navigate = (path) => {
  router.push(path);
  if (props.isMobile) {
    emit('close');
  }
};
</script>

<template>
  <aside :class="['sidebar', { 'mobile': isMobile, 'open': isOpen }]">
    <!-- Mobile Close Button -->
    <button v-if="isMobile" @click="$emit('close')" class="mobile-close-btn" aria-label="Bezárás">
      <X size="24" />
    </button>

    <!-- Header: Centered Blue Logo & Text -->
    <div class="logo-area">
      <Shirt :size="isMobile ? 28 : 24" class="logo-blue" stroke-width="2.5" />
      <h2 class="title-blue">Munyire</h2>
    </div>

    <!-- User Info - Always Visible -->
    <div class="user-info-section">
      <div class="user-avatar">{{ userInitials }}</div>
      <div class="user-details">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">{{ userRoleLabel }}</span>
      </div>
    </div>

    <!-- Navigation Area -->
    <nav class="nav-container">
      <template v-if="['Manager', 'Admin'].includes(userRole)">
        <button @click="navigate('/dashboard')" class="nav-item" :class="{ active: isActive('/dashboard') }">
          <LayoutDashboard :size="isMobile ? 24 : 22" />
          <span>Dashboard</span>
        </button>

        <button @click="navigate('/inventory')" class="nav-item" :class="{ active: isActive('/inventory') }">
          <Package :size="isMobile ? 24 : 22" />
          <span>Készlet</span>
        </button>

        <button @click="navigate('/workers')" class="nav-item" :class="{ active: isActive('/workers') }">
          <Users :size="isMobile ? 24 : 22" />
          <span>Dolgozók</span>
        </button>

        <button @click="navigate('/transactions')" class="nav-item" :class="{ active: isActive('/transactions') }">
          <MoveHorizontal :size="isMobile ? 24 : 22" />
          <span>Kiadás/Visszavétel</span>
        </button>

        <button @click="navigate('/orders')" class="nav-item" :class="{ active: isActive('/orders') }">
          <ShoppingCart :size="isMobile ? 24 : 22" />
          <span>Rendelések</span>
        </button>
      </template>

      <button @click="navigate('/my-clothes')" class="nav-item" :class="{ active: isActive('/my-clothes') }">
        <Shirt :size="isMobile ? 24 : 22" />
        <span>Saját Ruháim</span>
      </button>
    </nav>

    <!-- Footer: Theme Toggle & Logout Area -->
    <div class="footer-area">
      <button @click="themeStore.toggleTheme" class="nav-item theme-btn" :title="themeStore.themeLabel">
        <Sun v-if="themeStore.isDark" :size="isMobile ? 22 : 18" stroke-width="2" />
        <Moon v-else :size="isMobile ? 22 : 18" stroke-width="2" />
        <span>{{ themeStore.themeLabel }}</span>
      </button>
      <button @click="logout" class="nav-item logout-btn">
        <LogOut :size="isMobile ? 22 : 18" stroke-width="2" />
        <span>Kijelentkezés</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  position: sticky;
  top: 12px;
  margin: 12px;
  height: calc(100vh - 24px);
  border-radius: 18px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: var(--color-sidebar-bg);
  flex-shrink: 0;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Mobile Sidebar Styles */
.sidebar.mobile {
  position: fixed;
  top: 0;
  left: 0;
  margin: 0;
  height: 100vh;
  border-radius: 0;
  z-index: 300;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  width: 280px;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
}

.sidebar.mobile.open {
  transform: translateX(0);
}

.mobile-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s;
  z-index: 10;
}

.mobile-close-btn:hover {
  background: var(--color-sidebar-hover);
  color: var(--color-primary);
}

.user-info-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 0 12px 12px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 12px;
  color: white;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  opacity: 0.8;
}

.logo-area {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.sidebar.mobile .logo-area {
  padding-top: 1.5rem;
  padding-bottom: 1rem;
}

.logo-blue {
  color: #1e40af !important;
}

.title-blue {
  color: #1e3a8a !important;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1;
}

.nav-container {
  flex: 1;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow-y: auto;
}

.sidebar.mobile .nav-container {
  padding: 0 12px;
  gap: 4px;
}

.footer-area {
  margin-top: auto;
  padding: 1rem 0.5rem 1.5rem 0.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar.mobile .footer-area {
  padding: 16px;
  border-top: 1px solid var(--color-border);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--color-sidebar-text);
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  text-decoration: none;
  background-color: transparent;
  border: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.sidebar.mobile .nav-item {
  padding: 14px 16px;
  font-size: 15px;
  border-radius: 12px;
}

.nav-item:hover {
  background-color: var(--color-sidebar-hover);
  color: var(--color-text);
}

.nav-item.active {
  background-color: var(--color-sidebar-active);
  color: var(--color-sidebar-active-text);
  font-weight: 600;
}

.sidebar.mobile .nav-item.active {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
}

:root.dark .sidebar.mobile .nav-item.active {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.logout-btn {
  color: #dc2626;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: rgba(220, 38, 38, 0.1);
}

.sidebar.mobile .logout-btn {
  justify-content: center;
  border: 1px solid rgba(220, 38, 38, 0.3);
  margin-top: 8px;
}

.theme-btn {
  color: var(--color-sidebar-text);
  cursor: pointer;
}

.theme-btn:hover {
  background-color: var(--color-sidebar-hover);
  color: var(--color-text);
}

.sidebar.mobile .theme-btn {
  justify-content: center;
  border: 1px solid var(--color-border);
}

/* Mobile user info larger */
.sidebar.mobile .user-info-section {
  padding: 16px 20px;
  margin: 0 16px 16px;
  border-radius: 16px;
}

/* Desktop - Hide scrollbar but keep functionality */
.nav-container::-webkit-scrollbar {
  width: 4px;
}

.nav-container::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 2px;
}

.nav-container:hover::-webkit-scrollbar-thumb {
  background: #cbd5e1;
}

/* Responsive breakpoints for tablet */
@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar {
    width: 220px;
  }
}

/* Hide sidebar completely on very small screens when closed */
@media (max-width: 480px) {
  .sidebar.mobile {
    width: 100%;
    max-width: 300px;
  }
}
</style>
