<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import SearchableSelect from '../components/common/SearchableSelect.vue';
import BaseButton from '../components/common/BaseButton.vue';

import Modal from '../components/ui/Modal.vue';
import { ArrowRightLeft, History, Check } from 'lucide-vue-next';

const activeTab = ref('issue'); // 'issue', 'return', 'history'
const loading = ref(false);
const message = ref({ type: '', text: '' });

// Data for selects
const workers = ref([]); // { label: 'Name', value: id }
const clothes = ref([]); // { label: 'Name (Size)', value: cikkszam }
const activeIssues = ref([]); // List of active issues for return tab

// Issue Form
const issueForm = ref({
  DolgozoID: null,
  Cikkszam: null,
  Mennyiseg: 1,
  Indok: ''
});




// Modal State
const showReturnModal = ref(false);
const selectedReturnItem = ref(null);
const returnQuality = ref('Jó');
const qualityOptions = ['Új', 'Jó', 'Szakadt'];


const fetchDropdownData = async () => {
  try {
    const [workersRes, clothesRes] = await Promise.all([
      api.get('/dolgozok/names'), // Assuming endpoint returns { DolgozoID, DNev }
      api.get('/ruhak/options')   // Assuming endpoint returns list of clothes
    ]);

    // Transform for SearchableSelect
    // Based on API docs, /dolgozok/names returns [{ DolgozoID, DNev }]
    workers.value = workersRes.data.map(w => ({
      label: w.DNev,
      value: w.DolgozoID
    }));

    // Based on API docs /ruhak/options might return metadata, checking /ruhak might be better if options not sufficient
    // Actually /ruhak returns all clothes. Let's use that for now if options is just metadata.
    // Wait, let's try /ruhak for full info
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
    const res = await api.get('/ruhakibe/active'); // Endpoint check
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
      RuhaID: Number(issueForm.value.Cikkszam), // Backend validator requires RuhaID
      Mennyiseg: Number(issueForm.value.Mennyiseg),
      Indok: issueForm.value.Indok
    };
    await api.post('/ruhakibe', payload);
    message.value = { type: 'success', text: 'Ruha sikeresen kiadva!' };
    // Reset form
    issueForm.value = { DolgozoID: null, Cikkszam: null, Mennyiseg: 1, Indok: '' };
    // Refresh active issues if we switch tabs
    fetchActiveIssues();
  } catch (err) {
    message.value = { type: 'error', text: 'Hiba a kiadás során: ' + (err.response?.data?.error || err.message) };
  } finally {
    loading.value = false;
  }
};

const handleReturn = (issue) => {
  selectedReturnItem.value = issue;
  returnQuality.value = 'Jó'; // Default
  showReturnModal.value = true;
};

const confirmReturn = async () => {
  if (!selectedReturnItem.value) return;

  try {
    await api.patch(`/ruhakibe/${selectedReturnItem.value.RuhaKiBeID}`, {
      RuhaMinoseg: returnQuality.value,
      VisszaDatum: new Date().toISOString().split('T')[0]
    });
    
    // Remove from local list
    activeIssues.value = activeIssues.value.filter(i => i.RuhaKiBeID !== selectedReturnItem.value.RuhaKiBeID);
    
    // Success message
    message.value = { type: 'success', text: 'Sikeres visszavétel!' };
    
    // Close modal
    showReturnModal.value = false;
    selectedReturnItem.value = null;
    
    // Optional: clear message after a few seconds
    setTimeout(() => {
      if (message.value.type === 'success') message.value = { type: '', text: '' };
    }, 3000);

  } catch (err) {
    console.error('Hiba visszavételkor', err);
    message.value = { type: 'error', text: 'Hiba a visszavétel során!' };
    // Close modal even on error? Or keep it open?
    // Let's keep it open but show error if we had a modal error state. 
    // Here we just use the global message, so maybe close it.
    showReturnModal.value = false;
  }
};

onMounted(() => {
  fetchDropdownData();
  fetchActiveIssues();
});
</script>

