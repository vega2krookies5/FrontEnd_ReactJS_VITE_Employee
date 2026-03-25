/**
 * employeeStore.js — 직원 관리 Zustand 스토어
 *
 * ─── Zustand란? ───────────────────────────────────────────────────────
 *  React 컴포넌트 밖에서 상태를 관리하는 라이브러리입니다.
 *  기존: 상태가 EmpSection 안에 있어서 EmpList에 props로 전달해야 했습니다.
 *  Zustand: 상태가 store에 있어서 어느 컴포넌트에서든 직접 가져다 쓸 수 있습니다.
 *
 * ─── create() 함수 구조 ───────────────────────────────────────────────
 *  create((set, get) => ({ ... }))
 *
 *  set : 상태를 바꾸는 함수.  set({ loading: true })
 *  get : 현재 상태를 읽는 함수. get().currentPage
 *
 * ─── 컴포넌트에서 사용법 ──────────────────────────────────────────────
 *  import { useEmployeeStore } from '../../store/employeeStore';
 *
 *  const { employees, loadEmployeesPage } = useEmployeeStore();
 *  → 필요한 상태와 액션만 골라서 가져옵니다.
 */
import { create } from 'zustand';
import { EmployeeApi }   from '../api/employeeApi.js';
import { DepartmentApi } from '../api/departmentApi.js';

const employeeApi   = new EmployeeApi();
const departmentApi = new DepartmentApi();

export const useEmployeeStore = create((set, get) => ({

    // ── 상태(State) ───────────────────────────────────────────────────
    employees:   [],   // 현재 페이지 직원 목록
    departments: [],   // 전체 부서 목록 (EmpForm select + 부서명 클라이언트 조인용)
    loading:     false,
    editingEmp:  null, // null = 등록 모드, 객체 = 수정 모드

    // 페이징 상태
    currentPage: 0,
    totalPages:  1,
    sortBy:      'id',
    sortDir:     'asc',

    // ── 단순 상태 변경 액션 ───────────────────────────────────────────
    // set()에 바꿀 상태만 객체로 전달합니다. 나머지 상태는 유지됩니다.
    setEditingEmp:  (emp)  => set({ editingEmp: emp }),
    setCurrentPage: (page) => set({ currentPage: page }),

    // ── 비동기 액션 (API 호출) ────────────────────────────────────────

    // 부서 전체 목록 로드 (EmpForm select + 부서명 조인용)
    loadDepartments: async () => {
        const data = await departmentApi.getAll();
        set({ departments: data });
    },

    // 페이징 직원 목록 로드
    // pageNo를 인자로 받습니다. sortBy/sortDir은 get()으로 스토어에서 직접 읽습니다.
    loadEmployeesPage: async (pageNo = 0) => {
        const { sortBy, sortDir } = get();
        set({ loading: true });
        try {
            const data = await employeeApi.getPage({ pageNo, pageSize: 5, sortBy, sortDir });
            set({ employees: data.content, totalPages: data.totalPages });
        } finally {
            set({ loading: false });
        }
    },

    // 직원 생성
    createEmployee: async (formData) => {
        await employeeApi.create(formData);
    },

    // 직원 수정
    updateEmployee: async (id, formData) => {
        await employeeApi.update(id, formData);
    },

    // 직원 삭제
    deleteEmployee: async (id) => {
        await employeeApi.delete(id);
    },
}));
