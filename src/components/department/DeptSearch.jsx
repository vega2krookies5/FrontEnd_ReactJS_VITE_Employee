/**
 * DeptSearch.jsx — 부서 단건 조회 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  select 드롭다운으로 부서를 선택하여 단건 조회합니다.
 *  조회 결과를 같은 컴포넌트 안에 표시합니다.
 *
 * ─── 기존 방식과 비교 ────────────────────────────────────────────────
 *  기존: departments 데이터를 받아 innerHTML로 <option>을 직접 삽입했습니다.
 *    departments.forEach(dept => {
 *      const option = document.createElement('option');
 *      select.appendChild(option);
 *    });
 *
 *  React: departments 배열을 .map()으로 <option> JSX를 생성합니다.
 *    {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  departments : 부서 배열 (select 옵션 생성용, DeptSection에서 전달)
 *  showToast   : 오류 메시지 표시 함수
 */
import { useState } from 'react';
import { DepartmentApi } from '../../api/departmentApi.js';

const departmentApi = new DepartmentApi();

export default function DeptSearch({ departments, showToast }) {

    // 현재 선택된 부서 ID ('' = 선택 안 함)
    const [selectedId, setSelectedId] = useState('');

    // 조회 결과 (null = 결과 없음)
    const [result, setResult] = useState(null);

    // 조회 버튼 클릭 처리
    const handleSearch = async () => {
        if (!selectedId) {
            showToast('조회할 부서를 선택하세요.', true);
            return;
        }
        try {
            const dept = await departmentApi.getById(selectedId);
            if (!dept) {
                showToast('해당 부서가 존재하지 않습니다.', true);
                setResult(null);
                return;
            }
            setResult(dept); // 조회 결과를 state에 저장 → 화면 자동 업데이트
        } catch (err) {
            showToast(err.message || '조회 실패', true);
        }
    };

    return (
        <div className="card border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3 mb-5">
                부서 조회 (ID)
            </h3>

            <div className="flex gap-4 flex-wrap items-end">
                <select
                    value={selectedId}
                    onChange={e => {
                        setSelectedId(e.target.value);
                        setResult(null); // 선택이 바뀌면 이전 결과 숨기기
                    }}
                    className="flex-1 min-w-48 px-3 py-2.5 border border-slate-300 rounded-md
                               text-sm bg-white focus:outline-none focus:border-blue-400
                               focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                >
                    <option value="">조회할 부서를 선택하세요...</option>
                    {/*
                        departments 배열을 map으로 순환하며 <option>을 자동 생성합니다.
                        key={d.id} : React가 각 항목을 구분하기 위해 필요한 고유 키
                    */}
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>
                            {d.departmentName}
                        </option>
                    ))}
                </select>

                <button onClick={handleSearch} className="btn btn-success">
                    조회
                </button>
            </div>

            {/*
                result가 null이 아닐 때만 결과 영역을 렌더링합니다.
                기존: style.display = 'block' / 'none'으로 제어
                React: {result && <div>...</div>} 조건부 렌더링으로 제어
            */}
            {result && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 leading-7">
                    <p><strong>ID:</strong> {result.id}</p>
                    <p><strong>부서명:</strong> {result.departmentName}</p>
                    <p><strong>설명:</strong> {result.departmentDescription}</p>
                </div>
            )}
        </div>
    );
}
