# React Router 적용 구현 가이드

> **프로젝트**: Employee & Department Manager
> **대상**: React 초보자
> **React Router 기초 문서**: `docs/React_Router_Tutorial.md` 참고

---

## 1. 왜 React Router를 도입하나

### 현재 문제 — 탭 전환 방식의 한계

현재 `App.jsx`는 `useState`로 탭을 전환합니다.

```jsx
const [activeTab, setActiveTab] = useState('dept');

{activeTab === 'dept' && <DeptSection showToast={showToast} />}
{activeTab === 'emp'  && <EmpSection  showToast={showToast} />}
```

| 문제 | 설명 |
|------|------|
| URL이 바뀌지 않음 | 직원 탭을 눌러도 주소창이 항상 `localhost:5173`으로 동일 |
| 새로고침 시 초기화 | 직원 탭에서 F5를 누르면 부서 탭으로 돌아옴 |
| 즐겨찾기/공유 불가 | 특정 탭 URL을 저장하거나 공유할 수 없음 |
| 뒤로가기 동작 안 함 | 브라우저 뒤로가기 버튼이 탭 전환 기록을 기억하지 못함 |

### React Router 적용 후

| 탭 | URL |
|----|-----|
| 부서 관리 | `http://localhost:5173/dept` |
| 직원 관리 | `http://localhost:5173/emp` |

URL이 바뀌므로 새로고침, 즐겨찾기, 뒤로가기가 모두 정상 동작합니다.

---

## 2. 변경 전 vs 변경 후 구조

### 변경 전 — 탭 상태(useState) 기반

```
App.jsx
  activeTab = 'dept' | 'emp'  (useState)
  │
  ├─ <button onClick={() => setActiveTab('dept')}> 부서 관리 </button>
  ├─ <button onClick={() => setActiveTab('emp')}>  직원 관리 </button>
  │
  ├─ {activeTab === 'dept' && <DeptSection />}   ← 조건부 렌더링
  └─ {activeTab === 'emp'  && <EmpSection />}
```

### 변경 후 — URL(React Router) 기반

```
main.jsx
  <BrowserRouter>           ← 라우터 최상단에 한 번만 설정
    <App />
  </BrowserRouter>

App.jsx
  │
  ├─ <NavLink to="/dept"> 부서 관리 </NavLink>   ← URL 이동 링크
  ├─ <NavLink to="/emp">  직원 관리 </NavLink>
  │
  └─ <Routes>
       <Route path="/"     element={<Navigate to="/dept" replace />} />
       <Route path="/dept" element={<DeptSection showToast={showToast} />} />
       <Route path="/emp"  element={<EmpSection  showToast={showToast} />} />
     </Routes>
```

---

## 3. 설치

```bash
npm install react-router-dom
```

---

## 4. 수정 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/main.jsx` | `<BrowserRouter>`로 `<App>` 감싸기 |
| `src/App.jsx` | `useState` → `<Routes>/<Route>`, `<button>` → `<NavLink>` |

---

## 5. main.jsx 수정

`<BrowserRouter>`는 앱 전체에 라우팅 기능을 제공합니다. **딱 한 번**, 최상단에 감싸면 됩니다.

### 변경 전

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### 변경 후

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';   // ← 추가
import App from './App.jsx';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>          {/* ← App을 감싸기 */}
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
```

---

## 6. App.jsx 수정

변경되는 부분은 세 곳입니다.

### 변경 전 전체 코드

```jsx
import { useState } from 'react';
import Toast      from './components/common/Toast.jsx';
import DeptSection from './components/department/DeptSection.jsx';
import EmpSection  from './components/employee/EmpSection.jsx';

