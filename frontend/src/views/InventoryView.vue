<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';

const clothes = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const form = ref({
  RuhaID: null,
  Cikkszam: '',
  Fajta: '',
  Meret: '',
  Szin: '',
  Mennyiseg: 0,
  Minoseg: 'Uj'
});

const fetchClothes = async () => {
  loading.value = true;
  try {
    const response = await api.get('/ruhak');
    clothes.value = response.data;
  } catch (error) {
    console.error('Error fetching clothes:', error);
  } finally {
    loading.value = false;
  }
};

const filteredClothes = computed(() => {
  if (!searchQuery.value) return clothes.value;
  const q = searchQuery.value.toLowerCase();
  return clothes.value.filter(item => 
    item.Cikkszam.toLowerCase().includes(q) ||
    item.Fajta.toLowerCase().includes(q)
  );
});

const openAddModal = () => {
  isEditing.value = false;
  form.value = {
    RuhaID: null,
    Cikkszam: '',
    Fajta: '',
    Meret: '',
    Szin: '',
    Mennyiseg: 0,
    Minoseg: 'Uj'
  };
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  form.value = { ...item };
  showModal.value = true;
};

const saveItem = async () => {
  try {
    if (isEditing.value) {
      // Update
      await api.patch(`/ruhak/${form.value.RuhaID}`, form.value);
      // Optimistic update
      const index = clothes.value.findIndex(c => c.RuhaID === form.value.RuhaID);
      if (index !== -1) clothes.value[index] = { ...form.value };
    } else {
      // Create
      const res = await api.post('/ruhak', form.value);
      clothes.value.push(res.data || { ...form.value, RuhaID: Date.now() }); // fallback ID if mock
    }
    showModal.value = false;
  } catch (error) {
    console.error('Error saving item:', error);
    alert('Hiba történt a mentés során.');
  }
};

const deleteItem = async (id) => {
  if (!confirm('Biztosan törölni szeretné ezt az elemet?')) return;
  try {
    await api.delete(`/ruhak/${id}`);
    clothes.value = clothes.value.filter(c => c.RuhaID !== id);
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Hiba történt a törlés során.');
  }
};

onMounted(fetchClothes);
</script>

<template>
  <div class="inventory-container w-full">
    <!-- Header Card -->
    <div class="header-card p-14 shadow-xl bg-white rounded-[2rem] flex flex-col items-center justify-center text-center">
      <h1 class="m-0 text-8xl font-black text-gray-900 tracking-tighter leading-none">Készlet</h1>
      <p class="text-muted m-0 text-4xl mt-8 font-semibold">Raktárkészlet kezelése</p>
    </div>

    <!-- Actions Row -->
    <div class="actions-row flex justify-end mt-5 mb-5">
      <button @click="openAddModal" class="btn btn-primary px-8 py-4 text-lg font-bold shadow-lg">
        <Plus size="24" />
        Új termék
      </button>
    </div>

    <div class="controls flex gap-4 mb-6">
      <div class="search-box relative flex-1 max-w-sm">
        <Search size="18" class="absolute left-3 top-3 text-muted" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Keresés cikkszám vagy név alapján..." 
          class="pl-10"
        />
      </div>
    </div>

    <div class="card bg-white rounded-[2rem] shadow-sm p-8 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-sm font-semibold text-muted border-b border-gray-100">
              <th class="px-4 py-5 text-center">Cikkszám</th>
              <th class="px-4 py-5 text-center">Fajta</th>
              <th class="px-4 py-5 text-center">Méret</th>
              <th class="px-4 py-5 text-center">Szín</th>
              <th class="px-4 py-5 text-center">Minőség</th>
              <th class="px-4 py-5 text-center">Mennyiség</th>
              <th class="px-4 py-5 text-center">Műveletek</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in filteredClothes" :key="item.RuhaID" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-5 text-center font-medium">{{ item.Cikkszam }}</td>
              <td class="px-4 py-5 text-center">{{ item.Fajta }}</td>
              <td class="px-4 py-5 text-center">{{ item.Meret }}</td>
              <td class="px-4 py-5 text-center">{{ item.Szin }}</td>
              <td class="px-4 py-5 text-center">
                <span class="badge" :class="{
                  'bg-green-100 text-green-700': item.Minoseg === 'Uj',
                  'bg-blue-100 text-blue-700': item.Minoseg === 'Jo',
                  'bg-red-100 text-red-700': item.Minoseg === 'Szakadt'
                }">{{ item.Minoseg }}</span>
              </td>
              <td class="px-4 py-5 text-center font-bold">
                {{ item.Mennyiseg }} db
              </td>
              <td class="px-4 py-5 text-center">
                <div class="inline-flex items-center gap-4">
                  <button @click="openEditModal(item)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Szerkesztés">
                    <Edit size="20" />
                  </button>
                  <button @click="deleteItem(item.RuhaID)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Törlés">
                    <Trash2 size="20" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredClothes.length === 0 && !loading">
              <td colspan="7" class="px-6 py-8 text-center text-muted">Nincs megjeleníthető elem.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="isEditing ? 'Termék szerkesztése' : 'Új termék felvétele'" @close="showModal = false">
      <template #body>
        <form @submit.prevent="saveItem" id="itemForm" class="flex flex-col gap-4">
          <div>
            <label class="block mb-1 text-sm font-medium">Cikkszám</label>
            <input v-model="form.Cikkszam" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium">Fajta</label>
              <input v-model="form.Fajta" required />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium">Szín</label>
              <input v-model="form.Szin" required />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium">Méret</label>
              <input v-model="form.Meret" required />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium">Mennyiség</label>
              <input type="number" v-model="form.Mennyiseg" required min="0" />
            </div>
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">Minőség</label>
            <select v-model="form.Minoseg">
              <option value="Uj">Új</option>
              <option value="Jo">Jó</option>
              <option value="Szakadt">Szakadt</option>
            </select>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Mégse</button>
        <button type="submit" form="itemForm" class="btn btn-primary">Mentés</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.inventory-container {
  padding: 12px 12px 12px 0;
  width: 100% !important;
  display: flex;
  flex-direction: column;
}

.header-card {
  background-color: white;
  border-radius: 2rem;
  margin-bottom: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100% !important;
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.bg-green-100 { background-color: #dcfce7; }
.text-green-700 { color: #15803d; }
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-700 { color: #1d4ed8; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-700 { color: #b91c1c; }
</style>
