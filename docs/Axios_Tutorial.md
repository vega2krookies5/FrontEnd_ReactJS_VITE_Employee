# Axios 가이드 — fetch에서 axios로

> **프로젝트**: Employee & Department Manager
> **대상**: React 초보자, fetch API를 사용해본 분

---

## 1. axios란

axios는 브라우저와 Node.js에서 HTTP 요청을 보내는 라이브러리입니다.
브라우저 내장 `fetch`보다 더 적은 코드로 같은 기능을 구현할 수 있습니다.

```bash
npm install axios
```

---

## 2. fetch vs axios 핵심 비교

같은 GET 요청을 두 가지 방식으로 작성해 보겠습니다.

### fetch 방식

```js
// 1. 요청
const response = await fetch('http://localhost:8080/api/employees');

// 2. 에러 확인 (fetch는 4xx/5xx도 성공으로 처리하므로 수동 확인 필요)
if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? `HTTP 오류: ${response.status}`);
}

// 3. JSON 파싱 (별도 호출 필요)
const data = await response.json();
```

### axios 방식

```js
// 한 줄로 끝납니다.
const { data } = await axios.get('http://localhost:8080/api/employees');
// 4xx/5xx → 자동으로 에러 throw
// JSON 파싱 → 자동으로 response.data에 담김
```

---

## 3. fetch vs axios 기능 비교표

| 항목 | fetch | axios |
|------|-------|-------|
| 설치 | 불필요 (브라우저 내장) | `npm install axios` |
| 4xx/5xx 에러 throw | 직접 확인 필요 (`response.ok`) | **자동** |
| JSON 파싱 | `.json()` 별도 호출 | **자동** (`response.data`) |
| JSON 직렬화 (POST body) | `JSON.stringify()` 직접 호출 | **자동** |
| Content-Type 헤더 | 매 요청마다 직접 설정 | 인스턴스에서 한 번만 |
| 쿼리 파라미터 | `URLSearchParams` 직접 생성 | `params` 옵션으로 간결하게 |
| 요청/응답 가로채기 | 없음 | **인터셉터** 지원 |
| 요청 취소 | AbortController (복잡) | 간단하게 지원 |

---

## 4. 기본 사용법

### GET

```js
import axios from 'axios';

// 기본 GET
const { data } = await axios.get('http://localhost:8080/api/employees');

// 쿼리 파라미터 포함 GET
// → http://localhost:8080/api/employees/page?pageNo=0&pageSize=5
const { data } = await axios.get('http://localhost:8080/api/employees/page', {
    params: { pageNo: 0, pageSize: 5, sortBy: 'id', sortDir: 'asc' },
});
```

### POST

```js
// fetch: JSON.stringify + headers 직접 설정
const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: 'Alice', lastName: 'Kim' }),
});

// axios: 객체를 그대로 전달 (자동 직렬화)
const { data } = await axios.post(url, { firstName: 'Alice', lastName: 'Kim' });
```

### PUT

```js
const { data } = await axios.put(`${url}/${id}`, { firstName: 'Bob' });
```

### DELETE

```js
await axios.delete(`${url}/${id}`);
```

---

## 5. 응답 구조 — response.data

axios의 응답 객체는 아래 구조를 가집니다.

```js
const response = await axios.get('/api/employees');

response.data    // 서버가 보낸 실제 데이터 (JSON 파싱 완료)
response.status  // HTTP 상태 코드 (200, 201 ...)
response.headers // 응답 헤더
```

보통은 구조분해 할당으로 `data`만 꺼내서 사용합니다.

```js
const { data } = await axios.get('/api/employees');
// data = [{ id: 1, firstName: 'Alice', ... }, ...]
```

---

## 6. 에러 처리

axios는 4xx/5xx 응답에서 자동으로 에러를 throw합니다.
에러 객체에서 다음 정보를 꺼낼 수 있습니다.

```js
try {
    const { data } = await axios.get('/api/employees/999');
} catch (err) {
    err.message           // 에러 메시지 (기본: "Request failed with status code 404")
    err.response.status   // HTTP 상태 코드: 404
    err.response.data     // 서버가 보낸 에러 응답 본문: { message: "직원을 찾을 수 없습니다" }
}
```

