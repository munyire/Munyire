import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { guest: true }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue'),
            meta: { requiresAuth: true, roles: ['Manager', 'Admin'] }
        },
        {
            path: '/inventory',
            name: 'inventory',
            component: () => import('../views/InventoryView.vue'),
            meta: { requiresAuth: true, roles: ['Manager', 'Admin'] }
        },
        {
            path: '/workers',
            name: 'workers',
            component: () => import('../views/WorkersView.vue'),
            meta: { requiresAuth: true, roles: ['Manager', 'Admin'] }
        },
        {
            path: '/my-clothes',
            name: 'my-clothes',
            component: () => import('../views/MyClothesView.vue'),
            meta: { requiresAuth: true }
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated();
    const userRole = authStore.getUserRole();

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.meta.guest && isAuthenticated) {
        // If logged in and trying to access login, redirect based on role
        if (userRole === 'Dolgozo') {
            next('/my-clothes');
        } else {
            next('/dashboard');
        }
    } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
        // Unauthorized role
        next(isAuthenticated ? '/my-clothes' : '/login');
    } else {
        next();
    }
});

export default router;
