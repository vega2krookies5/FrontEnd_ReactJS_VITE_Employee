/**
 * employeeApi.js — 직원(Employee) API 통신
 *
 * React 버전에서 달라진 점
 * ─────────────────────────────────────────────────────────────
 * ECMAScript(org_js) 버전: 에러 발생 시 handleApiError()로 DOM에 직접 메시지를 표시했습니다.
 * React 버전:              에러를 throw만 하고, 화면 표시는 컴포넌트가 담당합니다.
 * ─────────────────────────────────────────────────────────────
 */

const checkResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: `HTTP 오류! 상태 코드: ${response.status}`,
        }));
        throw new Error(errorData?.message ?? `HTTP 오류! 상태 코드: ${response.status}`);
    }
    return response;
};

export class EmployeeApi {
    #baseUrl = 'http://localhost:8080/api/employees';

    // 전체 직원 목록 조회 — GET /api/employees
    async getAll() {
        const response = await fetch(this.#baseUrl);
        await checkResponse(response);
        return response.json();
    }

    // 직원 + 부서 정보 함께 조회 — GET /api/employees/departments
    async getAllWithDepartments() {
        const response = await fetch(`${this.#baseUrl}/departments`);
        await checkResponse(response);
        return response.json();
    }

    // ID로 직원 단건 조회 — GET /api/employees/{id}
    async getById(id) {
        const response = await fetch(`${this.#baseUrl}/${id}`);
        if (response.status === 404) return null;
        await checkResponse(response);
        return response.json();
    }

    // 이메일로 직원 조회 — GET /api/employees/email/{email}
    async getByEmail(email) {
        const response = await fetch(`${this.#baseUrl}/email/${email}`);
        if (response.status === 404) return null;
        await checkResponse(response);
        return response.json();
    }

    // 직원 생성 — POST /api/employees
    async create(employeeData) {
        const response = await fetch(this.#baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...employeeData }),
        });
        await checkResponse(response);
        return response.json();
    }

    // 직원 수정 — PUT /api/employees/{id}
    async update(id, employeeData) {
        const response = await fetch(`${this.#baseUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...employeeData }),
        });
        await checkResponse(response);
        return response.json();
    }

    // 직원 삭제 — DELETE /api/employees/{id}
    async delete(id) {
        const response = await fetch(`${this.#baseUrl}/${id}`, { method: 'DELETE' });
        await checkResponse(response);
        return true;
    }
}
