<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';

const clothes = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const showMessageModal = ref(false);
const messageModalType = ref('success'); // 'success' | 'error'
const messageModalText = ref('');
const showDeleteConfirmModal = ref(false);
const itemToDelete = ref(null);
const form = ref({
  RuhaID: null,
  Cikkszam: '',
  Fajta: '',
  Meret: '',
  Szin: '',
  Mennyiseg: 0,
  Minoseg: 'Új',
  Ar: 0
});

const fetchClothes = async () => {
  loading.value = true;
  try {
    const response = await api.get('/ruhak');
    // Flatten Raktars into the list
    const flattened = [];
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(ruha => {
        if (ruha.Raktars && ruha.Raktars.length > 0) {
          ruha.Raktars.forEach(raktar => {
            flattened.push({
              ...ruha,
              Mennyiseg: raktar.Mennyiseg,
              Minoseg: raktar.Minoseg,
            });
          });
        } else {
          flattened.push({
            ...ruha,
            Mennyiseg: 0,
            Minoseg: 'Új'
          });
        }
      });
    }
    clothes.value = flattened;
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
    Minoseg: 'Új',
    Ar: 0
  };
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  form.value = { ...item, originalMinoseg: item.Minoseg };
  showModal.value = true;
};

const saveItem = async () => {
  try {
    if (isEditing.value) {
      await api.patch(`/ruhak/${form.value.Cikkszam}`, form.value);
      // Refresh list to handle merges correctly
      await fetchClothes();
    } else {
      const payload = { ...form.value };
      if (!payload.Cikkszam) delete payload.Cikkszam;
      
      await api.post('/ruhak', payload);
      await fetchClothes();
    }
    showModal.value = false;
  } catch (error) {
    console.error('Error saving item:', error);
    messageModalText.value = 'Hiba történt a mentés során.';
    messageModalType.value = 'error';
    showMessageModal.value = true;
  }
};

const deleteItem = async (item) => {
  itemToDelete.value = item;
  showDeleteConfirmModal.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  
  try {
    await api.delete(`/ruhak/${itemToDelete.value.Cikkszam}/variants/${itemToDelete.value.Minoseg}`);
    // Only remove the specific variant locally
    clothes.value = clothes.value.filter(c => !(c.Cikkszam === itemToDelete.value.Cikkszam && c.Minoseg === itemToDelete.value.Minoseg));
    showDeleteConfirmModal.value = false;
    itemToDelete.value = null;
  } catch (error) {
    console.error('Error deleting item:', error);
    messageModalText.value = 'Hiba történt a törlés során.';
    messageModalType.value = 'error';
    showMessageModal.value = true;
    showDeleteConfirmModal.value = false;
    itemToDelete.value = null;
  }
};

onMounted(fetchClothes);
</script>

<template>
  <div class="inventory-container">
    <!-- Header Card -->
    <div class="header-card">
      <h1 class="header-title">Készlet</h1>
      <p class="header-subtitle">Raktárkészlet kezelése</p>
    </div>

    <!-- Controls Row -->
    <div class="controls">
      <!-- Search Input -->
      <div class="search-box">
        <Search size="20" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Keresés fajta alapján..." 
          class="search-input"
        />
      </div>

      <!-- Add Button -->
      <button @click="openAddModal" class="btn-add">
        <Plus size="22" />
        <span>Új termék</span>
      </button>
    </div>

    <!-- Data Table Card -->
    <div class="data-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cikkszám</th>
              <th>Fajta</th>
              <th>Méret</th>
              <th>Szín</th>
              <th>Minőség</th>
              <th>Mennyiség</th>
              <th>Ár (Ft)</th>
              <th class="actions-col">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredClothes" :key="item.Cikkszam + item.Minoseg">
              <td class="font-medium">{{ item.Cikkszam }}</td>
              <td>{{ item.Fajta }}</td>
              <td>{{ item.Meret }}</td>
              <td>{{ item.Szin }}</td>
              <td>
                <span class="badge" :class="{
                  'badge-new': item.Minoseg === 'Új',
                  'badge-good': item.Minoseg === 'Jó',
                  'badge-damaged': item.Minoseg === 'Szakadt'
                }">{{ item.Minoseg }}</span>
              </td>
              <td class="font-semibold">{{ item.Mennyiseg }} db</td>
              <td class="font-semibold">{{ item.Ar ? Number(item.Ar).toLocaleString('hu-HU') : 0 }} Ft</td>
              <td class="actions-col">
                <div class="action-buttons">
                  <button @click="openEditModal(item)" class="btn-edit" title="Szerkesztés">
                    <Edit size="18" />
                  </button>
                  <button @click="deleteItem(item)" class="btn-delete" title="Törlés">
                    <Trash2 size="18" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredClothes.length === 0 && !loading">
              <td colspan="8" class="empty-cell">Nincs megjeleníthető elem.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal :show="showModal" :title="isEditing ? 'Termék szerkesztése' : 'Új termék felvétele'" @close="showModal = false">
      <template #body>
        <form @submit.prevent="saveItem" id="itemForm" class="item-form">
          <div class="form-group full-width">
            <label class="form-label">Cikkszám</label>
            <input 
              v-model="form.Cikkszam" 
              :placeholder="isEditing ? '' : 'Automatikusan generálás...'" 
              :disabled="true" 
              class="form-input disabled"
            />
            <p v-if="!isEditing" class="help-text">A rendszer automatikusan generálja a cikkszámot.</p>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fajta</label>
              <input v-model="form.Fajta" required class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Szín</label>
              <input v-model="form.Szin" required class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Méret</label>
              <input v-model="form.Meret" required class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Mennyiség</label>
              <input type="number" v-model="form.Mennyiseg" required min="0" class="form-input" />
            </div>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Minőség</label>
            <select v-model="form.Minoseg" class="form-select">
              <option value="Új">Új</option>
              <option value="Jó">Jó</option>
              <option value="Szakadt">Szakadt</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Ár (Ft)</label>
            <input type="number" v-model="form.Ar" min="0" step="1" class="form-input" placeholder="0" />
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn-secondary" @click="showModal = false">Mégse</button>
        <button type="submit" form="itemForm" class="btn-primary">Mentés</button>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal 
      :show="showDeleteConfirmModal" 
      title="Tétel törlése" 
      @close="showDeleteConfirmModal = false"
    >
      <template #body>
        <p v-if="itemToDelete">Biztosan törölni szeretné a(z) <strong>{{ itemToDelete.Minoseg }}</strong> minőségű tételt?</p>
        <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-top: 0.5rem;">Ez az akció nem vonható vissza.</p>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteConfirmModal = false">Mégse</button>
          <button class="btn-danger" @click="confirmDelete">Törlés</button>
        </div>
      </template>
    </Modal>

    <!-- Message Modal (Success/Error) -->
    <Modal 
      :show="showMessageModal" 
      :title="messageModalType === 'success' ? 'Sikeresen' : 'Hiba'" 
      @close="showMessageModal = false"
    >
      <template #body>
        <p>{{ messageModalText }}</p>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-primary" @click="showMessageModal = false">Rendben</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.inventory-container {
  padding: 12px 12px 12px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Dark mode compatibility for modal content */
