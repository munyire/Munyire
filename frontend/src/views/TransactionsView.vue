<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import SearchableSelect from '../components/common/SearchableSelect.vue';
import BaseButton from '../components/common/BaseButton.vue';
import Modal from '../components/ui/Modal.vue';
import { ArrowRightLeft, History, Check } from 'lucide-vue-next';

const activeTab = ref('issue');
const loading = ref(false);
const message = ref({ type: '', text: '' });

const workers = ref([]);
const clothes = ref([]);
const activeIssues = ref([]);

const issueForm = ref({
  DolgozoID: null,
  Cikkszam: null,
  Mennyiseg: 1,
  Indok: ''
});

const showReturnModal = ref(false);
const selectedReturnItem = ref(null);
const returnQuality = ref('Jó');
const qualityOptions = ['Új', 'Jó', 'Szakadt'];
const returnSearch = ref('');

const filteredActiveIssues = computed(() => {
  if (!returnSearch.value.trim()) {
    return activeIssues.value;
  }
  
  const searchText = returnSearch.value.toLowerCase();
  return activeIssues.value.filter(issue => {
    const workerName = (issue.Dolgozo?.DNev || '').toLowerCase();
    const clotheType = (issue.Ruha?.Fajta || '').toLowerCase();
    
    return workerName.includes(searchText) || clotheType.includes(searchText);
  });
});

const fetchDropdownData = async () => {
  try {
    const [workersRes] = await Promise.all([
      api.get('/dolgozok/names')
    ]);

    workers.value = workersRes.data.map(w => ({
      label: w.Email ? `${w.DNev} (${w.Email})` : w.DNev,
      value: w.DolgozoID
    }));

    const allClothes = await api.get('/ruhak');
    clothes.value = allClothes.data.map(c => ({
      label: `${c.Fajta} - ${c.Szin} (${c.Meret}) [${c.Cikkszam}]`,
      value: c.Cikkszam
    }));
  } catch (err) {
    console.error('Error loading dropdown data', err);
  }
};

const fetchActiveIssues = async () => {
  try {
    const res = await api.get('/ruhakibe/active');
    activeIssues.value = res.data;
  } catch (err) {
    console.error('Error loading active issues', err);
  }
};

const handleIssue = async () => {
  if (!issueForm.value.DolgozoID || !issueForm.value.Cikkszam) {
    message.value = { type: 'error', text: 'Kérlek válassz dolgozót és ruhát!' };
    return;
  }
  
  loading.value = true;
  message.value = { type: '', text: '' };
  
  try {
    const payload = {
      DolgozoID: Number(issueForm.value.DolgozoID),
      RuhaID: Number(issueForm.value.Cikkszam),
      Mennyiseg: Number(issueForm.value.Mennyiseg),
      Indok: issueForm.value.Indok
    };
    await api.post('/ruhakibe', payload);
    message.value = { type: 'success', text: 'Ruha sikeresen kiadva!' };
    issueForm.value = { DolgozoID: null, Cikkszam: null, Mennyiseg: 1, Indok: '' };
    fetchActiveIssues();
  } catch (err) {
    message.value = { type: 'error', text: 'Hiba a kiadás során: ' + (err.response?.data?.error || err.message) };
  } finally {
    loading.value = false;
  }
};

const handleReturn = (issue) => {
  selectedReturnItem.value = issue;
  returnQuality.value = 'Jó';
  showReturnModal.value = true;
};

const confirmReturn = async () => {
  if (!selectedReturnItem.value) return;

  try {
    await api.patch(`/ruhakibe/${selectedReturnItem.value.RuhaKiBeID}`, {
      RuhaMinoseg: returnQuality.value,
      VisszaDatum: new Date().toISOString().split('T')[0]
    });
    
    activeIssues.value = activeIssues.value.filter(i => i.RuhaKiBeID !== selectedReturnItem.value.RuhaKiBeID);
    returnSearch.value = '';
    message.value = { type: 'success', text: 'Sikeres visszavétel!' };
    showReturnModal.value = false;
    selectedReturnItem.value = null;
    
    setTimeout(() => {
      if (message.value.type === 'success') message.value = { type: '', text: '' };
    }, 3000);
  } catch (err) {
    console.error('Hiba visszavételkor', err);
    message.value = { type: 'error', text: 'Hiba a visszavétel során!' };
    showReturnModal.value = false;
  }
};

onMounted(() => {
  fetchDropdownData();
  fetchActiveIssues();
});
</script>

