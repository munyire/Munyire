<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';
import { 
  Shirt, 
  Calendar, 
  AlertCircle 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const myItems = ref([]);
const loading = ref(true);

const fetchMyItems = async () => {
  loading.value = true;
  try {
    const userId = authStore.user?.id || authStore.user?.DolgozoID; // Fallback
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
  <div class="my-clothes-view">
    <div class="header-card p-14 shadow-xl bg-white rounded-[2rem] flex flex-col items-center justify-center text-center">
      <h1 class="m-0 text-8xl font-black text-gray-900 tracking-tighter leading-none">Saját Ruháim</h1>
      <p class="text-muted m-0 text-4xl mt-8 font-semibold">Az önnél lévő munkaruhák nyilvántartása</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p>Betöltés...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
      <div v-for="item in myItems" :key="item.RuhaKiBeID" class="card hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Shirt size="24" />
          </div>
          <span class="badge bg-gray-100 text-gray-700">{{ item.Mennyiseg }} db</span>
        </div>
        
        <h3 class="text-lg font-semibold mb-1">{{ item.Ruha?.Fajta || 'Ismeretlen' }}</h3>
        <p class="text-sm text-muted mb-4">{{ item.Ruha?.Cikkszam }}</p>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between border-b border-gray-50 pb-2">
            <span class="text-muted">Méret:</span>
            <span class="font-medium">{{ item.Ruha?.Meret }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-50 pb-2">
            <span class="text-muted">Szín:</span>
            <span class="font-medium">{{ item.Ruha?.Szin }}</span>
          </div>
          <div class="flex justify-between pt-1">
            <span class="text-muted flex items-center gap-1">
              <Calendar size="14" />
              Kiadva:
            </span>
            <span class="font-medium">{{ item.KiadasDatum }}</span>
          </div>
        </div>
      </div>

      <div v-if="myItems.length === 0" class="col-span-full text-center py-12 card bg-gray-50 border-dashed">
        <AlertCircle size="48" class="mx-auto text-gray-300 mb-4" />
        <h3 class="text-lg font-medium text-gray-900">Nincs kiadott ruha</h3>
        <p class="text-muted">Jelenleg nincs önnél munkaruha nyilvántartva.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-clothes-view {
  width: 100%;
  padding-right: 12px; /* Match dashboard padding if needed */
}

.header-card {
  background-color: white;
  border-radius: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100% !important;
  margin-bottom: 12px;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}
.bg-blue-100 { background-color: #eff6ff; }
.text-blue-600 { color: #2563eb; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-700 { color: #374151; }

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.gap-6 { gap: 1.5rem; }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.col-span-full { grid-column: 1 / -1; }
.mx-auto { margin-left: auto; margin-right: auto; }
.border-dashed { border-style: dashed; }
</style>