### 특정 상태 코드만 따로 처리하기

```js
async getById(id) {
    try {
        const { data } = await axios.get(`/api/employees/${id}`);
        return data;
    } catch (err) {
        if (err.response?.status === 404) return null; // 404이면 null 반환
        throw err;                                      // 나머지 에러는 그대로 throw
    }
}
```

---

## 7. axios 인스턴스 — 공통 설정 분리

매 요청마다 baseURL이나 헤더를 반복하지 않도록 `axios.create()`로 인스턴스를 만듭니다.

```js
// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',           // 모든 요청에 자동으로 붙는 기본 URL
    headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
```

```js
// 사용 시: baseURL이 자동으로 붙습니다.
import axios from './axiosInstance.js';

// http://localhost:8080/api/employees 로 요청됩니다.
const { data } = await axios.get('/api/employees');
```

---

## 8. Promise — 비동기 처리의 기초

### 8-1. Promise란 무엇인가요?

`Promise`는 **"미래에 완료될 작업의 결과를 담는 객체"** 입니다.

서버에 데이터를 요청하면 결과가 즉시 오지 않습니다. 그 사이에 다른 코드를 실행할 수 있고, 결과가 오면 그 때 처리합니다. Promise는 이런 비동기 작업을 다루는 방법입니다.

**실생활 비유 — 식당 진동벨:**

```
손님이 주문 → 진동벨 받음 (Promise 객체)
                → 음식 준비 중 (pending 상태)
                → 음식 완성 → 벨 울림 (fulfilled)
                → 재료 소진 → 벨 울림 (rejected)
```

주문 후 자리에서 다른 일을 할 수 있습니다 — 음식이 나올 때까지 카운터 앞에서 기다리지 않아도 됩니다.

---

### 8-2. Promise의 세 가지 상태

```
Promise
  ┌─────────────────────────────────────────────┐
  │                                             │
  │  pending (대기)                              │
  │  : 작업이 아직 완료되지 않은 초기 상태       │
  │                                             │
  │       ┌──────────────┬──────────────┐       │
  │       ▼              ▼              │       │
  │  fulfilled (이행)  rejected (거부)  │       │
  │  : 작업 성공       : 작업 실패      │       │
  │  : 결과값 반환     : 에러 반환      │       │
  └─────────────────────────────────────────────┘
```

| 상태 | 의미 | 예시 |
|------|------|------|
| `pending` | 아직 완료되지 않음 | 서버 응답을 기다리는 중 |
| `fulfilled` | 성공적으로 완료됨 | 서버가 200 응답과 데이터 반환 |
| `rejected` | 실패로 완료됨 | 네트워크 오류, 서버 400/500 응답 |

상태는 한 번만 변경됩니다 — fulfilled 또는 rejected가 되면 다시 pending으로 돌아갈 수 없습니다.

---

### 8-3. .then() / .catch() / .finally()

Promise의 결과를 처리하는 세 가지 메서드입니다.

```js
fetch('/api/employees')        // Promise 반환
    .then(response => {        // fulfilled(성공)일 때 실행
        return response.json();
    })
    .then(data => {            // 앞의 .then()이 반환한 값으로 실행
        console.log(data);
    })
    .catch(error => {          // rejected(실패)일 때 실행
        console.error(error.message);
    })
    .finally(() => {           // 성공/실패 관계없이 항상 실행
        setLoading(false);
    });
```

| 메서드 | 실행 시점 | 주로 하는 일 |
|--------|----------|-------------|
| `.then(fn)` | fulfilled(성공) 시 | 결과 데이터 처리 |
| `.catch(fn)` | rejected(실패) 시 | 에러 처리, 사용자에게 메시지 표시 |
| `.finally(fn)` | 항상 | 로딩 상태 해제, 정리 작업 |

---

### 8-4. Promise.resolve() / Promise.reject()

이미 값이 있을 때 즉시 이행/거부 상태의 Promise를 만드는 방법입니다.

