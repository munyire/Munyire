<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';
import { 
  Shirt, 
  Calendar, 
  AlertCircle,
  Package
} from 'lucide-vue-next';

const authStore = useAuthStore();
const myItems = ref([]);
const loading = ref(true);

const fetchMyItems = async () => {
  loading.value = true;
  try {
    const userId = authStore.user?.id || authStore.user?.DolgozoID;
    if (!userId) {
      console.error('No user ID found');
      return;
    }
    const response = await api.get(`/dolgozok/${userId}/ruhak/aktiv`);
    myItems.value = response.data;
  } catch (error) {
    console.error('Error fetching my items:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMyItems);
</script>

<template>
  <div class="my-clothes-container">
    <!-- Header Card -->
    <div class="header-card">
      <h1 class="header-title">Saját Ruháim</h1>
      <p class="header-subtitle">Az önnél lévő munkaruhák nyilvántartása</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Betöltés...</p>
    </div>

    <!-- Items Grid -->
    <div v-else class="items-grid">
      <div v-for="item in myItems" :key="item.RuhaKiBeID" class="item-card">
        <div class="item-header">
          <div class="item-icon">
            <Shirt size="24" />
          </div>
          <span class="item-qty">{{ item.Mennyiseg }} db</span>
        </div>
        
        <h3 class="item-name">{{ item.Ruha?.Fajta || 'Ismeretlen' }}</h3>
        <p class="item-code">{{ item.Ruha?.Cikkszam }}</p>

        <div class="item-details">
          <div class="detail-row">
            <span class="detail-label">Méret:</span>
            <span class="detail-value">{{ item.Ruha?.Meret }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Szín:</span>
            <span class="detail-value">{{ item.Ruha?.Szin }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">
              <Calendar size="14" />
              Kiadva:
            </span>
            <span class="detail-value">{{ item.KiadasDatum }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="myItems.length === 0" class="empty-card">
        <AlertCircle size="48" />
        <h3>Nincs kiadott ruha</h3>
        <p>Jelenleg nincs önnél munkaruha nyilvántartva.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-clothes-container {
  padding: 12px 12px 12px 0;
  width: 100%;
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
  margin-bottom: 1.5rem;
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

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Item Card */
.item-card {
  background: var(--color-surface);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 1rem;
  background: var(--color-sidebar-active);
  color: var(--color-sidebar-active-text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-qty {
  background: var(--color-bg);
  color: var(--color-text);
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.item-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.375rem;
  transition: color 0.3s ease;
}

.item-code {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0 0 1.25rem;
  font-family: monospace;
  transition: color 0.3s ease;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: color 0.3s ease;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s ease;
}

/* Empty Card */
.empty-card {
  grid-column: 1 / -1;
  background: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: 1.5rem;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--color-text-muted);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.empty-card svg {
  margin-bottom: 1rem;
  opacity: 0.5;
  color: var(--color-text-muted);
  transition: color 0.3s ease;
}

.empty-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem;
  transition: color 0.3s ease;
}

.empty-card p {
  margin: 0;
}

/* Tablet */
@media (max-width: 1024px) {
  .header-title {
    font-size: 3rem;
  }
  
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .my-clothes-container {
    padding: 8px;
  }
  
  .header-card {
    padding: 1.5rem 1rem;
    border-radius: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .item-card {
    padding: 1.25rem;
    border-radius: 1rem;
  }
  
  .item-icon {
    width: 40px;
    height: 40px;
  }
  
  .item-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .item-name {
    font-size: 1.125rem;
  }
  
  .empty-card {
    padding: 3rem 1.5rem;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .header-title {
    font-size: 1.75rem;
  }
}
</style>
