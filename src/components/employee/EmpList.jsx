/**
 * EmpList.jsx — 전체 직원 목록 테이블 컴포넌트
 *
 * ─── Zustand 적용 후 달라진 점 ────────────────────────────────────────
 *  기존: EmpSection에서 9개 props를 받았습니다.
 *        (employees, departments, loading, currentPage, totalPages,
 *         onPageChange, onEdit, onDelete, onRefresh)
 *
 *  변경: showToast 1개만 받습니다.
 *        나머지는 useEmployeeStore()로 스토어에서 직접 가져옵니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: 알림 메시지 표시 함수 (App.jsx → EmpSection → EmpList)
 */
import { useEmployeeStore } from '../../store/employeeStore.js';
import Pagination from '../common/Pagination.jsx';

export default function EmpList({ showToast }) {

    // ── 스토어에서 상태와 액션을 직접 가져옵니다 ─────────────────────
    const {
        employees,
        departments,
        loading,
        currentPage,
        totalPages,
        setCurrentPage,
        setEditingEmp,
        deleteEmployee,
        loadEmployeesPage,
    } = useEmployeeStore();

    // ── 직원 삭제 처리 ────────────────────────────────────────────────
    // 스토어의 deleteEmployee 액션을 직접 호출합니다.
    const handleDelete = async (id) => {
        if (!confirm(`정말로 ID ${id} 직원을 삭제하시겠습니까?`)) return;
        try {
            await deleteEmployee(id);
            showToast('직원이 삭제되었습니다.');
            await loadEmployeesPage(currentPage); // 현재 페이지 새로고침
        } catch (err) {
            showToast(err.message || '삭제 실패', true);
        }
    };

    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">

            {/* 헤더 */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3">
                    전체 직원 목록
                </h3>
                <button
                    onClick={() =>
                        loadEmployeesPage(currentPage).catch(err =>
                            showToast(err.message || '로드 실패', true)
                        )
                    }
                    className="btn btn-info"
                >
                    새로고침
                </button>
            </div>

            {loading && (
                <div className="text-center text-blue-500 font-bold my-5">
                    데이터를 불러오는 중...
                </div>
            )}

            <table className="w-full border-collapse mt-3">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">ID</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">이름</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">성</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">이메일</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">부서명</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">작업</th>
                    </tr>
                </thead>
                <tbody>
                    {!loading && employees.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-4 py-3 text-center text-slate-400">
                                직원 데이터를 불러오세요.
                            </td>
                        </tr>
                    ) : (
                        employees.map(emp => {
                            // 클라이언트 조인: departmentId → 부서명
                            const deptName = departments
                                .find(d => d.id === emp.departmentId)
                                ?.departmentName ?? 'N/A';

                            return (
                                <tr key={emp.id}>
                                    <td>{emp.id}</td>
                                    <td>{emp.firstName}</td>
                                    <td>{emp.lastName}</td>
                                    <td>{emp.email}</td>
                                    <td>{deptName}</td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                onClick={() => setEditingEmp(emp)}
                                                className="btn btn-warning btn-sm"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="btn btn-danger btn-sm"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/*
                Pagination에 setCurrentPage를 직접 전달합니다.
                setCurrentPage(pageNo) → 스토어의 currentPage 변경
                → EmpSection의 useEffect 감지 → loadEmployeesPage 자동 호출
            */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
