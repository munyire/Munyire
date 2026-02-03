<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '../api/axios';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  User,
  ChevronRight
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';

const workers = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedWorker = ref(null);

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
  Jelszo: ''
});

const fetchWorkers = async () => {
  loading.value = true;
  try {
    const response = await api.get('/dolgozok');
    workers.value = response.data;
    if (workers.value.length > 0 && !selectedWorker.value) {
      selectedWorker.value = workers.value[0];
    }
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
    w.Email.toLowerCase().includes(q) ||
    w.DolgozoID.toString().includes(q) ||
    (w.FelhasznaloNev && w.FelhasznaloNev.toLowerCase().includes(q))
  );
});

// Watch for search filter changes to potentially update selected worker
watch(filteredWorkers, (newVal) => {
  if (newVal.length > 0 && (!selectedWorker.value || !newVal.find(w => w.DolgozoID === selectedWorker.value.DolgozoID))) {
    selectedWorker.value = newVal[0];
  } else if (newVal.length === 0) {
    selectedWorker.value = null;
  }
});

const getAvatar = (worker) => {
  if (!worker) return '/avatars/male_1.png';
  const id = worker.DolgozoID;
  const gender = worker.Nem === 'Nő' ? 'female' : 'male';
  const num = (id % 2) + 1;
  return `/avatars/${gender}_${num}.png`;
};

const selectWorker = (worker) => {
  selectedWorker.value = worker;
};

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
  form.value = { ...worker, Jelszo: '' };
  showModal.value = true;
};

