/**
 * authStore.js — 인증 상태 Zustand 스토어
 *
 * ─── 관리하는 상태 ─────────────────────────────────────────────────────
 *  token : JWT 토큰 문자열 (null이면 비로그인)
 *  email : 로그인한 사용자 이메일
 *
 * ─── localStorage를 사용하는 이유 ─────────────────────────────────────
 *  Zustand 상태는 메모리에만 저장됩니다.
 *  페이지를 새로고침하면 상태가 초기화되어 로그인이 풀립니다.
 *  localStorage에 함께 저장하면 새로고침 후에도 로그인이 유지됩니다.
 *
 *  [로그인 흐름]
 *  login() → 서버에서 토큰 발급 → localStorage 저장 + set({ token, email })
 *
 *  [새로고침 시]
 *  authStore 초기화: localStorage.getItem('auth_token') → token 복원
 *
 *  [로그아웃 흐름]
 *  logout() → localStorage 삭제 + set({ token: null, email: null })
 *
 * ─── axiosInstance.js 와의 연동 ────────────────────────────────────────
 *  axiosInstance의 요청 인터셉터가 localStorage에서 토큰을 읽어
 *  모든 API 요청 헤더에 자동으로 추가합니다.
 *    Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
 */
import { create } from 'zustand';
import { AuthApi } from '../api/authApi.js';

const authApi = new AuthApi();

// localStorage 키 상수 — axiosInstance.js에서도 동일한 키를 사용합니다.
export const TOKEN_KEY = 'auth_token';
export const EMAIL_KEY = 'auth_email';

export const useAuthStore = create((set) => ({

    // ── 초기 상태 ─────────────────────────────────────────────────────
    // localStorage에서 저장된 값을 읽어 초기화합니다.
    // 페이지 새로고침 후에도 로그인이 유지되는 이유입니다.
    token: localStorage.getItem(TOKEN_KEY) ?? null,
    email: localStorage.getItem(EMAIL_KEY) ?? null,

    // ── 로그인 ────────────────────────────────────────────────────────
    // 1. 서버에 이메일/비밀번호 전송 → JWT 토큰 수신
    // 2. localStorage와 스토어 상태 모두 업데이트
    login: async (email, password) => {
        const token = await authApi.login(email, password);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(EMAIL_KEY, email);
        set({ token, email });
    },

    // ── 회원 가입 ─────────────────────────────────────────────────────
    // 가입 후 자동 로그인은 하지 않습니다.
    // 컴포넌트에서 성공 후 /login 페이지로 이동합니다.
    register: async (userData) => {
        await authApi.register(userData);
    },

    // ── 로그아웃 ──────────────────────────────────────────────────────
    // localStorage와 스토어 상태를 모두 초기화합니다.
    // 컴포넌트에서 호출 후 /login 페이지로 이동합니다.
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        set({ token: null, email: null });
    },
}));
