# React 페이징(Paging) 기능 구현 정리

> **프로젝트**: Employee & Department Manager
> **서버 API 문서**: `docs/SpringBoot_Paging.md` 참고

---

## 1. 개요

**페이징(Paging)** 이란 전체 데이터를 한 번에 가져오는 대신, 한 화면에 보여줄 만큼만 나눠서 가져오는 기법입니다.

| 방식 | API 호출 | 데이터 양 |
|------|----------|-----------|
| 기존 (페이징 없음) | `GET /api/employees` | 전체 직원 목록 (N개) |
| 변경 (페이징 적용) | `GET /api/employees/page?pageNo=0&pageSize=5` | 5개씩 나눠서 |

### 구현 범위

- 직원 목록 (`EmpSection` / `EmpList`) — 페이지당 5개, 부서명 클라이언트 조인
- 부서 목록 (`DeptSection` / `DeptList`) — 페이지당 5개
- 공통 페이지 버튼 컴포넌트 (`Pagination.jsx`) 신규 생성

---

## 2. 추가/수정된 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/common/Pagination.jsx` | **신규 생성** — 이전/번호/다음 버튼 공통 컴포넌트 |
| `src/api/employeeApi.js` | `getPage()` 메서드 추가 |
| `src/api/departmentApi.js` | `getPage()` 메서드 추가 |
| `src/components/employee/EmpSection.jsx` | 페이징 상태 추가, `withDept` 제거, `departments`를 EmpList에 전달 |
| `src/components/employee/EmpList.jsx` | 클라이언트 조인으로 부서명 표시, `withDept` 제거, `<Pagination>` 추가 |
| `src/components/department/DeptSection.jsx` | 페이징 상태 추가, `allDepartments`/`pagedDepts` 분리 |
| `src/components/department/DeptList.jsx` | `<Pagination>` 렌더링 추가 |

---

## 3. 핵심 React 개념: useEffect 의존성 배열

페이징의 핵심은 "페이지 번호가 바뀌면 자동으로 API를 다시 호출하는 것"입니다.
React에서는 `useEffect`의 **의존성 배열(dependency array)** 로 이를 구현합니다.

```jsx
useEffect(() => {
    loadEmployeesPage(currentPage);
}, [currentPage, sortBy, sortDir]);
//  ↑ 이 배열 안의 값이 바뀔 때마다 {} 안의 코드가 실행됩니다.
```

### 의존성 배열 동작 비교

| 의존성 배열 | 실행 시점 |
|------------|-----------|
| `[]` (빈 배열) | 컴포넌트가 처음 화면에 나타날 때 1번만 |
| `[currentPage]` | 처음 + `currentPage`가 바뀔 때마다 |
| `[currentPage, sortBy, sortDir]` | 처음 + 세 값 중 하나라도 바뀔 때마다 |

### 페이징에서의 흐름

```
버튼 클릭
  │
  ▼
setCurrentPage(2)        ← 상태 변경
  │
  ▼
React가 변경 감지
  │
  ▼
useEffect 재실행         ← 의존성 [currentPage, ...]가 바뀌었으니
  │
  ▼
loadEmployeesPage(2)     ← API 호출
  │
  ▼
setEmployees(data.content)  ← 상태 업데이트
  │
  ▼
화면 자동 갱신           ← React가 다시 렌더링
```

---

## 4. API 레이어 — getPage() 메서드

### employeeApi.js / departmentApi.js 공통 패턴

```js
// GET /api/employees/page?pageNo=0&pageSize=5&sortBy=id&sortDir=asc
async getPage({ pageNo = 0, pageSize = 5, sortBy = 'id', sortDir = 'asc' } = {}) {
    const params = new URLSearchParams({ pageNo, pageSize, sortBy, sortDir });
    const response = await fetch(`${this.#baseUrl}/page?${params}`);
    await checkResponse(response);
    return response.json();
}
```

### URLSearchParams 란?

쿼리 파라미터(`?key=value&key=value`)를 직접 문자열로 만들지 않아도 되는 브라우저 내장 API입니다.

```js
// 직접 쓰면 → 실수하기 쉽습니다
`/page?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`

