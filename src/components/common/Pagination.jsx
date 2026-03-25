/**
 * Pagination.jsx — 공통 페이지 이동 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  이전 / 페이지번호 / 다음 버튼을 렌더링합니다.
 *  버튼을 클릭하면 onPageChange(pageNo)를 호출하여 부모에게 알립니다.
 *  실제 데이터 로딩은 부모 컴포넌트(EmpSection, DeptSection)가 담당합니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  currentPage  : 현재 페이지 번호 (0부터 시작, 서버 기준)
 *  totalPages   : 전체 페이지 수
 *  onPageChange : 페이지 번호 클릭 시 호출되는 함수 (pageNo 전달)
 *
 * ─── 학습 포인트 ──────────────────────────────────────────────────────
 *  [...Array(totalPages)].map((_, index) => ...)
 *  → 길이가 totalPages인 빈 배열을 만들고 map으로 순회합니다.
 *  → index = 0, 1, 2 ... totalPages-1 (서버의 pageNo와 일치)
 *  → UI 표시는 index + 1 (사람에게는 1페이지부터 보여줍니다)
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {

    // 페이지가 1개 이하면 페이지 버튼을 표시할 필요가 없습니다.
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-1 mt-4">

            {/* 이전 버튼: 첫 페이지(0)이면 비활성화 */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 rounded border border-slate-300 text-slate-600 text-sm
                           hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                이전
            </button>

            {/*
                페이지 번호 버튼 목록
                - currentPage === index 이면 파란색(활성) 스타일
                - 그 외에는 기본 스타일
            */}
            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={index}
                    onClick={() => onPageChange(index)}
                    className={`px-3 py-1 rounded border text-sm font-medium
                        ${currentPage === index
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    {index + 1}
                </button>
            ))}

            {/* 다음 버튼: 마지막 페이지이면 비활성화 */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 rounded border border-slate-300 text-slate-600 text-sm
                           hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                다음
            </button>
        </div>
    );
}