const saveWorker = async () => {
  try {
    const payload = { ...form.value };
    if (!payload.Jelszo) delete payload.Jelszo;

    if (isEditing.value) {
      await api.patch(`/dolgozok/${form.value.DolgozoID}`, payload);
      const index = workers.value.findIndex(w => w.DolgozoID === form.value.DolgozoID);
      if (index !== -1) {
        workers.value[index] = { ...workers.value[index], ...payload };
        selectedWorker.value = workers.value[index];
      }
    } else {
      const registerPayload = {
        name: form.value.DNev,
        email: form.value.Email,
        username: form.value.FelhasznaloNev,
        password: form.value.Jelszo,
        role: form.value.Szerepkor
      };

      const res = await api.post('/auth/register', registerPayload);
      const newUserId = res.data.id;

      const extraDetails = {
        Telefonszam: form.value.Telefonszam,
        Nem: form.value.Nem,
        Munkakor: form.value.Munkakor
      };
      
      await api.patch(`/dolgozok/${newUserId}`, extraDetails);

      const newWorker = { 
        ...form.value, 
        DolgozoID: newUserId,
        Jelszo: undefined 
      };
      workers.value.push(newWorker);
      selectedWorker.value = newWorker;
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
    const index = workers.value.findIndex(w => w.DolgozoID === id);
    workers.value = workers.value.filter(w => w.DolgozoID !== id);
    if (selectedWorker.value?.DolgozoID === id) {
      selectedWorker.value = workers.value[index] || workers.value[index - 1] || null;
    }
  } catch (error) {
    console.error('Error deleting worker:', error);
    alert('Hiba történt a törlés során.');
  }
};

onMounted(fetchWorkers);
</script>

<template>
  <div class="workers-page h-full flex flex-col overflow-hidden">
    <!-- Header Card -->
    <div class="header-card p-12 shadow-2xl bg-white rounded-[2.5rem] flex flex-col items-center justify-center text-center mb-10 mx-6 border border-gray-100">
      <h1 class="text-7xl font-black tracking-tighter leading-none text-gray-900 m-0">Dolgozók</h1>
      <p class="text-3xl mt-4 font-semibold text-gray-500">Munkavállalók központi kezelése</p>
    </div>

    <!-- Actions Row -->
    <div class="actions-row flex items-center gap-8 mb-10 px-8">
      <button @click="openAddModal" class="btn-add shadow-lg text-lg px-8 py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl transition-all hover:-translate-y-1">
        <Plus size="28" />
        <span>Új dolgozó</span>
      </button>
      
      <!-- Total Workers Box -->
      <div class="stats-box bg-white px-10 py-5 rounded-[2rem] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-6">
        <div class="p-4 bg-blue-50 rounded-2xl text-blue-600">
          <Users size="28" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-gray-400 font-extrabold uppercase tracking-widest mb-1">Összesen</span>
          <div class="text-3xl font-black text-gray-900 leading-none">{{ workers.length }} alkalmazott</div>
        </div>
      </div>
    </div>

    <!-- Main Content Area: Sidebar on left, Large Card on right -->
    <div class="flex-1 flex gap-16 overflow-hidden px-12 pb-12">
      <!-- Left: Worker List (No Box) -->
      <aside class="w-[30rem] flex flex-col pt-4">
        <div class="mb-10">
          <div class="search-container relative">
            <Search size="22" class="search-icon-fixed" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Keress név vagy ID alapján..." 
              class="sidebar-search-input"
            />
          </div>
        </div>

        <div class="worker-list flex-1 overflow-y-auto pr-4 pb-8">
          <div 
            v-for="worker in filteredWorkers" 
            :key="worker.DolgozoID"
            @click="selectWorker(worker)"
            class="worker-list-item group"
            :class="{ 'active': selectedWorker?.DolgozoID === worker.DolgozoID }"
          >
            <div class="avatar-mini-new">
              <img :src="getAvatar(worker)" :alt="worker.DNev">
            </div>
            <div class="item-info ml-5">
              <span class="item-name-new text-xl">{{ worker.DNev }}</span>
              <span class="item-id text-sm opacity-50">ID: #{{ worker.DolgozoID }}</span>
            </div>
            <ChevronRight size="20" class="arrow-icon opacity-0 group-hover:opacity-100 transition-all" />
          </div>

          <div v-if="filteredWorkers.length === 0" class="flex flex-col items-center justify-center py-10 opacity-30">
            <Users size="48" class="mb-2" />
            <p class="font-bold">Nincs találat</p>
          </div>
        </div>
      </aside>

      <!-- Right Box: Worker Details (THE BOX) -->
      <main class="standalone-card flex-1 bg-white shadow-2xl rounded-[3rem] border border-gray-100 overflow-hidden flex flex-col">
        <div v-if="selectedWorker" class="h-full flex flex-col overflow-y-auto">
          <div class="details-container p-12">
            <!-- Profile Top info -->
            <div class="details-header flex items-center gap-12 mb-12">
              <div class="avatar-large w-56 h-56 rounded-[2.5rem] shadow-2xl">
                <img :src="getAvatar(selectedWorker)" :alt="selectedWorker.DNev">
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <h2 class="text-6xl font-black text-gray-900 mb-4 tracking-tighter">{{ selectedWorker.DNev }}</h2>
                    <div class="flex items-center gap-4">
                      <span class="tag tag-blue text-lg px-5 py-2">{{ selectedWorker.Munkakor || 'Nincs munkakör' }}</span>
                      <span class="tag text-lg px-5 py-2" :class="{
                        'tag-purple': selectedWorker.Szerepkor === 'Admin',
                        'tag-orange': selectedWorker.Szerepkor === 'Manager',
                        'tag-green': selectedWorker.Szerepkor === 'Dolgozo'
                      }">{{ selectedWorker.Szerepkor }}</span>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <button @click="openEditModal(selectedWorker)" class="action-btn edit p-4 rounded-2xl shadow-md" title="Szerkesztés">
                      <Edit size="28" />
                    </button>
                    <button @click="deleteWorker(selectedWorker.DolgozoID)" class="action-btn delete p-4 rounded-2xl shadow-md" title="Törlés">
                      <Trash2 size="28" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detailed Stats (Vertical Stacked Boxes) -->
            <div class="details-body flex flex-col gap-6">
              <div class="data-box w-full shadow-sm hover:shadow-md">
                <Mail size="26" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Email cím</span>
                  <span class="data-value text-2xl font-black">{{ selectedWorker.Email }}</span>
                </div>
              </div>

              <div class="data-box w-full shadow-sm hover:shadow-md">
                <Phone size="26" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Telefonszám</span>
                  <span class="data-value text-2xl font-black">{{ selectedWorker.Telefonszam || '-' }}</span>
                </div>
              </div>

              <div class="data-box w-full shadow-sm hover:shadow-md">
                <Briefcase size="26" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Munkakör</span>
                  <span class="data-value text-2xl font-black">{{ selectedWorker.Munkakor || 'Nincs megadva' }}</span>
                </div>
              </div>

              <div class="data-box w-full shadow-sm hover:shadow-md">
                <ShieldCheck size="26" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Szerepkör</span>
                  <span class="data-value text-2xl font-black">{{ selectedWorker.Szerepkor }}</span>
                </div>
              </div>

              <div class="data-box w-full shadow-sm hover:shadow-md">
                <User size="26" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Azonosító</span>
                  <span class="data-value text-2xl font-black">#{{ selectedWorker.DolgozoID }}</span>
                </div>
              </div>

              <div class="data-box w-full shadow-sm hover:shadow-md">
                <Users size="26" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Nem</span>
                  <span class="data-value text-2xl font-black">{{ selectedWorker.Nem }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="h-full flex flex-col items-center justify-center opacity-40 select-none">
          <Users size="100" class="mb-6 text-gray-300" />
          <p class="text-2xl font-black text-gray-400">Válassz egy dolgozót a megtekintéshez</p>
        </div>
      </main>
    </div>

    <!-- Modal for Add/Edit -->
    <Modal :show="showModal" :title="isEditing ? 'Dolgozó szerkesztése' : 'Új dolgozó felvétele'" @close="showModal = false">
      <template #body>
        <form @submit.prevent="saveWorker" id="workerForm" class="grid grid-cols-2 gap-6 p-2">
          <div class="col-span-2">
            <label class="form-label">Teljes Név</label>
            <input v-model="form.DNev" required class="form-input" placeholder="Példa János" />
          </div>
          <div>
            <label class="form-label">Email cím</label>
            <input type="email" v-model="form.Email" required class="form-input" placeholder="janos@example.com" />
          </div>
          <div>
            <label class="form-label">Telefonszám</label>
            <input v-model="form.Telefonszam" class="form-input" placeholder="+36 30 123 4567" />
          </div>
          <div>
            <label class="form-label">Felhasználónév</label>
            <input v-model="form.FelhasznaloNev" required :disabled="isEditing" class="form-input" />
          </div>
          <div>
            <label class="form-label">Jelszó</label>
            <input type="password" v-model="form.Jelszo" :placeholder="isEditing ? 'Hagyja üresen ha nem változik' : ''" :required="!isEditing" class="form-input" />
          </div>
          <div>
            <label class="form-label">Munkakör</label>
            <input v-model="form.Munkakor" class="form-input" placeholder="Pl. Raktáros" />
          </div>
          <div>
            <label class="form-label">Szerepkör</label>
            <select v-model="form.Szerepkor" required class="form-select">
              <option value="Dolgozo">Dolgozó</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="form-label">Nem</label>
            <select v-model="form.Nem" class="form-select">
              <option value="Férfi">Férfi</option>
              <option value="Nő">Nő</option>
            </select>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex gap-3 justify-end w-full px-2">
          <button class="btn-secondary" @click="showModal = false">Mégse</button>
          <button type="submit" form="workerForm" class="btn-primary-small">Mentés</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.workers-page {
  background-color: #f1f5f9; /* Darker gray background for better contrast */
  height: calc(100vh - 0px);
}

/* Header Card (Restored) */
.header-card {
  background-color: white;
  border-radius: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100% !important;
}

.btn-add {
  background-color: #1e3a8a;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

.btn-add:hover {
  background-color: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(30, 58, 138, 0.3);
}

/* Sidebar */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  background-color: #f8fafc;
  border: 1px border-gray-100;
  border-radius: 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  border-color: #1e3a8a;
}

.worker-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  border: 1px solid transparent;
}