// URLSearchParams 사용 → 깔끔합니다
const params = new URLSearchParams({ pageNo, pageSize, sortBy, sortDir });
`/page?${params}`
```

### 서버 응답 구조 (PageResponse)

```json
{
  "content":       [...],   ← 현재 페이지 데이터 배열 (React에서 테이블에 표시)
  "pageNo":        0,       ← 현재 페이지 번호 (0부터 시작)
  "pageSize":      5,       ← 페이지당 데이터 수
  "totalElements": 23,      ← 전체 데이터 수
  "totalPages":    5,       ← 전체 페이지 수 (React에서 버튼 개수 계산에 사용)
  "last":          false    ← 마지막 페이지 여부
}
```

> React에서 실제로 사용하는 필드: `content`, `totalPages`

---

## 5. Pagination.jsx — 공통 페이지 버튼 컴포넌트

```
src/components/common/Pagination.jsx
```

### props

| prop | 타입 | 설명 |
|------|------|------|
| `currentPage` | number | 현재 페이지 번호 (0부터, 서버 기준) |
| `totalPages` | number | 전체 페이지 수 |
| `onPageChange` | function | 페이지 버튼 클릭 시 호출 — `(pageNo) => void` |

### 핵심 코드 해설

```jsx
// totalPages가 1 이하면 버튼을 표시하지 않습니다.
if (totalPages <= 1) return null;

// [...Array(totalPages)].map((_, index) => ...)
// → 길이가 totalPages인 배열을 만들고 index(0, 1, 2...)로 순회합니다.
// → 서버의 pageNo(0부터)와 index가 일치합니다.
// → UI에는 index + 1 로 표시 (사람은 1페이지부터 읽으므로)
{[...Array(totalPages)].map((_, index) => (
    <button
        key={index}
        onClick={() => onPageChange(index)}
        className={currentPage === index ? '활성 스타일' : '기본 스타일'}
    >
        {index + 1}
    </button>
))}
```

### 이전 / 다음 버튼 비활성화 조건

```jsx
// 이전 버튼: 첫 페이지(0)이면 더 이상 이전이 없습니다.
disabled={currentPage === 0}

// 다음 버튼: 마지막 페이지이면 더 이상 다음이 없습니다.
disabled={currentPage === totalPages - 1}
```

---

## 6. EmpSection.jsx — 직원 페이징 상태 및 로직

### 상태 목록

```jsx
// 기존 상태 (변경 없음)
const [employees,   setEmployees]   = useState([]);
const [departments, setDepartments] = useState([]); // EmpForm + EmpList 부서명 조인 두 곳에 사용
const [loading,     setLoading]     = useState(false);
const [editingEmp,  setEditingEmp]  = useState(null);

// 페이징 상태 (신규)
const [currentPage, setCurrentPage] = useState(0);
const [totalPages,  setTotalPages]  = useState(1);
const [sortBy,      setSortBy]      = useState('id');
const [sortDir,     setSortDir]     = useState('asc');
```

> `withDept` 상태는 **제거**되었습니다.
> "직원+부서 조회" 버튼 없이도 클라이언트 조인으로 항상 부서명을 표시합니다.

### useEffect 두 개의 역할

```jsx
// [1] 마운트 시 딱 1번: 부서 전체 목록 로드
//     → EmpForm select 드롭다운 + EmpList 부서명 조인 두 곳에서 사용
useEffect(() => {
    loadDepartments();
}, []);

