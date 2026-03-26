/**
 * App.jsx — 루트(최상위) 컴포넌트
 *
 * ─── React Router 적용 후 달라진 점 ──────────────────────────────────
 *  기존: activeTab useState로 현재 탭을 기억하고 조건부 렌더링으로 전환
 *  변경: URL이 현재 탭을 대신 기억합니다.
 *
 *  /dept → <DeptSection> 렌더링
 *  /emp  → <EmpSection>  렌더링
 *
 * ─── 추가된 React Router 개념 3가지 ─────────────────────────────────
 *
 *  1. <NavLink to="/dept">
 *     클릭 시 URL을 /dept로 바꾸고, 현재 URL과 일치하면 isActive=true 제공
 *     → isActive로 기존 'active' 클래스를 그대로 재사용합니다.
 *
 *  2. <Routes> / <Route path="..." element={<컴포넌트 />}>
 *     현재 URL과 일치하는 Route의 element를 렌더링합니다.
 *     기존 조건부 렌더링({activeTab === 'dept' && ...})을 대체합니다.
 *
 *  3. <Navigate to="/dept" replace />
 *     "/" 접속 시 "/dept"로 자동 이동합니다.
 *     replace: 히스토리를 교체하여 뒤로가기가 자연스럽게 동작합니다.
 */
import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

import Toast       from './components/common/Toast.jsx';
import DeptSection from './components/department/DeptSection.jsx';
import EmpSection  from './components/employee/EmpSection.jsx';

export default function App() {

    // activeTab 상태는 제거되었습니다.
    // URL(/dept, /emp)이 현재 활성 탭을 대신 기억합니다.

    // 알림 메시지 상태는 그대로 유지합니다.
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    const showToast = (message, isError = false) => {
        setToast({ message, type: isError ? 'error' : 'success', visible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    return (
        <div className="bg-slate-100 text-slate-700 min-h-screen p-5">

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
                    
                    <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold
                        ${import.meta.env.VITE_APP_ENV === 'production'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-700'
                        }`}>
                        {import.meta.env.VITE_APP_ENV ?? 'unknown'} 환경
                    </span>
                </header>

                {/* ── 탭 메뉴: button → NavLink ─────────────────────────
                    NavLink는 HTML <a> 태그처럼 생겼지만 페이지를 새로고침하지 않습니다.
                    className에 함수를 전달하면 isActive(현재 URL 일치 여부)를 받을 수 있습니다.
                    isActive가 true이면 기존 'active' 클래스를 추가하여 탭을 강조합니다.
                */}
                <nav className="flex border-b-2 border-slate-200 mb-8">

                    <NavLink
                        to="/dept"
                        className={({ isActive }) =>
                            `tab-button px-6 py-3 font-semibold text-slate-400
                             border-b-4 border-transparent -mb-0.5
                             hover:bg-slate-50 hover:text-slate-600
                             transition-all duration-300
                             ${isActive ? 'active' : ''}`
                        }
                    >
                        부서 관리 (Department)
                    </NavLink>

                    <NavLink
                        to="/emp"
                        className={({ isActive }) =>
                            `tab-button px-6 py-3 font-semibold text-slate-400
                             border-b-4 border-transparent -mb-0.5
                             hover:bg-slate-50 hover:text-slate-600
                             transition-all duration-300
                             ${isActive ? 'active' : ''}`
                        }
                    >
                        직원 관리 (Employee)
                    </NavLink>
                </nav>

                {/* ── 라우트 정의 ───────────────────────────────────────
                    <Routes>는 현재 URL을 보고 일치하는 <Route> 하나만 렌더링합니다.
                    기존 조건부 렌더링({activeTab === 'dept' && <DeptSection />})과 같은 역할입니다.
                */}
                <Routes>
                    {/* "/" 접속 시 "/dept"로 자동 이동 (replace: 히스토리 교체) */}
                    <Route path="/" element={<Navigate to="/dept" replace />} />

                    {/* /dept → 부서 관리 섹션 */}
                    <Route path="/dept" element={<DeptSection showToast={showToast} />} />

                    {/* /emp → 직원 관리 섹션 */}
                    <Route path="/emp"  element={<EmpSection  showToast={showToast} />} />
                </Routes>
            </div>
        </div>
    );
}