.worker-item:hover {
  background-color: #f8fafc;
}

.worker-item.active {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

.avatar-mini {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  overflow: hidden;
  background-color: #f1f5f9;
  flex-shrink: 0;
}

.avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.item-id {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.arrow-icon {
  color: #cbd5e1;
}

.active .item-name { color: #1e3a8a; }
.active .arrow-icon { color: #1e3a8a; }

/* Content Details */
.avatar-large {
  width: 10rem;
  height: 10rem;
  border-radius: 2.5rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 4px solid white;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 700;
  background-color: #f1f5f9;
  color: #475569;
}

.tag-blue { background-color: #e0f2fe; color: #0369a1; }
.tag-purple { background-color: #f3e8ff; color: #7e22ce; }
.tag-orange { background-color: #ffedd5; color: #c2410c; }
.tag-green { background-color: #dcfce7; color: #15803d; }

.action-btn {
  padding: 0.75rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.action-btn.edit { color: #4f46e5; background-color: #f5f3ff; }
.action-btn.edit:hover { background-color: #ede9fe; transform: scale(1.05); }
.action-btn.delete { color: #e11d48; background-color: #fff1f2; }
.action-btn.delete:hover { background-color: #ffe4e6; transform: scale(1.05); }

/* Data Boxes */
.data-box {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 1.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s ease;
}

.data-box:hover {
  border-color: #1e3a8a;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.08);
  transform: translateX(4px);
}

.data-icon {
  color: #1e3a8a;
  opacity: 0.7;
}

.data-content {
  display: flex;
  flex-direction: column;
}

.data-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.2rem;
}

.data-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
}

.sidebar-search-input {
  width: 100%;
  padding: 1.25rem 1rem 1.25rem 3.5rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.sidebar-search-input:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.1);
}

.search-icon-fixed {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  z-index: 10;
}

/* Worker List Items (New Style) */
.worker-list-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 0.75rem;
  border: 1px solid transparent;
}

.worker-list-item:hover {
  background-color: white;
  border-color: #e2e8f0;
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.worker-list-item.active {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.08);
}

.avatar-mini-new {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.25rem;
  overflow: hidden;
  background-color: #f1f5f9;
  flex-shrink: 0;
  border: 2px solid white;
}

.avatar-mini-new img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-name-new {
  font-weight: 800;
  color: #1e293b;
}

.active .item-name-new { color: #1e3a8a; }

/* Form Elements */
.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.5rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.btn-secondary {
  padding: 0.6rem 1.2rem;
  border-radius: 0.75rem;
  background-color: #f1f5f9;
  color: #475569;
  font-weight: 700;
  transition: all 0.2s ease;
}

.btn-secondary:hover { background-color: #e2e8f0; }

.btn-primary-small {
  padding: 0.6rem 1.5rem;
  border-radius: 0.75rem;
  background-color: #1e3a8a;
  color: white;
  font-weight: 700;
  transition: all 0.2s ease;
}

.btn-primary-small:hover { background-color: #1e40af; transform: translateY(-1px); }

/* Main Card Wrapper */
.main-card {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
}

/* Sidebar */
.worker-sidebar {
  background-color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #94a3b8;
  font-weight: 600;
}
</style>
