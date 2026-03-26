# React Router 튜토리얼 — React 초보자를 위한 라우팅 입문

> **대상**: React `useState`, `useEffect`를 배웠고 라우팅을 처음 접하는 분
> **프로젝트 적용 문서**: `docs/React_Router_구현.md` 참고

---

## 1. 라우팅(Routing)이란

**라우팅**이란 URL 주소에 따라 다른 화면을 보여주는 것입니다.

```
주소창:  /           → 홈 화면
주소창:  /dept       → 부서 관리 화면
주소창:  /emp        → 직원 관리 화면
주소창:  /emp/5      → ID가 5인 직원 상세 화면
```

### 일반 웹사이트 vs React SPA의 라우팅 차이

**일반 웹사이트** (서버 라우팅)
```
주소 바뀜 → 서버에 요청 → 서버가 HTML 파일을 새로 전송 → 페이지 전체 새로고침
```

**React SPA** (클라이언트 라우팅)
```
주소 바뀜 → JavaScript가 처리 → 해당 컴포넌트만 교체 → 페이지 새로고침 없음
```

React Router는 이 **클라이언트 라우팅**을 쉽게 구현해주는 라이브러리입니다.

---

## 2. 설치

```bash
npm install react-router-dom
```

> `react-router-dom`은 브라우저 전용입니다. (React Native는 `react-router-native`)

---

## 3. 핵심 컴포넌트 5가지

| 컴포넌트 | 역할 | 비유 |
|----------|------|------|
| `<BrowserRouter>` | 라우팅 기능 제공 (최상단 1회) | 건물 전체에 전기 공급 |
| `<Routes>` | 라우트 목록 감싸기 | 전기 분전반 |
| `<Route>` | URL ↔ 컴포넌트 연결 | 각 방의 스위치 |
| `<Link>` | 링크 (클릭 시 URL 이동) | `<a href>` 대체 |
| `<NavLink>` | 활성 상태 스타일이 있는 링크 | 현재 탭이 강조되는 메뉴 버튼 |

---

## 4. BrowserRouter — 라우팅 기능 활성화

앱의 가장 바깥쪽을 `<BrowserRouter>`로 한 번만 감쌉니다.

```jsx
// main.jsx
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
```

> `<BrowserRouter>` 없이 `<Routes>`, `<Link>` 등을 사용하면 에러가 납니다.

---

## 5. Routes + Route — URL과 컴포넌트 연결

```jsx
import { Routes, Route } from 'react-router-dom';
import HomePage    from './pages/HomePage';
import AboutPage   from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    return (
        <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
    );
}
```

현재 URL이 `/about`이면 `<AboutPage />`만 렌더링됩니다.

### path 패턴 종류

```jsx
// 정확히 일치
<Route path="/dept" element={<DeptPage />} />

// URL 파라미터 (:id 부분이 변수)
<Route path="/emp/:id" element={<EmpDetailPage />} />
// /emp/1, /emp/2, /emp/100 모두 매칭됩니다.

// 모든 경로 (404 페이지에 사용)
<Route path="*" element={<NotFoundPage />} />
```

---

## 6. Link — 페이지 이동 링크

HTML의 `<a href>` 대신 `<Link to>`를 사용합니다.

```jsx
import { Link } from 'react-router-dom';

function Navigation() {
    return (
        <nav>
            <Link to="/">홈</Link>
            <Link to="/dept">부서 관리</Link>
            <Link to="/emp">직원 관리</Link>
        </nav>
    );
}
```

### `<a href>` vs `<Link to>` 차이

```jsx
// ❌ HTML <a> 태그 — 페이지 전체가 새로고침됩니다
<a href="/dept">부서 관리</a>

// ✅ React Router <Link> — 페이지 새로고침 없이 컴포넌트만 교체됩니다
<Link to="/dept">부서 관리</Link>
```

---

## 7. NavLink — 활성 상태가 있는 링크

메뉴처럼 **현재 URL과 일치하면 스타일을 다르게 표시**할 때 사용합니다.

```jsx
import { NavLink } from 'react-router-dom';

function TabMenu() {
    return (
        <nav>
            {/*
                className에 함수를 전달합니다.
                현재 URL이 to와 일치하면 isActive = true
            */}
            <NavLink
                to="/dept"
                className={({ isActive }) => isActive ? '활성-스타일' : '기본-스타일'}
            >
                부서 관리
            </NavLink>

            <NavLink
                to="/emp"
                className={({ isActive }) => isActive ? '활성-스타일' : '기본-스타일'}
            >
                직원 관리
            </NavLink>
        </nav>
    );
}
```

### style에도 같은 방식으로 사용 가능

```jsx
<NavLink
    to="/dept"
    style={({ isActive }) => ({
        fontWeight: isActive ? 'bold' : 'normal',
        color:      isActive ? 'blue' : 'gray',
    })}
>
    부서 관리
</NavLink>
```

---

## 8. Navigate — 자동 리다이렉트

특정 URL에 접속했을 때 다른 URL로 자동 이동시킵니다.

