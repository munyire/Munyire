<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import SearchableSelect from '../components/common/SearchableSelect.vue';
import BaseButton from '../components/common/BaseButton.vue';
import { ArrowRightLeft, History } from 'lucide-vue-next';

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

// Return Data
const returnForm = ref({
  RuhaKiBeID: null,
  RuhaMinoseg: 'Jo', // Default return quality
  VisszaDatum: new Date().toISOString().split('T')[0]
});

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

const handleReturn = async (issueId) => {
  // We can open a modal or just verify quality and submit.
  // For simplicity, let's assume "Jó" condition or allow prompt.
  // The requirement says "Ruhák visszavétele (visszavételkori minőség rögzítése)".
  // Let's use a small inline form or prompt.
  
  const quality = prompt('Milyen állapotban van a ruha? (Új, Jó, Szakadt, Használt)', 'Jó');
  if (!quality) return;

  try {
    await api.patch(`/ruhakibe/${issueId}`, {
      RuhaMinoseg: quality,
      VisszaDatum: new Date().toISOString().split('T')[0]
    });
    // Remove from local list
    activeIssues.value = activeIssues.value.filter(i => i.RuhaKiBeID !== issueId);
    alert('Sikeres visszavétel!');
  } catch (err) {
    alert('Hiba visszavételkor');
  }
};

onMounted(() => {
  fetchDropdownData();
  fetchActiveIssues();
});
</script>

<template>
  <div class="transactions-container w-full">
    <div class="header-card p-10 shadow-xl bg-white rounded-[2rem] flex flex-col items-center justify-center text-center">
      <h1 class="m-0 text-6xl font-black text-gray-900 tracking-tighter">Tranzakciók</h1>
      <p class="text-muted m-0 text-xl mt-4 font-semibold">Kiadás és visszavétel kezelése</p>
    </div>

    <!-- Tabs -->
    <div class="tabs-container mt-8 flex justify-center gap-4">
      <button 
        @click="activeTab = 'issue'" 
        class="tab-btn"
        :class="{ active: activeTab === 'issue' }"
      >
        <ArrowRightLeft size="20" />
        Kiadás
      </button>
      <button 
        @click="activeTab = 'return'" 
        class="tab-btn"
        :class="{ active: activeTab === 'return' }"
      >
        <History size="20" />
        Visszavétel
      </button>
    </div>

    <!-- Issue View -->
    <div v-if="activeTab === 'issue'" class="card bg-white mt-8 mx-auto max-w-2xl p-8 rounded-[2rem] shadow-sm">
      <h2 class="text-2xl font-bold mb-6">Új ruha kiadása</h2>
      
      <form @submit.prevent="handleIssue">
        <div class="form-group mb-4">
          <label class="block mb-2 font-medium">Dolgozó</label>
          <SearchableSelect 
            :items="workers" 
            v-model="issueForm.DolgozoID" 
            placeholder="Keress dolgozót..."
          />
        </div>

        <div class="form-group mb-4">
          <label class="block mb-2 font-medium">Ruha</label>
          <SearchableSelect 
            :items="clothes" 
            v-model="issueForm.Cikkszam" 
            placeholder="Keress ruhát (Név, Szín, Cikkszám)..."
          />
        </div>

        <div class="form-group mb-4">
          <label class="block mb-2 font-medium">Mennyiség</label>
          <input type="number" v-model="issueForm.Mennyiseg" min="1" class="form-input w-full" />
        </div>

        <div class="form-group mb-6">
          <label class="block mb-2 font-medium">Megjegyzés / Indok</label>
          <input type="text" v-model="issueForm.Indok" placeholder="Pl. Munkakezdés" class="form-input w-full" />
        </div>

        <div v-if="message.text" :class="`message mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`">
          {{ message.text }}
        </div>

        <BaseButton type="submit" variant="primary" :loading="loading" class="w-full justify-center">
          Kiadás Rögzítése
        </BaseButton>
      </form>
    </div>

    <!-- Return View -->
    <div v-if="activeTab === 'return'" class="card bg-white mt-8 mx-auto w-full max-w-6xl p-8 rounded-[2rem] shadow-sm">
      <h2 class="text-2xl font-bold mb-6">Aktív kiadások (Visszavételre vár)</h2>
      
      <div v-if="activeIssues.length === 0" class="text-center text-muted py-8">
        Nincs jelenleg kint lévő ruha.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left border-b border-gray-100">
              <th class="pb-4">Dolgozó</th>
              <th class="pb-4">Ruha</th>
              <th class="pb-4">Kiadva</th>
              <th class="pb-4">Művelet</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="issue in activeIssues" :key="issue.RuhaKiBeID" class="border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <td class="py-4 font-medium">{{ issue.Dolgozo?.DNev || issue.DolgozoID }}</td>
              <td class="py-4">
                <div class="flex flex-col">
                  <span>{{ issue.Ruha?.Fajta || 'Ismeretlen' }}</span>
                  <span class="text-xs text-muted">{{ issue.Ruha?.Cikkszam }}</span>
                </div>
              </td>
              <td class="py-4 text-muted">{{ new Date(issue.KiadasDatum).toLocaleDateString() }}</td>
              <td class="py-4">
                <BaseButton variant="secondary" size="sm" @click="handleReturn(issue.RuhaKiBeID)">
                  Visszavétel
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
.transactions-container {
  padding: 12px 12px 12px 0;
}

.header-card {
  width: 100%;
}

.tab-btn {
  padding: 1rem 2rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid #e5e7eb;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3);
}

.form-input {
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  border-radius: 0.5rem;
  outline: none;
}
.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
