# React + Zustand 상태관리 적용 정리

> **프로젝트**: Employee & Department Manager
> **대상**: React 초보자
> **Zustand 기초 문서**: `docs/Zustand_Tutorial.md` 참고

---

## 1. 왜 Zustand를 도입했나

### 기존 문제 — Props Drilling

페이징 기능을 추가하면서 컴포넌트 간에 전달해야 할 props가 크게 늘었습니다.

```
EmpSection (상태 보관)
  └─ EmpList (9개 props 수신)
       employees, departments, loading,
       currentPage, totalPages, onPageChange,
       onEdit, onDelete, onRefresh
       └─ Pagination (3개 props 수신)
            currentPage, totalPages, onPageChange
```

- `EmpList`는 `currentPage`를 직접 쓰지 않는데도 `Pagination`에 넘기기 위해 받아야 했습니다.
- 새 기능이 추가될수록 props 목록이 계속 늘어납니다.
- 어떤 컴포넌트가 어떤 데이터를 쓰는지 한눈에 파악하기 어렵습니다.

### 해결 — Zustand Store

```
employeeStore (상태 보관)
  ↓ useEmployeeStore()로 직접 구독
EmpSection   →  showToast만 전달  →  EmpList
                                      ↓ useEmployeeStore()로 직접 구독
                                    Pagination ← setCurrentPage 직접 전달
```

각 컴포넌트가 필요한 상태를 스토어에서 직접 꺼내 쓰므로 props 전달이 필요 없습니다.

---

## 2. 추가/수정된 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/store/employeeStore.js` | **신규 생성** — 직원 상태 + API 액션 |
| `src/store/departmentStore.js` | **신규 생성** — 부서 상태 + API 액션 |
| `src/components/employee/EmpSection.jsx` | useEmployeeStore 사용, 얇은 컴포넌트로 변경 |
| `src/components/employee/EmpList.jsx` | useEmployeeStore 직접 구독, props 9개 → 1개 |
| `src/components/department/DeptSection.jsx` | useDepartmentStore 사용 |
| `src/components/department/DeptList.jsx` | useDepartmentStore 직접 구독, props 8개 → 1개 |

---

## 3. 스토어 구조

### employeeStore.js

```js
export const useEmployeeStore = create((set, get) => ({

    // ── 상태 ──────────────────────────────────────────
    employees:   [],   // 현재 페이지 직원 목록
    departments: [],   // 전체 부서 목록 (폼 select + 부서명 조인용)
    loading:     false,
    editingEmp:  null, // null=등록모드, 객체=수정모드
    currentPage: 0,
    totalPages:  1,
    sortBy:      'id',
    sortDir:     'asc',

    // ── 단순 액션 ─────────────────────────────────────
    setEditingEmp:  (emp)  => set({ editingEmp: emp }),
    setCurrentPage: (page) => set({ currentPage: page }),

    // ── 비동기 액션 (API 호출) ─────────────────────────
    loadDepartments:   async () => { ... },
    loadEmployeesPage: async (pageNo = 0) => { ... },
    createEmployee:    async (formData) => { ... },
    updateEmployee:    async (id, formData) => { ... },
    deleteEmployee:    async (id) => { ... },
}));
```

### departmentStore.js

```js
export const useDepartmentStore = create((set, get) => ({

    // ── 상태 ──────────────────────────────────────────
    allDepartments: [], // DeptSearch 드롭다운용 (전체)
    pagedDepts:     [], // DeptList 테이블용 (현재 페이지)
    loading:        false,
    editingDept:    null,
    currentPage:    0,
    totalPages:     1,
    sortBy:         'id',
    sortDir:        'asc',

    // ── 단순 액션 ─────────────────────────────────────
    setEditingDept: (dept) => set({ editingDept: dept }),
    setCurrentPage: (page) => set({ currentPage: page }),

    // ── 비동기 액션 ───────────────────────────────────
    loadAllDepartments:  async () => { ... },
    loadDepartmentsPage: async (pageNo = 0) => { ... },
    createDepartment:    async (formData) => { ... },
    updateDepartment:    async (id, formData) => { ... },
    deleteDepartment:    async (id) => { ... },
}));
```

> 두 스토어는 완전히 독립적입니다. `employeeStore`가 변해도 `departmentStore`는 영향받지 않습니다.

---

## 4. 컴포넌트별 변경 내용

### EmpSection.jsx — 역할이 줄어든 얇은 컴포넌트

```jsx
// 기존: useState 8개 + API 함수들을 모두 직접 선언
const [employees,   setEmployees]   = useState([]);
const [departments, setDepartments] = useState([]);
const [loading,     setLoading]     = useState(false);
// ... 5개 더

// 변경: 스토어에서 필요한 것만 꺼내서 사용
const {
    departments, editingEmp, currentPage, sortBy, sortDir,
    loadDepartments, loadEmployeesPage,
    createEmployee, updateEmployee,
    setEditingEmp, setCurrentPage,
} = useEmployeeStore();
```

EmpSection의 역할은 **두 가지**만 남았습니다.

