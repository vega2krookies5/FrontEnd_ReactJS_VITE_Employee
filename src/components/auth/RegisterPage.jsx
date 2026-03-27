/**
 * RegisterPage.jsx — 회원 가입 페이지
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  이름, 이메일, 비밀번호, 권한을 입력받아 계정을 생성합니다.
 *  성공 시 /login 페이지로 이동합니다.
 *
 * ─── 권한(roles) 형식 ────────────────────────────────────────────────
 *  서버가 요구하는 형식: 'ROLE_USER' 또는 'ROLE_ADMIN'
 *  복수 권한: 'ROLE_ADMIN,ROLE_USER' (쉼표 구분, 공백 없음)
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: App.jsx에서 내려받은 알림 함수
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

const inputClass =
    'w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm bg-white ' +
    'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';

export default function RegisterPage({ showToast }) {

    const [form, setForm] = useState({
        name:     '',
        email:    '',
        password: '',
        roles:    'ROLE_USER', // 기본 권한
    });
    const [loading, setLoading] = useState(false);

    const { register } = useAuthStore();
    const navigate     = useNavigate();

    // 입력 필드가 바뀔 때마다 해당 key만 업데이트합니다.
    // e.target.name이 form의 key와 일치해야 합니다.
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);                 // authStore → authApi → 서버
            showToast('회원가입 완료. 로그인해 주세요.');
            navigate('/login');                   // 성공 시 로그인 페이지로 이동
        } catch (err) {
            showToast(err.message || '회원가입에 실패했습니다.', true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-4">
            <div className="border border-slate-200 rounded-xl p-8">

                <h3 className="text-lg font-semibold text-slate-700 border-l-4 border-blue-400 pl-3 mb-6">
                    회원 가입
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">이름</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="예: 홍길동"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="예: user@aa.com"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 font-semibold text-sm text-slate-500">권한</label>
                        <select
                            name="roles"
                            value={form.roles}
                            onChange={handleChange}
                            className={`${inputClass} appearance-none`}
                        >
                            <option value="ROLE_USER">ROLE_USER (일반 사용자)</option>
                            <option value="ROLE_ADMIN">ROLE_ADMIN (관리자)</option>
                            <option value="ROLE_ADMIN,ROLE_USER">ROLE_ADMIN,ROLE_USER (관리자+사용자)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-success w-full disabled:opacity-50"
                    >
                        {loading ? '처리 중...' : '회원 가입'}
                    </button>
                </form>

                <p className="text-sm text-slate-500 mt-5 text-center">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline font-semibold">
                        로그인
                    </Link>
                </p>

            </div>
        </div>
    );
}
