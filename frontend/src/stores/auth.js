import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('token') || null);
    const router = useRouter();

    // Normalize user object to include Hungarian `Szerepkor` for backward compatibility
    const normalizeUser = (u) => {
        if (!u) return null;
        if (!u.Szerepkor && u.role) u.Szerepkor = u.role;
        return u;
    };

    if (user.value) user.value = normalizeUser(user.value);

    const isTokenExpired = (t) => {
        if (!t) return true;
        try {
            const payload = JSON.parse(atob(t.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    };

    const isAuthenticated = () => {
        if (!token.value) return false;
        if (isTokenExpired(token.value)) {
            logout();
            return false;
        }
        return true;
    };
    // Return role from backend (`role`) but fall back to legacy `Szerepkor` if present
    const getUserRole = () => user.value?.role || user.value?.Szerepkor;

    const login = async (felhasznaloNev, jelszo) => {
        try {
            const response = await api.post('/auth/login', { username: felhasznaloNev, password: jelszo });
            token.value = response.data.token;
            user.value = normalizeUser(response.data.user);

            localStorage.setItem('token', token.value);
            localStorage.setItem('user', JSON.stringify(user.value));

            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Router redirect should be handled by the caller or a global guard, 
        // but here we can force a reload or just let the reactivity handle it.
        // For now, we assume the component calling logout will redirect.
    };

    return {
        user,
        token,
        isAuthenticated,
        getUserRole,
        login,
        logout
    };
});
