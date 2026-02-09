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
  <div class="dashboard-container">
    <!-- Header Card -->
    <div class="header-card">
      <h1 class="header-title">Áttekintés</h1>
      <p class="header-subtitle">Rendszerstatisztikák és aktivitás</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <!-- Hero Card: Workers (Blue) -->
      <div class="stat-card hero-blue">
        <div class="stat-card-header">
          <div class="stat-card-info">
            <h3 class="stat-card-label">Összes Dolgozó</h3>
            <p class="stat-card-value">{{ stats.totalWorkers }}</p>
          </div>
          <div class="icon-circle">
             <Users size="32" />
          </div>
        </div>
        <div class="stat-card-footer">
           <span class="badge">Aktív állomány</span>
        </div>
      </div>

      <!-- Card: Clothes (Orange) -->
      <div class="stat-card hero-orange">
        <div class="stat-card-header">
          <div class="stat-card-info">
            <h3 class="stat-card-label">Raktárkészlet</h3>
            <p class="stat-card-value">{{ stats.totalClothes }}</p>
          </div>
          <div class="icon-circle">
            <Package size="32" />
          </div>
        </div>
        <div class="stat-card-footer">
           <span class="badge">Összes rögzített ruha</span>
        </div>
      </div>

      <!-- Card: Issued (Purple) -->
      <div class="stat-card hero-purple">
         <div class="stat-card-header">
          <div class="stat-card-info">
            <h3 class="stat-card-label">Kiadott Ruhák</h3>
            <p class="stat-card-value">{{ stats.activeIssues }}</p>
          </div>
          <div class="icon-circle">
             <ArrowUpRight size="32" />
          </div>
        </div>
        <div class="stat-card-footer">
           <span class="badge">Jelenleg használatban</span>
        </div>
      </div>

      <!-- Card: Orders (Green) -->
      <div class="stat-card hero-green">
         <div class="stat-card-header">
          <div class="stat-card-info">
            <h3 class="stat-card-label">Rendelések</h3>
            <p class="stat-card-value">{{ stats.totalOrders }}</p>
          </div>
          <div class="icon-circle">
             <Activity size="32" />
          </div>
        </div>
         <div class="stat-card-footer">
           <span class="badge">Függőben lévő</span>
        </div>
      </div>
    </div>


    <div class="content-grid">
      <!-- Low Stock Section -->
      <div class="content-card">
        <div class="content-card-header">
          <h2 class="content-card-title">
            <AlertTriangle size="24" class="text-amber-500" />
            Alacsony Készlet
          </h2>
          <router-link to="/inventory" class="view-all-link">Összes &rarr;</router-link>
        </div>
        
        <div class="table-container">
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
                  <span class="stock-badge">{{ item.Mennyiseg }} db</span>
                </td>
              </tr>
              <tr v-if="lowStockItems.length === 0">
                <td colspan="4" class="empty-cell">Nincs alacsony készletű termék.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="content-card">
         <div class="content-card-header">
          <h2 class="content-card-title">
            <Activity size="24" class="text-blue-500" />
            Legutóbbi Aktivitás
          </h2>
        </div>
        
        <div class="activity-list">
          <div v-for="(act, index) in recentActivity" :key="index" class="activity-item">
            <div class="activity-icon">
              <ArrowUpRight v-if="act.action === 'Kiadás'" size="18" class="text-orange-500" />
              <ArrowDownRight v-else-if="act.action === 'Visszavétel'" size="18" class="text-green-500" />
              <Activity v-else size="18" class="text-blue-500" />
            </div>
            <div class="activity-content">
              <p class="activity-text">
                {{ act.user }} <span class="activity-action">- {{ act.action }}</span>
              </p>
              <p class="activity-meta">
                {{ act.item }} &bull; {{ act.date }}
              </p>
            </div>
          </div>
          <div v-if="recentActivity.length === 0" class="empty-activity">
            <p>Nincs legutóbbi aktivitás.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 12px 12px 12px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Header Card */
.header-card {
  background-color: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-lg);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 12px;
  transition: background-color 0.3s ease;
}

.header-title {
  margin: 0;
  font-size: 4rem;
  font-weight: 900;
  color: var(--color-text);
  letter-spacing: -0.025em;
  line-height: 1;
  transition: color 0.3s ease;
}

.header-subtitle {
  color: var(--color-text-muted);
  margin: 0.75rem 0 0;
  font-size: 1.5rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  width: 100%;
}

.stat-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-card-info {
  flex: 1;
}

.stat-card-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
}

.stat-card-value {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1;
}

.stat-card-footer {
  margin-top: auto;
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.hero-blue {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
}

.hero-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
}

.hero-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
}

.hero-green {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
}

.content-card {
  background: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  transition: background-color 0.3s ease;
}

.content-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.content-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.view-all-link {
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
  color: var(--color-primary-dark);
}

/* Table */
.table-container {
  overflow-x: auto;
  flex: 1;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 0.5rem;
  font-weight: 500;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.data-table td {
  padding: 0.875rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.data-table tr:hover td {
  background: var(--color-bg);
}

.text-right {
  text-align: right;
}

.text-muted {
  color: var(--color-text-muted);
}

.stock-badge {
  background: #fef3c7;
  color: #d97706;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.empty-cell {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 0.25rem;
}

.activity-action {
  color: var(--color-text-muted);
  font-weight: 400;
}

.activity-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0;
}

.empty-activity {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

/* Tablet Breakpoint */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .header-title {
    font-size: 3rem;
  }
  
  .header-subtitle {
    font-size: 1.25rem;
  }
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 8px;
  }
  
  .header-card {
    padding: 1.5rem 1rem;
    border-radius: 1.5rem;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
    margin-top: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .stat-card {
    min-height: 160px;
    padding: 1rem;
    border-radius: 1rem;
  }
  
  .stat-card-value {
    font-size: 1.75rem;
  }
  
  .stat-card-label {
    font-size: 0.75rem;
  }
  
  .icon-circle {
    width: 40px;
    height: 40px;
  }
  
  .icon-circle svg {
    width: 20px;
    height: 20px;
  }
  
  .badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.625rem;
  }
  
  .content-card {
    border-radius: 1.5rem;
    padding: 1rem;
    min-height: auto;
    min-width: 0;
    overflow: hidden;
  }
  
  .content-card-title {
    font-size: 1.125rem;
  }
  
  /* Make table horizontally scrollable */
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .data-table {
    font-size: 0.8125rem;
    min-width: 400px;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.625rem 0.375rem;
    white-space: nowrap;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    min-height: 140px;
  }
  
  .activity-item {
    padding-bottom: 0.75rem;
  }
  
  .activity-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