```jsx
import { Navigate } from 'react-router-dom';

<Routes>
    {/* "/" 접속 시 "/dept"로 자동 이동 */}
    <Route path="/" element={<Navigate to="/dept" replace />} />
    <Route path="/dept" element={<DeptPage />} />
</Routes>
```

### replace 속성 — 히스토리 교체란?

브라우저는 방문한 페이지를 **스택(stack)** 형태로 기록합니다.
뒤로가기 버튼은 이 스택에서 이전 페이지를 꺼내는 동작입니다.

**replace 없을 때 (기본값 — 스택에 추가)**

```
/ 접속 → /dept로 이동

히스토리 스택:
  1단계:  [ / ]
  2단계:  [ /, /dept ]   ← /dept가 추가됨

뒤로가기 누르면:
  /dept → /  → 또다시 /dept로 자동이동 → 뒤로가기 → /  (무한반복)
```

**replace 있을 때 (이전 항목을 덮어씀)**

```
/ 접속 → /dept로 이동

히스토리 스택:
  1단계:  [ / ]
  2단계:  [ /dept ]   ← /를 /dept로 교체 (/)가 스택에서 사라짐)

뒤로가기 누르면:
  /dept → 그 이전 페이지로 자연스럽게 이동 (무한반복 없음)
```

**실생활 비유**

```
replace 없음 (push — 추가):
  노트에 페이지를 계속 추가하는 것
  1페이지, 2페이지, 3페이지 ... 모두 남아있음

replace 있음 (replace — 교체):
  화이트보드에 덮어쓰는 것
  이전 내용이 지워지고 새 내용으로 교체됨
```

**언제 replace를 사용하나요?**

```
로그인 성공 후 /dept 이동
  → replace 사용: 로그인 페이지가 히스토리에 남으면
    뒤로가기로 다시 로그인 화면이 나와서 이상함

/ 접속 시 /dept로 자동 이동
  → replace 사용: / 자체는 의미 없는 경로이므로
    히스토리에 남길 필요 없음

로그아웃 후 /login 이동
  → replace 사용: 로그아웃 후 뒤로가기로
    인증이 필요한 페이지에 접근되면 안 됨
```

---

## 9. URL 파라미터 — useParams

URL의 일부를 변수처럼 받을 수 있습니다.

```jsx
// 라우트 정의
<Route path="/emp/:id" element={<EmpDetailPage />} />
//                ↑ :id 부분이 파라미터
```

```jsx
// EmpDetailPage.jsx
import { useParams } from 'react-router-dom';

function EmpDetailPage() {
    const { id } = useParams();
    // URL이 /emp/5 라면 id = "5"  (문자열)
    // URL이 /emp/12 라면 id = "12"

    return <p>직원 ID: {id}</p>;
}
```

### 실제 활용 예시

```jsx
function EmpDetailPage() {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        // URL의 id로 직원 1명 조회
        employeeApi.getById(Number(id))
            .then(data => setEmployee(data));
    }, [id]); // id가 바뀌면 다시 조회

    if (!employee) return <p>로딩 중...</p>;
    return <p>{employee.firstName} {employee.lastName}</p>;
}
```

---

## 10. 프로그래밍으로 페이지 이동 — useNavigate

버튼 클릭, 폼 제출 등 **코드에서 직접 페이지를 이동**할 때 사용합니다.

```jsx
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        await loginApi();
        navigate('/dept');      // /dept로 이동
    };

    const handleCancel = () => {
        navigate(-1);           // 뒤로가기 (브라우저 히스토리)
    };

    return (
        <>
            <button onClick={handleLogin}>로그인</button>
            <button onClick={handleCancel}>취소</button>
        </>
    );
}
```

### navigate() 사용법 정리

```jsx
navigate('/dept')                    // /dept로 이동 (히스토리에 추가)
navigate('/dept', { replace: true }) // /dept로 이동 (현재 페이지를 /dept로 교체)
navigate(-1)                         // 뒤로가기
navigate(1)                          // 앞으로가기
navigate('/emp/5')                   // 파라미터 포함 이동
```

### replace: true — 히스토리 교체

`navigate('/dept')` 와 `navigate('/dept', { replace: true })` 의 차이:

```
[replace 없음 — 히스토리에 추가]

로그인 페이지에서 로그인 성공 후 /dept로 이동한 경우:
  히스토리 스택: [ /login, /dept ]

  뒤로가기 누르면:
    /dept → /login   ← 이미 로그인했는데 로그인 화면이 다시 나옴 (이상함)
```

```
[replace: true — 현재 페이지를 교체]

로그인 페이지에서 로그인 성공 후 /dept로 이동한 경우:
  히스토리 스택: [ /dept ]   ← /login이 /dept로 교체됨

  뒤로가기 누르면:
    /dept → 로그인 이전 페이지   ← 자연스럽게 동작
```

**이 프로젝트에서 replace: true를 쓰는 곳:**

```jsx
// 로그인 성공 후 이동 — 로그인 페이지를 히스토리에 남기지 않음
navigate('/dept', { replace: true })

// 로그아웃 후 이동 — 로그아웃 후 뒤로가기로 인증 페이지 접근 방지
navigate('/login', { replace: true })  // App.jsx의 handleLogout
```

