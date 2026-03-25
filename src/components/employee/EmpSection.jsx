/**
 * EmpSection.jsx — 직원 관리 섹션
 *
 * ─── Zustand 적용 후 달라진 점 ────────────────────────────────────────
 *  기존: useState로 상태를 직접 선언하고, 모든 데이터를 props로 자식에게 내려줬습니다.
 *  변경: useEmployeeStore()로 스토어에서 상태와 액션을 가져옵니다.
 *        EmpList에는 showToast만 전달합니다. (데이터 props 불필요)
 *
 * ─── 이 컴포넌트의 역할 ───────────────────────────────────────────────
 *  1. 마운트 시 초기 데이터 로드 (useEffect)
 *  2. 페이지/정렬 변경 감지 → 직원 목록 재조회 (useEffect)
 *  3. 직원 생성/수정 처리 (handleSubmit)
 *  데이터 표시와 삭제 처리는 EmpList가 스토어에 직접 접근합니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: App.jsx에서 전달받은 알림 함수
 */
import { useEffect } from 'react';
import { useEmployeeStore } from '../../store/employeeStore.js';
import EmpForm   from './EmpForm.jsx';
import EmpSearch from './EmpSearch.jsx';
import EmpList   from './EmpList.jsx';

export default function EmpSection({ showToast }) {

    // ── 스토어에서 필요한 상태와 액션을 가져옵니다 ────────────────────
    // 구조분해 할당으로 필요한 것만 골라서 사용합니다.
    const {
        departments,
        editingEmp,
        currentPage,
        sortBy,
        sortDir,
        loadDepartments,
        loadEmployeesPage,
        createEmployee,
        updateEmployee,
        setEditingEmp,
        setCurrentPage,
    } = useEmployeeStore();

    // ── 마운트 시: 부서 전체 목록 1회 로드 ───────────────────────────
    useEffect(() => {
        loadDepartments().catch(err =>
            showToast(err.message || '부서 목록 로드 실패', true)
        );
    }, []);

    // ── 페이지·정렬 변경 시: 직원 목록 자동 재조회 ───────────────────
    // currentPage, sortBy, sortDir 중 하나라도 바뀌면 실행됩니다.
    useEffect(() => {
        loadEmployeesPage(currentPage).catch(err =>
            showToast(err.message || '직원 목록 로드 실패', true)
        );
    }, [currentPage, sortBy, sortDir]);

    // ── 직원 생성/수정 처리 ───────────────────────────────────────────
    const handleSubmit = async (formData) => {
        try {
            if (editingEmp) {
                await updateEmployee(editingEmp.id, formData);
                showToast('직원 정보가 수정되었습니다.');
            } else {
                await createEmployee(formData);
                showToast('직원이 생성되었습니다.');
            }
            setEditingEmp(null);
            // 저장 후 1페이지(0)로 이동
            if (currentPage === 0) {
                await loadEmployeesPage(0);
            } else {
                setCurrentPage(0); // useEffect가 자동으로 loadEmployeesPage 호출
            }
        } catch (err) {
            showToast(err.message || '저장 실패', true);
        }
    };

    return (
        <>
            <EmpForm
                editingEmp={editingEmp}
                departments={departments}
                onSubmit={handleSubmit}
                onCancel={() => setEditingEmp(null)}
            />
            <EmpSearch showToast={showToast} />

            {/*
                EmpList에는 showToast만 전달합니다.
                기존에 전달하던 employees, departments, loading, currentPage,
                totalPages, onPageChange, onEdit, onDelete, onRefresh는
                EmpList가 스토어에서 직접 가져옵니다.
            */}
            <EmpList showToast={showToast} />
        </>
    );
}
