<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Shirt, 
  LogOut,
  ArrowRightLeft,
  ShoppingCart
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const userRole = computed(() => authStore.getUserRole());
// Fallback to safe defaults if user is null (though usage usually implies auth)
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
  router.push('/login');
};
</script>

<template>
  <aside class="sidebar bg-white">
    <!-- Header: Centered Blue Logo & Text -->
    <div class="logo-area">
      <Shirt :size="24" class="logo-blue" stroke-width="2.5" />
      <h2 class="title-blue">Munyire</h2>
    </div>

    <!-- Navigation Area -->
    <nav class="nav-container">
      <template v-if="['Manager', 'Admin'].includes(userRole)">
        <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
          <LayoutDashboard size="22" />
          <span>Dashboard</span>
        </router-link>

        <router-link to="/inventory" class="nav-item" :class="{ active: isActive('/inventory') }">
          <Package size="22" />
          <span>Készlet</span>
        </router-link>

        <router-link to="/workers" class="nav-item" :class="{ active: isActive('/workers') }">
          <Users size="22" />
          <span>Dolgozók</span>
        </router-link>

        <router-link to="/transactions" class="nav-item" :class="{ active: isActive('/transactions') }">
          <ArrowRightLeft size="22" />
          <span>Kiadás/Visszavétel</span>
        </router-link>

        <router-link to="/orders" class="nav-item" :class="{ active: isActive('/orders') }">
          <ShoppingCart size="22" />
          <span>Rendelések</span>
        </router-link>
      </template>

      <router-link to="/my-clothes" class="nav-item" :class="{ active: isActive('/my-clothes') }">
        <Shirt size="22" />
        <span>Saját Ruháim</span>
      </router-link>
    </nav>

    <!-- Footer: Logout Area -->
    <div class="footer-area">
      <button @click="logout" class="nav-item logout-btn">
        <LogOut size="18" stroke-width="2" />
        <span>Kijelentkezés</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 180px;
  position: sticky;
  top: 12px;
  margin: 12px;
  height: calc(100vh - 24px);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
  display: flex;
  flex-direction: column;
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

.footer-area {
  margin-top: auto;
  padding: 1rem 0.5rem 1.5rem 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  text-decoration: none;
  background-color: transparent;
  border: none;
  width: 100%;
}

.nav-item:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #1e40af;
  font-weight: 600;
}

.logout-btn {
  color: #dc2626;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #fef2f2;
}
</style>
