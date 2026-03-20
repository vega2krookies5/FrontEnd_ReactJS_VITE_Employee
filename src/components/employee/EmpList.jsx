/**
 * EmpList.jsx — 전체 직원 목록 테이블 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  직원 배열을 받아 테이블 행으로 렌더링합니다.
 *  withDept 여부에 따라 5번째 컬럼이 "부서 ID" 또는 "부서명"으로 바뀝니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  employees          : 직원 배열
 *  loading            : true이면 로딩 중 표시
 *  withDept           : true = 직원+부서 조회 결과 / false = 일반 조회 결과
 *  onEdit             : 수정 버튼 클릭 → 해당 직원 객체를 editingEmp로 설정
 *  onDelete           : 삭제 버튼 클릭 → id 전달
 *  onRefresh          : 새로고침 버튼 클릭
 *  onRefreshWithDept  : 직원+부서 조회 버튼 클릭
 */
export default function EmpList({
    employees,
    loading,
    withDept,
    onEdit,
    onDelete,
    onRefresh,
    onRefreshWithDept,
}) {
    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">

            {/* 헤더 */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3">
                    전체 직원 목록
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={onRefreshWithDept}
                        className="btn btn-secondary"
                        title="직원과 부서 정보를 함께 조회합니다."
                    >
                        직원+부서 조회
                    </button>
                    <button onClick={onRefresh} className="btn btn-info">새로고침</button>
                </div>
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
                        {/* withDept에 따라 헤더 텍스트가 바뀝니다 */}
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">
                            {withDept ? '부서명' : '부서 ID'}
                        </th>
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
                            // withDept 여부에 따라 5번째 셀 내용 결정
                            const deptDisplay = withDept
                                ? (emp.departmentDto?.departmentName ?? 'N/A')
                                : (emp.departmentId ?? 'N/A');

                            return (
                                <tr key={emp.id}>
                                    <td>{emp.id}</td>
                                    <td>{emp.firstName}</td>
                                    <td>{emp.lastName}</td>
                                    <td>{emp.email}</td>
                                    <td>{deptDisplay}</td>
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
        </div>
    );
}
