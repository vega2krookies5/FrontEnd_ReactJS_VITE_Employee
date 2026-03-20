/**
 * Toast.jsx — 알림 메시지 컴포넌트
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  기존 ECMAScript에서는 utils.js의 showMessage()가 DOM을 직접 건드렸습니다:
 *    document.getElementById('alert-success').classList.add('show');
 *
 *  React에서는 이 컴포넌트가 props로 받은 데이터에 따라 화면을 그립니다.
 *  DOM을 직접 건드리지 않습니다.
 *
 * ─── props(속성) ──────────────────────────────────────────────────────
 *  props = 부모 컴포넌트(App.jsx)가 전달해주는 데이터
 *
 *  { message, type, visible }
 *    message : 표시할 텍스트  (예: '부서가 생성되었습니다.')
 *    type    : 'success' → 초록색 / 'error' → 빨간색
 *    visible : true → 화면에 보임 / false → 숨김
 *
 * ─── CSS 애니메이션 ───────────────────────────────────────────────────
 *  src/style.css의 .alert와 .alert.show 클래스를 그대로 사용합니다.
 *  visible이 true이면 'show' 클래스를 추가하고, false이면 제거합니다.
 */
export default function Toast({ message, type, visible }) {

    // type에 따라 배경색을 결정합니다.
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-emerald-500';

    return (
        // 화면 우상단에 고정 (fixed)
        <div className="fixed top-5 right-5 z-50 w-72">
            {/*
                .alert 클래스: 기본 상태에서는 투명하고 오른쪽 밖에 위치합니다.
                .alert.show 클래스: 화면 안으로 슬라이드 인 됩니다.
                (src/style.css에서 CSS 애니메이션을 정의합니다)

                visible이 true이면 'show'를 추가, false이면 제거합니다.
            */}
            <div className={`alert rounded-lg px-5 py-4 text-white shadow-lg ${bgColor} ${visible ? 'show' : ''}`}>
                {message}
            </div>
        </div>
    );
}
