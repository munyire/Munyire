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
      // Map fields for /auth/register
      const registerPayload = {
        name: form.value.DNev,
        email: form.value.Email,
        username: form.value.FelhasznaloNev,
        password: form.value.Jelszo,
        role: form.value.Szerepkor
      };

      const res = await api.post('/auth/register', registerPayload);
      const newUserId = res.data.id;

      // Update remaining fields that register might have missed
      const extraDetails = {
        Telefonszam: form.value.Telefonszam,
        Nem: form.value.Nem,
        Munkakor: form.value.Munkakor
      };
      
      // Update the rest of the details
      await api.patch(`/dolgozok/${newUserId}`, extraDetails);

      workers.value.push({ 
        ...form.value, 
        DolgozoID: newUserId,
        // Ensure we don't store password in frontend list
        Jelszo: undefined 
      });
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
  <div class="workers-container w-full">
    <!-- Centered Header Card -->
    <div class="header-card p-14 shadow-xl bg-white rounded-[2rem] flex flex-col items-center justify-center text-center">
      <h1 class="text-8xl font-black tracking-tighter leading-none text-gray-900 m-0">Dolgozók</h1>
      <p class="text-4xl mt-8 font-semibold text-gray-500">Munkavállalók központi kezelése</p>
    </div>

    <!-- Add Button Row (Above search like in Inventory) -->
    <div class="actions-row flex justify-end mb-[12px]">
      <button @click="openAddModal" class="btn btn-primary px-8 py-4 text-lg font-bold shadow-lg">
        <Plus size="24" />
        Új dolgozó
      </button>
    </div>

    <!-- Search Row -->
    <div class="controls flex gap-4 mb-[12px]">
      <div class="search-box relative flex-1 max-w-sm">
        <Search size="18" class="absolute left-3 top-3 text-muted" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Keresés név vagy email alapján..." 
          class="pl-10 h-10 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-sm font-semibold text-muted border-b border-gray-100">
              <th class="px-6 py-5 text-center">Név</th>
              <th class="px-6 py-5 text-center">Elérhetőség</th>
              <th class="px-6 py-5 text-center">Munkakör</th>
              <th class="px-6 py-5 text-center">Szerepkör</th>
              <th class="px-6 py-5 text-center">Műveletek</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="worker in filteredWorkers" :key="worker.DolgozoID" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-5 font-bold text-center text-lg text-gray-900 border-r border-gray-50/50">{{ worker.DNev }}</td>
              <td class="px-6 py-5 text-center border-r border-gray-50/50">
                <div class="font-medium text-gray-700">{{ worker.Email }}</div>
                <div class="text-sm text-gray-400 mt-1">{{ worker.Telefonszam }}</div>
              </td>
              <td class="px-6 py-5 text-center font-medium text-gray-600 border-r border-gray-50/50">{{ worker.Munkakor }}</td>
              <td class="px-6 py-5 text-center border-r border-gray-50/50">
                 <span class="px-4 py-2 rounded-full text-sm font-bold shadow-sm inline-block min-w-[100px]" :class="{
                  'bg-purple-100 text-purple-700': worker.Szerepkor === 'Admin',
                  'bg-orange-100 text-orange-700': worker.Szerepkor === 'Manager',
                  'bg-green-100 text-green-700': worker.Szerepkor === 'Dolgozo'
                }">{{ worker.Szerepkor.toUpperCase() }}</span>
              </td>
              <td class="px-6 py-5 text-center">
                <div class="inline-flex items-center gap-4">
                  <button @click="openEditModal(worker)" class="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110" title="Szerkesztés">
                    <Edit size="22" />
                  </button>
                  <button @click="deleteWorker(worker.DolgozoID)" class="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all hover:scale-110" title="Törlés">
                    <Trash2 size="22" />
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
.workers-container {
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

.card {
  background-color: white;
  border-radius: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.search-box input {
  outline: none;
  font-family: inherit;
}

.btn-primary {
  background-color: #1e3a8a;
  color: white;
  border-radius: 1.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Role Specific Colors */
.bg-purple-100 { background-color: #f3e8ff !important; }
.text-purple-700 { color: #7e22ce !important; }

.bg-orange-100 { background-color: #ffedd5 !important; }
.text-orange-700 { color: #c2410c !important; }

.bg-green-100 { background-color: #dcfce7 !important; }
.text-green-700 { color: #15803d !important; }
</style>
