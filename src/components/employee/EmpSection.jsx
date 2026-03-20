/**
 * EmpSection.jsx — 직원 관리 섹션 (컨테이너 컴포넌트)
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  직원 관련 모든 데이터와 API 호출을 한 곳에서 관리하고,
 *  EmpForm, EmpSearch, EmpList에 props로 나눠줍니다.
 *
 * ─── 왜 부서 목록도 여기서 관리하나요? ──────────────────────────────
 *  직원 등록/수정 폼(EmpForm)에서 부서 select 드롭다운을 채워야 합니다.
 *  그래서 DepartmentApi도 여기서 호출하고 departments 상태를 관리합니다.
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

    // ── 상태(State) 선언 ──────────────────────────────────────────────
    const [employees,   setEmployees]   = useState([]);  // 직원 목록
    const [departments, setDepartments] = useState([]);  // 부서 목록 (EmpForm용)
    const [loading,     setLoading]     = useState(false);
    const [editingEmp,  setEditingEmp]  = useState(null); // null=등록모드, 객체=수정모드

    // withDept: true이면 "직원+부서 조회" 목록, false이면 "일반 목록"
    // 이 값에 따라 EmpList의 5번째 컬럼이 "부서 ID" 또는 "부서명"으로 바뀝니다.
    const [withDept, setWithDept] = useState(false);

    // 컴포넌트 마운트 시 부서 목록과 직원 목록을 모두 불러옵니다.
    useEffect(() => {
        loadDepartments();
        loadEmployees();
    }, []);

    // ── 부서 목록 로드 (EmpForm의 select 옵션용) ──────────────────────
    const loadDepartments = async () => {
        try {
            const data = await departmentApi.getAll();
            setDepartments(data);
        } catch (err) {
            showToast(err.message || '부서 목록 로드 실패', true);
        }
    };

    // ── 직원 일반 목록 로드 ───────────────────────────────────────────
    const loadEmployees = async () => {
        setLoading(true);
        setWithDept(false); // 일반 목록: 부서 ID 표시
        try {
            const data = await employeeApi.getAll();
            setEmployees(data);
        } catch (err) {
            showToast(err.message || '직원 목록 로드 실패', true);
        } finally {
            setLoading(false);
        }
    };

    // ── 직원 + 부서 통합 목록 로드 ──────────────────────────────────
    const loadEmployeesWithDept = async () => {
        setLoading(true);
        setWithDept(true); // 통합 조회: 부서명 표시
        try {
            const data = await employeeApi.getAllWithDepartments();
            setEmployees(data);
        } catch (err) {
            showToast(err.message || '직원+부서 목록 로드 실패', true);
        } finally {
            setLoading(false);
        }
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
            await loadEmployees();
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
            await loadEmployees();
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
                loading={loading}
                withDept={withDept}
                onEdit={setEditingEmp}
                onDelete={handleDelete}
                onRefresh={loadEmployees}
                onRefreshWithDept={loadEmployeesWithDept}
            />
        </>
    );
}
