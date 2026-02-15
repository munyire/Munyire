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
  ChevronRight,
  ChevronLeft,
  X,
  Shirt,
  Printer
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import PrintTemplate from '../components/PrintTemplate.vue';

const workers = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedWorker = ref(null);
const isMobile = ref(false);
const showMobileDetail = ref(false);

const showModal = ref(false);
const isEditing = ref(false);
const showMessageModal = ref(false);
const messageModalType = ref('success'); // 'success' | 'error'
const messageModalText = ref('');
const showDeleteConfirmModal = ref(false);
const workerToDelete = ref(null);
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

// Check mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchWorkers();
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
    (w.FelhasznaloNev && w.FelhasznaloNev.toLowerCase().includes(q)) ||
    (w.Munkakor && w.Munkakor.toLowerCase().includes(q)) ||
    (w.Szerepkor && w.Szerepkor.toLowerCase().includes(q))
  );
});

watch(filteredWorkers, (newVal) => {
  if (newVal.length > 0 && (!selectedWorker.value || !newVal.find(w => w.DolgozoID === selectedWorker.value.DolgozoID))) {
    selectedWorker.value = newVal[0];
  } else if (newVal.length === 0) {
    selectedWorker.value = null;
  }
});



const selectWorker = (worker) => {
  selectedWorker.value = worker;
  if (isMobile.value) {
    showMobileDetail.value = true;
  }
  fetchClothingHistory(worker.DolgozoID);
};

// ===== CLOTHING HISTORY =====
const clothingHistory = ref([]);
const historyLoading = ref(false);
const showWorkerReceipt = ref(false);

const fetchClothingHistory = async (dolgozoId) => {
  historyLoading.value = true;
  try {
    const res = await api.get(`/dolgozok/${dolgozoId}/ruhak`);
    clothingHistory.value = res.data;
  } catch (err) {
    console.error('Error fetching clothing history:', err);
    clothingHistory.value = [];
  } finally {
    historyLoading.value = false;
  }
};

const activeClothes = computed(() => 
  clothingHistory.value.filter(item => !item.VisszaDatum)
);

const returnedClothes = computed(() => 
  clothingHistory.value.filter(item => item.VisszaDatum)
);

const workerReceiptColumns = [
  { key: 'Fajta', label: 'Ruha t\u00edpusa' },
  { key: 'Cikkszam', label: 'Cikksz\u00e1m' },
  { key: 'Mennyiseg', label: 'Mennyis\u00e9g' },
  { key: 'KiadasDatum', label: 'Kiad\u00e1s d\u00e1tuma' },
  { key: 'Indok', label: 'Indok' },
];

const workerReceiptData = computed(() => {
  return activeClothes.value.map(item => ({
    Fajta: item.Ruha?.Fajta || 'Ismeretlen',
    Cikkszam: item.Ruha?.Cikkszam || item.Cikkszam || '-',
    Mennyiseg: `${item.Mennyiseg || 1} db`,
    KiadasDatum: new Date(item.KiadasDatum).toLocaleDateString('hu-HU'),
    Indok: item.Indok || '-',
  }));
});

const workerReceiptSummary = computed(() => {
  const total = activeClothes.value.reduce((sum, item) => sum + (item.Mennyiseg || 1), 0);
  return `${total} db`;
});

const closeMobileDetail = () => {
  showMobileDetail.value = false;
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
    messageModalText.value = 'Hiba történt a mentés során.';
    messageModalType.value = 'error';
    showMessageModal.value = true;
  }
};

const deleteWorker = async (id) => {
  workerToDelete.value = id;
  showDeleteConfirmModal.value = true;
};

const confirmDelete = async () => {
  if (!workerToDelete.value) return;
  
  try {
    await api.delete(`/dolgozok/${workerToDelete.value}`);
    const index = workers.value.findIndex(w => w.DolgozoID === workerToDelete.value);
    workers.value = workers.value.filter(w => w.DolgozoID !== workerToDelete.value);
    if (selectedWorker.value?.DolgozoID === workerToDelete.value) {
      selectedWorker.value = workers.value[index] || workers.value[index - 1] || null;
    }
    showDeleteConfirmModal.value = false;
    workerToDelete.value = null;
  } catch (error) {
    console.error('Error deleting worker:', error);
    messageModalText.value = 'Hiba történt a törlés során.';
    messageModalType.value = 'error';
    showMessageModal.value = true;
    showDeleteConfirmModal.value = false;
    workerToDelete.value = null;
  }
};
</script>

