/**
 * DeptList.jsx — 전체 부서 목록 테이블 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  부서 배열을 받아 테이블 행(tr)으로 렌더링합니다.
 *
 * ─── 기존 방식과 비교 ────────────────────────────────────────────────
 *  기존: const rows = employees.map(emp => `<tr>...</tr>`); tbody.innerHTML = rows.join('');
 *  React: departments.map(dept => <tr key={dept.id}>...</tr>)
 *         → JSX로 직접 작성하므로 innerHTML이 필요없고 XSS 걱정도 없습니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  departments : 부서 배열
 *  loading     : true이면 로딩 중 메시지 표시
 *  onEdit      : 수정 버튼 클릭 시 → 해당 부서 객체를 editingDept로 설정
 *  onDelete    : 삭제 버튼 클릭 시 → id를 전달
 *  onRefresh   : 새로고침 버튼 클릭 시 → 목록 다시 로드
 */
export default function DeptList({ departments, loading, onEdit, onDelete, onRefresh }) {
    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">

            {/* 헤더: 제목 + 새로고침 버튼 */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3">
                    전체 부서 목록
                </h3>
                <button onClick={onRefresh} className="btn btn-info">새로고침</button>
            </div>

            {/* 로딩 중 표시 */}
            {loading && (
                <div className="text-center text-blue-500 font-bold my-5">
                    데이터를 불러오는 중...
                </div>
            )}

            <table className="w-full border-collapse mt-3">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">ID</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">부서명</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">부서 설명</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">작업</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 데이터가 없을 때 안내 메시지 */}
                    {!loading && departments.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-4 py-3 text-center text-slate-400">
                                부서 데이터가 없습니다.
                            </td>
                        </tr>
                    ) : (
                        /*
                            departments 배열을 map으로 순환하며 테이블 행을 그립니다.
                            key={dept.id}: React가 각 행을 추적하기 위한 고유 식별자
                                           (목록을 렌더링할 때 반드시 필요합니다)
                        */
                        departments.map(dept => (
                            <tr key={dept.id}>
                                <td>{dept.id}</td>
                                <td>{dept.departmentName}</td>
                                <td>{dept.departmentDescription}</td>
                                <td>
                                    <div className="actions">
                                        {/*
                                            onClick={() => onEdit(dept)}
                                            : 이 버튼을 클릭하면 부모의 setEditingDept(dept)가 실행됩니다.
                                            : 화살표 함수를 쓰는 이유: 클릭 시점에 dept를 넘기기 위해서
                                        */}
                                        <button
                                            onClick={() => onEdit(dept)}
                                            className="btn btn-warning btn-sm"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => onDelete(dept.id)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
