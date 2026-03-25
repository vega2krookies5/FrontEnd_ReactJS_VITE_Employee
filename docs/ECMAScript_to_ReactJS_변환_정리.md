# ECMAScript → ReactJS 변환 정리

> **프로젝트**: Employee & Department Manager
> **변환 수준**: Level 1 (HTML/CSS/JS 기반 → React 컴포넌트)
> **빌드 도구**: Vite
> **스타일**: Tailwind CSS (동일하게 유지)

---

## 1. 프로젝트 구조 비교

### ECMAScript (변환 전)

```
src/
├── main.js                    # 진입점: CSS + JS 파일 import
├── style.css
├── org_js/
│   ├── api/
│   │   ├── departmentApi.js   # DepartmentApi 클래스
│   │   └── employeeApi.js     # EmployeeApi 클래스
│   ├── dept_runner_v2.js      # 부서 UI 제어 (DOM 직접 조작)
│   ├── emp_runner_v2.js       # 직원 UI 제어 (DOM 직접 조작)
│   └── utils.js               # escapeHTML, showMessage, handleApiError
└── (index.html)               # 모든 HTML 구조 포함
```

### ReactJS (변환 후)

```
src/
├── main.jsx                   # 진입점: React 앱 마운트
├── App.jsx                    # 루트 컴포넌트 (탭, Toast 관리)
├── style.css
├── api/
│   ├── departmentApi.js       # DepartmentApi 클래스 (에러 throw로 변경)
│   └── employeeApi.js         # EmployeeApi 클래스 (에러 throw로 변경)
└── components/
    ├── common/
    │   └── Toast.jsx          # 알림 메시지 컴포넌트
    ├── department/
    │   ├── DeptSection.jsx    # 부서 섹션 (데이터/API 관리)
    │   ├── DeptForm.jsx       # 부서 등록/수정 폼
    │   ├── DeptSearch.jsx     # 부서 단건 조회
    │   └── DeptList.jsx       # 부서 목록 테이블
    └── employee/
        ├── EmpSection.jsx     # 직원 섹션 (데이터/API 관리)
        ├── EmpForm.jsx        # 직원 등록/수정 폼
        ├── EmpSearch.jsx      # 직원 단건 조회
        └── EmpList.jsx        # 직원 목록 테이블
```

**핵심 차이**: 하나의 runner 파일(300+ 줄)이 역할별 컴포넌트 4개로 분리됨

---

## 2. 진입점 (Entry Point) 변환

### 변환 전 — `src/main.js`

```js
import './style.css';
import './js/dept_runner_v2.js';
import './js/emp_runner_v2.js';
```

- CSS와 JS 파일을 직접 import
- 각 runner 파일이 로드되면서 DOM 조작 코드가 즉시 실행됨

### 변환 후 — `src/main.jsx`

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
```

| 항목 | ECMAScript | React |
|------|-----------|-------|
| 파일 확장자 | `.js` | `.jsx` |
| HTML 마운트 | 브라우저가 직접 렌더링 | `createRoot()`로 `<div id="root">`에 삽입 |
| 시작 방식 | 파일 import 시 코드 실행 | App 컴포넌트 하나를 렌더링 |
| StrictMode | 없음 | 개발 중 문제 코드 감지 (빌드 시 제거됨) |

---

## 3. 탭 전환 로직 변환

### 변환 전 — DOM 직접 제어

```js
// index.html에 전역 함수로 정의
function showTab(tabName) {
    document.querySelectorAll('.content-section').forEach(s =>
        s.classList.remove('active')
    );
    document.getElementById(tabName + '-section').classList.add('active');
}
```

```html
<!-- index.html -->
<button onclick="showTab('dept')">부서 관리</button>
<button onclick="showTab('emp')">직원 관리</button>
```

### 변환 후 — `useState`로 상태 관리 (`App.jsx`)

```jsx
const [activeTab, setActiveTab] = useState('dept');

// 탭 버튼
<button onClick={() => setActiveTab('dept')}>부서 관리</button>
<button onClick={() => setActiveTab('emp')}>직원 관리</button>