// [2] 페이지·정렬이 바뀔 때마다: 직원 목록 재조회
useEffect(() => {
    loadEmployeesPage(currentPage);
}, [currentPage, sortBy, sortDir]);
```

### loadEmployeesPage 함수

```jsx
const loadEmployeesPage = async (pageNo = 0) => {
    setLoading(true);
    try {
        const data = await employeeApi.getPage({ pageNo, pageSize: 5, sortBy, sortDir });
        setEmployees(data.content);     // ← 테이블에 표시할 데이터 (departmentDto는 null)
        setTotalPages(data.totalPages); // ← 페이지 버튼 개수
    } catch (err) {
        showToast(err.message || '직원 목록 로드 실패', true);
    } finally {
        setLoading(false);
    }
};
```

### CRUD 후 페이지 처리

```jsx
// 생성/수정 후 → 1페이지(0)로 이동
// 이미 0페이지이면 setCurrentPage(0)은 값이 안 바뀌므로 useEffect가 실행되지 않습니다.
// 그래서 직접 호출합니다.
if (currentPage === 0) {
    await loadEmployeesPage(0);   // 직접 호출
} else {
    setCurrentPage(0);            // useEffect가 자동으로 loadEmployeesPage 호출
}

// 삭제 후 → 현재 페이지 새로고침 (페이지 이동 없이)
await loadEmployeesPage(currentPage);
```

---

## 7. EmpList.jsx — 클라이언트 조인으로 부서명 표시

### 변경 전 vs 변경 후

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 부서명 표시 방법 | "직원+부서 조회" 버튼 → 별도 API 호출 | `departments` 배열에서 직접 찾기 |
| `withDept` 상태 | 있음 (true/false 분기 처리) | **제거** |
| "직원+부서 조회" 버튼 | 있음 | **제거** |
| 페이지 버튼 표시 | `withDept=false`일 때만 | **항상 표시** |
| 부서 컬럼 헤더 | `withDept`에 따라 "부서 ID" / "부서명" 전환 | **항상 "부서명"** |

### 변경된 props 목록

```jsx
// 제거된 props
withDept,          // 더 이상 필요 없음
onRefreshWithDept, // "직원+부서 조회" 버튼 제거로 불필요

// 추가된 props
departments,   // 전체 부서 목록 — 부서명 클라이언트 조인에 사용
currentPage,   // 현재 페이지 (Pagination에 전달)
totalPages,    // 전체 페이지 수 (Pagination에 전달)
onPageChange,  // 페이지 클릭 핸들러 (Pagination에 전달)
```

### 핵심 코드 — 클라이언트 조인

```jsx
employees.map(emp => {
    const deptName = departments
        .find(d => d.id === emp.departmentId)
        ?.departmentName
        ?? 'N/A';

    return <tr key={emp.id}>...<td>{deptName}</td>...</tr>;
})
```

이 3줄 코드에서 자바스크립트 연산자 3개가 사용됩니다.
자세한 설명은 아래 **섹션 8**을 참고하세요.

---

## 8. 핵심 코드 해설 — find() / ?. / ??

### 문제 상황

`GET /api/employees/page` 응답의 직원 데이터는 아래처럼 생겼습니다.

```json
{ "id": 5, "firstName": "Alice", "departmentId": 2, "departmentDto": null }
```

`departmentDto`가 `null`이므로 부서명을 직접 알 수 없습니다.
하지만 `departmentId: 2`는 있습니다.

이미 로드된 `departments` 배열에서 `id === 2`인 부서를 찾으면 부서명을 알 수 있습니다.

```js
departments = [
    { id: 1, departmentName: '인사팀', ... },
    { id: 2, departmentName: '개발팀', ... },  // ← 이걸 찾으면 됩니다
    { id: 3, departmentName: '영업팀', ... },
]
```

---

### ① Array.find() — 조건에 맞는 첫 번째 요소 찾기

```js
departments.find(d => d.id === emp.departmentId)
```

`find()`는 배열을 앞에서부터 하나씩 확인하면서, 조건(`d.id === emp.departmentId`)이
**처음으로 `true`가 되는 요소**를 반환합니다.

```js
// emp.departmentId = 2 라면
departments.find(d => d.id === 2)
// → { id: 2, departmentName: '개발팀', departmentDescription: '...' }

