
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Permission } from '@/lib/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
    hasPermission: (permission: Permission) => boolean;
    canAny: (permissions: Permission[]) => boolean;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: true, // Initially true, becomes false after hydration
            login: (user, token) => set({ user, token, isLoading: false }),
            logout: () => set({ user: null, token: null, isLoading: false }),
            setUser: (user) => set({ user, isLoading: false }),
            hasPermission: (permission) => {
                const user = get().user;
                if (!user) return false;
                if (user.role === 'ADMIN') return true;
                return user.permissions?.includes(permission) || false;
            },
            canAny: (permissions) => {
                const user = get().user;
                if (!user) return false;
                if (user.role === 'ADMIN') return true;
                return permissions.some(p => user.permissions?.includes(p));
            }
        }),
        {
            name: 'zapgo-auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoading = false;
                }
            },
        }
    )
);

// This is a bit of a hack to ensure isLoading is false after rehydration.
// The onRehydrateStorage callback is not always consistently firing on first load.
setTimeout(() => {
    useAuthStore.setState({ isLoading: false });
}, 100);


export { useAuthStore };