// 조건부 렌더링
{activeTab === 'dept' && <DeptSection showToast={showToast} />}
{activeTab === 'emp'  && <EmpSection  showToast={showToast} />}
```

| 항목 | ECMAScript | React |
|------|-----------|-------|
| 탭 상태 보관 | DOM의 `classList` | `activeTab` state |
| 탭 전환 | `classList.add/remove` | `setActiveTab()` 호출 |
| 섹션 숨김 | CSS `.active` 클래스 | 조건부 렌더링 (`&&`) |

---

## 4. 알림 메시지 변환

### 변환 전 — `utils.js`의 `showMessage()`

```js
// DOM 요소를 직접 찾아서 조작
export const showMessage = (message, isError = false) => {
    const alertBox = isError
        ? document.getElementById('alert-error')
        : document.getElementById('alert-success');

    alertBox.textContent = message;
    alertBox.classList.add('show');    // CSS로 표시
    setTimeout(() => alertBox.classList.remove('show'), 3000);
};
```

- `index.html`에 `id="alert-success"`, `id="alert-error"` 요소가 반드시 있어야 동작
- DOM을 직접 건드리므로 React와 충돌 가능

### 변환 후 — `Toast.jsx` 컴포넌트 + `App.jsx`의 `showToast()`

```jsx
// App.jsx — 상태로 관리
const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