<template>
  <div class="transactions-container w-full">
    <!-- RESTORED: Header Card with Shadow -->
    <div class="header-card-box p-12 shadow-2xl bg-white flex flex-col items-center justify-center text-center mx-8 border border-gray-100">
      <h1 class="text-8xl font-black tracking-tighter leading-none text-gray-900 m-0">Tranzakciók</h1>
      <p class="text-4xl mt-8 font-semibold text-gray-500">Kiadás és visszavétel kezelése</p>
    </div>

    <!-- Larger Tabs -->
    <div class="tabs-container flex justify-center gap-6 relative z-10">
      <button 
        @click="activeTab = 'issue'" 
        class="tab-btn scale-110"
        :class="{ active: activeTab === 'issue' }"
      >
        <ArrowRightLeft size="22" />
        <span>Kiadás</span>
      </button>
      <button 
        @click="activeTab = 'return'" 
        class="tab-btn scale-110"
        :class="{ active: activeTab === 'return' }"
      >
        <History size="22" />
        <span>Visszavétel</span>
      </button>
    </div>

    <!-- Issue View (BOXED with Shadow) -->
    <div v-if="activeTab === 'issue'" class="transaction-main-box bg-white mx-auto max-w-5xl p-16 shadow-2xl border border-gray-100 min-h-[700px] flex flex-col">
      <h2 class="text-5xl font-black mb-12 tracking-tight text-gray-900 text-center">Új ruha kiadása</h2>
      
      <form @submit.prevent="handleIssue" class="flex flex-col gap-10">
        <div class="form-group">
          <label class="block mb-4 text-2xl font-bold text-gray-700">Dolgozó kiválasztása</label>
          <SearchableSelect 
            :items="workers" 
            v-model="issueForm.DolgozoID" 
            placeholder="Keresés név vagy ID alapján..."
            class="scale-110 origin-left"
          />
        </div>

        <div class="form-group">
          <label class="block mb-4 text-2xl font-bold text-gray-700">Ruha kiválasztása</label>
          <SearchableSelect 
            :items="clothes" 
            v-model="issueForm.Cikkszam" 
            placeholder="Szűrés típus vagy cikkszám szerint..."
            class="scale-110 origin-left"
          />
        </div>

        <div class="grid grid-cols-2 gap-12">
          <div class="form-group">
            <label class="block mb-4 text-2xl font-bold text-gray-700">Mennyiség</label>
            <input type="number" v-model="issueForm.Mennyiseg" min="1" class="form-input-large w-full" />
          </div>

          <div class="form-group">
            <label class="block mb-4 text-2xl font-bold text-gray-700">Indoklás / Megjegyzés</label>
            <input type="text" v-model="issueForm.Indok" placeholder="Pl. Csere, Új belépő" class="form-input-large w-full" />
          </div>
        </div>

        <div v-if="message.text" :class="`message mt-4 p-6 rounded-2xl text-xl font-bold ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`">
          {{ message.text }}
        </div>

        <button type="submit" :disabled="loading" class="btn-primary-large mt-8">
          <span v-if="!loading">Kiadás Rögzítése</span>
          <span v-else>Feldolgozás...</span>
        </button>
      </form>
    </div>

    <!-- Return View (Scaled Up) -->
    <div v-if="activeTab === 'return'" class="transaction-card-return bg-white mx-auto w-full max-w-7xl p-12 shadow-2xl border border-gray-100 min-h-[500px]">
      <h2 class="text-4xl font-black mb-10 tracking-tight text-gray-900">Aktív kiadások (Visszavételre vár)</h2>
      
      <div v-if="activeIssues.length === 0" class="text-center text-muted py-16 text-2xl font-semibold opacity-30">
        Nincs jelenleg kint lévő ruha.
      </div>
      
      <!-- Feedback Message for Returns -->
      <div v-if="message.text && activeTab === 'return'" :class="`mb-6 p-6 rounded-2xl text-xl font-bold ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`">
        {{ message.text }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left border-b-2 border-gray-100">
              <th class="pb-6 text-xl font-black text-gray-500 uppercase tracking-widest pl-4">Dolgozó</th>
              <th class="pb-6 text-xl font-black text-gray-500 uppercase tracking-widest">Ruha Típusa</th>
              <th class="pb-6 text-xl font-black text-gray-500 uppercase tracking-widest">Kiadás Dátuma</th>
              <th class="pb-6 text-xl font-black text-gray-500 uppercase tracking-widest text-right pr-4">Művelet</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="issue in activeIssues" :key="issue.RuhaKiBeID" class="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors group">
              <td class="py-8 pl-4">
                <div class="font-black text-2xl text-gray-800">{{ issue.Dolgozo?.DNev || issue.DolgozoID }}</div>
              </td>
              <td class="py-8">
                <div class="flex flex-col">
                  <span class="text-2xl font-bold text-gray-700">{{ issue.Ruha?.Fajta || 'Ismeretlen' }}</span>
                  <span class="text-lg text-blue-600 font-mono font-bold">{{ issue.Ruha?.Cikkszam }}</span>
                </div>
              </td>
              <td class="py-8">
                <div class="text-xl font-bold text-gray-500">{{ new Date(issue.KiadasDatum).toLocaleDateString('hu-HU') }}</div>
              </td>
              <td class="py-8 text-right pr-4">
                <button class="btn-return scale-110" @click="handleReturn(issue)">
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
        <div v-if="selectedReturnItem" class="flex flex-col gap-6">
          <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h4 class="text-gray-500 font-bold uppercase text-sm mb-2">Visszavett tétel</h4>
            <div class="text-2xl font-black text-gray-800 mb-1">{{ selectedReturnItem.Ruha?.Fajta }}</div>
            <div class="text-lg text-blue-600 font-mono">{{ selectedReturnItem.Ruha?.Cikkszam }}</div>
            <div class="mt-4 text-gray-600 font-semibold">Tőle: <span class="text-gray-900">{{ selectedReturnItem.Dolgozo?.DNev }}</span></div>
          </div>

          <div>
            <label class="block mb-4 text-xl font-bold text-gray-800">Milyen állapotban van a ruha?</label>
            <div class="grid grid-cols-3 gap-4">
              <label 
                v-for="opt in qualityOptions" 
                :key="opt"
                class="cursor-pointer relative"
              >
                <input 
                  type="radio" 
                  name="quality" 
                  :value="opt" 
                  v-model="returnQuality"
                  class="peer sr-only"
                >
                <div class="p-4 rounded-xl border-2 border-gray-200 text-center font-bold text-gray-600 transition-all peer-checked:border-blue-600 peer-checked:text-blue-600 peer-checked:bg-blue-50 hover:border-blue-300">
                  {{ opt }}
                  <div class="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 text-blue-600">
                    <Check size="16" />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors" @click="showReturnModal = false">Mégse</button>
        <button class="px-6 py-3 rounded-xl font-bold text-white bg-blue-800 hover:bg-blue-900 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1" @click="confirmReturn">Visszavétel Rögzítése</button>
      </template>
    </Modal>

  </div>
</template>

<style scoped>
.transactions-container {
  padding: 12px 12px 12px 0;
}

.header-card-box {
  background-color: white !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2) !important;
  border-radius: 2rem !important; /* Matched to Dashboard rounding */
  margin-bottom: 5px !important; /* Exactly 5px space under header */
}

