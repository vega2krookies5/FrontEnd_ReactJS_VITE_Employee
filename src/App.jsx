/**
 * App.jsx — 루트(최상위) 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  1. 현재 활성화된 탭(부서/직원)을 기억합니다.          → useState
 *  2. 알림 메시지(성공/오류)를 관리합니다.               → useState
 *  3. 탭 버튼 UI를 그립니다.
 *  4. 활성 탭에 따라 DeptSection 또는 EmpSection을 보여줍니다.
 *
 * ─── React 핵심 개념: useState ───────────────────────────────────────
 *  const [값, 값변경함수] = useState(초기값);
 *
 *  예) const [activeTab, setActiveTab] = useState('dept');
 *      - activeTab    : 현재 탭 이름 ('dept' 또는 'emp')
 *      - setActiveTab : 탭을 바꾸는 함수. 호출하면 화면이 자동으로 다시 그려집니다.
 *
 * ─── 기존 ECMAScript 방식과 비교 ──────────────────────────────────────
 *  기존: showTab() 전역 함수가 classList.add/remove로 DOM을 직접 제어
 *  React: activeTab state가 바뀌면 React가 알아서 화면을 다시 그림
 */

// React에서 필요한 기능을 가져옵니다.
// useState: 컴포넌트 안에서 변할 수 있는 데이터(상태)를 관리하는 훅(Hook)입니다.
import { useState } from 'react';

// 하위 컴포넌트들을 import합니다.
// 컴포넌트 = 화면의 한 부분을 담당하는 함수
import Toast      from './components/common/Toast.jsx';
import DeptSection from './components/department/DeptSection.jsx';
import EmpSection  from './components/employee/EmpSection.jsx';

// ── App 컴포넌트 ──────────────────────────────────────────────────────
// function으로 컴포넌트를 만들고, return 안에 JSX(HTML과 비슷한 문법)를 작성합니다.
export default function App() {

    // ── 상태(State) 선언 ──────────────────────────────────────────────
    // 'dept' = 부서 탭, 'emp' = 직원 탭
    const [activeTab, setActiveTab] = useState('dept');

    // 알림 메시지 상태: { message: '내용', type: 'success'|'error', visible: true|false }
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    // ── 알림 메시지 표시 함수 ─────────────────────────────────────────
    // 기존 utils.js의 showMessage() 역할을 합니다.
    // props로 자식 컴포넌트에게 전달하여, 자식이 알림을 띄울 수 있게 합니다.
    const showToast = (message, isError = false) => {
        setToast({ message, type: isError ? 'error' : 'success', visible: true });
        // 3초 후 자동으로 숨깁니다.
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // ── JSX 반환 ──────────────────────────────────────────────────────
    // return 안의 내용이 실제로 화면에 그려집니다.
    // JSX는 HTML과 거의 같지만, class 대신 className을 씁니다.
    return (
        <div className="bg-slate-100 text-slate-700 min-h-screen p-5">

            {/* 알림 메시지 컴포넌트 — 항상 우상단에 떠있습니다 */}
            {/* props(속성)으로 데이터를 자식 컴포넌트에게 전달합니다 */}
            <Toast
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
            />

            <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Employee &amp; Department Manager
                    </h1>
                </header>

                {/* ── 탭 메뉴 ── */}
                <nav className="flex border-b-2 border-slate-200 mb-8">

                    {/* 부서 탭 버튼 */}
                    {/* activeTab === 'dept' 이면 'active' 클래스를 추가합니다 */}
                    <button
                        className={`tab-button px-6 py-3 font-semibold text-slate-400
                                    border-b-4 border-transparent -mb-0.5
                                    hover:bg-slate-50 hover:text-slate-600
                                    transition-all duration-300
                                    ${activeTab === 'dept' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dept')}
                    >
                        부서 관리 (Department)
                    </button>

                    {/* 직원 탭 버튼 */}
                    <button
                        className={`tab-button px-6 py-3 font-semibold text-slate-400
                                    border-b-4 border-transparent -mb-0.5
                                    hover:bg-slate-50 hover:text-slate-600
                                    transition-all duration-300
                                    ${activeTab === 'emp' ? 'active' : ''}`}
                        onClick={() => setActiveTab('emp')}
                    >
                        직원 관리 (Employee)
                    </button>
                </nav>

                {/*
                    ── 조건부 렌더링 ──────────────────────────────────────
                    기존: CSS .content-section.active 로 보이고 숨겼습니다.
                    React: 조건식으로 아예 렌더링 여부를 결정합니다.
                    activeTab이 'dept'일 때만 DeptSection을 화면에 그립니다.
                */}
                {activeTab === 'dept' && <DeptSection showToast={showToast} />}
                {activeTab === 'emp'  && <EmpSection  showToast={showToast} />}
            </div>
        </div>
    );
}
