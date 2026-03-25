/**
 * DeptList.jsx — 전체 부서 목록 테이블 컴포넌트
 *
 * ─── Zustand 적용 후 달라진 점 ────────────────────────────────────────
 *  기존: DeptSection에서 7개 props를 받았습니다.
 *        (departments, loading, currentPage, totalPages,
 *         onPageChange, onEdit, onDelete, onRefresh)
 *
 *  변경: showToast 1개만 받습니다.
 *        나머지는 useDepartmentStore()로 스토어에서 직접 가져옵니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: 알림 메시지 표시 함수
 */
import { useDepartmentStore } from '../../store/departmentStore.js';
import Pagination from '../common/Pagination.jsx';

export default function DeptList({ showToast }) {

    // ── 스토어에서 상태와 액션을 직접 가져옵니다 ─────────────────────
    const {
        pagedDepts,
        loading,
        currentPage,
        totalPages,
        setCurrentPage,
        setEditingDept,
        deleteDepartment,
        loadDepartmentsPage,
        loadAllDepartments,
    } = useDepartmentStore();

    // ── 부서 삭제 처리 ────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm(`정말로 ID ${id} 부서를 삭제하시겠습니까?`)) return;
        try {
            await deleteDepartment(id);
            showToast('부서가 삭제되었습니다.');
            // 드롭다운과 테이블 모두 갱신
            await loadAllDepartments();
            await loadDepartmentsPage(currentPage);
        } catch (err) {
            showToast(err.message || '삭제 실패', true);
        }
    };

    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">

            {/* 헤더 */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3">
                    전체 부서 목록
                </h3>
                <button
                    onClick={() =>
                        loadDepartmentsPage(currentPage).catch(err =>
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
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">부서명</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">부서 설명</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold text-sm border-b border-slate-200">작업</th>
                    </tr>
                </thead>
                <tbody>
                    {!loading && pagedDepts.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-4 py-3 text-center text-slate-400">
                                부서 데이터가 없습니다.
                            </td>
                        </tr>
                    ) : (
                        pagedDepts.map(dept => (
                            <tr key={dept.id}>
                                <td>{dept.id}</td>
                                <td>{dept.departmentName}</td>
                                <td>{dept.departmentDescription}</td>
                                <td>
                                    <div className="actions">
                                        <button
                                            onClick={() => setEditingDept(dept)}
                                            className="btn btn-warning btn-sm"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
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

            {/*
                Pagination에 setCurrentPage를 직접 전달합니다.
                setCurrentPage(pageNo) → 스토어의 currentPage 변경
                → DeptSection의 useEffect 감지 → loadDepartmentsPage 자동 호출
            */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
