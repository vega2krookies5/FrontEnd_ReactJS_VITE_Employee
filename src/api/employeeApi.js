/**
 * employeeApi.js — 직원(Employee) API 통신
 *
 * ─── fetch → axios 변경 후 달라진 점 ─────────────────────────────────
 *
 *  1. checkResponse() 함수 제거
 *     axios는 2xx 이외의 응답에서 자동으로 에러를 throw합니다.
 *     수동으로 응답 상태를 확인할 필요가 없습니다.
 *
 *  2. response.json() → response.data
 *     axios는 응답 본문을 자동으로 파싱하여 response.data에 담습니다.
 *     JSON.parse나 .json() 호출이 필요 없습니다.
 *
 *  3. headers / JSON.stringify 제거
 *     axiosInstance에 Content-Type이 공통 설정되어 있고,
 *     객체를 body로 전달하면 axios가 자동으로 JSON.stringify합니다.
 *
 *  4. 쿼리 파라미터: URLSearchParams → params 옵션
 *     axios.get(url, { params: { key: value } }) 으로 간결하게 작성합니다.
 *
 *  5. 404 처리: response.status 확인 → catch로 처리
 *     axios는 404도 에러로 throw하므로 catch 블록에서 처리합니다.
 */
import axios from './axiosInstance.js';

export class EmployeeApi {
    #base = '/api/employees';

    // 전체 직원 목록 조회 — GET /api/employees
    async getAll() {
        const { data } = await axios.get(this.#base);
        return data;
    }

    // 직원 + 부서 정보 함께 조회 — GET /api/employees/departments
    async getAllWithDepartments() {
        const { data } = await axios.get(`${this.#base}/departments`);
        return data;
    }

    // ID로 직원 단건 조회 — GET /api/employees/{id}
    // 404이면 null 반환, 그 외 에러는 그대로 throw
    async getById(id) {
        try {
            const { data } = await axios.get(`${this.#base}/${id}`);
            return data;
        } catch (err) {
            if (err.response?.status === 404) return null;
            throw err;
        }
    }

    // 이메일로 직원 조회 — GET /api/employees/email/{email}
    async getByEmail(email) {
        try {
            const { data } = await axios.get(`${this.#base}/email/${email}`);
            return data;
        } catch (err) {
            if (err.response?.status === 404) return null;
            throw err;
        }
    }

    // 직원 생성 — POST /api/employees
    async create(employeeData) {
        const { data } = await axios.post(this.#base, employeeData);
        return data;
    }

    // 직원 수정 — PUT /api/employees/{id}
    async update(id, employeeData) {
        const { data } = await axios.put(`${this.#base}/${id}`, employeeData);
        return data;
    }

    // 페이징 직원 목록 조회 — GET /api/employees/page
    // params 옵션: axios가 자동으로 ?pageNo=0&pageSize=5&... 쿼리 문자열을 만들어줍니다.
    async getPage({ pageNo = 0, pageSize = 5, sortBy = 'id', sortDir = 'asc' } = {}) {
        const { data } = await axios.get(`${this.#base}/page`, {
            params: { pageNo, pageSize, sortBy, sortDir },
        });
        return data;
        // 응답 구조: { content, pageNo, pageSize, totalElements, totalPages, last }
    }

    // 직원 삭제 — DELETE /api/employees/{id}
    async delete(id) {
        await axios.delete(`${this.#base}/${id}`);
        return true;
    }
}
