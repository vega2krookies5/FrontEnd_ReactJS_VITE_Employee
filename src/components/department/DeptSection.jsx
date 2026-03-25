/**
 * DeptSection.jsx — 부서 관리 섹션
 *
 * ─── Zustand 적용 후 달라진 점 ────────────────────────────────────────
 *  기존: useState로 상태를 직접 선언하고, 모든 데이터를 props로 전달했습니다.
 *  변경: useDepartmentStore()로 스토어에서 상태와 액션을 가져옵니다.
 *        DeptList에는 showToast만 전달합니다.
 *
 * ─── 이 컴포넌트의 역할 ───────────────────────────────────────────────
 *  1. 마운트 시 초기 데이터 로드 (useEffect)
 *  2. 페이지/정렬 변경 감지 → 부서 목록 재조회 (useEffect)
 *  3. 부서 생성/수정 처리 (handleSubmit)
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: App.jsx에서 전달받은 알림 함수
 */
import { useEffect } from 'react';
import { useDepartmentStore } from '../../store/departmentStore.js';
import DeptForm   from './DeptForm.jsx';
import DeptSearch from './DeptSearch.jsx';
import DeptList   from './DeptList.jsx';

export default function DeptSection({ showToast }) {

    // ── 스토어에서 필요한 상태와 액션을 가져옵니다 ────────────────────
    const {
        allDepartments,
        editingDept,
        currentPage,
        sortBy,
        sortDir,
        loadAllDepartments,
        loadDepartmentsPage,
        createDepartment,
        updateDepartment,
        setEditingDept,
        setCurrentPage,
    } = useDepartmentStore();

    // ── 마운트 시: 전체 목록(드롭다운용) 로드 ────────────────────────
    useEffect(() => {
        loadAllDepartments().catch(err =>
            showToast(err.message || '부서 목록 로드 실패', true)
        );
    }, []);

    // ── 페이지·정렬 변경 시: 부서 목록 자동 재조회 ───────────────────
    useEffect(() => {
        loadDepartmentsPage(currentPage).catch(err =>
            showToast(err.message || '부서 목록 로드 실패', true)
        );
    }, [currentPage, sortBy, sortDir]);

    // ── 부서 생성/수정 처리 ───────────────────────────────────────────
    const handleSubmit = async (formData) => {
        try {
            if (editingDept) {
                await updateDepartment(editingDept.id, formData);
                showToast('부서가 수정되었습니다.');
            } else {
                await createDepartment(formData);
                showToast('부서가 생성되었습니다.');
            }
            setEditingDept(null);
            // 드롭다운도 최신 데이터로 갱신
            await loadAllDepartments();
            // 저장 후 1페이지(0)로 이동
            if (currentPage === 0) {
                await loadDepartmentsPage(0);
            } else {
                setCurrentPage(0);
            }
        } catch (err) {
            showToast(err.message || '저장 실패', true);
        }
    };

    return (
        <>
            <DeptForm
                editingDept={editingDept}
                onSubmit={handleSubmit}
                onCancel={() => setEditingDept(null)}
            />

            {/* allDepartments: 전체 목록 → 드롭다운 옵션 */}
            <DeptSearch
                departments={allDepartments}
                showToast={showToast}
            />

            {/*
                DeptList에는 showToast만 전달합니다.
                pagedDepts, loading, currentPage, totalPages 등은
                DeptList가 스토어에서 직접 가져옵니다.
            */}
            <DeptList showToast={showToast} />
        </>
    );
}
