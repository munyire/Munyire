<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  Activity
} from 'lucide-vue-next';

const stats = ref({
  totalWorkers: 0,
  totalClothes: 0,
  activeIssues: 0,
  totalOrders: 0
});

const lowStockItems = ref([]);
const recentActivity = ref([]);
const loading = ref(true);

const fetchDashboardData = async () => {
  try {
    const [statsRes, lowStockRes, activityRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/low-stock'),
      api.get('/dashboard/recent-activity')
    ]);

    stats.value = statsRes.data;
    lowStockItems.value = lowStockRes.data;
    recentActivity.value = activityRes.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="dashboard-container">
    <div class="header mb-8">
      <h1>Áttekintés</h1>
      <p class="text-muted">Rendszerstatisztikák és aktivitás</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card stat-card flex items-center gap-4">
        <div class="icon-bg bg-blue-100 text-blue-600">
          <Users size="24" />
        </div>
        <div>
          <h3 class="text-sm text-muted font-normal m-0">Dolgozók</h3>
          <p class="text-2xl font-bold m-0">{{ stats.totalWorkers }}</p>
        </div>
      </div>

      <div class="card stat-card flex items-center gap-4">
        <div class="icon-bg bg-green-100 text-green-600">
          <Package size="24" />
        </div>
        <div>
          <h3 class="text-sm text-muted font-normal m-0">Összes Ruha</h3>
          <p class="text-2xl font-bold m-0">{{ stats.totalClothes }}</p>
        </div>
      </div>

      <div class="card stat-card flex items-center gap-4">
        <div class="icon-bg bg-orange-100 text-orange-600">
          <ArrowUpRight size="24" />
        </div>
        <div>
          <h3 class="text-sm text-muted font-normal m-0">Kiadva</h3>
          <p class="text-2xl font-bold m-0">{{ stats.activeIssues }}</p>
        </div>
      </div>

      <div class="card stat-card flex items-center gap-4">
        <div class="icon-bg bg-purple-100 text-purple-600">
          <Activity size="24" />
        </div>
        <div>
          <h3 class="text-sm text-muted font-normal m-0">Rendelések</h3>
          <p class="text-2xl font-bold m-0">{{ stats.totalOrders }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Low Stock Section -->
      <div class="card">
        <div class="card-header flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold m-0 flex items-center gap-2">
            <AlertTriangle size="20" class="text-amber-500" />
            Alacsony Készlet
          </h2>
          <router-link to="/inventory" class="text-sm text-primary">Összes &rarr;</router-link>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left border-b border-gray-100">
                <th class="pb-2 font-medium text-muted">Cikkszám</th>
                <th class="pb-2 font-medium text-muted">Termék</th>
                <th class="pb-2 font-medium text-muted">Méret</th>
                <th class="pb-2 font-medium text-muted text-right">Készlet</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowStockItems" :key="item.RuhaID" class="border-b border-gray-50 last:border-0">
                <td class="py-3 font-medium">{{ item.Cikkszam }}</td>
                <td class="py-3">{{ item.Fajta }}</td>
                <td class="py-3 text-muted">{{ item.Meret }}</td>
                <td class="py-3 text-right">
                  <span class="badge badge-warning">{{ item.Mennyiseg }} db</span>
                </td>
              </tr>
              <tr v-if="lowStockItems.length === 0">
                <td colspan="4" class="py-4 text-center text-muted">Nincs alacsony készletű termék.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="card">
         <div class="card-header flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold m-0 flex items-center gap-2">
            <Activity size="20" class="text-blue-500" />
            Legutóbbi Aktivitás
          </h2>
        </div>
        
        <div class="activity-list flex flex-col gap-4">
          <div v-for="(act, index) in recentActivity" :key="index" class="activity-item flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
            <div class="activity-icon rounded-full bg-gray-100 p-2 h-fit">
              <ArrowUpRight v-if="act.action === 'Kiadás'" size="16" class="text-orange-500" />
              <ArrowDownRight v-else-if="act.action === 'Visszavétel'" size="16" class="text-green-500" />
              <Activity v-else size="16" class="text-blue-500" />
            </div>
            <div>
              <p class="text-sm font-medium m-0">
                {{ act.user }} <span class="text-muted font-normal">- {{ act.action }}</span>
              </p>
              <p class="text-xs text-muted m-0 mt-1">
                {{ act.item }} &bull; {{ act.date }}
              </p>
            </div>
          </div>
          <div v-if="recentActivity.length === 0">
            <p class="text-center text-muted">Nincs legutóbbi aktivitás.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.md\:grid-cols-2 { @media (min-width: 768px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lg\:grid-cols-4 { @media (min-width: 1024px) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.lg\:grid-cols-2 { @media (min-width: 1024px) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

.icon-bg {
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-100 { background-color: #dbeafe; }
.text-blue-600 { color: #2563eb; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-600 { color: #16a34a; }
.bg-orange-100 { background-color: #ffedd5; }
.text-orange-600 { color: #ea580c; }
.bg-purple-100 { background-color: #f3e8ff; }
.text-purple-600 { color: #9333ea; }

.text-amber-500 { color: #f59e0b; }
.text-blue-500 { color: #3b82f6; }
.text-primary { color: var(--color-primary); }

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-warning {
  background-color: #fef3c7;
  color: #d97706;
}

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
