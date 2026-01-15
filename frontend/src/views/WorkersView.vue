<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search 
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';

const workers = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const form = ref({
  DolgozoID: null,
  DNev: '',
  Email: '',
  Telefonszam: '',
  Nem: 'Férfi',
  Munkakor: '',
  Szerepkor: 'Dolgozo',
  FelhasznaloNev: '',
  Jelszo: '' // Only for creation/update
});

const fetchWorkers = async () => {
  loading.value = true;
  try {
    const response = await api.get('/dolgozok');
    workers.value = response.data;
  } catch (error) {
    console.error('Error fetching workers:', error);
  } finally {
    loading.value = false;
  }
};

const filteredWorkers = computed(() => {
  if (!searchQuery.value) return workers.value;
  const q = searchQuery.value.toLowerCase();
  return workers.value.filter(w => 
    w.DNev.toLowerCase().includes(q) ||
    w.Email.toLowerCase().includes(q)
  );
});

const openAddModal = () => {
  isEditing.value = false;
  form.value = {
    DolgozoID: null,
    DNev: '',
    Email: '',
    Telefonszam: '',
    Nem: 'Férfi',
    Munkakor: '',
    Szerepkor: 'Dolgozo',
    FelhasznaloNev: '',
    Jelszo: ''
  };
  showModal.value = true;
};

const openEditModal = (worker) => {
  isEditing.value = true;
  form.value = { ...worker, Jelszo: '' }; // Don't show password, allow reset
  showModal.value = true;
};

const saveWorker = async () => {
  try {
    const payload = { ...form.value };
    if (!payload.Jelszo) delete payload.Jelszo; // Don't send empty password if not changing

    if (isEditing.value) {
      await api.patch(`/dolgozok/${form.value.DolgozoID}`, payload);
      const index = workers.value.findIndex(w => w.DolgozoID === form.value.DolgozoID);
      if (index !== -1) workers.value[index] = { ...workers.value[index], ...payload };
    } else {
      const res = await api.post('/auth/register', payload); // Use register endpoint for new users? Or specific endpoint?
      // Assuming /auth/register or a dedicated POST /dolgozok exists. POST /auth/register is in ENDPOINT.md
      // But typically admin uses a user management endpoint. ENDPOINT says POST /auth/register is for "Új felhasználó regisztrálása" (Admin only).
      // Let's use that.
      
      workers.value.push(res.data.user || { ...payload, DolgozoID: Date.now() });
    }
    showModal.value = false;
  } catch (error) {
    console.error('Error saving worker:', error);
    alert('Hiba történt a mentés során.');
  }
};

const deleteWorker = async (id) => {
  if (!confirm('Biztosan törölni szeretné ezt a dolgozót?')) return;
  try {
    await api.delete(`/dolgozok/${id}`);
    workers.value = workers.value.filter(w => w.DolgozoID !== id);
  } catch (error) {
    console.error('Error deleting worker:', error);
    alert('Hiba történt a törlés során.');
  }
};

onMounted(fetchWorkers);
</script>

<template>
  <div class="workers-view">
    <div class="view-header">
      <div class="header-content">
        <h1>Dolgozók</h1>
        <p class="text-muted">Munkavállalók kezelése</p>
      </div>
      
      <button @click="openAddModal" class="btn btn-primary" data-testid="workers-add-btn">
        <Plus size="20" />
        Új dolgozó
      </button>
    </div>

    <div class="view-controls">
      <div class="search-wrapper">
        <Search size="18" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Keresés név vagy email alapján..." 
          class="search-input"
          data-testid="search-input"
        />
      </div>
    </div>

    <div class="card p-0 overflow-hidden">
      <div class="data-table-wrapper">
        <table class="data-table" data-testid="workers-table">
          <thead>
            <tr>
              <th>Név</th>
              <th>Email / Telefon</th>
              <th>Munkakör</th>
              <th>Szerepkör</th>
              <th class="text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="worker in filteredWorkers" :key="worker.DolgozoID">
              <td class="font-medium">{{ worker.DNev }}</td>
              <td class="text-sm">
                <div>{{ worker.Email }}</div>
                <div class="text-muted">{{ worker.Telefonszam }}</div>
              </td>
              <td>{{ worker.Munkakor }}</td>
              <td>
                 <span class="badge" :class="{
                  'badge-info': worker.Szerepkor === 'Admin',
                  'badge-success': worker.Szerepkor === 'Manager',
                  'badge-neutral': worker.Szerepkor === 'Dolgozo'
                }">{{ worker.Szerepkor }}</span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openEditModal(worker)" class="btn-icon" :data-testid="`edit-btn-${worker.DolgozoID}`">
                    <Edit size="18" />
                  </button>
                  <button @click="deleteWorker(worker.DolgozoID)" class="btn-icon text-danger" :data-testid="`delete-btn-${worker.DolgozoID}`">
                    <Trash2 size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal :show="showModal" :title="isEditing ? 'Dolgozó szerkesztése' : 'Új dolgozó felvétele'" @close="showModal = false">
      <template #body>
        <form @submit.prevent="saveWorker" id="workerForm" class="flex flex-col gap-4">
          <div class="form-group">
            <label class="form-label">Teljes Név</label>
            <input v-model="form.DNev" required data-testid="input-name" />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" v-model="form.Email" required data-testid="input-email" />
            </div>
            <div class="form-group">
              <label class="form-label">Telefonszám</label>
              <input v-model="form.Telefonszam" data-testid="input-phone" />
            </div>
          </div>
          <div class="grid-2">
             <div class="form-group">
              <label class="form-label">Felhasználónév</label>
              <input v-model="form.FelhasznaloNev" required :disabled="isEditing" data-testid="input-username" />
            </div>
             <div class="form-group">
              <label class="form-label">Jelszó</label>
              <input type="password" v-model="form.Jelszo" :placeholder="isEditing ? 'Hagyja üresen ha nem változik' : ''" :required="!isEditing" data-testid="input-password" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Munkakör</label>
              <input v-model="form.Munkakor" data-testid="input-job" />
            </div>
             <div class="form-group">
              <label class="form-label">Szerepkör</label>
              <select v-model="form.Szerepkor" required data-testid="input-role">
                <option value="Dolgozo">Dolgozó</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
           <div class="form-group">
              <label class="form-label">Nem</label>
              <select v-model="form.Nem" data-testid="input-gender">
                <option value="Férfi">Férfi</option>
                <option value="Nő">Nő</option>
              </select>
            </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false" data-testid="modal-cancel">Mégse</button>
        <button type="submit" form="workerForm" class="btn btn-primary" data-testid="modal-save">Mentés</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.workers-view {
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