```js
// Promise.resolve(값) — 즉시 fulfilled 상태의 Promise 반환
Promise.resolve(42)
    .then(value => console.log(value));  // 42 출력

// Promise.reject(에러) — 즉시 rejected 상태의 Promise 반환
Promise.reject(new Error('실패!'))
    .catch(err => console.error(err.message));  // '실패!' 출력
```

**이 프로젝트에서 쓰이는 곳 — axiosInstance.js 인터셉터:**

```js
// 에러 인터셉터에서 에러를 다시 throw할 때
return Promise.reject(error);
// ↑ 이렇게 해야 employeeApi.js의 catch 블록이 실행됩니다.
//   그냥 throw error 해도 동일하게 동작합니다.
```

---

### 8-5. async / await — Promise를 더 읽기 쉽게

`async/await`는 Promise를 동기 코드처럼 읽히게 만드는 문법입니다.

```js
// Promise 체인 방식
function getEmployee(id) {
    return axios.get(`/api/employees/${id}`)
        .then(response => response.data)
        .catch(err => { throw err; });
}

// async/await 방식 — 같은 동작, 더 읽기 쉬움
async function getEmployee(id) {
    const { data } = await axios.get(`/api/employees/${id}`);
    return data;
}
```

`await`는 Promise가 fulfilled 또는 rejected 될 때까지 기다립니다.
rejected(실패)이면 에러를 throw하므로 `try/catch`로 잡습니다.

```js
async function getEmployee(id) {
    try {
        const { data } = await axios.get(`/api/employees/${id}`);
        return data;
    } catch (err) {
        // Promise rejected → 여기서 에러 처리
        if (err.response?.status === 404) return null;
        throw err;
    }
}
```

**이 프로젝트의 모든 API 함수는 async/await 방식을 사용합니다.**

---

### 8-6. Promise 흐름 요약

```
axios.get('/api/employees')
    │
    │  서버 응답 대기 (pending)
    │
    ├─ 응답 성공 (fulfilled) ──────────────────────────────────
    │     .then(response => response.data)
    │          → 데이터 반환
    │
    └─ 응답 실패 (rejected) ──────────────────────────────────
          .catch(err => ...)
               → 에러 처리 (토스트 메시지, null 반환 등)
```

```
async/await 동일 흐름:

const { data } = await axios.get('/api/employees');
//                ↑ fulfilled → data 사용 가능
//                  rejected  → 에러 throw → catch 블록으로 이동
```

---

## 9. 인터셉터 — 요청/응답 가로채기

### 9-1. 인터셉터란 무엇인가요?

"intercept(가로채다)"라는 단어 그대로, 요청이나 응답이 목적지에 **도달하기 전에 중간에서 붙잡아** 추가 작업을 수행하는 기능입니다.

**실생활 비유:**

```
일반 우편:
  나(컴포넌트) → [우체통] → 서버 → [우체통] → 나(컴포넌트)

인터셉터가 있는 경우:
  나(컴포넌트) → [★ 요청 인터셉터: 편지 봉투에 도장 찍기] → 서버
                                                               ↓
  나(컴포넌트) ← [★ 응답 인터셉터: 수신한 편지 내용 검토] ← 서버
```

인터셉터는 **모든** 요청/응답에 자동으로 실행됩니다. 한 번 등록하면 이후 모든 API 호출에 적용되므로, 반복 코드를 없앨 수 있습니다.

---

### 9-2. 요청 인터셉터 vs 응답 인터셉터

```
컴포넌트
    │  axios.get('/api/employees')
    ▼
[★ 요청 인터셉터]   ← 서버로 떠나기 직전 실행
    │  주로 하는 일:
    │  - Authorization 헤더에 토큰 자동 추가
    │  - 로딩 스피너 시작
    ▼
  서버 (Spring Boot)
    │  HTTP 응답 반환
    ▼
[★ 응답 인터셉터]   ← 컴포넌트에 도달하기 직전 실행
    │  주로 하는 일:
    │  - 에러 메시지 변환 (이 프로젝트에서 사용)
    │  - 토큰 만료 시 자동 로그아웃
    │  - 로딩 스피너 종료
    ▼
컴포넌트 (성공: .then / 실패: .catch)
```