export default function App() {
    const [activeTab, setActiveTab] = useState('dept');  // ← 제거
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    const showToast = (message, isError = false) => {
        setToast({ message, type: isError ? 'error' : 'success', visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    return (
        <div className="bg-slate-100 text-slate-700 min-h-screen p-5">
            <Toast ... />
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md">
                <header>...</header>

                <nav className="flex border-b-2 border-slate-200 mb-8">
                    {/* ↓ button → NavLink 로 교체 */}
                    <button
                        className={`tab-button ... ${activeTab === 'dept' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dept')}
                    >
                        부서 관리 (Department)
                    </button>
                    <button
                        className={`tab-button ... ${activeTab === 'emp' ? 'active' : ''}`}
                        onClick={() => setActiveTab('emp')}
                    >
                        직원 관리 (Employee)
                    </button>
                </nav>

                {/* ↓ 조건부 렌더링 → Routes/Route 로 교체 */}
                {activeTab === 'dept' && <DeptSection showToast={showToast} />}
                {activeTab === 'emp'  && <EmpSection  showToast={showToast} />}
            </div>
        </div>
    );
}
```

### 변경 후 전체 코드

```jsx
import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';  // ← 추가
import Toast       from './components/common/Toast.jsx';
import DeptSection from './components/department/DeptSection.jsx';
import EmpSection  from './components/employee/EmpSection.jsx';

export default function App() {
    // activeTab useState 제거 — URL이 탭 상태를 대신합니다.

    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    const showToast = (message, isError = false) => {
        setToast({ message, type: isError ? 'error' : 'success', visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    return (
        <div className="bg-slate-100 text-slate-700 min-h-screen p-5">
            <Toast ... />
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md">
                <header>...</header>

                {/* ── 탭 메뉴: button → NavLink ── */}
                <nav className="flex border-b-2 border-slate-200 mb-8">

                    {/*
                        NavLink의 className은 함수를 받을 수 있습니다.
                        현재 URL이 to와 일치하면 isActive = true 가 됩니다.
                        isActive를 이용해 기존 'active' 클래스를 그대로 사용합니다.
                    */}
                    <NavLink
                        to="/dept"
                        className={({ isActive }) =>
                            `tab-button px-6 py-3 font-semibold text-slate-400
                             border-b-4 border-transparent -mb-0.5
                             hover:bg-slate-50 hover:text-slate-600
                             transition-all duration-300
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
                             hover:bg-slate-50 hover:text-slate-600
                             transition-all duration-300
                             ${isActive ? 'active' : ''}`
                        }
                    >
                        직원 관리 (Employee)
                    </NavLink>
                </nav>

                {/* ── 라우트 정의 ── */}
                <Routes>
                    {/* "/" 접속 시 "/dept"로 자동 이동 */}
                    <Route path="/" element={<Navigate to="/dept" replace />} />

                    {/* 각 경로에 맞는 컴포넌트를 렌더링 */}
                    <Route path="/dept" element={<DeptSection showToast={showToast} />} />
                    <Route path="/emp"  element={<EmpSection  showToast={showToast} />} />
                </Routes>
            </div>
        </div>
    );
}
```

---

## 7. 변경 포인트 3가지 상세 설명

### ① useState 제거

```jsx
// 제거
const [activeTab, setActiveTab] = useState('dept');
```

URL이 현재 탭을 대신 기억합니다.
`/dept`이면 부서 탭, `/emp`이면 직원 탭이 활성화됩니다.

---

### ② `<button>` → `<NavLink>`

```jsx
// 기존: button + onClick + 조건부 active 클래스
<button
    className={`tab-button ... ${activeTab === 'dept' ? 'active' : ''}`}
    onClick={() => setActiveTab('dept')}
>
    부서 관리
</button>

// 변경: NavLink — 클릭 시 URL 이동 + isActive 자동 제공
<NavLink
    to="/dept"
    className={({ isActive }) => `tab-button ... ${isActive ? 'active' : ''}`}
>
    부서 관리
</NavLink>
```

`NavLink`의 `className`은 일반 문자열 대신 **함수**를 받을 수 있습니다.
현재 URL이 `to`와 일치하면 `isActive = true`가 자동으로 전달됩니다.

---

### ③ 조건부 렌더링 → `<Routes>/<Route>`

```jsx
// 기존: 조건부 렌더링
{activeTab === 'dept' && <DeptSection showToast={showToast} />}
{activeTab === 'emp'  && <EmpSection  showToast={showToast} />}

// 변경: Routes/Route
<Routes>
    <Route path="/"     element={<Navigate to="/dept" replace />} />
    <Route path="/dept" element={<DeptSection showToast={showToast} />} />
    <Route path="/emp"  element={<EmpSection  showToast={showToast} />} />
</Routes>
```

`<Routes>`는 현재 URL을 보고 일치하는 `<Route>` 하나만 렌더링합니다.
`<Navigate>`는 해당 경로에 접근했을 때 다른 경로로 자동으로 보냅니다.

---

## 8. 라우트 구조

```
/          → <Navigate to="/dept" replace />  → /dept 로 리다이렉트
/dept      → <DeptSection showToast={showToast} />
/emp       → <EmpSection  showToast={showToast} />
그 외 경로  → 아무것도 렌더링되지 않음 (필요 시 NotFound 페이지 추가 가능)
```

### Navigate의 replace 속성

```jsx
<Navigate to="/dept" replace />
```

`replace`가 없으면: `/` → `/dept` 이동이 히스토리에 쌓여 뒤로가기 시 `/`로 돌아옵니다.
`replace`가 있으면: `/`를 `/dept`로 **교체**하므로 뒤로가기가 자연스럽게 동작합니다.

---

## 9. 전체 데이터 흐름

```
[사용자: 주소창에 localhost:3000/emp 입력 또는 NavLink 클릭]
  │
  ▼
BrowserRouter
  URL = '/emp' 감지
  │
  ▼
App.jsx > <Routes>
  path="/emp" 일치 → <EmpSection showToast={showToast} /> 렌더링
  │
  ▼
<NavLink to="/emp">
  isActive = true → 'active' 클래스 적용 → 탭 강조 표시
```

---

## 10. 적용 후 달라지는 점

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 부서 탭 URL | `localhost:3000` | `localhost:3000/dept` |
| 직원 탭 URL | `localhost:3000` | `localhost:3000/emp` |
| 새로고침 | 항상 부서 탭으로 초기화 | 현재 탭 유지 |
| 뒤로가기 | 동작 안 함 | 이전 탭으로 이동 |
| 즐겨찾기 | 탭 구분 불가 | 각 탭 URL 저장 가능 |
| `activeTab` state | 필요 | **제거** |

---

## 11. 주의사항

| 항목 | 설명 |
|------|------|
| **BrowserRouter 위치** | 반드시 `main.jsx`에서 `<App>`을 감싸야 합니다. `App.jsx` 안에 두면 안 됩니다 |
| **Routes는 한 번만** | 앱 전체에서 `<Routes>`는 필요한 곳에만 씁니다 |
| **Link vs NavLink** | 단순 이동이면 `<Link>`, 활성 상태 스타일이 필요하면 `<NavLink>` |
| **replace 속성** | 리다이렉트(`<Navigate>`)에는 `replace`를 붙여 뒤로가기가 무한루프에 빠지지 않게 합니다 |
| **Vite 개발서버** | SPA 라우팅은 기본적으로 Vite에서 잘 동작합니다. 배포 시에는 서버 설정이 필요합니다 |
