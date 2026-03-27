# React 인증(Auth) 구현 가이드

Spring Boot + JWT 백엔드와 연동하는 React 클라이언트 인증 구현 문서입니다.
인증 구현을 처음 접하는 개발자를 위해 개념부터 코드까지 단계별로 설명합니다.

---

## 목차

1. [JWT 인증이란?](#1-jwt-인증이란)
2. [전체 구조 한눈에 보기](#2-전체-구조-한눈에-보기)
3. [백엔드 API 정보](#3-백엔드-api-정보)
4. [파일별 구현 상세](#4-파일별-구현-상세)
5. [App.jsx — 라우팅에 인증 적용](#5-appjsx--라우팅에-인증-적용)
6. [전체 인증 흐름](#6-전체-인증-흐름)
7. [자주 묻는 질문 (FAQ)](#7-자주-묻는-질문-faq)
8. [주의사항](#8-주의사항)

---

## 1. JWT 인증이란?

### 1-1. 왜 인증이 필요한가요?

로그인 없이 누구나 직원/부서 데이터에 접근하면 안 됩니다. 서버는 요청자가 **"허가된 사람인지"** 확인해야 합니다.

```
인증 없음 (문제):
  아무나 → GET /api/employees → 서버가 데이터 반환 (위험!)

인증 있음 (안전):
  로그인한 사용자 → 토큰 발급 → 모든 API 요청에 토큰 첨부 → 서버가 토큰 검증 후 데이터 반환
```

### 1-2. JWT(JSON Web Token)란?

JWT는 **"내가 누구인지 증명하는 디지털 신분증"** 입니다.

```
실생활 비유 — 놀이공원 손목 밴드:
  1. 입장 시 (로그인): 신분 확인 후 손목 밴드 발급
  2. 놀이기구 탑승 시 (API 요청): 밴드 제시 → 직원이 확인
  3. 밴드 유효 시간이 지나면 (토큰 만료): 재발급 필요
```

JWT는 세 부분으로 구성됩니다:

```
eyJhbGciOiJIUzI1NiJ9  .  eyJzdWIiOiJhZG1pbi4uLiIsImlhdCI6...  .  서명
      ↑                           ↑                                  ↑
   Header                      Payload                           Signature
 (알고리즘 정보)            (사용자 정보 포함)                  (위변조 방지)
```

**이 프로젝트의 Payload 내용:**

```json
{
  "sub": "admin@aa.com",   // 로그인한 이메일
  "iat": 1742745600,       // 발급 시간 (Unix 타임스탬프)
  "exp": 1742749200        // 만료 시간 (발급 + 3600초 = 1시간 후)
}
```

### 1-3. 클라이언트에서 토큰을 어떻게 사용하나요?

```
1. 로그인 성공 → 서버가 JWT 토큰 문자열 반환
2. 클라이언트가 localStorage에 토큰 저장
3. 이후 모든 API 요청 헤더에 토큰 첨부:
     Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
4. 서버가 헤더의 토큰을 검증 → 성공이면 데이터 반환
```

> **Bearer**란? "이 토큰을 가진(bearer) 사람에게 접근을 허용합니다"라는 의미의 약속된 단어입니다.

---

## 2. 전체 구조 한눈에 보기

### 2-1. 파일 구조

```
src/
├── api/
│   ├── axiosInstance.js     # ① 공통 axios 설정 + 토큰 자동 첨부 인터셉터
│   ├── authApi.js           # ② 로그인 / 회원가입 HTTP 요청
│   ├── employeeApi.js       # 직원 API (토큰 자동 첨부됨)
│   └── departmentApi.js     # 부서 API (토큰 자동 첨부됨)
│
├── store/
│   ├── authStore.js         # ③ 인증 상태 관리 (token, email) + localStorage
│   ├── employeeStore.js     # 직원 상태
│   └── departmentStore.js   # 부서 상태
│
├── components/
│   ├── auth/
│   │   ├── LoginPage.jsx    # ④ 로그인 폼 화면
│   │   └── RegisterPage.jsx # ⑤ 회원가입 폼 화면
│   ├── employee/
│   └── department/
│
└── App.jsx                  # ⑥ 라우팅 + ProtectedRoute (인증 없으면 로그인 페이지로)
```

### 2-2. 각 파일의 역할 관계

```
사용자 (브라우저)
    │
    ├─ 로그인 화면 → LoginPage.jsx
    │                    │ login() 호출
    │                    ▼
    │               authStore.js ────→ authApi.js ────→ axiosInstance.js ────→ 서버
    │                    │                                      ▲
    │                    │ 토큰 저장 (localStorage)             │
    │                    │                                      │
    └─ 직원/부서 화면 → API 요청 시 ──── 요청 인터셉터 ──── 토큰 자동 첨부
```

---

## 3. 백엔드 API 정보

### 3-1. 서버 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL (개발) | `http://localhost:8080` |
| 인증 방식 | JWT Bearer Token |
| 토큰 유효 시간 | 3600초 (1시간) |
| Content-Type | `application/json` |

### 3-2. 인증 관련 엔드포인트 (토큰 불필요)

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/userinfos/login` | 로그인 — JWT 토큰 발급 |
| POST | `/userinfos/new` | 회원 가입 |

### 3-3. 직원 / 부서 엔드포인트 (토큰 필요)

| Method | URL | 필요 권한 | 설명 |
|--------|-----|-----------|------|
| GET | `/api/employees` | `ROLE_ADMIN` | 전체 직원 목록 |
| GET | `/api/employees/page` | 인증 | 직원 페이징 조회 |
| POST | `/api/employees` | 인증 | 직원 등록 |
| PUT | `/api/employees/{id}` | 인증 | 직원 수정 |
| DELETE | `/api/employees/{id}` | 인증 | 직원 삭제 |
| GET | `/api/departments` | 인증 | 전체 부서 목록 |
| GET | `/api/departments/page` | 인증 | 부서 페이징 조회 |
| POST | `/api/departments` | 인증 | 부서 등록 |

### 3-4. 요청 / 응답 데이터 형식

**로그인 요청:**
```json
POST /userinfos/login
{
  "email": "admin@aa.com",
  "password": "pwd1"
}
```

**로그인 응답 — plain text (JSON이 아님!):**
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbi4uLiIsImlhdCI6...
```

> 주의: 로그인 응답은 `{ token: "..." }` 같은 JSON이 아닙니다.
> `response.data` 자체가 토큰 문자열입니다.

**회원가입 요청:**
```json
POST /userinfos/new
{
  "name": "홍길동",
  "email": "user@aa.com",
  "password": "pwd1",
  "roles": "ROLE_USER"
}
```

> `roles` 값: `"ROLE_USER"`, `"ROLE_ADMIN"`, `"ROLE_ADMIN,ROLE_USER"` (쉼표 구분, 공백 없음)

### 3-5. 에러 응답 형식

**401 — 토큰 없음 / 만료 / 잘못된 자격증명:**
```json
{
  "statusCode": 401,
  "message": "Full authentication is required to access this resource"
}
```

**403 — 권한 부족 (토큰은 있지만 ROLE이 부족):**
```json
{
  "statusCode": 403,
  "message": "Access Denied"
}
```

**400 — 입력값 검증 실패:**
```json
{
  "status": 400,
  "message": "입력항목 검증 오류",
  "errors": {
    "email": "이미 사용 중인 이메일입니다."
  }
}
```

---

## 4. 파일별 구현 상세

### 4-1. authApi.js — 로그인/회원가입 HTTP 요청

**파일 위치:** `src/api/authApi.js`

```js
/**
 * authApi.js — 인증(Authentication) API 통신
 *
 * 로그인과 회원가입 요청을 서버에 보냅니다.
 * axiosInstance를 사용하므로 baseURL이 자동으로 결합됩니다.
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
    async register(userData) {
        const { data } = await axios.post('/userinfos/new', userData);
        return data;
    }
}
```

**핵심 포인트:**
- 로그인 엔드포인트(`/userinfos/login`)는 토큰이 불필요합니다 — 인터셉터가 토큰 없으면 헤더를 추가하지 않으므로 자연스럽게 동작합니다
- `data`가 바로 토큰 문자열입니다 — `data.token`이 아님에 주의

---

### 4-2. authStore.js — 인증 상태 Zustand 스토어

**파일 위치:** `src/store/authStore.js`

```js
/**
 * authStore.js — 인증 상태 Zustand 스토어
 *
 * 관리하는 상태:
 *   token : JWT 토큰 문자열 (null이면 비로그인 상태)
 *   email : 로그인한 사용자 이메일
 *
 * localStorage를 함께 사용하는 이유:
 *   Zustand 상태는 메모리에만 저장됩니다.
 *   새로고침하면 메모리가 초기화되어 로그인이 풀립니다.
 *   localStorage에 저장하면 새로고침 후에도 토큰이 남아있어 로그인이 유지됩니다.
 */
import { create } from 'zustand';
import { AuthApi } from '../api/authApi.js';

const authApi = new AuthApi();

// localStorage 키 상수 — axiosInstance.js에서도 동일한 키를 사용합니다
export const TOKEN_KEY = 'auth_token';
export const EMAIL_KEY = 'auth_email';

export const useAuthStore = create((set) => ({

    // ── 초기 상태 ────────────────────────────────────────────────────
    // 앱이 처음 실행될 때 localStorage에서 저장된 토큰을 읽어 초기화합니다.
    // 이것이 새로고침 후에도 로그인이 유지되는 핵심 이유입니다.
    token: localStorage.getItem(TOKEN_KEY) ?? null,
    email: localStorage.getItem(EMAIL_KEY) ?? null,

    // ── 로그인 ───────────────────────────────────────────────────────
    // 1. authApi를 통해 서버에 이메일/비밀번호 전송
    // 2. 서버가 JWT 토큰 반환
    // 3. localStorage와 Zustand 상태 모두 업데이트
    login: async (email, password) => {
        const token = await authApi.login(email, password);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(EMAIL_KEY, email);
        set({ token, email });
    },

    // ── 회원 가입 ────────────────────────────────────────────────────
    // 가입 후 자동 로그인은 하지 않습니다.
    // 성공 후 LoginPage에서 /login 페이지로 이동합니다.
    register: async (userData) => {
        await authApi.register(userData);
    },

    // ── 로그아웃 ─────────────────────────────────────────────────────
    // localStorage와 Zustand 상태 모두 초기화합니다.
    // 호출 후 App.jsx의 handleLogout이 /login으로 이동합니다.
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        set({ token: null, email: null });
    },
}));
```

**localStorage vs Zustand 저장 차이:**

```
Zustand 상태 (메모리):
  앱 실행 중   → 빠르게 접근 가능 (token 값이 메모리에 있음)
  새로고침 시  → 초기화 (로그인 풀림)

localStorage (브라우저 저장소):
  앱 실행 중   → 접근 가능하지만 상대적으로 느림
  새로고침 시  → 유지됨 (브라우저를 닫아도 남아있음)

두 곳에 함께 저장하면:
  앱 실행 중   → Zustand 상태로 읽음 (빠름)
  새로고침 후  → localStorage.getItem()으로 복원 → Zustand 초기값 설정
```

---

### 4-3. axiosInstance.js — 토큰 자동 첨부 인터셉터

**파일 위치:** `src/api/axiosInstance.js`

인증 추가 후 인터셉터가 2개가 됩니다.

```js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ── ① 요청 인터셉터 — Bearer 토큰 자동 첨부 ─────────────────────────
// 모든 API 요청이 서버로 떠나기 직전에 실행됩니다.
// localStorage에서 토큰을 읽어 Authorization 헤더에 자동으로 추가합니다.
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // 결과: 서버가 받는 헤더 → Authorization: Bearer eyJhbGci...
        }
        return config; // 반드시 반환해야 요청이 계속 진행됩니다
    },
    error => Promise.reject(error)
);

// ── ② 응답 인터셉터 — 401 자동 로그아웃 + 에러 메시지 변환 ─────────
axiosInstance.interceptors.response.use(

    // 성공 응답 (2xx): 그대로 통과
    response => response,

    // 에러 응답 (4xx, 5xx)
    error => {
        if (error.response?.status === 401) {
            // 401: 토큰 없음 / 만료 / 위변조 → 자동 로그아웃 처리
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_email');
            window.location.href = '/login';  // 로그인 페이지로 강제 이동
            return Promise.reject(error);
        }
        // 그 외 에러: 서버 메시지로 error.message 교체
        const serverMessage = error.response?.data?.message;
        if (serverMessage) error.message = serverMessage;
        return Promise.reject(error);
    }
);

export default axiosInstance;
```

**왜 authStore를 import하지 않고 localStorage를 직접 읽나요?**

```
만약 authStore를 import하면 순환 참조가 발생합니다:

authStore.js → (import) → authApi.js
                               │
                               → (import) → axiosInstance.js
                                                   │
                                                   → (import) → authStore.js ← 순환!

해결: axiosInstance에서 authStore 대신 localStorage를 직접 읽으면 순환이 끊깁니다.
```

**왜 401 처리에 useNavigate 대신 window.location.href를 쓰나요?**

```
useNavigate()는 React 훅입니다.
훅은 React 컴포넌트 안에서만 사용할 수 있습니다.

axiosInstance.js는 React 컴포넌트 밖에 있는 일반 JS 파일입니다.
→ useNavigate() 사용 불가
→ window.location.href = '/login' 으로 페이지 이동합니다.
```

---

### 4-4. LoginPage.jsx — 로그인 폼 컴포넌트

**파일 위치:** `src/components/auth/LoginPage.jsx`

```jsx
/**
 * LoginPage.jsx — 로그인 폼
 *
 * 사용자가 이메일과 비밀번호를 입력하면:
 *   성공 → Toast 표시 → /dept 페이지로 이동
 *   실패 → Toast로 서버 에러 메시지 표시
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

const inputClass =
    'w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm bg-white ' +
    'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';

export default function LoginPage({ showToast }) {

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [loading,  setLoading]  = useState(false);

    const { login } = useAuthStore();  // authStore의 login 액션
    const navigate  = useNavigate();   // 페이지 이동 훅

    const handleSubmit = async (e) => {
        e.preventDefault();  // 폼 기본 제출(새로고침) 방지
        setLoading(true);
        try {
            await login(email, password);   // authStore → authApi → 서버
            showToast('로그인 성공');
            navigate('/dept');              // 성공 시 부서 관리 페이지로 이동
        } catch (err) {
            // axiosInstance 인터셉터가 서버 메시지로 err.message를 교체했습니다.
            // err.message = "아이디 또는 비밀번호가 올바르지 않습니다" (서버 메시지)
            showToast(err.message || '로그인에 실패했습니다.', true);
        } finally {
            setLoading(false);  // 성공/실패 관계없이 로딩 해제
        }
    };

    return (
        <div className="max-w-md mx-auto mt-4">
            <div className="border border-slate-200 rounded-xl p-8">

                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3 mb-6">
                    로그인
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="예: admin@aa.com"
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                            className={inputClass}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <p className="text-sm text-slate-500 mt-5 text-center">
                    계정이 없으신가요?{' '}
                    <Link to="/register" className="text-blue-500 hover:underline font-semibold">
                        회원가입
                    </Link>
                </p>

            </div>
        </div>
    );
}
```

**코드 핵심 포인트:**

| 코드 | 설명 |
|------|------|
| `useState('')` | 입력 필드의 값을 상태로 관리 |
| `e.preventDefault()` | `<form>`의 기본 동작(페이지 새로고침)을 막음 |
| `await login(email, password)` | authStore의 login 실행 — 서버 요청부터 저장까지 처리 |
| `navigate('/dept')` | 성공 후 페이지 이동 (새로고침 없이) |
| `loading` 상태 | 버튼 비활성화로 중복 클릭 방지 |
| `<Link to="/register">` | 회원가입 페이지로 이동하는 React Router 링크 |

---

### 4-5. RegisterPage.jsx — 회원가입 폼 컴포넌트

**파일 위치:** `src/components/auth/RegisterPage.jsx`

```jsx
/**
 * RegisterPage.jsx — 회원 가입 폼
 *
 * 이름, 이메일, 비밀번호, 권한을 입력받아 계정을 생성합니다.
 * 성공 시 /login 페이지로 이동합니다.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

const inputClass =
    'w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm bg-white ' +
    'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';

export default function RegisterPage({ showToast }) {

    // 여러 필드를 하나의 객체 상태로 관리합니다 (LoginPage의 개별 useState와 비교)
    const [form, setForm] = useState({
        name:     '',
        email:    '',
        password: '',
        roles:    'ROLE_USER',  // 기본값: 일반 사용자
    });
    const [loading, setLoading] = useState(false);

    const { register } = useAuthStore();
    const navigate     = useNavigate();

    // 입력 필드가 바뀔 때마다 해당 key만 업데이트합니다.
    // [e.target.name]: e.target.value → name 속성과 동일한 key를 업데이트합니다.
    // 예: name="email" 필드가 바뀌면 → form.email만 업데이트
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);                   // authStore → authApi → 서버
            showToast('회원가입 완료. 로그인해 주세요.');
            navigate('/login');                     // 성공 시 로그인 페이지로 이동
        } catch (err) {
            showToast(err.message || '회원가입에 실패했습니다.', true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-4">
            <div className="border border-slate-200 rounded-xl p-8">

                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3 mb-6">
                    회원 가입
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">이름</label>
                        <input
                            type="text"
                            name="name"           /* handleChange가 name 속성으로 form.name을 업데이트 */
                            value={form.name}
                            onChange={handleChange}
                            placeholder="예: 홍길동"
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="예: user@aa.com"
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">권한</label>
                        <select
                            name="roles"
                            value={form.roles}
                            onChange={handleChange}
                            className={`${inputClass} appearance-none`}
                        >
                            <option value="ROLE_USER">ROLE_USER (일반 사용자)</option>
                            <option value="ROLE_ADMIN">ROLE_ADMIN (관리자)</option>
                            <option value="ROLE_ADMIN,ROLE_USER">ROLE_ADMIN,ROLE_USER (관리자+사용자)</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-success w-full disabled:opacity-50"
                    >
                        {loading ? '처리 중...' : '회원 가입'}
                    </button>
                </form>

                <p className="text-sm text-slate-500 mt-5 text-center">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline font-semibold">
                        로그인
                    </Link>
                </p>

            </div>
        </div>
    );
}
```

**handleChange 패턴 이해:**

```js
// 개별 useState 방식 (LoginPage):
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
onChange={e => setEmail(e.target.value)}

// 객체 useState 방식 (RegisterPage):
const [form, setForm] = useState({ name: '', email: '', password: '', roles: '' });
const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
};
// name="email" 필드 변경 시 → form = { ...기존값, email: 새값 }
// name="password" 필드 변경 시 → form = { ...기존값, password: 새값 }

// 필드가 4개 이상이면 객체 방식이 더 간결합니다.
```

---

## 5. App.jsx — 라우팅에 인증 적용

### 5-1. ProtectedRoute 컴포넌트란?

**토큰이 없으면 로그인 페이지로 자동 이동**시키는 보호막 컴포넌트입니다.

```
토큰 있음: ProtectedRoute → 자식 컴포넌트(DeptSection 등) 렌더링
토큰 없음: ProtectedRoute → /login 으로 자동 이동 (자식 컴포넌트 렌더링 안 함)
```

### 5-2. App.jsx 전체 코드

```jsx
import { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';

import Toast        from './components/common/Toast.jsx';
import DeptSection  from './components/department/DeptSection.jsx';
import EmpSection   from './components/employee/EmpSection.jsx';
import LoginPage    from './components/auth/LoginPage.jsx';
import RegisterPage from './components/auth/RegisterPage.jsx';

// ── ProtectedRoute — 토큰 없으면 /login으로 보내는 보호막 ─────────────
// children: 보호할 컴포넌트 (DeptSection, EmpSection 등)
function ProtectedRoute({ children }) {
    const { token } = useAuthStore();
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {

    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    const showToast = (message, isError = false) => {
        setToast({ message, type: isError ? 'error' : 'success', visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    // 로그인 상태와 이메일을 Zustand에서 읽습니다
    const { token, email, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();             // localStorage 초기화 + Zustand 상태 초기화
        navigate('/login');   // /login 페이지로 이동
    };

    return (
        <div className="bg-slate-100 text-slate-700 min-h-screen p-5">

            <Toast message={toast.message} type={toast.type} visible={toast.visible} />

            <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Employee &amp; Department Manager
                    </h1>
                    <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold
                        ${import.meta.env.VITE_APP_ENV === 'production'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-700'
                        }`}>
                        {import.meta.env.VITE_APP_ENV ?? 'unknown'} 환경
                    </span>
                </header>

                {/* 로그인 상태일 때만 탭 메뉴와 로그아웃 버튼 표시 */}
                {token && (
                    <nav className="flex justify-between items-center border-b-2 border-slate-200 mb-8">
                        <div className="flex">
                            <NavLink
                                to="/dept"
                                className={({ isActive }) =>
                                    `tab-button px-6 py-3 font-semibold text-slate-400
                                     border-b-4 border-transparent -mb-0.5
                                     hover:bg-slate-50 hover:text-slate-600 transition-all duration-300
                                     ${isActive ? 'active' : ''}`
                                }
                            >
                                부서 관리 (Department)
                            </NavLink>
                            <NavLink
                                to="/emp"
                                className={({ isActive }) =>
                                    `tab-button px-6 py-3 font-semibold text-slate-400
                                     border-b-4 border-transparent -mb-0.5
                                     hover:bg-slate-50 hover:text-slate-600 transition-all duration-300
                                     ${isActive ? 'active' : ''}`
                                }
                            >
                                직원 관리 (Employee)
                            </NavLink>
                        </div>
                        {/* 로그인 사용자 이메일 + 로그아웃 버튼 */}
                        <div className="flex items-center gap-3 pb-0.5">
                            <span className="text-sm text-slate-500">{email}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-semibold text-slate-500
                                           border border-slate-300 rounded-lg
                                           hover:bg-slate-50 transition-all"
                            >
                                로그아웃
                            </button>
                        </div>
                    </nav>
                )}

                <Routes>
                    {/* 공개 경로 — 토큰 없이 접근 가능 */}
                    <Route path="/login"    element={<LoginPage    showToast={showToast} />} />
                    <Route path="/register" element={<RegisterPage showToast={showToast} />} />

                    {/* 보호 경로 — 토큰 없으면 ProtectedRoute가 /login으로 이동 */}
                    <Route path="/" element={
                        <ProtectedRoute><Navigate to="/dept" replace /></ProtectedRoute>
                    } />
                    <Route path="/dept" element={
                        <ProtectedRoute><DeptSection showToast={showToast} /></ProtectedRoute>
                    } />
                    <Route path="/emp" element={
                        <ProtectedRoute><EmpSection showToast={showToast} /></ProtectedRoute>
                    } />
                </Routes>
            </div>
        </div>
    );
}
```

### 5-3. ProtectedRoute 동작 원리

```
사용자가 /dept URL에 접근 시:

① token 있음 (로그인 상태):
   ProtectedRoute → token 확인 → DeptSection 렌더링

② token 없음 (미로그인):
   ProtectedRoute → token 없음 → <Navigate to="/login" replace />
   → URL이 /login으로 바뀌면서 LoginPage가 렌더링됨
   → 사용자는 로그인 페이지를 보게 됨
```

```
replace 옵션을 사용하는 이유:
  replace 없음: 히스토리 스택 → [/, /dept, /login]
               /login에서 뒤로가기 → /dept → 또 /login으로 튕김 (무한 반복!)

  replace 있음: 히스토리 스택 → [/, /login]
               /dept를 /login으로 교체했으므로 뒤로가기가 자연스러움
```

---

## 6. 전체 인증 흐름

### 6-1. 최초 접속 흐름

```
브라우저에서 http://localhost:5173 접속
    │
    ▼
authStore 초기화
  token: localStorage.getItem('auth_token')  → null (첫 방문) 또는 이전 토큰
    │
    ├─ token 없음 ──────────────────────────────────────────────────────
    │    App.jsx → Route "/" → ProtectedRoute → token 없음
    │    → <Navigate to="/login" replace />
    │    → LoginPage 표시
    │
    └─ token 있음 (이전에 로그인했던 경우) ─────────────────────────────
         App.jsx → Route "/" → ProtectedRoute → token 있음
         → <Navigate to="/dept" replace />
         → DeptSection 표시 (자동 로그인 유지)
```

### 6-2. 로그인 흐름

```
LoginPage
  handleSubmit() → e.preventDefault()
      │  await login(email, password)
      ▼
authStore.login()
      │  const token = await authApi.login(email, password)
      ▼
authApi.js
      │  axios.post('/userinfos/login', { email, password })
      ▼
[요청 인터셉터]
      │  localStorage에 토큰 없음 → Authorization 헤더 미추가 (정상)
      ▼
Spring Boot 서버
  이메일/비밀번호 검증 성공
      │  JWT 토큰 문자열 반환 (text/plain)
      ▼
[응답 인터셉터]
      │  2xx 성공 → 그대로 통과
      ▼
authStore.login()
      │  localStorage.setItem('auth_token', token)
      │  localStorage.setItem('auth_email', email)
      │  set({ token, email })  ← Zustand 상태 업데이트
      ▼
LoginPage
      │  showToast('로그인 성공')
      │  navigate('/dept')
      ▼
DeptSection 화면 표시
```

### 6-3. 인증이 필요한 API 요청 흐름

```
DeptSection (useEffect → 마운트 시 자동 실행)
  loadDepartmentsPage()
      │
      ▼
departmentStore.js
  departmentApi.getPage(...)
      │
      ▼
departmentApi.js
  axios.get('/api/departments/page', { params })
      │
      ▼
[요청 인터셉터]
  const token = localStorage.getItem('auth_token')  → 토큰 있음
  config.headers.Authorization = 'Bearer eyJhbGci...'  ← 자동 추가
      │
      ▼
Spring Boot 서버
  Authorization 헤더의 JWT 검증 성공
  페이징 데이터 반환
      │
      ▼
[응답 인터셉터]
  2xx → 그대로 통과
      │
      ▼
departmentStore.js
  set({ departments: data.content, totalPages: data.totalPages })
      │
      ▼
DeptList.jsx (자동 리렌더링)
```

### 6-4. 토큰 만료 흐름

```
API 요청 (만료된 토큰이 localStorage에 남아있음)
      │
      ▼
[요청 인터셉터]
  만료된 토큰을 헤더에 첨부 (만료 여부는 서버만 알 수 있음)
      │
      ▼
Spring Boot 서버
  토큰 검증 실패 (만료)
  401 응답 반환
      │
      ▼
[응답 인터셉터]
  error.response.status === 401 감지
  localStorage.removeItem('auth_token')  ← 만료된 토큰 삭제
  localStorage.removeItem('auth_email')
  window.location.href = '/login'        ← 로그인 페이지로 강제 이동
      │
      ▼
LoginPage 표시 (사용자가 다시 로그인해야 함)
```

### 6-5. 새로고침 후 로그인 유지 흐름

```
F5 키 (새로고침) 누름
      │
      ▼
React 앱 재시작
authStore 초기화 실행:
  token: localStorage.getItem('auth_token')  → 저장된 토큰 복원!
  email: localStorage.getItem('auth_email')  → 저장된 이메일 복원!
      │
      ▼
App.jsx 렌더링
  token 있음 → ProtectedRoute 통과 → 기존 페이지 유지
  token 없음 → /login 으로 이동
```

### 6-6. 로그아웃 흐름

```
사용자가 "로그아웃" 버튼 클릭
      │
      ▼
App.jsx handleLogout()
      │  logout()  ← authStore.logout() 호출
      ▼
authStore.logout()
      │  localStorage.removeItem('auth_token')
      │  localStorage.removeItem('auth_email')
      │  set({ token: null, email: null })
      ▼
App.jsx handleLogout()
      │  navigate('/login')
      ▼
LoginPage 표시
(이후 /dept 등에 직접 접근해도 ProtectedRoute가 다시 /login으로 이동)
```

---

## 7. 자주 묻는 질문 (FAQ)

### Q1. 로그인했는데 새로고침하면 왜 로그인이 유지되나요?

```
authStore의 초기값을 localStorage에서 읽기 때문입니다.

export const useAuthStore = create((set) => ({
    token: localStorage.getItem(TOKEN_KEY) ?? null,  // ← 여기!
    ...
}));

앱이 재시작(새로고침)될 때 이 코드가 실행되어 저장된 토큰을 복원합니다.
```

### Q2. 토큰을 어디서 볼 수 있나요?

```
브라우저 개발자 도구 → Application(또는 Storage) 탭
→ Local Storage → http://localhost:5173
→ auth_token 키에서 JWT 토큰 확인 가능

또는 콘솔에서:
> localStorage.getItem('auth_token')
```

### Q3. JWT 토큰 내용을 어떻게 확인하나요?

```
https://jwt.io 에 토큰을 붙여넣으면 디코딩됩니다.

이 프로젝트 토큰의 Payload:
{
  "sub": "admin@aa.com",  // 로그인 이메일
  "iat": 1742745600,      // 발급 시간
  "exp": 1742749200       // 만료 시간 (1시간 후)
}
```

### Q4. 401과 403 에러의 차이는 무엇인가요?

```
401 Unauthorized:
  → 토큰이 없거나, 만료되었거나, 위변조된 경우
  → "당신이 누구인지 알 수 없습니다" (인증 실패)
  → 처리: 자동 로그아웃 → /login 이동

403 Forbidden:
  → 토큰은 유효하지만 해당 리소스에 접근할 권한(ROLE)이 없는 경우
  → "당신이 누구인지는 알지만, 이 자원에 접근 권한이 없습니다" (인가 실패)
  → 처리: 에러 메시지 Toast 표시 (자동 로그아웃 안 함)
```

### Q5. ROLE_USER와 ROLE_ADMIN의 차이는?

| 엔드포인트 | ROLE_USER | ROLE_ADMIN |
|------------|-----------|-----------|
| `GET /api/employees` | 접근 불가 (403) | 접근 가능 |
| `GET /api/employees/{id}` | 접근 가능 | 접근 가능 |
| `GET /api/employees/page` | 접근 가능 | 접근 가능 |
| 부서 CRUD | 접근 가능 | 접근 가능 |

### Q6. 회원가입 후 자동 로그인이 안 되는 이유는?

```
현재 구현에서는 회원가입 성공 후 /login 페이지로 이동합니다.
자동 로그인을 원하면 RegisterPage.jsx의 handleSubmit에서:

await register(form);
await login(form.email, form.password);  // 추가
navigate('/dept');                       // /login 대신
```

---

## 8. 주의사항

| 항목 | 설명 |
|------|------|
| **로그인 응답 형식** | `text/plain` — `response.data`가 바로 토큰 문자열. `response.data.token`이 아님 |
| **토큰에 roles 없음** | Payload에 역할 정보가 없으므로 클라이언트에서 역할 기반 UI 제어 불가 |
| **localStorage 키** | `auth_token`, `auth_email` — authStore.js와 axiosInstance.js에서 동일하게 사용 |
| **순환 참조 방지** | axiosInstance 인터셉터에서 authStore를 import하지 않고 localStorage 직접 읽음 |
| **window.location.href** | 401 로그아웃 시 useNavigate 대신 사용 — 인터셉터는 React 컴포넌트 밖이라 훅 사용 불가 |
| **401 vs 403** | 401 = 자동 로그아웃. 403 = 접근 거부 메시지만 표시 (로그아웃 안 함) |
| **replace: true** | ProtectedRoute의 Navigate에 replace 적용 → 뒤로가기 무한 반복 방지 |
| **토큰 유효 시간** | 1시간 (3600초) — 만료되면 서버가 401 반환 → 인터셉터가 자동 로그아웃 처리 |
