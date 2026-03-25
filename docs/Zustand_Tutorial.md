# Zustand 튜토리얼 — React 초보자를 위한 상태관리 입문

> **대상**: React `useState`를 배웠고, 상태관리 라이브러리를 처음 접하는 분
> **프로젝트 적용 문서**: `docs/React_Zustand.md` 참고

---

## 1. Zustand가 무엇인가

Zustand(주스탄트)는 React 상태관리 라이브러리입니다.

`useState`는 상태가 특정 컴포넌트 안에 갇혀 있어서, 다른 컴포넌트가 쓰려면 props로 내려줘야 합니다.
Zustand는 **컴포넌트 밖에 상태를 두고**, 어느 컴포넌트에서든 직접 꺼내 쓸 수 있게 합니다.

```
useState (컴포넌트 내부 상태)
  ┌──────────────┐
  │  Component A │  ← 상태가 여기 있음
  │  count = 0   │
  └──────┬───────┘
         │ props로 전달해야만 공유 가능
         ▼
  ┌──────────────┐
  │  Component B │
  └──────────────┘

Zustand (컴포넌트 외부 상태)
  ┌─────────────────────┐
  │  store              │
  │  count = 0          │  ← 상태가 여기 있음
  └──────┬──────┬───────┘
         │      │  어디서든 직접 구독
         ▼      ▼
  Component A  Component B
```

### useState vs Zustand 한눈에 비교

| 항목 | useState | Zustand |
|------|----------|---------|
| 상태 위치 | 컴포넌트 내부 | 스토어 (컴포넌트 외부) |
| 다른 컴포넌트와 공유 | props로 전달 | 스토어 직접 구독 |
| 설치 필요 여부 | 필요 없음 (React 내장) | `npm install zustand` |
| Provider 필요 여부 | 없음 | 없음 (Redux와 다름!) |
| 코드 양 | 적음 | 적음 |

---

## 2. 설치

```bash
npm install zustand
```

---

## 3. 스토어 만들기 — create()

Zustand의 핵심은 `create()` 함수 하나입니다.

```js
import { create } from 'zustand';

const useCounterStore = create((set) => ({
    // 상태 (State)
    count: 0,

    // 액션 (Action) — 상태를 바꾸는 함수
    increment: () => set(state => ({ count: state.count + 1 })),
    decrement: () => set(state => ({ count: state.count - 1 })),
    reset:     () => set({ count: 0 }),
}));
```

### create()의 구조

```
create( (set, get) => ({ 상태와 액션을 담은 객체 }) )
  │       │    │
  │       │    └── get: 스토어의 현재 상태를 읽는 함수
  │       └─────── set: 스토어의 상태를 바꾸는 함수
  └─────────────── 스토어를 만들고 훅(hook)을 반환
```

### set()의 두 가지 사용법

```js
// 방법 1: 객체를 직접 전달 (이전 상태와 무관할 때)
reset: () => set({ count: 0 })

// 방법 2: 함수를 전달 (이전 상태를 기반으로 바꿀 때)
increment: () => set(state => ({ count: state.count + 1 }))
//                     ↑ 현재 상태 전체를 받아서, 바꿀 부분만 반환
```

> `set()`은 전체 상태를 교체하지 않습니다. 전달한 키만 바꾸고 나머지는 그대로 유지합니다.

---

## 4. 컴포넌트에서 사용하기

스토어를 만들었다면, 컴포넌트에서 훅처럼 호출합니다.

```jsx
function Counter() {
    // useCounterStore()로 스토어 구독
    // 필요한 상태와 액션만 골라서 가져옵니다.
    const { count, increment, decrement, reset } = useCounterStore();

    return (
        <div>
            <p>현재 카운트: {count}</p>
            <button onClick={increment}>+1</button>
            <button onClick={decrement}>-1</button>
            <button onClick={reset}>초기화</button>
        </div>
    );
}
```

`count`가 바뀌면 이 컴포넌트는 자동으로 다시 렌더링됩니다.

### 여러 컴포넌트에서 같은 스토어 사용하기

```jsx
function DisplayCount() {
    const count = useCounterStore(state => state.count);
    //                            ↑ 필요한 값만 선택해서 가져올 수도 있습니다.
    return <p>다른 컴포넌트에서도 count: {count}</p>;
}

function ResetButton() {
    const reset = useCounterStore(state => state.reset);
    return <button onClick={reset}>초기화</button>;
}
```

