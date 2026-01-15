<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { Shirt, Mail, Key } from 'lucide-vue-next';

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
            <h1 class="app-name">Munyire</h1>
          </div>
          <p class="subtitle">Munkaruhakezelő Rendszer</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">Felhasználónév</label>
            <div class="input-wrapper">
              <Mail class="input-icon" :size="20" />
              <input 
                id="username" 
                v-model="username" 
                type="text" 
                placeholder="Adja meg a felhasználónevét" 
                required
                class="form-input"
                data-testid="email-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Jelszó</label>
            <div class="input-wrapper">
              <Key class="input-icon" :size="20" />
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                placeholder="Adja meg a jelszavát" 
                required
                class="form-input"
                data-testid="password-input"
              />
            </div>
            <a href="#" class="forgot-password">Elfelejtettem a jelszót</a>
          </div>

          <div v-if="error" class="error-message" data-testid="login-error">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading" data-testid="login-submit">
            {{ loading ? 'Bejelentkezés...' : 'Bejelentkezés' }}
          </button>
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
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  display: flex;
  width: 900px;
  max-width: 90%;
  min-height: 600px;
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  position: relative;
  z-index: 10;
}

.form-side {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.footer-left {
  position: absolute;
  bottom: 2rem;
  left: 3rem;
  color: var(--color-text-light);
  font-size: var(--font-xs);
}

.footer-right {
  position: absolute;
  bottom: 2rem;
  right: 3rem;
}

.footer-right a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: var(--font-xs);
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
  color: var(--color-primary);
}

.app-name {
  font-size: 2.5rem;
  color: var(--color-primary-dark);
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

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--color-primary);
  pointer-events: none;
  z-index: 1;
}

.form-input {
  padding-left: 2.75rem; /* Make room for icon */
}

.forgot-password {
  align-self: flex-end;
  font-size: var(--font-sm);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  margin-top: 0.25rem;
}

.forgot-password:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.btn.w-full {
  width: 100%;
  padding: 0.875rem;
  font-size: var(--font-base);
}

.error-message {
  color: var(--color-danger);
  font-size: var(--font-sm);
  text-align: center;
  padding: 0.5rem;
  background-color: var(--color-danger-bg);
  border-radius: var(--radius-sm);
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
  .login-container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    width: 100%;
    max-width: none;
    border-radius: 0;
  }

  .image-side {
    display: none;
  }

  .form-side {
    padding: 2rem;
  }

  .footer-left, .footer-right {
    position: static;
    margin-top: 2rem;
    text-align: center;
  }
  
  .footer-left {
    margin-bottom: 0.5rem;
  }
}
</style>
