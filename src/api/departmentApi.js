/**
 * departmentApi.js — 부서(Department) API 통신
 *
 * React 버전에서 달라진 점
 * ─────────────────────────────────────────────────────────────
 * ECMAScript(org_js) 버전: 에러 발생 시 handleApiError()로 DOM에 직접 메시지를 표시했습니다.
 * React 버전:              에러를 throw만 하고, 화면 표시는 컴포넌트가 담당합니다.
 *                          (React에서 DOM을 직접 건드리면 안 됩니다)
 * ─────────────────────────────────────────────────────────────
 */

// ── HTTP 응답 확인 (내부 공통 함수) ──────────────────────────────────
// 200~299 범위가 아닌 응답(오류)이면 에러를 던집니다.
const checkResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: `HTTP 오류! 상태 코드: ${response.status}`,
        }));
        throw new Error(errorData?.message ?? `HTTP 오류! 상태 코드: ${response.status}`);
    }
    return response;
};

// ── DepartmentApi 클래스 ──────────────────────────────────────────────
// org_js 버전과 동일한 클래스 구조입니다.
// 차이점: handleApiError 제거 → 에러를 throw하여 컴포넌트에서 처리합니다.
export class DepartmentApi {
    #baseUrl = 'http://localhost:8080/api/departments';

    // 전체 부서 목록 조회 — GET /api/departments
    async getAll() {
        const response = await fetch(this.#baseUrl);
        await checkResponse(response);
        return response.json();
    }

    // ID로 부서 단건 조회 — GET /api/departments/{id}
    async getById(id) {
        const response = await fetch(`${this.#baseUrl}/${id}`);
        if (response.status === 404) return null; // 없는 부서 → null
        await checkResponse(response);
        return response.json();
    }

    // 부서 생성 — POST /api/departments
    async create(data) {
        const response = await fetch(this.#baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        await checkResponse(response);
        return response.json();
    }

    // 부서 수정 — PUT /api/departments/{id}
    async update(id, data) {
        const response = await fetch(`${this.#baseUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        await checkResponse(response);
        return response.json();
    }

    // 부서 삭제 — DELETE /api/departments/{id}
    async delete(id) {
        const response = await fetch(`${this.#baseUrl}/${id}`, { method: 'DELETE' });
        await checkResponse(response);
        return true;
    }
}