두 컴포넌트 모두 같은 `count`를 바라봅니다.
`reset()`을 호출하면 두 컴포넌트가 동시에 업데이트됩니다.

---

## 5. get() — 액션 안에서 다른 상태 읽기

`set`은 상태를 바꾸는 함수입니다.
`get`은 액션 **내부에서** 현재 상태를 읽는 함수입니다.

```js
const useStore = create((set, get) => ({
    count: 0,
    step:  1,

    // count에 step을 더합니다.
    addStep: () => {
        const { step } = get(); // 현재 step 값을 읽어옵니다.
        set(state => ({ count: state.count + step }));
    },
}));
```

> 컴포넌트 안에서는 `get()`을 쓸 필요 없이 그냥 구조분해 할당으로 꺼내면 됩니다.
> `get()`은 스토어 **내부 액션**에서만 사용합니다.

---

## 6. 비동기 액션 — API 호출

Zustand는 비동기 함수도 그냥 `async/await`으로 작성합니다. 별도 설정이 필요 없습니다.

```js
const useTodoStore = create((set) => ({
    todos:   [],
    loading: false,

    // API에서 할 일 목록을 가져옵니다.
    fetchTodos: async () => {
        set({ loading: true });   // 로딩 시작
        try {
            const response = await fetch('/api/todos');
            const data = await response.json();
            set({ todos: data }); // 성공: 데이터 저장
        } finally {
            set({ loading: false }); // 로딩 종료 (성공/실패 무관)
        }
    },

    // 할 일 추가
    addTodo: async (text) => {
        await fetch('/api/todos', {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
        // 추가 후 목록 새로고침 (같은 스토어 액션 호출 가능)
        await get().fetchTodos();  // get()으로 다른 액션 호출
    },
}));
```

컴포넌트에서 사용:

```jsx
function TodoList() {
    const { todos, loading, fetchTodos } = useTodoStore();

    useEffect(() => {
        fetchTodos(); // 마운트 시 API 호출
    }, []);

    if (loading) return <p>로딩 중...</p>;

    return (
        <ul>
            {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
        </ul>
    );
}
```

---

## 7. 에러 처리 패턴

스토어 액션은 에러를 `throw`만 합니다.
어떻게 에러를 표시할지는 컴포넌트가 결정합니다.

```js
// 스토어: 에러를 throw (화면 처리는 컴포넌트 담당)
fetchTodos: async () => {
    set({ loading: true });
    try {
        const data = await fetch('/api/todos').then(r => r.json());
        set({ todos: data });
    } finally {
        set({ loading: false });
    }
    // ← 에러가 나면 자동으로 throw됩니다.
},
```

```jsx
// 컴포넌트: .catch()로 에러를 잡아서 처리
useEffect(() => {
    fetchTodos().catch(err => alert(err.message));
}, []);

// 또는 async/await + try/catch
const handleAdd = async (text) => {
    try {
        await addTodo(text);
    } catch (err) {
        alert('추가 실패: ' + err.message);
    }
};
```

---

## 8. 실전 예제 — 간단한 Todo 앱

### store/todoStore.js

```js
import { create } from 'zustand';

export const useTodoStore = create((set, get) => ({

    // ── 상태 ──────────────────────────────────────
    todos:   [],
    filter:  'all', // 'all' | 'done' | 'todo'
    loading: false,

    // ── 단순 액션 ─────────────────────────────────
    setFilter: (filter) => set({ filter }),

    // ── 비동기 액션 ───────────────────────────────
    fetchTodos: async () => {
        set({ loading: true });
        try {
            const data = await fetch('/api/todos').then(r => r.json());
            set({ todos: data });
        } finally {
            set({ loading: false });
        }
    },

    addTodo: async (text) => {
        await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, done: false }),
        });
    },

    toggleTodo: async (id) => {
        const todo = get().todos.find(t => t.id === id);
        await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...todo, done: !todo.done }),
        });
    },
}));
```

### components/TodoList.jsx