---

## 11. 현재 URL 정보 읽기 — useLocation

현재 URL의 경로, 쿼리 파라미터 등을 읽을 수 있습니다.

```jsx
import { useLocation } from 'react-router-dom';

function CurrentPath() {
    const location = useLocation();

    // location 객체 구조:
    // {
    //   pathname: "/emp",        ← 현재 경로
    //   search:   "?page=2",     ← 쿼리 파라미터
    //   hash:     "",            ← 해시(#)
    //   state:    null,          ← navigate()로 전달한 상태
    // }

    return <p>현재 경로: {location.pathname}</p>;
}
```

### 활용 예: 탭 활성화 상태를 수동으로 확인할 때

```jsx
function TabMenu() {
    const location = useLocation();

    return (
        <nav>
            <Link
                to="/dept"
                className={location.pathname === '/dept' ? 'active' : ''}
            >
                부서 관리
            </Link>
        </nav>
    );
}
// 보통은 NavLink의 isActive를 사용하는 것이 더 간편합니다.
```

---

## 12. 중첩 라우트 (Nested Routes)

페이지 안에 또 다른 라우트 영역이 있을 때 사용합니다.

```jsx
// 라우트 구조
<Routes>
    <Route path="/emp" element={<EmpLayout />}>
        <Route index        element={<EmpList />} />       {/* /emp */}
        <Route path=":id"   element={<EmpDetail />} />     {/* /emp/5 */}
        <Route path="new"   element={<EmpForm />} />       {/* /emp/new */}
    </Route>
</Routes>
```

```jsx
// EmpLayout.jsx — Outlet이 자식 라우트를 표시하는 위치
import { Outlet } from 'react-router-dom';

function EmpLayout() {
    return (
        <div>
            <h2>직원 관리</h2>
            <Outlet />   {/* /emp → <EmpList />, /emp/5 → <EmpDetail /> */}
        </div>
    );
}
```

---

## 13. 404 페이지 — 존재하지 않는 경로 처리

```jsx
function NotFoundPage() {
    return (
        <div>
            <h2>404 — 페이지를 찾을 수 없습니다</h2>
            <Link to="/">홈으로 돌아가기</Link>
        </div>
    );
}

// 라우트 정의 (맨 마지막에 추가)
<Routes>
    <Route path="/"    element={<Navigate to="/dept" replace />} />
    <Route path="/dept" element={<DeptSection />} />
    <Route path="/emp"  element={<EmpSection />} />
    <Route path="*"     element={<NotFoundPage />} />  {/* ← 그 외 모든 경로 */}
</Routes>
```

---

## 14. 전체 구조 예시 — 실제 프로젝트 패턴

```
src/
├── main.jsx           ← BrowserRouter 설정
├── App.jsx            ← Routes/Route 정의, 공통 레이아웃
├── pages/             ← 라우트 단위 컴포넌트 (각 URL에 대응)
│   ├── DeptPage.jsx   ← /dept
│   ├── EmpPage.jsx    ← /emp
│   └── NotFoundPage.jsx ← *
└── components/        ← 재사용 UI 컴포넌트 (라우트와 무관)
    ├── common/
    ├── department/
    └── employee/
```

```jsx
// main.jsx
<BrowserRouter>
    <App />
</BrowserRouter>

// App.jsx
<Routes>
    <Route path="/"     element={<Navigate to="/dept" replace />} />
    <Route path="/dept" element={<DeptPage />} />
    <Route path="/emp"  element={<EmpPage />} />
    <Route path="/emp/:id" element={<EmpDetailPage />} />
    <Route path="*"     element={<NotFoundPage />} />
</Routes>
```

---

## 15. 훅 정리

| 훅 | 사용 시점 | 반환값 |
|----|----------|--------|
| `useParams()` | URL 파라미터를 읽을 때 | `{ id: "5" }` |
| `useNavigate()` | 코드에서 페이지를 이동할 때 | `navigate` 함수 |
| `useLocation()` | 현재 URL 정보를 읽을 때 | `{ pathname, search, ... }` |

---

## 16. 학습 포인트 요약

```
1단계: BrowserRouter로 앱 감싸기 (main.jsx에서 1회)

2단계: Routes + Route로 URL ↔ 컴포넌트 연결
        <Route path="/dept" element={<DeptPage />} />

3단계: Link / NavLink로 페이지 이동
        <NavLink to="/dept" className={({isActive}) => isActive ? 'on' : 'off'}>

4단계: 훅으로 URL 제어
        useParams()    → URL 파라미터 읽기
        useNavigate()  → 코드에서 페이지 이동
        useLocation()  → 현재 URL 정보 읽기
```

### 언제 어떤 것을 쓸까?

```
단순 링크 이동          → <Link to="/path">
탭처럼 활성 스타일 필요  → <NavLink to="/path" className={({isActive}) => ...}>
조건부/자동 리다이렉트   → <Navigate to="/path" replace />
폼 제출 후 이동         → const navigate = useNavigate(); navigate('/path')
URL의 :id 값 읽기       → const { id } = useParams()
현재 경로 확인          → const { pathname } = useLocation()
```
