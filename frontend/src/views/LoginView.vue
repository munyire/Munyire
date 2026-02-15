<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { Shirt, Mail, Key } from 'lucide-vue-next';
import BaseButton from '../components/common/BaseButton.vue';

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
  <div class="login-wrapper">
    <div class="login-container">
      <div class="form-side">
        <div class="header">
          <div class="logo-container">
            <Shirt class="app-logo" :size="48" />
            <h1>Munyire</h1>
          </div>
          <p class="subtitle">Munkaruhakezelő Rendszer</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Felhasználónév</label>
            <div class="input-wrapper">
              <Mail class="input-icon" :size="20" />
              <input 
                id="username" 
                v-model="username" 
                type="text" 
                placeholder="Adja meg a felhasználónevét" 
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Jelszó</label>
            <div class="input-wrapper">
              <Key class="input-icon" :size="20" />
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                placeholder="Adja meg a jelszavát" 
                required
              />
            </div>
            <a href="#" class="forgot-password">Elfelejtettem a jelszót</a>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <BaseButton type="submit" variant="primary" :loading="loading" class="full-width">
            Bejelentkezés
          </BaseButton>
        </form>

        <div class="footer-left">
          Copyright &copy; 2026 Munyire
        </div>
        <div class="footer-right">
          <a href="#">Privacy Policy</a>
        </div>
      </div>
      
      <div class="image-side"></div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: background-color 0.3s ease;
}

.login-container {
  display: flex;
  width: 900px;
  max-width: 90%;
  height: 600px;
  background: var(--color-surface);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  position: relative;
  z-index: 10;
  transition: background-color 0.3s ease;
}

.form-side {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative; /* Make relative for absolute footer positioning */
}

.footer-left {
  position: absolute;
  bottom: 2rem;
  left: 3rem;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.footer-right {
  position: absolute;
  bottom: 2rem;
  right: 3rem;
}

.footer-right a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.2s;
}

.footer-right a:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.header {
  text-align: center;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.app-logo {
  color: #1e40af;
}

.header h1 {
  font-size: 2.5rem;
  color: #1e3a8a;
  margin: 0;
  font-weight: 700;
  line-height: 1;
}

.subtitle {
  color: var(--color-text-muted);
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #1e40af;
  pointer-events: none;
}

label {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: var(--color-bg);
  color: var(--color-text);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: var(--color-surface);
}

.forgot-password {
  align-self: flex-end;
  font-size: 0.85rem;
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #1e3a8a;
  text-decoration: underline;
}


.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
}


.image-side {
  flex: 1;
  background-image: url('../assets/login-side.png');
  background-size: cover;
  background-position: center;
  position: relative;
}

.image-side::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(30, 64, 175, 0.1), rgba(30, 64, 175, 0.2));
}

@media (max-width: 768px) {
  .login-wrapper {
    position: fixed;
    padding: 0;
  }
  
  .login-container {
    flex-direction: column;
    height: 100vh;
    min-height: 100vh;
    width: 100%;
    max-width: none;
    border-radius: 0;
  }

  .image-side {
    display: none;
  }

  .form-side {
    padding: 1.5rem;
    justify-content: center;
    min-height: 100vh;
  }
  
  .header {
    margin-bottom: 2rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .app-logo {
    width: 40px;
    height: 40px;
  }

  .footer-left, .footer-right {
    position: static;
    margin-top: auto;
    padding-top: 2rem;
    text-align: center;
  }
  
  .footer-left {
    margin-bottom: 0.25rem;
  }
}

@media (max-width: 380px) {
  .form-side {
    padding: 1.25rem;
  }
  
  .header h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 0.9375rem;
  }
  
  .login-form {
    gap: 1.25rem;
  }
  
  input {
    padding: 0.625rem 0.875rem 0.625rem 2.5rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .input-icon {
    left: 10px;
    width: 18px;
    height: 18px;
  }
}

.full-width {
  width: 100%;
  margin-top: 0.5rem;
}
</style>