```jsx
import { useEffect } from 'react';
import { useTodoStore } from '../store/todoStore';

export default function TodoList() {
    const { todos, filter, loading, fetchTodos, toggleTodo, setFilter } = useTodoStore();

    // 마운트 + filter 변경 시 데이터 로드
    useEffect(() => {
        fetchTodos().catch(err => console.error(err));
    }, [filter]);

    // filter에 따라 화면에 보여줄 할 일 목록 계산
    const visibleTodos = todos.filter(todo => {
        if (filter === 'done') return todo.done;
        if (filter === 'todo') return !todo.done;
        return true; // 'all'
    });

    return (
        <div>
            {/* 필터 버튼 */}
            <div>
                <button onClick={() => setFilter('all')}>전체</button>
                <button onClick={() => setFilter('todo')}>미완료</button>
                <button onClick={() => setFilter('done')}>완료</button>
            </div>

            {loading && <p>로딩 중...</p>}

            {/* 할 일 목록 */}
            <ul>
                {visibleTodos.map(todo => (
                    <li
                        key={todo.id}
                        onClick={() => toggleTodo(todo.id).catch(console.error)}
                        style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
                    >
                        {todo.text}
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

---

## 9. Redux와 비교

Redux를 사용해본 적 있거나 앞으로 배울 예정이라면 참고하세요.

### Redux로 카운터 만들기

```js
// slice 파일
import { createSlice } from '@reduxjs/toolkit';
const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
        increment: state => { state.value += 1; },
    },
});
export const { increment } = counterSlice.actions;
export default counterSlice.reducer;

// store 파일
import { configureStore } from '@reduxjs/toolkit';
const store = configureStore({ reducer: { counter: counterSlice.reducer } });

// main.jsx — Provider 필수
<Provider store={store}><App /></Provider>

// 컴포넌트
const count    = useSelector(state => state.counter.value);
const dispatch = useDispatch();
<button onClick={() => dispatch(increment())}>+1</button>
```

### Zustand로 카운터 만들기

```js
// store 파일 하나로 끝
const useCounterStore = create(set => ({
    count:     0,
    increment: () => set(state => ({ count: state.count + 1 })),
}));

// Provider 불필요

// 컴포넌트
const { count, increment } = useCounterStore();
<button onClick={increment}>+1</button>
```

### 개념 대응표

| Redux 개념 | Zustand 대응 | 설명 |
|------------|-------------|------|
| `state` | `state` | 데이터 |
| `action` | 액션 함수 | 상태를 바꾸는 명령 |
| `reducer` | `set()` | 상태를 실제로 바꾸는 로직 |
| `dispatch` | 액션 직접 호출 | `increment()` |
| `selector` | 구조분해 할당 | `const { count } = useStore()` |
| `Provider` | 불필요 | Zustand는 필요 없음 |
| `Slice` | `create()` 하나 | 파일 분리 없이 한 파일에 |

---

## 10. 자주 하는 실수

### 실수 1: set()에 전체 상태를 다시 써주는 경우

```js
// ❌ 잘못된 방법 — 다른 상태가 모두 사라집니다
set({ count: state.count + 1 });  // todos, filter 등이 사라짐!

// ✅ 올바른 방법 — 바꿀 것만 전달합니다
set(state => ({ count: state.count + 1 }));  // 나머지는 자동 유지
```

### 실수 2: get()을 컴포넌트에서 호출하는 경우

```js
// ❌ 컴포넌트에서 get()은 사용하지 않습니다
const { count } = useStore.getState(); // 구독이 안 되어 자동 갱신 X

// ✅ 컴포넌트에서는 훅으로 사용합니다
const { count } = useStore(); // 구독 O, 변경 시 자동 리렌더링
```

### 실수 3: 스토어를 컴포넌트 안에서 create하는 경우

```js
// ❌ 컴포넌트가 렌더링될 때마다 새 스토어가 만들어집니다
function MyComponent() {
    const useStore = create(...); // 매 렌더링마다 새로 생성!
}

// ✅ 컴포넌트 밖에서 한 번만 만듭니다
const useStore = create(...); // 파일 최상단에

function MyComponent() {
    const { ... } = useStore();
}
```

---

## 11. 학습 포인트 요약

```
핵심 3가지만 기억하세요.

1. create((set, get) => ({ 상태, 액션 }))  → 스토어 정의
2. const { 상태, 액션 } = useMyStore()     → 컴포넌트에서 구독
3. set({ key: value })                     → 상태 변경

나머지는 이 세 가지의 응용입니다.
```

### 언제 Zustand를 써야 할까?

```
이런 상황이라면 Zustand를 고려하세요:

1. props를 3단계 이상 내려보내고 있다
   (부모 → 자식 → 손자 → ...)

2. 여러 컴포넌트가 같은 상태를 필요로 한다

3. 페이지를 이동해도 상태를 유지하고 싶다

반대로 이런 경우에는 useState로 충분합니다:
- 해당 컴포넌트 안에서만 쓰는 상태
  (예: 모달 열림/닫힘, 입력 필드 값)
```
