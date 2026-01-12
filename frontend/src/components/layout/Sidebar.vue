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
  <aside class="sidebar glass-panel flex flex-col h-screen">
    <div class="logo-area p-6 flex items-center gap-3">
      <div class="logo-icon bg-primary text-white p-2 rounded-lg">
        <Shirt size="24" />
      </div>
      <h2 class="text-xl font-bold m-0">Munyire</h2>
    </div>

    <nav class="flex-1 px-4 py-6 flex flex-col gap-2">
      <template v-if="['Manager', 'Admin'].includes(userRole)">
        <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
          <LayoutDashboard size="20" />
          <span>Dashboard</span>
        </router-link>

        <router-link to="/inventory" class="nav-item" :class="{ active: isActive('/inventory') }">
          <Package size="20" />
          <span>Készlet</span>
        </router-link>

        <router-link to="/workers" class="nav-item" :class="{ active: isActive('/workers') }">
          <Users size="20" />
          <span>Dolgozók</span>
        </router-link>
      </template>

      <router-link to="/my-clothes" class="nav-item" :class="{ active: isActive('/my-clothes') }">
        <Shirt size="20" />
        <span>Saját Ruháim</span>
      </router-link>
    </nav>

    <div class="p-4 border-t border-gray-200">
      <button @click="logout" class="nav-item w-full text-red-600 hover:bg-red-50">
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
  border-right: 1px solid var(--color-border);
}

.logo-area {
  border-bottom: 1px solid var(--color-border);
}

.bg-primary {
  background-color: var(--color-primary);
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
  text-decoration: none;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.5);
  color: var(--color-primary);
}

.nav-item.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.text-red-600 { color: #dc2626; }
.hover\:bg-red-50:hover { background-color: #fef2f2; }
</style>