1. `useEffect` — 언제 데이터를 로드할지 결정
2. `handleSubmit` — 생성/수정 처리 (에러 시 `showToast` 호출)

```jsx
// useEffect: 페이지/정렬 변경 시 자동 재조회
useEffect(() => {
    loadEmployeesPage(currentPage).catch(err => showToast(err.message, true));
}, [currentPage, sortBy, sortDir]);

// EmpList에는 showToast 하나만 전달 (나머지는 스토어에서 직접)
return (
    <>
        <EmpForm ... />
        <EmpSearch ... />
        <EmpList showToast={showToast} />
    </>
);
```

---

### EmpList.jsx — props 9개 → 1개

```jsx
// 기존 props: 9개
export default function EmpList({
    employees, departments, loading,
    currentPage, totalPages, onPageChange,
    onEdit, onDelete, onRefresh,
}) { ... }

// 변경 후 props: 1개
export default function EmpList({ showToast }) {
    const {
        employees, departments, loading,
        currentPage, totalPages,
        setCurrentPage, setEditingEmp,
        deleteEmployee, loadEmployeesPage,
    } = useEmployeeStore();
    ...
}
```

Pagination에 `setCurrentPage`를 **직접** 전달합니다.

```jsx
<Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}  // 스토어 액션을 그대로 넘깁니다
/>
```

`setCurrentPage(2)`가 호출되면:
1. 스토어의 `currentPage`가 `2`로 변경
2. `EmpSection`의 `useEffect([currentPage, ...])` 감지
3. `loadEmployeesPage(2)` 자동 호출 → 화면 갱신

---

### DeptSection / DeptList — 동일한 패턴

`EmpSection` / `EmpList`와 완전히 동일한 패턴입니다.
차이점은 부서 스토어에 `allDepartments`(드롭다운용)와 `pagedDepts`(테이블용)가 분리되어 있는 것입니다.

```jsx
// DeptSection: 드롭다운은 전체 목록 전달
<DeptSearch departments={allDepartments} showToast={showToast} />
<DeptList showToast={showToast} />  // 테이블 데이터는 스토어에서 직접

// DeptList: 스토어에서 직접 구독
const { pagedDepts, loading, currentPage, totalPages, ... } = useDepartmentStore();
```

---

## 5. 전체 데이터 흐름

```
[사용자: 페이지 버튼 클릭]
  │
  ▼
Pagination.jsx
  onPageChange(1) → setCurrentPage(1)   ← 스토어 액션 직접 호출
  │
  ▼
employeeStore
  currentPage: 1 로 변경
  │
  ▼
EmpSection.jsx (currentPage를 구독 중)
  useEffect([currentPage, sortBy, sortDir]) 재실행
  │
  ▼
employeeStore.loadEmployeesPage(1)
  → GET /api/employees/page?pageNo=1&pageSize=5
  → set({ employees: data.content, totalPages: data.totalPages })
  │
  ▼
EmpList.jsx (employees, totalPages를 구독 중)
  자동 리렌더링 → 새 직원 목록 표시
```

---

## 6. props 전달 구조 비교

### 변경 전

```
App.jsx
  └─ EmpSection.jsx  (useState 8개)
       └─ EmpList.jsx  ← 9개 props
            └─ Pagination.jsx  ← 3개 props
```

### 변경 후

```
App.jsx
  └─ EmpSection.jsx  (useEmployeeStore)
       └─ EmpList.jsx  ← showToast 1개
            └─ Pagination.jsx  ← setCurrentPage (스토어 액션)

employeeStore ──────────────────┐
  employees, departments,       │ 직접 구독
  loading, currentPage, ...  ───┤
                                ├── EmpSection
                                ├── EmpList
                                └── (Pagination은 setCurrentPage만 사용)
```

---

## 7. 주의사항

| 항목 | 설명 |
|------|------|
| **스토어는 전역** | `useEmployeeStore()`를 어디서 호출해도 같은 스토어를 바라봅니다. 탭을 전환해도 상태가 유지됩니다 |
| **Provider 불필요** | Redux와 달리 `<Provider>`로 앱을 감쌀 필요가 없습니다 |
| **비동기 에러 처리** | 스토어 액션은 에러를 throw합니다. 컴포넌트에서 `.catch()`로 잡아 `showToast`를 호출합니다 |
| **get() 사용 시점** | 비동기 액션 내부에서 다른 상태를 읽을 때 사용합니다. `const { sortBy } = get();` |
| **set() 병합 방식** | `set({ loading: true })`는 전체 상태를 교체하지 않고 `loading`만 바꿉니다. 나머지 상태는 유지됩니다 |

---

## 8. 학습 포인트 요약

```
1. create((set, get) => ({ 상태, 액션 }))  → 스토어 정의
2. useEmployeeStore()                       → 컴포넌트에서 구독
3. set({ key: value })                      → 상태 변경
4. get().key                                → 액션 내부에서 상태 읽기
5. props 전달 최소화                         → 각 컴포넌트가 필요한 것만 스토어에서 직접
```
