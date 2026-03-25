/**
 * departmentStore.js — 부서 관리 Zustand 스토어
 *
 * ─── employeeStore.js와 동일한 패턴입니다 ────────────────────────────
 *  차이점: 부서는 두 가지 목록을 관리합니다.
 *
 *  allDepartments : getAll() → 전체 목록  → DeptSearch select 드롭다운용
 *  pagedDepts     : getPage() → 현재 페이지 → DeptList 테이블용
 *
 * ─── 컴포넌트에서 사용법 ──────────────────────────────────────────────
 *  import { useDepartmentStore } from '../../store/departmentStore';
 *
 *  const { pagedDepts, loadDepartmentsPage } = useDepartmentStore();
 */
import { create } from 'zustand';
import { DepartmentApi } from '../api/departmentApi.js';

const departmentApi = new DepartmentApi();

export const useDepartmentStore = create((set, get) => ({

    // ── 상태(State) ───────────────────────────────────────────────────
    allDepartments: [], // DeptSearch select 드롭다운용 (전체)
    pagedDepts:     [], // DeptList 테이블용 (현재 페이지)
    loading:        false,
    editingDept:    null,

    // 페이징 상태
    currentPage: 0,
    totalPages:  1,
    sortBy:      'id',
    sortDir:     'asc',

    // ── 단순 상태 변경 액션 ───────────────────────────────────────────
    setEditingDept: (dept) => set({ editingDept: dept }),
    setCurrentPage: (page) => set({ currentPage: page }),

    // ── 비동기 액션 (API 호출) ────────────────────────────────────────

    // 부서 전체 목록 로드 (DeptSearch 드롭다운용)
    loadAllDepartments: async () => {
        const data = await departmentApi.getAll();
        set({ allDepartments: data });
    },

    // 페이징 부서 목록 로드
    loadDepartmentsPage: async (pageNo = 0) => {
        const { sortBy, sortDir } = get();
        set({ loading: true });
        try {
            const data = await departmentApi.getPage({ pageNo, pageSize: 5, sortBy, sortDir });
            set({ pagedDepts: data.content, totalPages: data.totalPages });
        } finally {
            set({ loading: false });
        }
    },

    // 부서 생성
    createDepartment: async (formData) => {
        await departmentApi.create(formData);
    },

    // 부서 수정
    updateDepartment: async (id, formData) => {
        await departmentApi.update(id, formData);
    },

    // 부서 삭제
    deleteDepartment: async (id) => {
        await departmentApi.delete(id);
    },
}));