.transaction-main-box,
.transaction-card-return {
  background-color: white !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2) !important;
  border-radius: 2rem !important; /* Matched to Dashboard rounding */
  margin-top: 0px !important; 
}

.tabs-container {
  margin-top: 0px !important;
  margin-bottom: 5px !important; /* Exactly 5px space under tabs */
}

.tab-btn {
  padding: 1rem 2.5rem;
  border-radius: 1.5rem; /* More consistent rounding with boxes */
  background: white;
  border: 1px solid #e5e7eb;
  font-weight: 800;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #1e3a8a; /* Blue for the active tab */
  color: white;
  border-color: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3);
}

.btn-return {
  background-color: #f1f5f9;
  color: #1e3a8a;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-weight: 800;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-return:hover {
  background-color: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

.form-input-large {
  border: 1px solid #e2e8f0;
  padding: 1.25rem 1.5rem;
  border-radius: 1.25rem;
  outline: none;
  font-size: 1.1rem;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}
.form-input-large:focus {
  background-color: white;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.1);
}

.btn-primary-large {
  background-color: #1e3a8a;
  color: white;
  padding: 1.5rem;
  border-radius: 1.5rem;
  font-weight: 800;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.2);
}

.btn-primary-large:hover {
  background-color: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(30, 58, 138, 0.3);
}

.btn-primary-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
