/**
 * EmpSearch.jsx — 직원 단건 조회 컴포넌트 (ID 또는 이메일)
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  ID 또는 이메일로 직원 한 명을 조회하고 결과를 표시합니다.
 *
 * ─── 상호 초기화 기능 ────────────────────────────────────────────────
 *  ID 필드에 포커스 → 이메일 필드 초기화 + 조회 결과 숨김
 *  이메일 필드에 포커스 → ID 필드 초기화 + 조회 결과 숨김
 *
 *  기존 ECMAScript에서는 addEventListener('focus', ...)로 구현했습니다.
 *  React에서는 onFocus 이벤트 핸들러로 처리합니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: 오류 메시지 표시 함수
 */
import { useState } from 'react';
import { EmployeeApi } from '../../api/employeeApi.js';

const employeeApi = new EmployeeApi();

const inputClass =
    'flex-1 min-w-48 px-3 py-2.5 border border-slate-300 rounded-md text-sm bg-white ' +
    'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';

export default function EmpSearch({ showToast }) {

    // ID 입력 필드 값
    const [empId,    setEmpId]    = useState('');
    // 이메일 입력 필드 값
    const [empEmail, setEmpEmail] = useState('');
    // 조회 결과
    const [result,   setResult]   = useState(null);

    // ID로 조회
    const handleSearchById = async () => {
        if (!empId) { showToast('조회할 직원 ID를 입력해주세요.', true); return; }
        try {
            const emp = await employeeApi.getById(empId);
            if (!emp) { showToast('해당 ID의 직원이 존재하지 않습니다.', true); setResult(null); return; }
            setResult(emp);
        } catch (err) {
            showToast(err.message || '조회 실패', true);
        }
    };

    // 이메일로 조회
    const handleSearchByEmail = async () => {
        if (!empEmail) { showToast('조회할 이메일을 입력해주세요.', true); return; }
        try {
            const emp = await employeeApi.getByEmail(empEmail);
            if (!emp) { showToast('해당 이메일의 직원이 존재하지 않습니다.', true); setResult(null); return; }
            setResult(emp);
        } catch (err) {
            showToast(err.message || '조회 실패', true);
        }
    };

    // 부서 정보 표시 방식 결정
    const deptDisplay = result?.departmentDto
        ? result.departmentDto.departmentName  // 직원+부서 조회 결과
        : (result?.departmentId ?? '정보 없음'); // 일반 조회 결과

    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3 mb-5">
                직원 조회
            </h3>

            {/* ID 조회 행 */}
            <div className="flex gap-4 flex-wrap items-end mb-4">
                <input
                    type="number"
                    value={empId}
                    onChange={e => setEmpId(e.target.value)}
                    onFocus={() => {
                        // ID 필드에 포커스 → 이메일 필드와 결과 초기화
                        setEmpEmail('');
                        setResult(null);
                    }}
                    placeholder="ID로 조회"
                    min="1"
                    className={inputClass}
                />
                <button onClick={handleSearchById} className="btn btn-success">
                    ID로 조회
                </button>
            </div>

            {/* 이메일 조회 행 */}
            <div className="flex gap-4 flex-wrap items-end">
                <input
                    type="email"
                    value={empEmail}
                    onChange={e => setEmpEmail(e.target.value)}
                    onFocus={() => {
                        // 이메일 필드에 포커스 → ID 필드와 결과 초기화
                        setEmpId('');
                        setResult(null);
                    }}
                    placeholder="이메일로 조회"
                    className={inputClass}
                />
                <button onClick={handleSearchByEmail} className="btn btn-success">
                    이메일로 조회
                </button>
            </div>

            {/* 조회 결과 */}
            {result && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 leading-7">
                    <p><strong>ID:</strong> {result.id}</p>
                    <p><strong>이름:</strong> {result.firstName} {result.lastName}</p>
                    <p><strong>이메일:</strong> {result.email}</p>
                    <p><strong>부서:</strong> {deptDisplay}</p>
                </div>
            )}
        </div>
    );
}