const showToast = (message, isError = false) => {
    setToast({ message, type: isError ? 'error' : 'success', visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
};

// Toast.jsx — props를 받아 렌더링
export default function Toast({ message, type, visible }) {
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-emerald-500';
    return (
        <div className="fixed top-5 right-5 z-50 w-72">
            <div className={`alert ${bgColor} ${visible ? 'show' : ''}`}>
                {message}
            </div>
        </div>
    );
}
```

| 항목 | ECMAScript | React |
|------|-----------|-------|
| HTML 의존 | `id="alert-success"` 요소 필요 | 컴포넌트 자체 포함 |
| 표시 제어 | `classList.add/remove` | `visible` state |
| 하위 전달 | 전역 함수 직접 호출 | `showToast` props로 전달 |
| XSS 위험 | `textContent` (안전) | JSX 자동 이스케이프 |

---

## 5. 부서 관리 모듈 변환

### 변환 전 — `dept_runner_v2.js` (단일 파일, 약 325줄)

```
dept_runner_v2.js
 ├── DOM 요소 캐싱 (getElementById × 10개)
 ├── renderDepartmentList()    → innerHTML로 행 생성
 ├── renderDepartmentDetail()  → innerHTML로 결과 표시
 ├── populateSearchDropdown()  → createElement + appendChild
 ├── showLoading()             → style.display 토글
 ├── resetDeptForm()           → form.reset() + DOM 조작
 ├── setupEditForm()           → input.value 직접 설정
 ├── loadAndRenderDepartments()
 ├── handleFormSubmit()
 ├── handleSearchById()
 ├── handleListClick()         → 이벤트 위임 (data-action)
 └── DOMContentLoaded 이벤트 → 이벤트 리스너 등록 + 초기 로드
```

### 변환 후 — 4개 컴포넌트로 분리

```
DeptSection.jsx  (컨테이너)
 ├── useState: departments, loading, editingDept
 ├── useEffect: 마운트 시 loadDepartments() 호출
 ├── loadDepartments(), handleSubmit(), handleDelete()
 └── DeptForm / DeptSearch / DeptList에 props 전달

DeptForm.jsx
 ├── useState: name, desc
 ├── useEffect: editingDept 변경 시 폼 데이터 동기화
 └── Controlled Input (value + onChange)

DeptSearch.jsx
 ├── useState: selectedId, result
 └── select → API 호출 → result 렌더링

DeptList.jsx
 └── departments.map(dept => <tr key={dept.id}>...)
```

#### DOM 조작 → JSX 렌더링 비교

```js
// ECMAScript: innerHTML로 행 생성 (XSS 위험)
const rows = departments.map(dept => `
    <tr>
        <td>${escapeHTML(dept.departmentName)}</td>
        <button data-id="${dept.id}" data-action="edit">수정</button>
    </tr>
`);
deptListBody.innerHTML = rows.join('');
```

```jsx
// React: JSX로 직접 렌더링 (자동 이스케이프, XSS 안전)
departments.map(dept => (
    <tr key={dept.id}>
        <td>{dept.departmentName}</td>
        <button onClick={() => onEdit(dept)}>수정</button>
    </tr>
))
```

#### 이벤트 위임 → 직접 바인딩 비교

```js
// ECMAScript: 이벤트 위임 (data-* 속성으로 분기)
deptListBody.addEventListener('click', (e) => {
    const { action, id } = e.target.dataset;
    if (action === 'edit') { ... }
    if (action === 'delete') { ... }
});
```

```jsx
// React: 각 버튼에 직접 onClick 바인딩
<button onClick={() => onEdit(dept)}>수정</button>
<button onClick={() => onDelete(dept.id)}>삭제</button>
```

---

## 6. API 클래스 변환

### 변환 전 — `org_js/api/departmentApi.js`

```js
// 에러 발생 시 handleApiError()로 DOM에 직접 메시지 표시
async getAll() {
    try {
        const response = await fetch(this.#baseUrl);
        await checkResponse(response);
        return response.json();
    } catch (error) {
        handleApiError(error);  // DOM 조작!
        return [];
    }
}
```

### 변환 후 — `src/api/departmentApi.js`

```js
// 에러를 throw만 하고, UI 처리는 컴포넌트가 담당
async getAll() {
    const response = await fetch(this.#baseUrl);
    await checkResponse(response);
    return response.json();
    // 에러 처리 없음 → 호출한 컴포넌트의 catch에서 showToast() 호출
}
```

| 항목 | ECMAScript | React |
|------|-----------|-------|
| 에러 처리 | API 클래스가 DOM에 직접 표시 | `throw`만 하고 컴포넌트가 처리 |
| 이유 | DOM 직접 접근 가능 | React에서 DOM 직접 접근 금지 |
| 결과 | API와 UI가 강하게 결합 | API는 순수 통신만, UI는 컴포넌트가 담당 |

---

## 7. 폼 입력 처리 변환

### 변환 전 — DOM에서 직접 읽기/쓰기

```js
// 읽기: DOM에서 직접 값을 꺼냄
const departmentName = document.getElementById('dept-name').value.trim();

// 쓰기 (수정 모드): DOM에 직접 값을 설정
document.getElementById('dept-name').value = dept.departmentName;

// 초기화
document.getElementById('dept-form').reset();
```

### 변환 후 — Controlled Input (제어 컴포넌트)

```jsx
// 상태 선언
const [name, setName] = useState('');

// 읽기: state에서 읽음
// 쓰기: state를 변경하면 input이 자동으로 업데이트됨
<input
    value={name}
    onChange={e => setName(e.target.value)}
/>

// 수정 모드: useEffect로 state에 값을 설정 → input 자동 반영
useEffect(() => {
    if (editingDept) setName(editingDept.departmentName ?? '');
    else setName('');
}, [editingDept]);
```

---

## 8. 초기 데이터 로드 변환

### 변환 전 — `DOMContentLoaded` 이벤트

```js
// 페이지 DOM이 준비되면 실행
document.addEventListener('DOMContentLoaded', () => {
    deptForm.addEventListener('submit', handleFormSubmit);
    // ...
    loadAndRenderDepartments(); // 첫 데이터 로드
});
```

### 변환 후 — `useEffect`

```jsx
// 컴포넌트가 처음 화면에 나타날 때 딱 한 번 실행
useEffect(() => {
    loadDepartments();
}, []); // 빈 배열 = 마운트 시에만 실행 (DOMContentLoaded와 동일한 역할)
```

| 항목 | ECMAScript | React |
|------|-----------|-------|
| 초기 실행 시점 | `DOMContentLoaded` 이벤트 | `useEffect(() => {}, [])` |
| 이벤트 등록 | `addEventListener` | `onClick`, `onSubmit` props |
| 이벤트 해제 | 직접 관리 필요 | React가 자동 관리 |

---

## 9. 컴포넌트 계층 구조와 Props 흐름

```
App
 ├── Toast           ← { message, type, visible }
 ├── DeptSection     ← { showToast }
 │    ├── DeptForm   ← { editingDept, onSubmit, onCancel }
 │    ├── DeptSearch ← { departments, showToast }
 │    └── DeptList   ← { departments, loading, onEdit, onDelete, onRefresh }
 └── EmpSection      ← { showToast }
      ├── EmpForm    ← { editingEmp, departments, onSubmit, onCancel }
      ├── EmpSearch  ← { showToast }
      └── EmpList    ← { employees, loading, withDept, onEdit, onDelete, onRefresh, onRefreshWithDept }
```

**Props 흐름 원칙**:
- 데이터는 부모 → 자식 방향으로만 흐름 (단방향)
- 자식이 부모의 상태를 바꾸려면 부모가 만든 **함수(콜백)**를 props로 받아서 호출

---

## 10. React 핵심 개념 요약

| 개념 | 역할 | ECMAScript 대응 |
|------|------|----------------|
| `useState` | 변하는 데이터 관리 | 전역 변수, DOM 속성 |
| `useEffect(fn, [])` | 마운트 시 한 번 실행 | `DOMContentLoaded` |
| `useEffect(fn, [dep])` | 의존값 변경 시 실행 | 별도 함수 수동 호출 |
| JSX | HTML 구조 표현 | `innerHTML`, `createElement` |
| props | 부모 → 자식 데이터 전달 | 함수 인자, 전역 변수 |
| 조건부 렌더링 `{cond && <Comp/>}` | 요소 보이기/숨기기 | `style.display`, `classList` |
| `key` prop | 목록 항목 고유 식별 | `data-id` 속성 |
| Controlled Input | 폼 값을 state로 관리 | `input.value` 직접 접근 |
| React Fragment `<>...</>` | 불필요한 div 없이 묶기 | 없음 (div로 감쌌음) |

---

## 11. 변환 전후 코드량 비교

| 파일 (ECMAScript) | 역할 | 변환 후 파일 |
|-------------------|------|-------------|
| `dept_runner_v2.js` (~325줄) | 부서 UI 전체 | `DeptSection` + `DeptForm` + `DeptSearch` + `DeptList` |
| `emp_runner_v2.js` (~400줄) | 직원 UI 전체 | `EmpSection` + `EmpForm` + `EmpSearch` + `EmpList` |
| `utils.js` (showMessage) | 알림 표시 | `Toast.jsx` + `App.jsx`의 `showToast` |
| `index.html` (탭 HTML) | 탭 UI 구조 | `App.jsx` |

> 파일 수는 늘어났지만, 각 파일의 역할이 명확해지고 코드를 이해하기 쉬워짐

---

## 12. 변환 시 주의했던 포인트

### 1. API 에러 처리 분리
ECMAScript 버전의 API 클래스는 에러 발생 시 `handleApiError()`를 호출해 DOM을 직접 수정했습니다.
React 버전에서는 **API 클래스는 `throw`만** 하고, 컴포넌트의 `catch` 블록에서 `showToast()`를 호출하도록 변경했습니다.

### 2. 수정 모드에서 부서 ID 처리 (EmpForm)
직원 API의 응답 형태가 호출 방식에 따라 달라집니다:
- 일반 목록 조회: `{ departmentId: 2 }`
- 직원+부서 통합 조회: `{ departmentDto: { id: 2 } }`

두 경우를 모두 처리하기 위해 `??` 연산자를 활용했습니다:
```js
const deptId = editingEmp.departmentId ?? editingEmp.departmentDto?.id;
setDepartmentId(String(deptId ?? ''));
```

### 3. XSS 보안
ECMAScript 버전은 `innerHTML`에 삽입할 때 `escapeHTML()`을 수동으로 호출했습니다.
React의 JSX는 `{변수}` 출력 시 **자동으로 이스케이프** 처리하므로 별도 함수가 필요 없습니다.

### 4. select의 value 타입 일치
`<select value={departmentId}>`와 `<option value={d.id}>`를 비교할 때, 숫자 `2`와 문자열 `"2"`는 일치하지 않습니다.
`String(d.id)`와 `String(deptId)`로 타입을 통일해야 수정 모드에서 select가 올바른 옵션을 자동 선택합니다.