:deep(.modal-content) {
  background: var(--color-surface);
  color: var(--color-text);
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

/* Controls */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface);
  border-radius: 1rem;
  padding: 0.875rem 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  flex: 1;
  max-width: 400px;
  transition: all 0.2s;
  height: 48px;
  box-sizing: border-box;
}

.search-box:focus-within {
  border-color: var(--color-primary);
}

.search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.9375rem;
  color: var(--color-text);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1e3a8a;
  color: white;
  padding: 0 1.5rem;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 0.9375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
  height: 48px;
  box-sizing: border-box;
}

.btn-add:hover {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 58, 138, 0.35);
}

/* Data Card */
.data-card {
  background: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.table-wrapper {
  overflow-x: auto;
  margin: -1.5rem;
  padding: 1.5rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.data-table th {
  background: var(--color-bg);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.data-table tr:hover td {
  background: var(--color-bg);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-new {
  background: #dcfce7;
  color: #166534;
}

.badge-good {
  background: #dbeafe;
  color: #1e40af;
}

.badge-damaged {
  background: #fee2e2;
  color: #b91c1c;
}

.actions-col {
  text-align: center;
  width: 100px;
}

.action-buttons {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.btn-edit {
  color: #2563eb;
}

.btn-edit:hover {
  background: #eff6ff;
}

.btn-delete {
  color: #dc2626;
}

.btn-delete:hover {
  background: #fef2f2;
}

.empty-cell {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

/* Modal Form */
.item-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.375rem;
}

.form-input, .form-select {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  font-size: 0.9375rem;
  transition: all 0.2s;
  background: var(--color-bg);
  color: var(--color-text);
  width: 100%;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input.disabled {
  background: var(--color-bg);
  cursor: not-allowed;
  opacity: 0.6;
}

.help-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 0.625rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: 600;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-secondary:hover {
  background: var(--color-sidebar-hover);
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  border-radius: 0.625rem;
  background: #1e3a8a;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-primary:hover {
  background: #1e40af;
}

.btn-danger {
  padding: 0.625rem 1.5rem;
  border-radius: 0.625rem;
  background: #dc2626;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-danger:hover {
  background: #b91c1c;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Tablet Breakpoint */
@media (max-width: 1024px) {
  .header-title {
    font-size: 3rem;
  }
  
  .header-subtitle {
    font-size: 1.25rem;
  }
  
  .data-table {
    font-size: 0.875rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.875rem 0.625rem;
  }
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
  .inventory-container {
    padding: 8px;
    gap: 1rem;
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
  }
  
  .controls {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-box {
    max-width: none;
    width: 100%;
    padding: 0.75rem 1rem;
  }
  
  .btn-add {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
  }
  
  .btn-add span {
    display: inline;
  }
  
  .data-card {
    border-radius: 1.5rem;
    padding: 1rem;
  }
  
  .table-wrapper {
    margin: -1rem;
    padding: 1rem;
  }
  
  .data-table {
    min-width: 700px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .header-title {
    font-size: 1.75rem;
  }
  
  .btn-add span {
    font-size: 0.875rem;
  }
}
</style>
