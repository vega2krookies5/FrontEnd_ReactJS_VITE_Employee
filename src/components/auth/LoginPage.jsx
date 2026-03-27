/**
 * LoginPage.jsx — 로그인 페이지
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  이메일과 비밀번호를 입력받아 로그인합니다.
 *  성공 시 /dept 페이지로 이동합니다.
 *  실패 시 Toast로 서버 에러 메시지를 표시합니다.
 *
 * ─── useNavigate ──────────────────────────────────────────────────────
 *  React Router가 제공하는 훅입니다.
 *  navigate('/dept') 를 호출하면 페이지를 새로고침 없이 /dept로 이동합니다.
 *  기존 HTML의 location.href = '/dept' 와 역할은 같지만
 *  SPA(Single Page Application) 방식으로 동작합니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: App.jsx에서 내려받은 알림 함수
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

// EmpForm.jsx와 동일한 input 스타일 재사용
const inputClass =
    'w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm bg-white ' +
    'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';

export default function LoginPage({ showToast }) {

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [loading,  setLoading]  = useState(false);

    const { login } = useAuthStore();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);         // authStore → authApi → 서버
            showToast('로그인 성공');
            navigate('/dept');                    // 성공 시 부서 관리 페이지로 이동
        } catch (err) {
            // axiosInstance 인터셉터가 서버 메시지로 err.message를 교체했습니다.
            showToast(err.message || '로그인에 실패했습니다.', true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-4">
            <div className="border border-slate-200 rounded-xl p-8">

                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3 mb-6">
                    로그인
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="예: admin@aa.com"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                            className={inputClass}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <p className="text-sm text-slate-500 mt-5 text-center">
                    계정이 없으신가요?{' '}
                    <Link to="/register" className="text-blue-500 hover:underline font-semibold">
                        회원가입
                    </Link>
                </p>

            </div>
        </div>
    );
}
