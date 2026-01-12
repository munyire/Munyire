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
    <div class="header flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1>Dolgozók</h1>
        <p class="text-muted">Munkavállalók kezelése</p>
      </div>
      
      <button @click="openAddModal" class="btn btn-primary">
        <Plus size="20" />
        Új dolgozó
      </button>
    </div>

    <div class="controls flex gap-4 mb-6">
      <div class="search-box relative flex-1 max-w-sm">
        <Search size="18" class="absolute left-3 top-3 text-muted" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Keresés név vagy email alapján..." 
          class="pl-10"
        />
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-left text-sm font-medium text-muted border-b border-gray-100">
              <th class="px-6 py-4">Név</th>
              <th class="px-6 py-4">Email / Telefon</th>
              <th class="px-6 py-4">Munkakör</th>
              <th class="px-6 py-4">Szerepkör</th>
              <th class="px-6 py-4 text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="worker in filteredWorkers" :key="worker.DolgozoID" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-medium">{{ worker.DNev }}</td>
              <td class="px-6 py-4 text-sm">
                <div>{{ worker.Email }}</div>
                <div class="text-muted">{{ worker.Telefonszam }}</div>
              </td>
              <td class="px-6 py-4">{{ worker.Munkakor }}</td>
              <td class="px-6 py-4">
                 <span class="badge" :class="{
                  'bg-purple-100 text-purple-700': worker.Szerepkor === 'Admin',
                  'bg-blue-100 text-blue-700': worker.Szerepkor === 'Manager',
                  'bg-gray-100 text-gray-700': worker.Szerepkor === 'Dolgozo'
                }">{{ worker.Szerepkor }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openEditModal(worker)" class="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit size="18" />
                  </button>
                  <button @click="deleteWorker(worker.DolgozoID)" class="p-1 text-red-600 hover:bg-red-50 rounded">
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
          <div>
            <label class="block mb-1 text-sm font-medium">Teljes Név</label>
            <input v-model="form.DNev" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium">Email</label>
              <input type="email" v-model="form.Email" required />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium">Telefonszám</label>
              <input v-model="form.Telefonszam" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
             <div>
              <label class="block mb-1 text-sm font-medium">Felhasználónév</label>
              <input v-model="form.FelhasznaloNev" required :disabled="isEditing" />
            </div>
             <div>
              <label class="block mb-1 text-sm font-medium">Jelszó</label>
              <input type="password" v-model="form.Jelszo" :placeholder="isEditing ? 'Hagyja üresen ha nem változik' : ''" :required="!isEditing" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium">Munkakör</label>
              <input v-model="form.Munkakor" />
            </div>
             <div>
              <label class="block mb-1 text-sm font-medium">Szerepkör</label>
              <select v-model="form.Szerepkor" required>
                <option value="Dolgozo">Dolgozó</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
           <div>
              <label class="block mb-1 text-sm font-medium">Nem</label>
              <select v-model="form.Nem">
                <option value="Férfi">Férfi</option>
                <option value="Nő">Nő</option>
              </select>
            </div>
        </form>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Mégse</button>
        <button type="submit" form="workerForm" class="btn btn-primary">Mentés</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.bg-purple-100 { background-color: #f3e8ff; }
.text-purple-700 { color: #7e22ce; }
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-700 { color: #1d4ed8; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-700 { color: #374151; }
</style>
