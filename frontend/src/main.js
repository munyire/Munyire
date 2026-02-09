import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style/main.css';
import { useThemeStore } from './stores/theme';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize theme before mounting to prevent flash
const themeStore = useThemeStore(pinia);
themeStore.initTheme();

app.mount('#app');