// emp.departmentId = 99 라면 (없는 ID)
departments.find(d => d.id === 99)
// → undefined   ← 조건에 맞는 요소가 없으면 undefined 반환
```

---

### ② ?. (옵셔널 체이닝, Optional Chaining) — 안전하게 속성 접근

```js
departments.find(d => d.id === emp.departmentId)?.departmentName
```

`find()`가 `undefined`를 반환했을 때 `.departmentName`을 그냥 쓰면 에러가 납니다.

```js
// ❌ 위험한 코드 — undefined.departmentName → TypeError!
departments.find(d => d.id === 99).departmentName

// ✅ 안전한 코드 — undefined?.departmentName → 에러 없이 undefined 반환
departments.find(d => d.id === 99)?.departmentName
```

`?.`의 동작 원리는 아래 표로 정리할 수 있습니다.

| `find()` 결과 | `?.departmentName` 결과 |
|--------------|------------------------|
| `{ departmentName: '개발팀', ... }` (찾음) | `'개발팀'` |
| `undefined` (못 찾음) | `undefined` (에러 없음) |

> 한 마디로: `?.`는 **"앞이 null/undefined이면 멈추고 undefined를 반환해"** 라는 뜻입니다.

---

### ③ ?? (널 병합 연산자, Nullish Coalescing) — 기본값 설정

```js
departments.find(d => d.id === emp.departmentId)?.departmentName ?? 'N/A'
```

`??`는 왼쪽 값이 `null` 또는 `undefined`일 때만 오른쪽 기본값을 사용합니다.

```js
'개발팀'   ?? 'N/A'  // → '개발팀'   (값이 있으므로 그대로 사용)
undefined  ?? 'N/A'  // → 'N/A'     (undefined이므로 기본값 사용)
null       ?? 'N/A'  // → 'N/A'     (null이므로 기본값 사용)
```

> `||`(OR 연산자)와 비슷하지만 다릅니다.
> `||`는 `0`, `''`(빈 문자열), `false`도 falsy로 취급해서 기본값으로 넘어갑니다.
> `??`는 오직 `null`과 `undefined`일 때만 기본값으로 넘어갑니다.

---

### 세 연산자 합쳐서 한 번에 읽기

```js
const deptName = departments
    .find(d => d.id === emp.departmentId)  // ① id가 같은 부서를 찾는다
    ?.departmentName                        // ② 찾았으면 부서명을, 못 찾았으면 undefined를
    ?? 'N/A';                              // ③ undefined이면 'N/A'를 최종값으로
```

```
departments에서 id=2인 부서를 찾는다
  │
  ├─ 찾았다  → { departmentName: '개발팀' }?.departmentName → '개발팀' ?? 'N/A' → '개발팀'
  │
  └─ 못 찾았다 → undefined?.departmentName → undefined ?? 'N/A' → 'N/A'
```

---

## 9. DeptSection.jsx — 부서 페이징 특이사항

### allDepartments vs pagedDepts 분리

부서 섹션에는 **드롭다운(DeptSearch)** 과 **테이블(DeptList)** 이 함께 있습니다.

| 상태 | API | 사용처 |
|------|-----|--------|
| `allDepartments` | `getAll()` → 전체 목록 | DeptSearch의 select 드롭다운 |
| `pagedDepts` | `getPage()` → 현재 페이지 | DeptList의 테이블 |

```jsx
// 왜 두 개로 나눌까요?
// pagedDepts만 쓰면 현재 페이지에 있는 5개 부서만 드롭다운에 나타납니다.
// DeptSearch select에는 전체 부서가 모두 나와야 합니다.

const [allDepartments, setAllDepartments] = useState([]); // 드롭다운용
const [pagedDepts,     setPagedDepts]     = useState([]); // 테이블용
```

```jsx
// DeptSearch → allDepartments (전체 목록)
<DeptSearch departments={allDepartments} showToast={showToast} />

// DeptList → pagedDepts (현재 페이지만)
<DeptList departments={pagedDepts} ... />
```

---

## 10. 전체 데이터 흐름

```
[사용자: 페이지 2 버튼 클릭]
  │
  ▼
