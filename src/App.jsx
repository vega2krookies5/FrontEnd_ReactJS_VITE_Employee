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
 *
 * ─── 인증 추가 후 달라진 점 ───────────────────────────────────────────
 *
 *  4. ProtectedRoute
 *     token이 없으면 /login으로 리다이렉트합니다.
 *     /dept, /emp를 감싸서 로그인하지 않은 사용자의 접근을 막습니다.
 *
 *  5. 인증 라우트 추가
 *     /login    → LoginPage  (누구나 접근 가능)
 *     /register → RegisterPage (누구나 접근 가능)
 *
 *  6. 헤더에 사용자 정보 + 로그아웃 버튼
 *     로그인 상태에서만 표시됩니다.
 */
import { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';

import Toast        from './components/common/Toast.jsx';
import DeptSection  from './components/department/DeptSection.jsx';
import EmpSection   from './components/employee/EmpSection.jsx';
import LoginPage    from './components/auth/LoginPage.jsx';
import RegisterPage from './components/auth/RegisterPage.jsx';
import { useAuthStore } from './store/authStore.js';

// ── ProtectedRoute ────────────────────────────────────────────────────
// token이 없으면 /login으로 리다이렉트합니다.
// 사용법: <ProtectedRoute><컴포넌트 /></ProtectedRoute>
function ProtectedRoute({ children }) {
    const { token } = useAuthStore();
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {

    const { token, email, logout } = useAuthStore();
    const navigate = useNavigate();

    // 알림 메시지 상태는 그대로 유지합니다.
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    // 로그아웃: authStore 초기화 후 /login으로 이동
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

                    {/* 환경 배지 */}
                    <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold
                        ${import.meta.env.VITE_APP_ENV === 'production'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-700'
                        }`}>
                        {import.meta.env.VITE_APP_ENV ?? 'unknown'} 환경
                    </span>

                    {/* 로그인 상태에서만 사용자 이메일 + 로그아웃 버튼 표시 */}
                    {token && (
                        <div className="flex items-center justify-end mt-2">
                            <span className="text-sm text-slate-500 mr-3">{email}</span>
                            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                로그아웃
                            </button>
                        </div>
                    )}
                </header>

                {/* ── 탭 메뉴: 로그인 상태에서만 표시 ─────────────────
                    비로그인 시에는 로그인/회원가입 페이지만 표시하므로
                    탭 메뉴가 필요하지 않습니다.
                */}
                {token && (
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
                )}

                {/* ── 라우트 정의 ───────────────────────────────────────
                    공개 경로: /login, /register (토큰 없이 접근 가능)
                    보호 경로: /, /dept, /emp (ProtectedRoute로 감싸져 있음)
                             → 토큰 없으면 /login으로 자동 이동
                */}
                <Routes>
                    {/* 공개 경로 — 로그인/회원가입 */}
                    <Route path="/login"    element={<LoginPage    showToast={showToast} />} />
                    <Route path="/register" element={<RegisterPage showToast={showToast} />} />

                    {/* 보호 경로 — 로그인 필수 */}
                    <Route path="/" element={
                        <ProtectedRoute><Navigate to="/dept" replace /></ProtectedRoute>
                    } />
                    <Route path="/dept" element={
                        <ProtectedRoute><DeptSection showToast={showToast} /></ProtectedRoute>
                    } />
                    <Route path="/emp" element={
                        <ProtectedRoute><EmpSection showToast={showToast} /></ProtectedRoute>
                    } />
                </Routes>
            </div>
        </div>
    );
}
