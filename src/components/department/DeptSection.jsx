/**
 * DeptSection.jsx — 부서 관리 섹션 (컨테이너 컴포넌트)
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  부서와 관련된 모든 데이터와 API 호출을 한 곳에서 관리합니다.
 *  그리고 그 데이터를 DeptForm, DeptSearch, DeptList에 props로 전달합니다.
 *
 * ─── 페이징 추가 후 상태 구분 ────────────────────────────────────────
 *  allDepartments : getAll()로 가져온 전체 목록 → DeptSearch의 select 드롭다운용
 *  pagedDepts     : getPage()로 가져온 현재 페이지 목록 → DeptList 테이블용
 *
 *  왜 두 개로 나눌까요?
 *  DeptSearch의 select 드롭다운은 모든 부서를 보여줘야 합니다.
 *  페이징하면 5개만 보이게 되므로, 드롭다운용 데이터는 여전히 전체 목록이 필요합니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: App.jsx에서 전달받은 알림 함수
 */
import { useState, useEffect } from 'react';
import { DepartmentApi } from '../../api/departmentApi.js';
import DeptForm   from './DeptForm.jsx';
import DeptSearch from './DeptSearch.jsx';
import DeptList   from './DeptList.jsx';

const departmentApi = new DepartmentApi();

export default function DeptSection({ showToast }) {

    // ── 기본 상태 ─────────────────────────────────────────────────────
    const [allDepartments, setAllDepartments] = useState([]); // DeptSearch 드롭다운용 (전체)
    const [pagedDepts,     setPagedDepts]     = useState([]); // DeptList 테이블용 (현재 페이지)
    const [loading,        setLoading]        = useState(false);
    const [editingDept,    setEditingDept]    = useState(null);

    // ── 페이징 상태 ───────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages,  setTotalPages]  = useState(1);
    const [sortBy,      setSortBy]      = useState('id');
    const [sortDir,     setSortDir]     = useState('asc');

    // ── 마운트 시: 전체 목록(드롭다운용) + 첫 페이지 동시 로드 ──────
    useEffect(() => {
        loadAllDepartments();
    }, []);

    // ── 페이지·정렬 변경 시: 부서 목록 자동 재조회 ───────────────────
    useEffect(() => {
        loadDepartmentsPage(currentPage);
    }, [currentPage, sortBy, sortDir]);

    // ── 전체 부서 목록 (DeptSearch 드롭다운용) ────────────────────────
    const loadAllDepartments = async () => {
        try {
            const data = await departmentApi.getAll();
            setAllDepartments(data);
        } catch (err) {
            showToast(err.message || '부서 목록 로드 실패', true);
        }
    };

    // ── 페이징 부서 목록 로드 ─────────────────────────────────────────
    const loadDepartmentsPage = async (pageNo = 0) => {
        setLoading(true);
        try {
            const data = await departmentApi.getPage({ pageNo, pageSize: 5, sortBy, sortDir });
            setPagedDepts(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            showToast(err.message || '부서 목록 로드 실패', true);
        } finally {
            setLoading(false);
        }
    };

    // ── 페이지 변경 핸들러 ────────────────────────────────────────────
    const handlePageChange = (pageNo) => {
        setCurrentPage(pageNo);
    };

    // ── 부서 생성 또는 수정 처리 ──────────────────────────────────────
    const handleSubmit = async (formData) => {
        try {
            if (editingDept) {
                await departmentApi.update(editingDept.id, formData);
                showToast('부서가 수정되었습니다.');
            } else {
                await departmentApi.create(formData);
                showToast('부서가 생성되었습니다.');
            }
            setEditingDept(null);
            // 드롭다운도 최신 데이터로 갱신
            await loadAllDepartments();
            // 생성/수정 후 1페이지(0)로 이동
            if (currentPage === 0) {
                await loadDepartmentsPage(0);
            } else {
                setCurrentPage(0);
            }
        } catch (err) {
            showToast(err.message || '저장 실패', true);
        }
    };

    // ── 부서 삭제 처리 ────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm(`정말로 ID ${id} 부서를 삭제하시겠습니까?`)) return;
        try {
            await departmentApi.delete(id);
            showToast('부서가 삭제되었습니다.');
            await loadAllDepartments();
            await loadDepartmentsPage(currentPage);
        } catch (err) {
            showToast(err.message || '삭제 실패', true);
        }
    };

    return (
        <>
            <DeptForm
                editingDept={editingDept}
                onSubmit={handleSubmit}
                onCancel={() => setEditingDept(null)}
            />

            {/* allDepartments: 전체 목록을 드롭다운 옵션으로 사용 */}
            <DeptSearch
                departments={allDepartments}
                showToast={showToast}
            />

            {/* pagedDepts: 현재 페이지 데이터만 테이블에 표시 */}
            <DeptList
                departments={pagedDepts}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onEdit={setEditingDept}
                onDelete={handleDelete}
                onRefresh={() => loadDepartmentsPage(currentPage)}
            />
        </>
    );
}
