<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Shirt, 
  LogOut 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const userRole = computed(() => authStore.getUserRole());

const isActive = (path) => route.path.startsWith(path);

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <aside class="sidebar glass-panel">
    <div class="sidebar-header">
      <div class="logo-icon">
        <Shirt size="24" />
      </div>
      <h2 class="app-title">Munyire</h2>
    </div>

    <nav class="sidebar-nav">
      <template v-if="['Manager', 'Admin'].includes(userRole)">
        <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }" data-testid="sidebar-dashboard-link">
          <LayoutDashboard size="20" />
          <span>Dashboard</span>
        </router-link>

        <router-link to="/inventory" class="nav-item" :class="{ active: isActive('/inventory') }" data-testid="sidebar-inventory-link">
          <Package size="20" />
          <span>Készlet</span>
        </router-link>

        <router-link to="/workers" class="nav-item" :class="{ active: isActive('/workers') }" data-testid="sidebar-workers-link">
          <Users size="20" />
          <span>Dolgozók</span>
        </router-link>
      </template>

      <router-link to="/my-clothes" class="nav-item" :class="{ active: isActive('/my-clothes') }" data-testid="sidebar-myclothes-link">
        <Shirt size="20" />
        <span>Saját Ruháim</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button @click="logout" class="nav-item logout-btn" data-testid="sidebar-logout-btn">
        <LogOut size="20" />
        <span>Kijelentkezés</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid var(--color-border);
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.logo-icon {
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  display: flex;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-weight: 500;
  transition: all 0.2s;
  background: transparent;
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: left;
}

.nav-item:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-primary);
}

.nav-item.active {
  background-color: var(--color-primary-subtle);
  color: var(--color-primary-dark);
}

.logout-btn {
  color: var(--color-danger);
}

.logout-btn:hover {
  background-color: var(--color-danger-bg);
  color: #991b1b;
}
</style>