Pagination.jsx
  onPageChange(1)  ← index=1 (서버 기준 2페이지)
  │
  ▼
EmpSection.jsx
  handlePageChange(1) → setCurrentPage(1)
  │
  ▼
useEffect([currentPage, sortBy, sortDir]) 재실행
  │
  ▼
loadEmployeesPage(1)
  → employeeApi.getPage({ pageNo: 1, pageSize: 5, ... })
  → GET /api/employees/page?pageNo=1&pageSize=5&sortBy=id&sortDir=asc
  │
  ▼
서버 응답 { content: [...5개, departmentDto: null], totalPages: 5 }
  │
  ├─ setEmployees(data.content)     → EmpList에 직원 5명 전달
  └─ setTotalPages(data.totalPages) → Pagination 버튼 유지
  │
  ▼
EmpList.jsx — 각 행 렌더링 시 클라이언트 조인 실행
  departments.find(d => d.id === emp.departmentId)?.departmentName ?? 'N/A'
  → 이미 로드된 departments 배열에서 부서명 찾기 (추가 API 호출 없음)
  │
  ▼
[화면: 2페이지 직원 5명 + 부서명 표시, 2번 버튼 강조]
```

---

## 11. 컴포넌트 props 전달 구조

```
App.jsx
  └─ EmpSection.jsx  (상태 보관: employees, departments, currentPage, totalPages)
       ├─ EmpForm.jsx       ← departments (select 드롭다운용)
       ├─ EmpSearch.jsx
       └─ EmpList.jsx       ← employees, departments, currentPage, totalPages, onPageChange
            └─ Pagination.jsx  ← currentPage, totalPages, onPageChange

App.jsx
  └─ DeptSection.jsx  (상태 보관: allDepartments, pagedDepts, currentPage, totalPages)
       ├─ DeptForm.jsx
       ├─ DeptSearch.jsx  ← allDepartments (전체 목록)
       └─ DeptList.jsx    ← pagedDepts (현재 페이지), currentPage, totalPages, onPageChange
            └─ Pagination.jsx
```

> **규칙**: 상태(state)는 항상 `Section` 컴포넌트에 있고, `List` 컴포넌트는 받은 props를 표시하기만 합니다.

---

## 12. 주의사항

| 항목 | 설명 |
|------|------|
| **pageNo는 0부터** | 서버와 React 모두 0부터 시작. UI에는 `index + 1`로 표시 |
| **useEffect 무한루프 주의** | `useEffect` 안에서 의존성 배열에 있는 상태를 바꾸면 무한 루프가 됩니다 |
| **이미 0페이지일 때 새로고침** | `setCurrentPage(0)`은 값이 안 바뀌므로 useEffect가 실행되지 않습니다. 이 경우 `loadEmployeesPage(0)` 직접 호출이 필요합니다 |
| **DeptSearch 드롭다운** | 페이징하면 드롭다운 옵션도 5개만 나옵니다. `allDepartments`(전체 목록)를 별도로 관리해야 합니다 |
| **클라이언트 조인 전제** | `departments`가 로드되기 전에 직원 목록이 먼저 표시되면 부서명이 'N/A'로 잠시 보일 수 있습니다. 두 `useEffect`가 거의 동시에 실행되므로 실제로는 거의 문제가 되지 않습니다 |

---

## 13. 학습 포인트 요약

```
1. useState      → 페이지 번호·전체 페이지 수를 상태로 관리
2. useEffect     → 상태가 바뀌면 자동으로 API 재호출 (의존성 배열 핵심)
3. props         → Section이 가진 상태를 List → Pagination으로 내려줌
4. Array.find()  → 배열에서 조건에 맞는 요소 찾기 (클라이언트 조인)
5. ?.            → null/undefined일 때 에러 없이 안전하게 속성 접근
6. ??            → null/undefined일 때 기본값으로 대체
```

```
상태 변경(setState) → useEffect 재실행 → API 호출 → setState → 화면 갱신
     ↑_______________________________________________|
                    (React의 자동 반응 사이클)
```
