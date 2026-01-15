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
  <div class="inventory-view">
    <div class="view-header">
      <div class="header-content">
        <h1>Készlet</h1>
        <p class="text-muted">Raktárkészlet kezelése</p>
      </div>
      
      <button @click="openAddModal" class="btn btn-primary" data-testid="inventory-add-btn">
        <Plus size="20" />
        Új termék
      </button>
    </div>

    <div class="view-controls">
      <div class="search-wrapper">
        <Search size="18" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Keresés cikkszám vagy név alapján..." 
          class="search-input"
          data-testid="search-input"
        />
      </div>
    </div>

    <div class="card p-0 overflow-hidden">
      <div class="data-table-wrapper">
        <table class="data-table" data-testid="inventory-table">
          <thead>
            <tr>
              <th>Cikkszám</th>
              <th>Fajta</th>
              <th>Méret</th>
              <th>Szín</th>
              <th class="text-center">Minőség</th>
              <th class="text-right">Mennyiség</th>
              <th class="text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredClothes" :key="item.RuhaID">
              <td class="font-medium">{{ item.Cikkszam }}</td>
              <td>{{ item.Fajta }}</td>
              <td>{{ item.Meret }}</td>
              <td>{{ item.Szin }}</td>
              <td class="text-center">
                <span class="badge" :class="{
                  'badge-success': item.Minoseg === 'Uj',
                  'badge-info': item.Minoseg === 'Jo',
                  'badge-danger': item.Minoseg === 'Szakadt'
                }">{{ item.Minoseg }}</span>
              </td>
              <td class="text-right font-medium">
                {{ item.Mennyiseg }} db
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openEditModal(item)" class="btn-icon" :data-testid="`edit-btn-${item.RuhaID}`">
                    <Edit size="18" />
                  </button>
                  <button @click="deleteItem(item.RuhaID)" class="btn-icon text-danger" :data-testid="`delete-btn-${item.RuhaID}`">
                    <Trash2 size="18" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredClothes.length === 0 && !loading">
              <td colspan="7" class="text-center text-muted p-8">Nincs megjeleníthető elem.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="isEditing ? 'Termék szerkesztése' : 'Új termék felvétele'" @close="showModal = false">
      <template #body>
        <form @submit.prevent="saveItem" id="itemForm" class="flex flex-col gap-4">
          <div class="form-group">
            <label class="form-label">Cikkszám</label>
            <input v-model="form.Cikkszam" required data-testid="input-cikkszam" />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Fajta</label>
              <input v-model="form.Fajta" required data-testid="input-fajta" />
            </div>
            <div class="form-group">
              <label class="form-label">Szín</label>
              <input v-model="form.Szin" required data-testid="input-szin" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Méret</label>
              <input v-model="form.Meret" required data-testid="input-meret" />
            </div>
            <div class="form-group">
              <label class="form-label">Mennyiség</label>
              <input type="number" v-model="form.Mennyiseg" required min="0" data-testid="input-mennyiseg" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Minőség</label>
            <select v-model="form.Minoseg" data-testid="input-minoseg">
              <option value="Uj">Új</option>
              <option value="Jo">Jó</option>
              <option value="Szakadt">Szakadt</option>
            </select>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false" data-testid="modal-cancel">Mégse</button>
        <button type="submit" form="itemForm" class="btn btn-primary" data-testid="modal-save">Mentés</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.inventory-view {
  width: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-controls {
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  padding-left: 2.5rem;
}

.text-danger {
  color: var(--color-danger);
}

.text-danger:hover {
  background-color: var(--color-danger-bg);
  color: #991b1b;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.p-0 { padding: 0 !important; }
</style>