---

### 9-3. 인터셉터 등록 문법

```js
axiosInstance.interceptors.response.use(
    성공핸들러,  // 2xx 응답이 왔을 때 실행
    에러핸들러   // 4xx/5xx 응답이 왔을 때 실행
);
```

두 핸들러 모두 **반드시 값을 반환하거나 throw해야 합니다.**

| 핸들러에서 반환하는 값 | 결과 |
|------------------------|------|
| `return response` | 성공으로 처리 → `.then()` 실행 |
| `return Promise.resolve(값)` | 성공으로 처리 → `.then()` 실행 |
| `return Promise.reject(error)` | 에러로 처리 → `.catch()` 실행 |
| `throw error` | 에러로 처리 → `.catch()` 실행 |

---

### 9-4. 응답 에러 인터셉터 — 서버 에러 메시지 적용 (이 프로젝트)

이 프로젝트에서 사용하는 패턴입니다.

**문제 상황:**

```
서버가 400 응답을 보낼 때 응답 본문:
{ "message": "이미 사용 중인 이메일입니다" }

axios 기본 동작:
err.message = "Request failed with status code 400"  ← 영어, 의미 없음
err.response.data = { message: "이미 사용 중인 이메일입니다" }  ← 여기 있지만 꺼내기 번거로움

컴포넌트에서 매번:
showToast(err.response?.data?.message || err.message, true)  ← 반복 코드
```

**인터셉터로 해결:**

```
인터셉터에서 한 번만:
  error.message = error.response.data.message  (서버 메시지로 교체)

컴포넌트에서 간단하게:
  showToast(err.message, true)  ← 이미 한국어 서버 메시지
```

**코드:**

```js
axiosInstance.interceptors.response.use(
    // 성공 응답 (2xx): 그대로 통과시킵니다.
    // response를 반환해야 axios.get()의 결과로 사용할 수 있습니다.
    response => response,

    // 에러 응답 (4xx, 5xx): 서버 메시지로 err.message를 교체합니다.
    error => {
        // error 객체의 구조:
        //   error.message          → "Request failed with status code 400"
        //   error.response.status  → 400
        //   error.response.data    → { message: "이미 사용 중인 이메일입니다" }
        //
        // error.response?.data?.message
        //   네트워크 단절처럼 응답 자체가 없을 수 있으므로 ?. 으로 안전하게 접근합니다.
        const serverMessage = error.response?.data?.message;

        if (serverMessage) {
            error.message = serverMessage;  // 메시지 교체
        }
        // Promise.reject(error)로 에러를 다시 던져야
        // api 파일의 catch 블록이 실행됩니다.
        // error.response.status는 그대로 유지되므로 404 분기 처리도 여전히 가능합니다.
        return Promise.reject(error);
    }
);
```

**인터셉터 적용 효과:**

```
서버 응답: { "message": "이미 사용 중인 이메일입니다" }

인터셉터 없음: err.message = "Request failed with status code 400"
인터셉터 적용: err.message = "이미 사용 중인 이메일입니다"

컴포넌트: showToast(err.message, true)
결과: 토스트 메시지에 "이미 사용 중인 이메일입니다" 표시
```

---

### 9-5. 인터셉터와 404 개별 처리의 조합

인터셉터가 먼저 실행된 뒤 api 파일의 catch로 전달됩니다.

```
서버가 404 응답
    ↓
[응답 인터셉터]
  error.message = "직원을 찾을 수 없습니다"  (서버 메시지로 교체)
  return Promise.reject(error)               (다시 throw)
    ↓
[employeeApi.js catch 블록]
  if (err.response?.status === 404) return null;  ← 여전히 동작
  throw err;
```

인터셉터가 `error.message`만 교체하고 `error.response`는 건드리지 않으므로, `err.response?.status === 404` 조건은 그대로 동작합니다.

---

### 9-6. 요청 인터셉터 예시 (참고)

이 프로젝트에서는 사용하지 않지만, 토큰 인증이 필요한 프로젝트에서 자주 쓰이는 패턴입니다.

