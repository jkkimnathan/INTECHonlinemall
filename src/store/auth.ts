import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  grade: "일반" | "실버" | "골드" | "VIP";
  points: number;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  signup: (data: { email: string; password: string; name: string; phone: string }) => boolean;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

// 임시 사용자 데이터 (추후 Supabase로 교체)
const DEMO_USER: User = {
  id: "user-1",
  email: "demo@intechonline.kr",
  name: "홍길동",
  phone: "010-1234-5678",
  grade: "실버",
  points: 15000,
  createdAt: "2025-01-01",
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      login: (email, password) => {
        // 임시 로그인 로직 (추후 Supabase Auth로 교체)
        if (email && password) {
          set({ user: { ...DEMO_USER, email }, isLoggedIn: true });
          return true;
        }
        return false;
      },

      signup: (data) => {
        // 임시 회원가입 로직 (추후 Supabase Auth로 교체)
        if (data.email && data.password && data.name) {
          const newUser: User = {
            id: `user-${Date.now()}`,
            email: data.email,
            name: data.name,
            phone: data.phone,
            grade: "일반",
            points: 0,
            createdAt: new Date().toISOString().split("T")[0],
          };
          set({ user: newUser, isLoggedIn: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isLoggedIn: false });
      },

      updateUser: (data) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...data } });
        }
      },
    }),
    { name: "auth-storage" }
  )
);
