/**
 * EmpSection.jsx — 직원 관리 섹션 (컨테이너 컴포넌트)
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  직원 관련 모든 데이터와 API 호출을 한 곳에서 관리하고,
 *  EmpForm, EmpSearch, EmpList에 props로 나눠줍니다.
 *
 * ─── 클라이언트 조인 방식 ─────────────────────────────────────────────
 *  GET /api/employees/page 응답의 departmentDto는 항상 null입니다. (LAZY 로딩)
 *  대신, 이미 로드된 departments 배열을 EmpList에 함께 전달합니다.
 *  EmpList 안에서 emp.departmentId로 departments를 검색하여 부서명을 표시합니다.
 *  → 추가 API 호출 없이, "직원+부서 조회" 버튼 없이 항상 부서명을 보여줍니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: App.jsx에서 전달받은 알림 함수
 */
import { useState, useEffect } from 'react';
import { EmployeeApi }   from '../../api/employeeApi.js';
import { DepartmentApi } from '../../api/departmentApi.js';
import EmpForm   from './EmpForm.jsx';
import EmpSearch from './EmpSearch.jsx';
import EmpList   from './EmpList.jsx';

const employeeApi   = new EmployeeApi();
const departmentApi = new DepartmentApi();

export default function EmpSection({ showToast }) {

    // ── 기본 상태 ─────────────────────────────────────────────────────
    const [employees,   setEmployees]   = useState([]);
    const [departments, setDepartments] = useState([]); // EmpForm select + EmpList 부서명 조인용
    const [loading,     setLoading]     = useState(false);
    const [editingEmp,  setEditingEmp]  = useState(null);

    // ── 페이징 상태 ───────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages,  setTotalPages]  = useState(1);
    const [sortBy,      setSortBy]      = useState('id');
    const [sortDir,     setSortDir]     = useState('asc');

    // ── 마운트 시: 부서 전체 목록 1회 로드 ───────────────────────────
    // EmpForm의 select 드롭다운 + EmpList의 부서명 표시 두 곳에서 사용합니다.
    useEffect(() => {
        loadDepartments();
    }, []);

    // ── 페이지·정렬 변경 시: 직원 목록 자동 재조회 ───────────────────
    useEffect(() => {
        loadEmployeesPage(currentPage);
    }, [currentPage, sortBy, sortDir]);

    // ── 부서 전체 목록 로드 ───────────────────────────────────────────
    const loadDepartments = async () => {
        try {
            const data = await departmentApi.getAll();
            setDepartments(data);
        } catch (err) {
            showToast(err.message || '부서 목록 로드 실패', true);
        }
    };

    // ── 페이징 직원 목록 로드 ─────────────────────────────────────────
    const loadEmployeesPage = async (pageNo = 0) => {
        setLoading(true);
        try {
            const data = await employeeApi.getPage({ pageNo, pageSize: 5, sortBy, sortDir });
            setEmployees(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            showToast(err.message || '직원 목록 로드 실패', true);
        } finally {
            setLoading(false);
        }
    };

    // ── 페이지 변경 핸들러 ────────────────────────────────────────────
    const handlePageChange = (pageNo) => {
        setCurrentPage(pageNo);
    };

    // ── 직원 생성/수정 처리 ───────────────────────────────────────────
    const handleSubmit = async (formData) => {
        try {
            if (editingEmp) {
                await employeeApi.update(editingEmp.id, formData);
                showToast('직원 정보가 수정되었습니다.');
            } else {
                await employeeApi.create(formData);
                showToast('직원이 생성되었습니다.');
            }
            setEditingEmp(null);
            if (currentPage === 0) {
                await loadEmployeesPage(0);
            } else {
                setCurrentPage(0);
            }
        } catch (err) {
            showToast(err.message || '저장 실패', true);
        }
    };

    // ── 직원 삭제 처리 ────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm(`정말로 ID ${id} 직원을 삭제하시겠습니까?`)) return;
        try {
            await employeeApi.delete(id);
            showToast('직원이 삭제되었습니다.');
            await loadEmployeesPage(currentPage);
        } catch (err) {
            showToast(err.message || '삭제 실패', true);
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
            <EmpList
                employees={employees}
                departments={departments}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onEdit={setEditingEmp}
                onDelete={handleDelete}
                onRefresh={() => loadEmployeesPage(currentPage)}
            />
        </>
    );
}