<template>
  <div class="transactions-container">
    <!-- Header Card -->
    <div class="header-card">
      <h1 class="header-title">Tranzakciók</h1>
      <p class="header-subtitle">Kiadás és visszavétel kezelése</p>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button 
        @click="activeTab = 'issue'" 
        class="tab-btn"
        :class="{ active: activeTab === 'issue' }"
      >
        <ArrowRightLeft size="20" />
        <span>Kiadás</span>
      </button>
      <button 
        @click="activeTab = 'return'" 
        class="tab-btn"
        :class="{ active: activeTab === 'return' }"
      >
        <History size="20" />
        <span>Visszavétel</span>
      </button>
    </div>

    <!-- Issue View -->
    <div v-if="activeTab === 'issue'" class="transaction-card">
      <h2 class="card-title">Új ruha kiadása</h2>
      
      <form @submit.prevent="handleIssue" class="issue-form">
        <div class="form-group">
          <label class="form-label">Dolgozó kiválasztása</label>
          <SearchableSelect 
            :items="workers" 
            v-model="issueForm.DolgozoID" 
            placeholder="Keresés név vagy ID alapján..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">Ruha kiválasztása</label>
          <SearchableSelect 
            :items="clothes" 
            v-model="issueForm.Cikkszam" 
            placeholder="Szűrés típus vagy cikkszám szerint..."
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Mennyiség</label>
            <input type="number" v-model="issueForm.Mennyiseg" min="1" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Indoklás / Megjegyzés</label>
            <input type="text" v-model="issueForm.Indok" placeholder="Pl. Csere, Új belépő" class="form-input" />
          </div>
        </div>

        <div v-if="message.text" :class="['message', message.type]">
          {{ message.text }}
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="!loading">Kiadás Rögzítése</span>
          <span v-else>Feldolgozás...</span>
        </button>
      </form>
    </div>

    <!-- Return View -->
    <div v-if="activeTab === 'return'" class="transaction-card">
      <h2 class="card-title">Aktív kiadások (Visszavételre vár)</h2>
      
      <div v-if="activeIssues.length === 0" class="empty-state">
        Nincs jelenleg kint lévő ruha.
      </div>
      
      <div v-if="message.text && activeTab === 'return'" :class="['message', message.type]">
        {{ message.text }}
      </div>

      <div v-if="activeIssues.length > 0" class="search-container">
        <input 
          v-model="returnSearch"
          type="text"
          class="search-input"
          placeholder="Keresés dolgozó név vagy ruha típusa alapján..."
        />
      </div>

      <div v-if="filteredActiveIssues.length === 0 && activeIssues.length > 0" class="empty-state">
        Nincs a keresésnek megfelelő ruha.
      </div>

      <div v-if="filteredActiveIssues.length > 0" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Dolgozó</th>
              <th>Ruha Típusa</th>
              <th>Indok</th>
              <th>Kiadás Dátuma</th>
              <th class="actions-col">Művelet</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="issue in filteredActiveIssues" :key="issue.RuhaKiBeID">
              <td>
                <div class="worker-info">
                  <div class="worker-name">{{ issue.Dolgozo?.DNev || issue.DolgozoID }}</div>
                  <div v-if="issue.Dolgozo?.Email" class="worker-email">{{ issue.Dolgozo.Email }}</div>
                </div>
              </td>
              <td>
                <div class="item-info">
                  <span class="item-name">{{ issue.Ruha?.Fajta || 'Ismeretlen' }}</span>
                  <span class="item-code">{{ issue.Ruha?.Cikkszam }}</span>
                </div>
              </td>
              <td>
                <span class="indok">{{ issue.Indok || '-' }}</span>
              </td>
              <td>
                <span class="date">{{ new Date(issue.KiadasDatum).toLocaleDateString('hu-HU') }}</span>
              </td>
              <td class="actions-col">
                <button class="btn-return" @click="handleReturn(issue)">
                  Visszavétel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Return Quality Modal -->
    <Modal :show="showReturnModal" title="Ruha Visszavétele - Minőség" @close="showReturnModal = false">
      <template #body>
        <div v-if="selectedReturnItem" class="return-modal-content">
          <div class="return-item-info">
            <h4>Visszavett tétel</h4>
            <div class="item-name">{{ selectedReturnItem.Ruha?.Fajta }}</div>
            <div class="item-code">{{ selectedReturnItem.Ruha?.Cikkszam }}</div>
            <div class="item-from">Tőle: <span>{{ selectedReturnItem.Dolgozo?.DNev }}</span></div>
          </div>

          <div class="quality-selection">
            <label class="form-label">Milyen állapotban van a ruha?</label>
            <div class="quality-options">
              <label 
                v-for="opt in qualityOptions" 
                :key="opt"
                class="quality-option"
              >
                <input 
                  type="radio" 
                  name="quality" 
                  :value="opt" 
                  v-model="returnQuality"
                  class="sr-only"
                >
                <div class="quality-card" :class="{ selected: returnQuality === opt }">
                  {{ opt }}
                  <Check v-if="returnQuality === opt" size="16" class="check-icon" />
                </div>
              </label>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn-secondary" @click="showReturnModal = false">Mégse</button>
        <button class="btn-primary" @click="confirmReturn">Visszavétel Rögzítése</button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.transactions-container {
  padding: 12px 12px 12px 0;
  width: 100%;
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
  margin-bottom: 0.75rem;
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

/* Tabs */
.tabs-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border-radius: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.tab-btn:hover {
  background: var(--color-bg);
  border-color: var(--color-border);
}

.tab-btn.active {
  background: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
}

/* Transaction Card */
.transaction-card {
  background: var(--color-surface);
  border-radius: 2rem;
  box-shadow: var(--shadow-lg);
  padding: 2.5rem;
  max-width: 800px;
  margin: 0 auto;
  transition: background-color 0.3s ease;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 2rem;
  text-align: center;
  transition: color 0.3s ease;
}

/* Issue Form */
.issue-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Search Container */
.search-container {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  font-size: 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: all 0.2s;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  outline: none;
  background: var(--color-surface);
  border-color: var(--color-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  font-size: 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  background: var(--color-surface);
  border-color: var(--color-primary);
}

.message {
  padding: 1rem;
  border-radius: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.message.error {
  background: rgba(220, 38, 38, 0.1);
  color: #ef4444;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.message.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.btn-submit {
  background: #1e3a8a;
  color: white;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 58, 138, 0.35);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
  font-size: 1.125rem;
  font-weight: 500;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  margin: -1rem;
  padding: 1rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.data-table th {
  text-align: left;
  padding: 1rem 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: 1.25rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.data-table tr:hover td {
  background: var(--color-bg);
}

.worker-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.worker-name {
  font-weight: 600;
  color: var(--color-text);
}

.worker-email {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  font-family: monospace;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 600;
  color: var(--color-text);
}

.item-code {
  font-size: 0.8125rem;
  color: var(--color-primary);
  font-family: monospace;
  font-weight: 600;
}

.date {
  color: var(--color-text-muted);
  font-weight: 500;
}

.indok {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-style: italic;
}

.actions-col {
  text-align: right;
}

.btn-return {
  background: var(--color-bg);
  color: var(--color-primary);
  padding: 0.625rem 1.25rem;
  border-radius: 0.625rem;
  font-weight: 600;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-return:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Return Modal */
.return-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.return-item-info {
  background: var(--color-bg);
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
}

.return-item-info h4 {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
}

.return-item-info .item-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.return-item-info .item-code {
  font-size: 0.9375rem;
  margin-bottom: 0.75rem;
}

.return-item-info .item-from {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.return-item-info .item-from span {
  color: var(--color-text);
  font-weight: 600;
}

.quality-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quality-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.quality-option {
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.quality-card {
  padding: 1rem;
  border-radius: 0.75rem;
  border: 2px solid var(--color-border);
  text-align: center;
  font-weight: 600;
  color: var(--color-text-muted);
  transition: all 0.2s;
  position: relative;
}

.quality-card:hover {
  border-color: var(--color-primary);
}

.quality-card.selected {
  border-color: var(--color-primary);
  background: var(--color-sidebar-active);
  color: var(--color-sidebar-active-text);
}

.check-icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

/* Modal Footer Buttons */
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
  transform: translateY(-1px);
}

/* Tablet */
@media (max-width: 1024px) {
  .header-title {
    font-size: 3rem;
  }
  
  .header-subtitle {
    font-size: 1.25rem;
  }
  
  .transaction-card {
    padding: 2rem;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .transactions-container {
    padding: 8px;
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
  
  .tabs-container {
    gap: 0.5rem;
  }
  
  .tab-btn {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
    flex: 1;
    justify-content: center;
  }
  
  .transaction-card {
    padding: 1.5rem;
    border-radius: 1.5rem;
  }
  
  .card-title {
    font-size: 1.375rem;
    margin-bottom: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .issue-form {
    gap: 1.25rem;
  }
  
  .table-wrapper {
    margin: -0.5rem;
    padding: 0.5rem;
  }
  
  .data-table {
    min-width: 600px;
  }
  
  .quality-options {
    grid-template-columns: 1fr;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .header-title {
    font-size: 1.75rem;
  }
  
  .transaction-card {
    padding: 1.25rem;
  }
  
  .btn-submit {
    padding: 0.875rem 1.5rem;
  }
}
</style>