```js
axiosInstance.interceptors.request.use(
    // 요청이 서버로 떠나기 직전에 실행
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            // 모든 요청 헤더에 토큰 자동 추가
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;  // config를 반드시 반환해야 요청이 계속 진행됩니다.
    },
    error => Promise.reject(error)
);
```

---

## 10. 이 프로젝트 적용 내용

### 추가/수정된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/api/axiosInstance.js` | **신규 생성** — 공통 인스턴스 + 에러 인터셉터 |
| `src/api/employeeApi.js` | fetch → axios 교체, checkResponse 제거 |
| `src/api/departmentApi.js` | fetch → axios 교체, checkResponse 제거 |

### 코드 변경 전/후 비교

**전체 직원 조회**
```js
// fetch (변경 전)
async getAll() {
    const response = await fetch(this.#baseUrl);
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP 오류: ${response.status}`);
    }
    return response.json();
}

// axios (변경 후)
async getAll() {
    const { data } = await axios.get(this.#base);
    return data;
}
```

**페이징 조회**
```js
// fetch (변경 전)
async getPage({ pageNo = 0, pageSize = 5, sortBy = 'id', sortDir = 'asc' } = {}) {
    const params = new URLSearchParams({ pageNo, pageSize, sortBy, sortDir });
    const response = await fetch(`${this.#baseUrl}/page?${params}`);
    await checkResponse(response);
    return response.json();
}

// axios (변경 후)
async getPage({ pageNo = 0, pageSize = 5, sortBy = 'id', sortDir = 'asc' } = {}) {
    const { data } = await axios.get(`${this.#base}/page`, {
        params: { pageNo, pageSize, sortBy, sortDir },
    });
    return data;
}
```

**직원 생성**
```js
// fetch (변경 전)
async create(employeeData) {
    const response = await fetch(this.#baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...employeeData }),
    });
    await checkResponse(response);
    return response.json();
}

// axios (변경 후)
async create(employeeData) {
    const { data } = await axios.post(this.#base, employeeData);
    return data;
}
```

### 제거된 코드

```js
// checkResponse 함수 완전 제거 (axios가 자동 처리)
const checkResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: `HTTP 오류! 상태 코드: ${response.status}`,
        }));
        throw new Error(errorData?.message ?? `HTTP 오류! 상태 코드: ${response.status}`);
    }
    return response;
};
```

---

## 11. axios 인스턴스 + 인터셉터 전체 흐름

```
컴포넌트
  await loadEmployeesPage()
      │
      ▼
employeeStore.js
  await employeeApi.getPage({ pageNo: 1, ... })
      │
      ▼
employeeApi.js
  axios.get('/api/employees/page', { params: {...} })
      │
      ▼
[요청 인터셉터] → baseURL 자동 결합
      │            http://localhost:8080/api/employees/page?pageNo=1&...
      ▼
Spring Boot 서버
      │
      ▼
[응답 인터셉터]
  성공(200): response 그대로 통과
  실패(4xx): error.message = 서버 메시지로 교체 후 throw
      │
      ▼
employeeApi.js
  return response.data  ← { content: [...], totalPages: 5 }
      │
      ▼
employeeStore.js
  set({ employees: data.content, totalPages: data.totalPages })
      │
      ▼
EmpList.jsx (자동 리렌더링)
```

---

## 12. 주의사항

| 항목 | 설명 |
|------|------|
| **baseURL 끝 슬래시** | `baseURL: 'http://localhost:8080'` (끝에 `/` 없이), 경로는 `/api/...`로 시작 |
| **response.data** | axios는 `response.data`에 파싱된 데이터가 있습니다. `response.json()`을 쓰면 에러 납니다 |
| **404 처리** | axios는 404도 에러로 throw합니다. `getById()`처럼 null을 반환해야 할 때는 `catch`에서 처리합니다 |
| **인터셉터 순서** | 응답 인터셉터 이후 `error.response`는 여전히 접근 가능합니다 (`err.response?.status === 404`) |
| **params vs URL 직접 작성** | `params` 옵션을 쓰면 axios가 인코딩을 처리합니다. 직접 쿼리 문자열을 붙이지 않습니다 |