<template>
  <div class="workers-page">
    <!-- Header Card -->
    <div class="header-card">
      <h1 class="header-title">Dolgozók</h1>
      <p class="header-subtitle">Munkavállalók központi kezelése</p>
    </div>

    <!-- Actions Row -->
    <div class="actions-row">
      <button @click="openAddModal" class="btn-add">
        <Plus size="24" />
        <span>Új dolgozó</span>
      </button>
      
      <!-- Total Workers Box -->
      <div class="stats-box">
        <div class="stats-icon">
          <Users size="24" />
        </div>
        <div class="stats-info">
          <span class="stats-label">Összesen</span>
          <div class="stats-value">{{ workers.length }} alkalmazott</div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content-area">
      <!-- Left: Worker List -->
      <aside class="worker-list-section" :class="{ 'hidden-mobile': showMobileDetail && isMobile }">
        <div class="search-container">
          <Search size="20" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Név, munkakör vagy szerepkör..." 
            class="sidebar-search-input"
          />
        </div>

        <div class="worker-list">
          <div 
            v-for="worker in filteredWorkers" 
            :key="worker.DolgozoID"
            @click="selectWorker(worker)"
            class="worker-list-item"
            :class="{ 'active': selectedWorker?.DolgozoID === worker.DolgozoID }"
          >
            <div class="avatar-mini">
              <User size="24" class="text-gray-500" />
            </div>
            <div class="item-info">
              <span class="item-name">{{ worker.DNev }}</span>
              <span class="item-id">ID: #{{ worker.DolgozoID }}</span>
            </div>
            <ChevronRight size="18" class="arrow-icon" />
          </div>

          <div v-if="filteredWorkers.length === 0" class="empty-list">
            <Users size="40" />
            <p>Nincs találat</p>
          </div>
        </div>
      </aside>

      <!-- Right: Worker Details -->
      <main class="worker-detail-section" :class="{ 'mobile-open': showMobileDetail && isMobile }">
        <!-- Mobile Back Button -->
        <button v-if="isMobile && showMobileDetail" @click="closeMobileDetail" class="mobile-back-btn">
          <ChevronLeft size="20" />
          <span>Vissza a listához</span>
        </button>

        <div v-if="selectedWorker" class="detail-card">
          <div class="detail-content">
            <!-- Profile Header -->
            <div class="detail-header">
              <div class="avatar-large">
                <User size="64" class="text-gray-400" />
              </div>
              <div class="header-info">
                <div class="header-top">
                  <div>
                    <h2 class="worker-name">{{ selectedWorker.DNev }}</h2>
                    <div class="tags">
                      <span class="tag tag-blue">{{ selectedWorker.Munkakor || 'Nincs munkakör' }}</span>
                      <span class="tag" :class="{
                        'tag-purple': selectedWorker.Szerepkor === 'Admin',
                        'tag-orange': selectedWorker.Szerepkor === 'Manager',
                        'tag-green': selectedWorker.Szerepkor === 'Dolgozo'
                      }">{{ selectedWorker.Szerepkor }}</span>
                    </div>
                  </div>
                  <div class="header-actions">
                    <button @click="openEditModal(selectedWorker)" class="action-btn edit" title="Szerkesztés">
                      <Edit size="20" />
                    </button>
                    <button @click="deleteWorker(selectedWorker.DolgozoID)" class="action-btn delete" title="Törlés">
                      <Trash2 size="20" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detailed Info Grid -->
            <div class="detail-grid">
              <div class="data-box">
                <Mail size="20" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Email cím</span>
                  <span class="data-value">{{ selectedWorker.Email }}</span>
                </div>
              </div>

              <div class="data-box">
                <Phone size="20" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Telefonszám</span>
                  <span class="data-value">{{ selectedWorker.Telefonszam || '-' }}</span>
                </div>
              </div>

              <div class="data-box">
                <Briefcase size="20" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Munkakör</span>
                  <span class="data-value">{{ selectedWorker.Munkakor || 'Nincs megadva' }}</span>
                </div>
              </div>

              <div class="data-box">
                <ShieldCheck size="20" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Szerepkör</span>
                  <span class="data-value">{{ selectedWorker.Szerepkor }}</span>
                </div>
              </div>

              <div class="data-box">
                <User size="20" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Azonosító</span>
                  <span class="data-value">#{{ selectedWorker.DolgozoID }}</span>
                </div>
              </div>

              <div class="data-box">
                <Users size="20" class="data-icon" />
                <div class="data-content">
                  <span class="data-label">Nem</span>
                  <span class="data-value">{{ selectedWorker.Nem }}</span>
                </div>
              </div>
            </div>

            <!-- Clothing History Section -->
            <div class="history-section">
              <div class="history-header">
                <h3 class="history-title">
                  <Shirt size="20" />
                  Ruhakiadási előzmények
                </h3>
                <button v-if="activeClothes.length > 0" class="btn-receipt" @click="showWorkerReceipt = true">
                  <Printer size="16" />
                  <span>Átvételi lap</span>
                </button>
              </div>

              <div v-if="historyLoading" class="history-loading">Betöltés...</div>

              <!-- Active items -->
              <div v-if="activeClothes.length > 0" class="history-group">
                <h4 class="group-label">Jelenleg kint lévő ruhák ({{ activeClothes.length }})</h4>
                <div class="history-table-wrap">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Ruha</th>
                        <th>Cikkszám</th>
                        <th>Db</th>
                        <th>Kiadás</th>
                        <th>Indok</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in activeClothes" :key="item.RuhaKiBeID">
                        <td class="fw-600">{{ item.Ruha?.Fajta || 'Ismeretlen' }}</td>
                        <td class="mono">{{ item.Ruha?.Cikkszam || item.Cikkszam }}</td>
                        <td>{{ item.Mennyiseg || 1 }}</td>
                        <td>{{ new Date(item.KiadasDatum).toLocaleDateString('hu-HU') }}</td>
                        <td class="muted">{{ item.Indok || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Returned items -->
              <div v-if="returnedClothes.length > 0" class="history-group">
                <h4 class="group-label">Visszavett ruhák ({{ returnedClothes.length }})</h4>
                <div class="history-table-wrap">
                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>Ruha</th>
                        <th>Cikkszám</th>
                        <th>Db</th>
                        <th>Kiadás</th>
                        <th>Visszavétel</th>
                        <th>Minőség</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in returnedClothes" :key="item.RuhaKiBeID">
                        <td class="fw-600">{{ item.Ruha?.Fajta || 'Ismeretlen' }}</td>
                        <td class="mono">{{ item.Ruha?.Cikkszam || item.Cikkszam }}</td>
                        <td>{{ item.Mennyiseg || 1 }}</td>
                        <td>{{ new Date(item.KiadasDatum).toLocaleDateString('hu-HU') }}</td>
                        <td>{{ new Date(item.VisszaDatum).toLocaleDateString('hu-HU') }}</td>
                        <td>
                          <span class="quality-badge" :class="'q-' + (item.RuhaMinoseg || 'unknown').toLowerCase()">{{ item.RuhaMinoseg || '-' }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="!historyLoading && clothingHistory.length === 0" class="history-empty">
                Nincs ruhakiadási előzmény.
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-detail">
          <Users size="64" />
          <p>Válassz egy dolgozót a megtekintéshez</p>
        </div>
      </main>
    </div>

    <!-- Modal for Add/Edit -->
    <Modal :show="showModal" :title="isEditing ? 'Dolgozó szerkesztése' : 'Új dolgozó felvétele'" @close="showModal = false">
      <template #body>
        <form @submit.prevent="saveWorker" id="workerForm" class="worker-form">
          <div class="form-group full-width">
            <label class="form-label">Teljes Név</label>
            <input v-model="form.DNev" required class="form-input" placeholder="Példa János" />
          </div>
          <div class="form-group">
            <label class="form-label">Email cím</label>
            <input type="email" v-model="form.Email" required class="form-input" placeholder="janos@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Telefonszám</label>
            <input v-model="form.Telefonszam" class="form-input" placeholder="+36 30 123 4567" />
          </div>
          <div class="form-group">
            <label class="form-label">Felhasználónév</label>
            <input v-model="form.FelhasznaloNev" required :disabled="isEditing" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Jelszó</label>
            <input type="password" v-model="form.Jelszo" :placeholder="isEditing ? 'Hagyja üresen ha nem változik' : ''" :required="!isEditing" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Munkakör</label>
            <input v-model="form.Munkakor" class="form-input" placeholder="Pl. Raktáros" />
          </div>
          <div class="form-group">
            <label class="form-label">Szerepkör</label>
            <select v-model="form.Szerepkor" required class="form-select">
              <option value="Dolgozo">Dolgozó</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Nem</label>
            <select v-model="form.Nem" class="form-select">
              <option value="Férfi">Férfi</option>
              <option value="Nő">Nő</option>
            </select>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showModal = false">Mégse</button>
          <button type="submit" form="workerForm" class="btn-primary">Mentés</button>
        </div>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal 
      :show="showDeleteConfirmModal" 
      title="Dolgozó törlése" 
      @close="showDeleteConfirmModal = false"
    >
      <template #body>
        <p>Biztosan törölni szeretné ezt a dolgozót?</p>
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

    <!-- Worker Receipt Print -->
    <PrintTemplate
      :visible="showWorkerReceipt"
      :title="'Átvételi elismervény – ' + (selectedWorker?.DNev || '')"
      subtitle="Munkaruha kiadás igazolása"
      :period="new Date().toLocaleDateString('hu-HU')"
      :columns="workerReceiptColumns"
      :data="workerReceiptData"
      summary-label="Összes kiadott tétel"
      :summary-value="workerReceiptSummary"
      @close="showWorkerReceipt = false"
    />
  </div>
</template>

<style scoped>
.workers-page {
  background-color: var(--color-bg);
  height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  padding: 0 12px 12px 0;
  overflow: hidden;
  transition: background-color 0.3s ease;
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
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s ease;
}

.header-title {
  font-size: 3rem;
  font-weight: 900;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.025em;
  transition: color 0.3s ease;
}

.header-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  margin: 0.5rem 0 0;
  font-weight: 600;
  transition: color 0.3s ease;
}

/* Actions Row */
.actions-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.btn-add {
  background-color: #1e3a8a;
  color: white;
  padding: 0 1.5rem;
  height: 64px;
  border-radius: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
  border: none;
  cursor: pointer;
  font-size: 0.9375rem;
}

.btn-add:hover {
  background-color: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(30, 58, 138, 0.3);
}

.stats-box {
  background: var(--color-surface);
  padding: 0 1.5rem;
  height: 64px;
  border-radius: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: background-color 0.3s ease;
}

.stats-icon {
  padding: 0.75rem;
  background: var(--color-sidebar-active);
  border-radius: 1rem;
  color: var(--color-sidebar-active-text);
}

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  transition: color 0.3s ease;
}

/* Main Content Area */
.main-content-area {
  flex: 1;
  display: flex;
  gap: 1.5rem;
  overflow: hidden;
  padding: 0 0.5rem;
  min-height: 0;
}

/* Worker List Section */
.worker-list-section {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  background: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  transition: background-color 0.3s ease;
}

.search-container {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.sidebar-search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 0.875rem;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  color: var(--color-text);
}

.sidebar-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.sidebar-search-input::placeholder {
  color: var(--color-text-muted);
}

.worker-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  min-height: 0;
}

