/**
 * DeptForm.jsx — 부서 등록/수정 폼 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  부서 이름과 설명을 입력받아 등록하거나 수정합니다.
 *
 * ─── React 핵심 개념: Controlled Input (제어 컴포넌트) ───────────────
 *  기존 HTML에서는 input에 값을 입력하면 자동으로 브라우저가 관리했습니다.
 *  React에서는 input의 값을 state로 직접 관리합니다:
 *
 *    const [name, setName] = useState('');
 *    <input value={name} onChange={e => setName(e.target.value)} />
 *
 *  이렇게 하면:
 *  - 사용자가 입력 → onChange 발생 → setName 호출 → name state 업데이트
 *  - name state가 바뀌면 React가 화면을 자동으로 다시 그림
 *
 * ─── React 핵심 개념: useEffect의 의존성 배열 ─────────────────────────
 *  useEffect(() => { ... }, [editingDept]);
 *  editingDept가 바뀔 때마다 폼 필드를 동기화합니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  editingDept : null = 등록 모드 / 부서 객체 = 수정 모드
 *  onSubmit    : 폼 제출 시 부모(DeptSection)가 실행할 함수
 *  onCancel    : 취소 버튼 클릭 시 부모가 실행할 함수
 */
import { useState, useEffect } from 'react';

// 긴 클래스 문자열을 변수로 빼서 코드를 깔끔하게 합니다.
const inputClass =
    'w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm bg-white ' +
    'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';

export default function DeptForm({ editingDept, onSubmit, onCancel }) {

    // ── 폼 입력 상태 ──────────────────────────────────────────────────
    // 각 input의 값을 state로 관리합니다.
    const [name, setName] = useState(''); // 부서명 입력 필드
    const [desc, setDesc] = useState(''); // 부서 설명 입력 필드

    // ── 수정 모드 전환 시 폼 데이터 동기화 ───────────────────────────
    // 기존 ECMAScript: document.getElementById('dept-name').value = dept.departmentName;
    // React: useEffect로 editingDept가 바뀌면 state를 업데이트 → 화면 자동 반영
    useEffect(() => {
        if (editingDept) {
            // 수정 모드: 기존 데이터로 폼 채우기
            setName(editingDept.departmentName         ?? '');
            setDesc(editingDept.departmentDescription  ?? '');
        } else {
            // 등록 모드: 폼 초기화
            setName('');
            setDesc('');
        }
    }, [editingDept]); // editingDept가 바뀔 때마다 실행

    // ── 폼 제출 처리 ─────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault(); // 브라우저 기본 동작(페이지 새로고침) 막기
        // 부모 컴포넌트(DeptSection)의 handleSubmit을 호출합니다.
        onSubmit({
            departmentName:        name.trim(),
            departmentDescription: desc.trim(),
        });
    };

    // ── 화면 렌더링 ──────────────────────────────────────────────────
    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">

            {/* 제목: editingDept 여부에 따라 텍스트가 자동으로 바뀝니다 */}
            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3 mb-5">
                {editingDept ? '부서 수정' : '부서 등록'}
            </h3>

            <form onSubmit={handleSubmit}>
                <div className="flex gap-4 flex-wrap mb-4">

                    {/* 부서명 입력 */}
                    <div className="flex-1 min-w-48">
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">
                            부서명
                        </label>
                        {/*
                            value={name}              : 이 input의 값은 name state입니다.
                            onChange={e => setName(...)} : 사용자가 입력하면 name state를 업데이트합니다.
                        */}
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="예: HR"
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* 부서 설명 입력 */}
                    <div className="flex-1 min-w-48">
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">
                            부서 설명
                        </label>
                        <input
                            type="text"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="부서에 대한 설명을 입력하세요"
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* 제출 버튼: 수정/등록 모드에 따라 텍스트가 바뀝니다 */}
                <button type="submit" className="btn btn-primary">
                    {editingDept ? '수정 저장' : '부서 생성'}
                </button>

                {/* 취소 버튼: 수정 모드일 때만 보입니다 */}
                {editingDept && (
                    <button type="button" onClick={onCancel} className="btn btn-info ml-2">
                        취소
                    </button>
                )}
            </form>
        </div>
    );
}
