/**
 * main.jsx — React 앱 진입점 (Entry Point)
 *
 * ─── ECMAScript 방식 vs React 방식 비교 ───────────────────────────────
 *
 * [기존 ECMAScript] src/main.js
 *   import './style.css';
 *   import './js/dept_runner_v2.js';
 *   import './js/emp_runner_v2.js';
 *   → CSS와 JS 파일을 직접 import
 *
 * [React] src/main.jsx
 *   → createRoot()로 HTML의 <div id="root">에 React 앱 전체를 삽입합니다.
 *   → App 컴포넌트 하나만 여기서 렌더링하면, 나머지는 App이 알아서 처리합니다.
 *
 * ─────────────────────────────────────────────────────────────────────
 *
 * StrictMode란?
 *   개발 중에 문제가 될 수 있는 코드를 미리 경고해주는 React 도우미입니다.
 *   배포(build)에서는 자동으로 사라지므로 성능에 영향 없습니다.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';    // Tailwind CSS — ECMAScript 버전과 동일한 파일을 그대로 사용합니다.
import App from './App.jsx';

// document.getElementById('root') → index.html의 <div id="root">를 찾아서
// 그 안에 <App /> 컴포넌트를 그립니다.
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
