/**
 * EmpForm.jsx — 직원 등록/수정 폼 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  직원 이름, 성, 이메일, 부서를 입력받아 등록하거나 수정합니다.
 *
 * ─── 수정 모드에서 부서 select 자동 선택 ───────────────────────────
 *  직원 데이터에는 API 호출 방식에 따라 두 가지 형태가 있습니다:
 *    - 일반 조회:       { departmentId: 2 }
 *    - 직원+부서 조회:  { departmentDto: { id: 2, ... } }  (departmentId는 null)
 *
 *  두 경우를 모두 처리하기 위해 ?? (Nullish Coalescing) 연산자를 사용합니다:
 *    const deptId = editingEmp.departmentId ?? editingEmp.departmentDto?.id;
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  editingEmp   : null = 등록 모드 / 직원 객체 = 수정 모드
 *  departments  : 부서 목록 배열 (select 옵션 생성용)
 *  onSubmit     : 폼 제출 시 부모가 실행할 함수
 *  onCancel     : 취소 버튼 클릭 시 부모가 실행할 함수
 */
import { useState, useEffect } from 'react';

const inputClass =
    'w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm bg-white ' +
    'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';

export default function EmpForm({ editingEmp, departments, onSubmit, onCancel }) {

    // ── 폼 입력 상태 ──────────────────────────────────────────────────
    const [firstName,    setFirstName]    = useState('');
    const [lastName,     setLastName]     = useState('');
    const [email,        setEmail]        = useState('');
    const [departmentId, setDepartmentId] = useState(''); // select 선택값 (문자열)

    // ── 수정 모드 전환 시 폼 데이터 동기화 ───────────────────────────
    useEffect(() => {
        if (editingEmp) {
            setFirstName(editingEmp.firstName ?? '');
            setLastName(editingEmp.lastName   ?? '');
            setEmail(editingEmp.email         ?? '');

            // 두 가지 API 응답 형태 모두 처리:
            //   일반 목록        → departmentId: 2
            //   직원+부서 조회   → departmentDto: { id: 2 }  (departmentId = null)
            const deptId = editingEmp.departmentId ?? editingEmp.departmentDto?.id;
            // select의 value와 option의 value는 문자열로 비교되므로 String()으로 변환합니다.
            setDepartmentId(String(deptId ?? ''));
        } else {
            // 등록 모드: 초기화
            setFirstName('');
            setLastName('');
            setEmail('');
            setDepartmentId('');
        }
    }, [editingEmp]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ firstName, lastName, email, departmentId });
    };

    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3 mb-5">
                {editingEmp ? '직원 수정' : '직원 등록'}
            </h3>

            <form onSubmit={handleSubmit}>

                {/* 이름 + 성 */}
                <div className="flex gap-4 flex-wrap mb-4">
                    <div className="flex-1 min-w-48">
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">이름 (First Name)</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="예: John"
                            required
                            className={inputClass}
                        />
                    </div>
                    <div className="flex-1 min-w-48">
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">성 (Last Name)</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="예: Doe"
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* 이메일 + 부서 */}
                <div className="flex gap-4 flex-wrap mb-4">
                    <div className="flex-1 min-w-48">
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="예: john.doe@example.com"
                            required
                            className={inputClass}
                        />
                    </div>
                    <div className="flex-1 min-w-48">
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">부서</label>
                        <select
                            value={departmentId}
                            onChange={e => setDepartmentId(e.target.value)}
                            required
                            className={`${inputClass} appearance-none`}
                        >
                            <option value="">부서를 선택하세요...</option>
                            {departments.map(d => (
                                // option의 value를 String(d.id)로 지정해야
                                // select.value와 일치하여 자동 선택됩니다.
                                <option key={d.id} value={String(d.id)}>
                                    {d.departmentName} (ID: {d.id})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">
                    {editingEmp ? '수정 저장' : '직원 생성'}
                </button>
                {editingEmp && (
                    <button type="button" onClick={onCancel} className="btn btn-info ml-2">
                        취소
                    </button>
                )}
            </form>
        </div>
    );
}