.worker-list-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  background: transparent;
  border: 1px solid transparent;
}

.worker-list-item:hover {
  background: var(--color-bg);
  border-color: var(--color-border);
  transform: translateX(4px);
}

.worker-list-item.active {
  background: var(--color-sidebar-active);
  border-color: var(--color-primary);
}

.avatar-mini {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0.75rem;
  min-width: 0;
}

.item-name {
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.item-id {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.arrow-icon {
  color: var(--color-border);
  opacity: 0;
  transition: opacity 0.2s;
}

.worker-list-item:hover .arrow-icon,
.worker-list-item.active .arrow-icon {
  opacity: 1;
  color: var(--color-primary);
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

/* Worker Detail Section */
.worker-detail-section {
  flex: 1;
  background: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background-color 0.3s ease;
}

.mobile-back-btn {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: var(--color-bg);
  border: none;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
}

.detail-card {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.detail-content {
  padding: 2rem;
}

.detail-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.avatar-large {
  width: 7rem;
  height: 7rem;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 4px solid white;
  flex-shrink: 0;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.worker-name {
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-text);
  margin: 0 0 0.75rem;
  letter-spacing: -0.025em;
  transition: color 0.3s ease;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.375rem 1rem;
  border-radius: 2rem;
  font-size: 0.8125rem;
  font-weight: 700;
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.tag-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.tag-purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.tag-orange { background: rgba(249, 115, 22, 0.2); color: #fb923c; }
.tag-green { background: rgba(34, 197, 94, 0.2); color: #4ade80; }

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.625rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  background: none;
}

.action-btn.edit { color: #4f46e5; background: #f5f3ff; }
.action-btn.edit:hover { background: #ede9fe; transform: scale(1.05); }
.action-btn.delete { color: #e11d48; background: #fff1f2; }
.action-btn.delete:hover { background: #ffe4e6; transform: scale(1.05); }

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.data-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.data-box:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
  transform: translateX(4px);
}

.data-icon {
  color: var(--color-primary);
  opacity: 0.7;
  flex-shrink: 0;
}

.data-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.data-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.data-value {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.empty-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-border);
  gap: 1rem;
}

.empty-detail p {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

/* Clothing History Section */
.history-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
}

.btn-receipt {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-receipt:hover {
  background: #1e40af;
  transform: translateY(-1px);
}

.history-loading {
  text-align: center;
  padding: 1.5rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.history-group {
  margin-bottom: 1.25rem;
}

.group-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem;
}

.history-table-wrap {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.history-table th {
  padding: 0.5rem 0.625rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.history-table td {
  padding: 0.5rem 0.625rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.history-table tr:last-child td {
  border-bottom: none;
}

.history-table .fw-600 { font-weight: 600; }
.history-table .mono { font-family: monospace; color: var(--color-primary); font-weight: 600; }
.history-table .muted { color: var(--color-text-muted); font-style: italic; }

.quality-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.q-új { background: #dcfce7; color: #166534; }
.q-jó { background: #dbeafe; color: #1e40af; }
.q-használt { background: #fef3c7; color: #92400e; }
.q-kopott { background: #fed7aa; color: #9a3412; }
.q-szakadt { background: #fecaca; color: #991b1b; }
.q-selejt { background: #f3e8ff; color: #6b21a8; }
.q-unknown { background: var(--color-bg); color: var(--color-text-muted); }

.history-empty {
  text-align: center;
  padding: 1.5rem;
  color: var(--color-text-muted);
  font-style: italic;
  font-size: 0.875rem;
}

/* Form Styles */
.worker-form {
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
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.375rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: var(--color-bg);
  color: var(--color-text);
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input:disabled {
  background: var(--color-bg);
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 0.625rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: 700;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
}

.btn-secondary:hover { background: var(--color-sidebar-hover); }

.btn-primary {
  padding: 0.625rem 1.5rem;
  border-radius: 0.625rem;
  background: #1e3a8a;
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
}

.btn-primary:hover { background: #1e40af; transform: translateY(-1px); }

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
  .worker-list-section {
    width: 280px;
  }
  
  .header-title {
    font-size: 2.5rem;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .header-top {
    flex-direction: column;
    align-items: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
  .workers-page {
    padding: 8px;
    height: auto;
    min-height: calc(100vh - 72px);
    overflow: visible;
  }
  
  .header-card {
    padding: 1.5rem 1rem;
    border-radius: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .header-title {
    font-size: 1.75rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .actions-row {
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 0;
  }
  
  .btn-add {
    flex: 1;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .stats-box {
    padding: 0.75rem 1rem;
  }
  
  .stats-value {
    font-size: 1rem;
  }
  
  .main-content-area {
    flex-direction: column;
    gap: 1rem;
    padding: 0;
  }
  
  .worker-list-section {
    width: 100%;
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 0;
    border-radius: 0;
  }
  
  .worker-list-section.hidden-mobile {
    display: none;
  }
  
  .worker-detail-section {
    position: fixed;
    inset: 56px 0 0 0;
    z-index: 50;
    border-radius: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  
  .worker-detail-section.mobile-open {
    transform: translateX(0);
  }
  
  .mobile-back-btn {
    display: flex;
  }
  
  .detail-content {
    padding: 1.5rem;
  }
  
  .avatar-large {
    width: 5rem;
    height: 5rem;
    border-radius: 1rem;
  }
  
  .worker-name {
    font-size: 1.5rem;
  }
  
  .data-box {
    padding: 1rem;
  }
  
  .data-value {
    font-size: 0.875rem;
  }
  
  /* Modal adjustments */
  .worker-form {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .modal-footer button {
    width: 100%;
    justify-content: center;
  }
}

/* Scrollbar for worker list */
.worker-list::-webkit-scrollbar {
  width: 4px;
}

.worker-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
</style>
