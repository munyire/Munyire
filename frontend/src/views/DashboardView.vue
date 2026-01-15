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

  <div class="dashboard-view w-full">
    <!-- Header Card -->
    <div class="header-card" data-testid="dashboard-header">
      <h1 class="header-title">Áttekintés</h1>
      <p class="header-subtitle">Rendszerstatisztikák és aktivitás</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <!-- Hero Card: Workers (Blue) -->
      <div class="stat-card hero-blue" data-testid="stat-workers">
        <div class="stat-header">
          <div>
            <h3 class="stat-title">Összes Dolgozó</h3>
            <p class="stat-value">{{ stats.totalWorkers }}</p>
          </div>
          <div class="icon-circle">
             <Users size="40" />
          </div>
        </div>
        <div class="mt-auto">
           <span class="stat-badge">Aktív állomány</span>
        </div>
      </div>

      <!-- Card: Clothes (Orange) -->
      <div class="stat-card hero-orange" data-testid="stat-stock">
        <div class="stat-header">
          <div>
            <h3 class="stat-title">Raktárkészlet</h3>
            <p class="stat-value">{{ stats.totalClothes }}</p>
          </div>
          <div class="icon-circle">
            <Package size="40" />
          </div>
        </div>
        <div class="mt-auto">
           <span class="stat-badge">Összes rögzített ruha</span>
        </div>
      </div>

      <!-- Card: Issued (Purple) -->
      <div class="stat-card hero-purple" data-testid="stat-issued">
         <div class="stat-header">
          <div>
            <h3 class="stat-title">Kiadott Ruhák</h3>
            <p class="stat-value">{{ stats.activeIssues }}</p>
          </div>
          <div class="icon-circle">
             <ArrowUpRight size="40" />
          </div>
        </div>
        <div class="mt-auto">
           <span class="stat-badge">Jelenleg használatban</span>
        </div>
      </div>

      <!-- Card: Orders (Green) -->
      <div class="stat-card hero-green" data-testid="stat-orders">
         <div class="stat-header">
          <div>
            <h3 class="stat-title">Rendelések</h3>
            <p class="stat-value">{{ stats.totalOrders }}</p>
          </div>
          <div class="icon-circle">
             <Activity size="40" />
          </div>
        </div>
         <div class="mt-auto">
           <span class="stat-badge">Függőben lévő</span>
        </div>
      </div>
    </div>


    <div class="content-grid">
      <!-- Low Stock Section -->
      <div class="card dashboard-section" data-testid="low-stock-section">
        <div class="section-header">
          <h2 class="section-title">
            <AlertTriangle size="28" class="text-warning" />
            Alacsony Készlet
          </h2>
          <router-link to="/inventory" class="text-lg text-primary hover:underline">Összes &rarr;</router-link>
        </div>
        
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cikkszám</th>
                <th>Termék</th>
                <th>Méret</th>
                <th class="text-right">Készlet</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowStockItems" :key="item.RuhaID">
                <td class="font-medium">{{ item.Cikkszam }}</td>
                <td>{{ item.Fajta }}</td>
                <td class="text-muted">{{ item.Meret }}</td>
                <td class="text-right">
                  <span class="badge badge-warning">{{ item.Mennyiseg }} db</span>
                </td>
              </tr>
              <tr v-if="lowStockItems.length === 0">
                <td colspan="4" class="text-center text-muted p-6">Nincs alacsony készletű termék.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="card dashboard-section" data-testid="activity-section">
         <div class="section-header">
          <h2 class="section-title">
            <Activity size="28" class="text-info" />
            Legutóbbi Aktivitás
          </h2>
        </div>
        
        <div class="activity-list">
          <div v-for="(act, index) in recentActivity" :key="index" class="activity-item">
            <div class="activity-icon-wrapper">
              <ArrowUpRight v-if="act.action === 'Kiadás'" size="20" class="text-warning" />
              <ArrowDownRight v-else-if="act.action === 'Visszavétel'" size="20" class="text-success" />
              <Activity v-else size="20" class="text-info" />
            </div>
            <div>
              <p class="activity-text">
                {{ act.user }} <span class="text-muted font-normal">- {{ act.action }}</span>
              </p>
              <p class="activity-meta">
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
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.header-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 3rem;
  box-shadow: var(--shadow-xl);
  text-align: center;
  margin-bottom: 2rem;
}

.header-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  color: var(--color-text);
  line-height: 1.1;
}

.header-subtitle {
  font-size: 1.5rem;
  color: var(--color-text-muted);
  margin-top: 1rem;
  margin-bottom: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
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
  box-shadow: var(--shadow-lg);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
}

.hero-blue { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; }
.hero-orange { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; }
.hero-purple { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; }
.hero-green { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; }

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.stat-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 0.75rem 0;
}

.stat-value {
  font-size: 4rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1;
}

.icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.stat-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: 500;
  display: inline-block;
}

.dashboard-section {
  min-height: 500px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-surface-hover);
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-icon-wrapper {
  padding: 0.75rem;
  background-color: var(--color-bg);
  border-radius: 50%;
  height: fit-content;
}

.activity-text {
  font-size: var(--font-lg);
  font-weight: 500;
  margin: 0;
}

.activity-meta {
  font-size: var(--font-sm);
  color: var(--color-text-muted);
  margin: 0.5rem 0 0 0;
}

.text-warning { color: var(--color-warning); }
.text-info { color: var(--color-info); }
.text-success { color: var(--color-success); }
.text-primary { color: var(--color-primary); }
</style>

