/**
 * fetchClient.js — fetch 공통 유틸리티
 *
 * ─── axios → fetch 변경 후 달라진 점 ──────────────────────────────────
 *  axios 라이브러리를 제거하고 브라우저 내장 fetch()를 사용합니다.
 *  이 파일은 모든 API 파일이 공통으로 사용하는 두 가지를 제공합니다.
 *
 *  1. BASE_URL — 서버 주소 (한 곳에서 관리)
 *  2. checkResponse() — 응답 상태 확인 함수
 *
 * ─── fetch의 에러 처리 특성 ──────────────────────────────────────────
 *  fetch는 4xx/5xx 응답도 성공으로 처리합니다.
 *  (네트워크 자체가 끊기거나 요청 자체가 실패할 때만 에러를 throw)
 *
 *  fetch 기본 동작:
 *    200 OK        → 성공 (정상)
 *    404 Not Found → 성공 (!) → response.ok = false
 *    500 Error     → 성공 (!) → response.ok = false
 *
 *  따라서 checkResponse()로 response.ok를 직접 확인해야 합니다.
 */

// ── 서버 주소 ─────────────────────────────────────────────────────────
// 모든 API 파일에서 이 상수를 import해서 사용합니다.
// 서버 주소가 바뀌면 이 한 줄만 수정하면 됩니다.
export const BASE_URL = 'http://localhost:8080';

// ── 응답 상태 확인 함수 ───────────────────────────────────────────────
//
// fetch 응답에서 에러를 감지하고 서버 메시지로 에러를 throw합니다.
//
// response.ok: HTTP 상태 코드가 200~299이면 true, 그 외면 false
//
// 사용법:
//   const response = await fetch(url);
//   await checkResponse(response);   ← 에러가 있으면 여기서 throw
//   return response.json();
//
export const checkResponse = async (response) => {
    if (!response.ok) {
        // 서버가 보낸 에러 응답 본문을 읽습니다.
        // 읽기 실패(빈 응답 등)는 catch(() => ({}))로 빈 객체로 처리합니다.
        const errorData = await response.json().catch(() => ({}));

        // 서버 메시지가 있으면 그대로 사용, 없으면 기본 메시지를 사용합니다.
        throw new Error(errorData?.message ?? `HTTP 오류: ${response.status}`);
    }
    return response;
};
