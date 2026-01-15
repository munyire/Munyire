<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { 
  Shirt, 
  Calendar, 
  AlertCircle 
} from 'lucide-vue-next';

const myItems = ref([]);
const loading = ref(true);

const fetchMyItems = async () => {
  loading.value = true;
  try {
    const response = await api.get('/ruhakibe/mine');
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
  <div class="my-clothes-view">
    <div class="view-header">
      <h1 class="header-title">Saját Ruháim</h1>
      <p class="header-subtitle">Az önnél lévő munkaruhák nyilvántartása</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p>Betöltés...</p>
    </div>

    <div v-else class="items-grid">
      <div v-for="item in myItems" :key="item.RuhaKiBeID" class="card card-hover item-card" :data-testid="`my-item-${item.RuhaKiBeID}`">
        <div class="card-header">
          <div class="item-icon">
            <Shirt size="24" />
          </div>
          <span class="badge badge-neutral">{{ item.Mennyiseg }} db</span>
        </div>
        
        <h3 class="item-title">{{ item.Ruha?.Fajta || 'Ismeretlen' }}</h3>
        <p class="item-sku">{{ item.Ruha?.Cikkszam }}</p>

        <div class="item-details">
          <div class="detail-row">
            <span class="detail-label">Méret:</span>
            <span class="detail-value">{{ item.Ruha?.Meret }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Szín:</span>
            <span class="detail-value">{{ item.Ruha?.Szin }}</span>
          </div>
          <div class="detail-row detail-date">
            <span class="detail-label flex items-center gap-1">
              <Calendar size="14" />
              Kiadva:
            </span>
            <span class="detail-value">{{ item.KiadasDatum }}</span>
          </div>
        </div>
      </div>

      <div v-if="myItems.length === 0" class="empty-state card">
        <AlertCircle size="48" class="empty-icon" />
        <h3 class="empty-title">Nincs kiadott ruha</h3>
        <p class="text-muted">Jelenleg nincs önnél munkaruha nyilvántartva.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-clothes-view {
  width: 100%;
}

.view-header {
  margin-bottom: 2rem;
}

.header-title {
  margin: 0;
}

.header-subtitle {
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

.items-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .items-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.item-card {
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-icon {
  padding: 0.75rem;
  background-color: var(--color-info-bg);
  color: var(--color-info);
  border-radius: var(--radius-md);
}

.item-title {
  font-size: var(--font-lg);
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.item-sku {
  font-size: var(--font-sm);
  color: var(--color-text-muted);
  margin: 0 0 1rem 0;
}

.item-details {
  margin-top: auto;
  font-size: var(--font-sm);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-bg);
  padding-bottom: 0.5rem;
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
  padding-top: 0.25rem;
}

.detail-label {
  color: var(--color-text-muted);
}

.detail-value {
  font-weight: 500;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  background-color: var(--color-bg);
  border: 2px dashed var(--color-border);
}

.empty-icon {
  margin: 0 auto 1rem auto;
  color: var(--color-text-light);
}

.empty-title {
  font-size: var(--font-lg);
  font-weight: 500;
  margin-bottom: 0.5rem;
}
</style>
