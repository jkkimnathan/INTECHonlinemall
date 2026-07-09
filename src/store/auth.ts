import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useWishlistStore } from "@/store/wishlist";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  grade: "일반" | "실버" | "골드" | "VIP";
  points: number;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string; needsConfirm?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  initialize: () => Promise<void>;
}

// onAuthStateChange 리스너는 앱 수명 동안 1회만 등록 (StrictMode 이중 실행/재초기화 대비)
let authListenerRegistered = false;

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isLoggedIn: false,
  loading: true,

  initialize: async () => {
    const supabase = createClient();

    // Auth 상태 변경 리스너 — 세션 유무와 무관하게 항상 등록
    if (!authListenerRegistered) {
      authListenerRegistered = true;
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
          // 공용 PC에서 다음 사용자 계정으로 위시리스트가 넘어가지 않도록 정리
          useWishlistStore.getState().clearWishlist();
          set({ user: null, isLoggedIn: false, loading: false });
          return;
        }

        if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          const u = session.user;
          const current = get().user;
          // 세션 기반으로 즉시 로그인 반영 (동일 유저면 기존 프로필 유지)
          if (!current || current.id !== u.id) {
            set({
              user: {
                id: u.id,
                email: u.email || "",
                name: u.user_metadata?.name || "",
                phone: u.user_metadata?.phone || "",
                grade: "일반",
                points: 0,
                isAdmin: false,
                createdAt: u.created_at || new Date().toISOString(),
              },
              isLoggedIn: true,
              loading: false,
            });
          } else {
            set({ isLoggedIn: true, loading: false });
          }

          // supabase-js 콜백 내부에서 쿼리를 await하면 토큰 갱신 락 데드락 위험 → 콜백 밖에서 로드
          setTimeout(() => {
            supabase
              .from("profiles")
              .select("*")
              .eq("id", u.id)
              .single()
              .then(({ data: profile }) => {
                if (profile && get().user?.id === profile.id) {
                  set({
                    user: {
                      id: profile.id,
                      email: profile.email,
                      name: profile.name || "",
                      phone: profile.phone || "",
                      grade: profile.grade || "일반",
                      points: profile.points || 0,
                      isAdmin: profile.is_admin || false,
                      createdAt: profile.created_at,
                    },
                    isLoggedIn: true,
                  });
                }
              });
          }, 0);
        }
      });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // auth 세션 존재 → 즉시 로그인 처리
      const u = session.user;
      set({
        user: {
          id: u.id,
          email: u.email || "",
          name: u.user_metadata?.name || "",
          phone: u.user_metadata?.phone || "",
          grade: "일반",
          points: 0,
          isAdmin: false,
          createdAt: u.created_at || new Date().toISOString(),
        },
        isLoggedIn: true,
        loading: false,
      });

      // profile 보강 (실패해도 로그인 유지)
      try {
        let { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();

        if (!profile) {
          const { data: newProfile } = await supabase
            .from("profiles")
            .upsert({
              id: u.id,
              email: u.email,
              name: u.user_metadata?.name || "",
              phone: u.user_metadata?.phone || "",
            })
            .select("*")
            .single();
          profile = newProfile;
        }

        if (profile) {
          set({
            user: {
              id: profile.id,
              email: profile.email,
              name: profile.name || "",
              phone: profile.phone || "",
              grade: profile.grade || "일반",
              points: profile.points || 0,
              isAdmin: profile.is_admin || false,
              createdAt: profile.created_at,
            },
          });
        }
      } catch {
        // profile 로드 실패해도 로그인 유지
      }

      // 위시리스트 DB 동기화
      useWishlistStore.getState().syncFromSupabase().catch(() => {});
      return;
    }

    set({ user: null, isLoggedIn: false, loading: false });
  },

  login: async (email, password) => {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
      }
      if (error.message === "Email not confirmed") {
        return { success: false, error: "이메일 인증이 필요합니다. 메일함을 확인해주세요." };
      }
      return { success: false, error: error.message };
    }

    const sessionUser = authData.session?.user || authData.user;
    if (!sessionUser) {
      return { success: false, error: "세션을 가져올 수 없습니다." };
    }

    // auth 성공 → 즉시 로그인 처리 (profile 없어도)
    const fallbackUser: User = {
      id: sessionUser.id,
      email: sessionUser.email || email,
      name: sessionUser.user_metadata?.name || "",
      phone: sessionUser.user_metadata?.phone || "",
      grade: "일반",
      points: 0,
      isAdmin: false,
      createdAt: sessionUser.created_at || new Date().toISOString(),
    };
    set({ user: fallbackUser, isLoggedIn: true });

    // profile 보강 로드 (실패해도 로그인 유지)
    try {
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (!profile) {
        const { data: newProfile } = await supabase
          .from("profiles")
          .upsert({
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.user_metadata?.name || "",
            phone: sessionUser.user_metadata?.phone || "",
          })
          .select("*")
          .single();
        profile = newProfile;
      }

      if (profile) {
        set({
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name || "",
            phone: profile.phone || "",
            grade: profile.grade || "일반",
            points: profile.points || 0,
            isAdmin: profile.is_admin || false,
            createdAt: profile.created_at,
          },
        });
      }
    } catch {
      // profile 로드 실패해도 로그인은 유지
    }

    // 위시리스트 DB 동기화
    useWishlistStore.getState().syncFromSupabase().catch(() => {});

    return { success: true };
  },

  signup: async (data) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return { success: false, error: "이미 가입된 이메일입니다." };
      }
      return { success: false, error: error.message };
    }

    // 회원가입 후 자동 로그인 시 프로필 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // phone 정보는 트리거에서 안 넣으므로 직접 업데이트
      await supabase
        .from("profiles")
        .update({ phone: data.phone, name: data.name })
        .eq("id", session.user.id);

      set({
        user: {
          id: session.user.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          grade: "일반",
          points: 0,
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        isLoggedIn: true,
      });
      return { success: true };
    }

    // 세션이 없으면 = 이메일 확인이 필요한 설정(Confirm email ON).
    // 확인 메일을 보냈으므로 자동 로그인하지 않고 안내가 필요함을 알린다.
    return { success: true, needsConfirm: true };
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // 다음 사용자 계정으로의 교차 오염 방지 — 위시리스트는 DB로 upsert되므로 반드시 정리
    useWishlistStore.getState().clearWishlist();
    set({ user: null, isLoggedIn: false, loading: false });
  },

  updateUser: (data) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...data } });
    }
  },
}));
