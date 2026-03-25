/**
 * EmpList.jsx — 전체 직원 목록 테이블 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  직원 배열을 받아 테이블 행으로 렌더링합니다.
 *  departments 배열을 함께 받아, emp.departmentId로 부서명을 찾아 표시합니다.
 *
 * ─── 클라이언트 조인 핵심 ────────────────────────────────────────────
 *  서버의 GET /api/employees/page 응답에서 departmentDto는 항상 null입니다.
 *  하지만 departmentId는 항상 있습니다.
 *
 *  departments 배열(전체 부서 목록)에서 해당 id를 찾으면 부서명을 알 수 있습니다.
 *
 *  departments.find(d => d.id === emp.departmentId)?.departmentName
 *  ↑ Array.find(): 조건에 맞는 첫 번째 요소를 반환합니다. 없으면 undefined.
 *  ↑ ?.           : 옵셔널 체이닝. undefined이면 에러 대신 undefined를 반환합니다.
 *  ↑ ?? 'N/A'    : null/undefined이면 'N/A'를 기본값으로 사용합니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  employees    : 직원 배열 (현재 페이지)
 *  departments  : 부서 배열 (전체 — 부서명 조인용)
 *  loading      : true이면 로딩 중 표시
 *  currentPage  : 현재 페이지 번호 (0부터)
 *  totalPages   : 전체 페이지 수
 *  onPageChange : 페이지 버튼 클릭 시 호출
 *  onEdit       : 수정 버튼 클릭 → 해당 직원 객체를 editingEmp로 설정
 *  onDelete     : 삭제 버튼 클릭 → id 전달
 *  onRefresh    : 새로고침 버튼 클릭
 */
import Pagination from '../common/Pagination.jsx';

export default function EmpList({
    employees,
    departments,
    loading,
    currentPage,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
    onRefresh,
}) {
    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">

            {/* 헤더 */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3">
                    전체 직원 목록
                </h3>
                <button onClick={onRefresh} className="btn btn-info">새로고침</button>
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
                            /*
                             * 클라이언트 조인: emp.departmentId로 departments 배열에서 부서를 찾습니다.
                             *
                             * departments.find(d => d.id === emp.departmentId)
                             *   → { id: 2, departmentName: '개발팀', ... } 또는 undefined
                             * ?.departmentName
                             *   → '개발팀' 또는 undefined
                             * ?? 'N/A'
                             *   → 부서 정보가 없으면 'N/A' 표시
                             */
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
                                                onClick={() => onEdit(emp)}
                                                className="btn btn-warning btn-sm"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => onDelete(emp.id)}
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

            {/* 페이지 버튼: totalPages <= 1이면 Pagination 내부에서 자동으로 숨김 */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
}
