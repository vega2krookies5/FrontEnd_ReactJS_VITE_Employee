/**
 * departmentApi.js — 부서(Department) API 통신
 *
 * ─── fetch → axios 변경 내용은 employeeApi.js 주석 참고 ───────────────
 *  동일한 패턴으로 변경되었습니다.
 *  checkResponse 제거 / response.data 사용 / params 옵션 사용
 */
import axios from './axiosInstance.js';

export class DepartmentApi {
    #base = '/api/departments';

    // 전체 부서 목록 조회 — GET /api/departments
    async getAll() {
        const { data } = await axios.get(this.#base);
        return data;
    }

    // ID로 부서 단건 조회 — GET /api/departments/{id}
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

    // 부서 생성 — POST /api/departments
    async create(departmentData) {
        const { data } = await axios.post(this.#base, departmentData);
        return data;
    }

    // 부서 수정 — PUT /api/departments/{id}
    async update(id, departmentData) {
        const { data } = await axios.put(`${this.#base}/${id}`, departmentData);
        return data;
    }

    // 페이징 부서 목록 조회 — GET /api/departments/page
    async getPage({ pageNo = 0, pageSize = 5, sortBy = 'id', sortDir = 'asc' } = {}) {
        const { data } = await axios.get(`${this.#base}/page`, {
            params: { pageNo, pageSize, sortBy, sortDir },
        });
        return data;
        // 응답 구조: { content, pageNo, pageSize, totalElements, totalPages, last }
    }

    // 부서 삭제 — DELETE /api/departments/{id}
    async delete(id) {
        await axios.delete(`${this.#base}/${id}`);
        return true;
    }
}
