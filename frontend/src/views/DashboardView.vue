<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  Activity,
  Filter,
  ChevronDown
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
  <div class="dashboard-container w-full">
    <!-- Header Card -->
    <div class="header-card p-14 shadow-xl bg-white rounded-[2rem] flex flex-col items-center justify-center text-center">
      <h1 class="m-0 text-8xl font-black text-gray-900 tracking-tighter leading-none">Áttekintés</h1>
      <p class="text-muted m-0 text-4xl mt-8 font-semibold">Rendszerstatisztikák és aktivitás</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid mt-5">
      <!-- Hero Card: Workers (Blue) -->
      <div class="stat-card hero-blue p-10">
        <div class="flex justify-between items-start mb-8">
          <div>
            <h3 class="text-white/90 text-2xl font-medium m-0 mb-3">Összes Dolgozó</h3>
            <p class="text-8xl font-bold text-white m-0">{{ stats.totalWorkers }}</p>
          </div>
          <div class="icon-circle bg-white/20 text-white">
             <Users size="40" />
          </div>
        </div>
        <div class="mt-auto">
           <span class="badge bg-white/20 text-white text-md px-5 py-2 rounded-full">Aktív állomány</span>
        </div>
      </div>

      <!-- Card: Clothes (Orange) -->
      <div class="stat-card hero-orange p-10">
        <div class="flex justify-between items-start mb-8">
          <div>
            <h3 class="text-white/90 text-2xl font-medium m-0 mb-3">Raktárkészlet</h3>
            <p class="text-8xl font-bold text-white m-0">{{ stats.totalClothes }}</p>
          </div>
          <div class="icon-circle bg-white/20 text-white">
            <Package size="40" />
          </div>
        </div>
        <div class="mt-auto">
           <span class="badge bg-white/20 text-white text-md px-5 py-2 rounded-full">Összes rögzített ruha</span>
        </div>
      </div>

      <!-- Card: Issued (Purple) -->
      <div class="stat-card hero-purple p-10">
         <div class="flex justify-between items-start mb-8">
          <div>
            <h3 class="text-white/90 text-2xl font-medium m-0 mb-3">Kiadott Ruhák</h3>
            <p class="text-8xl font-bold text-white m-0">{{ stats.activeIssues }}</p>
          </div>
          <div class="icon-circle bg-white/20 text-white">
             <ArrowUpRight size="40" />
          </div>
        </div>
        <div class="mt-auto">
           <span class="badge bg-white/20 text-white text-md px-5 py-2 rounded-full">Jelenleg használatban</span>
        </div>
      </div>

      <!-- Card: Orders (Green) -->
      <div class="stat-card hero-green p-10">
         <div class="flex justify-between items-start mb-8">
          <div>
            <h3 class="text-white/90 text-2xl font-medium m-0 mb-3">Rendelések</h3>
            <p class="text-8xl font-bold text-white m-0">{{ stats.totalOrders }}</p>
          </div>
          <div class="icon-circle bg-white/20 text-white">
             <Activity size="40" />
          </div>
        </div>
         <div class="mt-auto">
           <span class="badge bg-white/20 text-white text-md px-5 py-2 rounded-full">Függőben lévő</span>
        </div>
      </div>
    </div>


    <div class="content-grid mt-5">
      <!-- Low Stock Section -->
      <div class="card bg-white rounded-[2rem] shadow-sm p-10 flex flex-col" style="min-height: 486px;">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold m-0 flex items-center gap-3">
            <AlertTriangle size="28" class="text-amber-500" />
            Alacsony Készlet
          </h2>
          <router-link to="/inventory" class="text-lg text-primary hover:underline">Összes &rarr;</router-link>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-base">
            <thead>
              <tr class="text-left border-b border-gray-100">
                <th class="pb-4 font-medium text-muted">Cikkszám</th>
                <th class="pb-4 font-medium text-muted">Termék</th>
                <th class="pb-4 font-medium text-muted">Méret</th>
                <th class="pb-4 font-medium text-muted text-right">Készlet</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowStockItems" :key="item.RuhaID" class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td class="py-4 font-medium">{{ item.Cikkszam }}</td>
                <td class="py-4">{{ item.Fajta }}</td>
                <td class="py-4 text-muted">{{ item.Meret }}</td>
                <td class="py-4 text-right">
                  <span class="badge badge-warning text-sm">{{ item.Mennyiseg }} db</span>
                </td>
              </tr>
              <tr v-if="lowStockItems.length === 0">
                <td colspan="4" class="py-6 text-center text-muted">Nincs alacsony készletű termék.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="card bg-white rounded-[2rem] shadow-sm p-10 flex flex-col" style="min-height: 430px;">
         <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold m-0 flex items-center gap-3">
            <Activity size="28" class="text-blue-500" />
            Legutóbbi Aktivitás
          </h2>
        </div>
        
        <div class="activity-list flex flex-col gap-6">
          <div v-for="(act, index) in recentActivity" :key="index" class="activity-item flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
            <div class="activity-icon rounded-full bg-gray-100 p-3 h-fit">
              <ArrowUpRight v-if="act.action === 'Kiadás'" size="20" class="text-orange-500" />
              <ArrowDownRight v-else-if="act.action === 'Visszavétel'" size="20" class="text-green-500" />
              <Activity v-else size="20" class="text-blue-500" />
            </div>
            <div>
              <p class="text-lg font-medium m-0">
                {{ act.user }} <span class="text-muted font-normal">- {{ act.action }}</span>
              </p>
              <p class="text-sm text-muted m-0 mt-2">
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
.dashboard-container {
  padding: 12px 12px 12px 0; /* Match sidebar's right margin gap */
  width: 100% !important;
  display: flex;
  flex-direction: column;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Force 4 columns on large screens */
  gap: 12px;
  margin-bottom: 12px;
  width: 100% !important;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Force 2 columns */
  gap: 12px;
  width: 100% !important;
}

.header-card {
  background-color: white;
  border-radius: 2rem;
  margin-bottom: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100% !important;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 1.5rem;
  padding: 2.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.hero-blue {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  border: none;
}

.hero-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
}

.hero-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  border: none;
}

.hero-green {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
}

.icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Keep generic badge styles */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}

.badge-warning {
  background-color: #fef3c7;
  color: #d97706;
}

/* Utilities needed for lower sections */
.text-amber-500 { color: #f59e0b; }
.text-blue-500 { color: #3b82f6; }
.text-orange-500 { color: #f97316; }
.text-green-500 { color: #22c55e; }
.text-primary { color: #1e40af; }
.text-muted { color: #64748b; }
</style>

