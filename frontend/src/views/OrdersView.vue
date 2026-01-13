<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import { 
  ShoppingCart, 
  Plus, 
  Search,
  CheckCircle,
  Truck
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import SearchableSelect from '../components/common/SearchableSelect.vue';
import BaseButton from '../components/common/BaseButton.vue';

const orders = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const clothes = ref([]); // For select

const showModal = ref(false);
const form = ref({
  Cikkszam: null,
  Mennyiseg: 10,
  Szallito: '',
  Megjegyzes: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [ordersRes, clothesRes] = await Promise.all([
      api.get('/rendelesek'),
      api.get('/ruhak')
    ]);
    orders.value = ordersRes.data;
    
    clothes.value = clothesRes.data.map(c => ({
      label: `${c.Fajta} - ${c.Szin} (${c.Meret})`,
      value: c.Cikkszam
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value;
  const q = searchQuery.value.toLowerCase();
  return orders.value.filter(o => 
    (o.Szallito && o.Szallito.toLowerCase().includes(q)) ||
    (o.Megjegyzes && o.Megjegyzes.toLowerCase().includes(q))
  );
});

const openAddModal = () => {
  form.value = {
    Cikkszam: null,
    Mennyiseg: 10,
    Szallito: 'WorkWear Kft.',
    Megjegyzes: ''
  };
  showModal.value = true;
};

const createOrder = async () => {
  if (!form.value.Cikkszam) {
    alert('Válasszon terméket!');
    return;
  }
  
  try {
    const res = await api.post('/rendelesek', form.value);
    orders.value.push(res.data); // Or refresh
    showModal.value = false;
    alert('Rendelés sikeresen leadva!');
    fetchData(); // Refresh to be sure
  } catch (error) {
    console.error('Error creating order:', error);
    alert('Hiba történt a rendelés során.');
  }
};

const completeOrder = async (id) => {
  if (!confirm('Biztosan teljesítettnek jelöli? Ezzel a raktárkészlet is nőni fog.')) return;
  try {
    await api.patch(`/rendelesek/${id}/complete`);
    const index = orders.value.findIndex(o => o.RendelesID === id);
    if (index !== -1) {
      orders.value[index].Statusz = 'Teljesítve'; // Optimistic/Manual update
    }
  } catch (error) {
    console.error('Error completing order:', error);
    alert('Hiba történt a teljesítés során.');
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="orders-container w-full">
    <!-- Header Card -->
    <div class="header-card p-14 shadow-xl bg-white rounded-[2rem] flex flex-col items-center justify-center text-center">
      <h1 class="m-0 text-8xl font-black text-gray-900 tracking-tighter leading-none">Rendelések</h1>
      <p class="text-muted m-0 text-4xl mt-8 font-semibold">Utánpótlás és beszerzés</p>
    </div>

    <!-- Actions Row -->
    <div class="actions-row flex justify-end mt-5 mb-5">
      <button @click="openAddModal" class="btn btn-primary px-8 py-4 text-lg font-bold shadow-lg">
        <Plus size="24" />
        Új rendelés
      </button>
    </div>

    <!-- Search Row -->
    <div class="controls flex gap-4 mb-6">
      <div class="search-box relative flex-1 max-w-sm">
        <Search size="18" class="absolute left-3 top-3 text-muted" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Keresés szállító vagy megjegyzés alapján..." 
          class="pl-10"
        />
      </div>
    </div>

    <div class="card bg-white rounded-[2rem] shadow-sm p-8 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-sm font-semibold text-muted border-b border-gray-100">
              <th class="px-4 py-5 text-center">Rendelés #</th>
              <th class="px-4 py-5 text-center">Dátum</th>
              <th class="px-4 py-5 text-center">Termék (Cikkszám)</th>
              <th class="px-4 py-5 text-center">Mennyiség</th>
              <th class="px-4 py-5 text-center">Szállító</th>
              <th class="px-4 py-5 text-center">Státusz</th>
              <th class="px-4 py-5 text-center">Műveletek</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in filteredOrders" :key="order.RendelesID" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-5 text-center font-medium">#{{ order.RendelesID }}</td>
              <td class="px-4 py-5 text-center text-muted">{{ new Date(order.RDatum || Date.now()).toLocaleDateString() }}</td>
              <td class="px-4 py-5 text-center">{{ order.Cikkszam }}</td>
              <td class="px-4 py-5 text-center font-bold">{{ order.Mennyiseg }} db</td>
              <td class="px-4 py-5 text-center">{{ order.Szallito }}</td>
              <td class="px-4 py-5 text-center">
                <span class="badge" :class="{
                  'bg-yellow-100 text-yellow-700': order.Statusz === 'Leadva',
                  'bg-green-100 text-green-700': order.Statusz === 'Teljesítve',
                  'bg-red-100 text-red-700': order.Statusz === 'Lemondva'
                }">
                  {{ order.Statusz }}
                </span>
              </td>
              <td class="px-4 py-5 text-center">
                <div class="flex justify-center">
                  <button 
                    v-if="order.Statusz === 'Leadva'" 
                    @click="completeOrder(order.RendelesID)" 
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2" 
                    title="Teljesítés"
                  >
                    <CheckCircle size="20" />
                    <span class="text-sm font-semibold">Átvétel</span>
                  </button>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </div>
              </td>
            </tr>
             <tr v-if="filteredOrders.length === 0 && !loading">
              <td colspan="7" class="px-6 py-8 text-center text-muted">Nincs rendelés.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Modal :show="showModal" title="Új rendelés leadása" @close="showModal = false">
      <template #body>
         <div class="flex flex-col gap-4">
           <div>
             <label class="block mb-2 font-medium">Termék</label>
             <SearchableSelect 
               :items="clothes" 
               v-model="form.Cikkszam" 
               placeholder="Válassz terméket..."
             />
           </div>

           <div>
             <label class="block mb-2 font-medium">Mennyiség</label>
             <input type="number" v-model="form.Mennyiseg" min="1" class="form-input w-full" />
           </div>

           <div>
             <label class="block mb-2 font-medium">Szállító</label>
             <input type="text" v-model="form.Szallito" placeholder="Pl. WorkWear Kft." class="form-input w-full" />
           </div>

           <div>
             <label class="block mb-2 font-medium">Megjegyzés</label>
             <input type="text" v-model="form.Megjegyzes" placeholder="Pl. Sürgős" class="form-input w-full" />
           </div>
         </div>
      </template>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Mégse</BaseButton>
        <BaseButton variant="primary" @click="createOrder">Rendelés Leadása</BaseButton>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.orders-container {
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
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.bg-yellow-100 { background-color: #fef3c7; }
.text-yellow-700 { color: #b45309; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-700 { color: #15803d; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-700 { color: #b91c1c; }

.form-input {
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  border-radius: 0.5rem;
  outline: none;
  width: 100%;
}
.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
</style>
