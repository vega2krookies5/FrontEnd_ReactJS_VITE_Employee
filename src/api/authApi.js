/**
 * authApi.js — 인증(Authentication) API 통신
 *
 * ─── 엔드포인트 ────────────────────────────────────────────────────────
 *  POST /userinfos/login  → 로그인 (JWT 토큰 반환 — plain text)
 *  POST /userinfos/new    → 회원 가입
 *
 * ─── 로그인 응답 특이사항 ─────────────────────────────────────────────
 *  일반 API는 JSON을 반환하지만, 로그인은 JWT 토큰 문자열(text/plain)을 반환합니다.
 *  axios는 Content-Type이 text/plain이면 자동으로 문자열로 파싱합니다.
 *  따라서 response.data가 바로 토큰 문자열입니다.
 *
 *  예: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbi4uLiIsImlhdCI6..."
 */
import axios from './axiosInstance.js';

export class AuthApi {

    // 로그인 — POST /userinfos/login
    // 성공 시 JWT 토큰 문자열을 반환합니다.
    async login(email, password) {
        const { data } = await axios.post('/userinfos/login', { email, password });
        return data; // plain text JWT 토큰
    }

    // 회원 가입 — POST /userinfos/new
    // userData: { name, email, password, roles }
    // roles 예시: 'ROLE_USER' 또는 'ROLE_ADMIN' 또는 'ROLE_ADMIN,ROLE_USER'
    async register(userData) {
        const { data } = await axios.post('/userinfos/new', userData);
        return data;
    }
}
