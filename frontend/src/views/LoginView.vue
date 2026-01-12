<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(username.value, password.value);
    
    // Redirect based on role
    const role = authStore.getUserRole();
    if (role === 'Dolgozo') {
      router.push('/my-clothes');
    } else {
      router.push('/dashboard');
    }
  } catch (err) {
    error.value = 'Érvénytelen felhasználónév vagy jelszó';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container flex items-center justify-between h-screen w-full">
    <div class="login-bg"></div>
    
    <div class="login-card glass-panel p-8">
      <div class="text-center mb-6">
        <h1>Munyire</h1>
        <p class="text-muted">Munkaruhakezelő Rendszer</p>
      </div>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label for="username" class="block mb-1 text-sm font-medium">Felhasználónév</label>
          <input 
            id="username" 
            v-model="username" 
            type="text" 
            placeholder="Adja meg a felhasználónevét" 
            required
            class="w-full"
          />
        </div>
        
        <div>
          <label for="password" class="block mb-1 text-sm font-medium">Jelszó</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            placeholder="Adja meg a jelszavát" 
            required
            class="w-full"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Bejelentkezés...' : 'Bejelentkezés' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  position: relative;
  overflow: hidden;
  justify-content: center;
}

.login-bg {
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  background-image: 
    radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 40%);
  z-index: 0;
}

.login-card {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
  border-radius: 1.5rem;
}

.text-muted {
  color: var(--color-text-muted);
}

.text-red-500 {
  color: #ef4444;
}

.p-8 { padding: 2rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.text-sm { font-size: 0.875rem; }
.font-medium { font-weight: 500; }
.block { display: block; }
</style>
