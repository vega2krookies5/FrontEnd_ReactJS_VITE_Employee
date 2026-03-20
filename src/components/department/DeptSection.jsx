/**
 * DeptSection.jsx — 부서 관리 섹션 (컨테이너 컴포넌트)
 *
 * ─── 이 컴포넌트가 하는 일 ────────────────────────────────────────────
 *  부서와 관련된 모든 데이터와 API 호출을 한 곳에서 관리합니다.
 *  그리고 그 데이터를 DeptForm, DeptSearch, DeptList에 props로 전달합니다.
 *
 *  [기존 ECMAScript 방식]
 *    dept_runner_v2.js 하나의 파일에 모든 코드가 섞여 있었습니다.
 *    (폼 제출 처리 + 목록 렌더링 + API 호출이 한 파일에)
 *
 *  [React 방식]
 *    DeptSection  → 데이터 관리 + API 호출 담당 (이 파일)
 *    DeptForm     → 등록/수정 폼 UI 담당
 *    DeptSearch   → 단건 조회 UI 담당
 *    DeptList     → 목록 테이블 UI 담당
 *
 * ─── React 핵심 개념: useEffect ──────────────────────────────────────
 *  useEffect(() => { 실행할 코드 }, [의존성 배열]);
 *
 *  의존성 배열이 빈 배열([])이면: 컴포넌트가 처음 화면에 나타날 때 딱 한 번만 실행합니다.
 *  기존 ECMAScript의 DOMContentLoaded 이벤트와 같은 역할입니다.
 *
 * ─── props ────────────────────────────────────────────────────────────
 *  showToast: App.jsx에서 전달받은 알림 함수
 */

// useState: 데이터 상태 관리 / useEffect: 컴포넌트 생명주기 처리
import { useState, useEffect } from 'react';
import { DepartmentApi } from '../../api/departmentApi.js';
import DeptForm   from './DeptForm.jsx';
import DeptSearch from './DeptSearch.jsx';
import DeptList   from './DeptList.jsx';

// API 인스턴스를 컴포넌트 밖에서 만듭니다.
// (컴포넌트가 다시 렌더링될 때마다 새로 만들지 않아도 됩니다)
const departmentApi = new DepartmentApi();

export default function DeptSection({ showToast }) {

    // ── 상태(State) 선언 ──────────────────────────────────────────────

    // 부서 목록 (배열). 처음에는 빈 배열로 시작합니다.
    const [departments, setDepartments] = useState([]);

    // 로딩 중 여부. true이면 "불러오는 중..." 표시
    const [loading, setLoading] = useState(false);

    // 현재 수정 중인 부서 객체.
    // null이면 "부서 등록" 모드, 부서 객체가 있으면 "부서 수정" 모드입니다.
    const [editingDept, setEditingDept] = useState(null);

    // ── 컴포넌트가 처음 화면에 나타날 때 부서 목록을 불러옵니다 ────────
    // 기존 ECMAScript: dept_runner_v2.js가 로드되면서 자동으로 실행됐습니다.
    // React: useEffect의 [] = "처음 한 번만 실행"을 의미합니다.
    useEffect(() => {
        loadDepartments();
    }, []); // ← 빈 배열: 마운트(첫 렌더링) 시에만 실행

    // ── API 호출 함수들 ───────────────────────────────────────────────

    // 부서 전체 목록 불러오기
    const loadDepartments = async () => {
        setLoading(true); // 로딩 시작
        try {
            const data = await departmentApi.getAll();
            setDepartments(data); // 받아온 데이터로 departments 상태를 업데이트
        } catch (err) {
            showToast(err.message || '부서 목록 로드 실패', true);
        } finally {
            setLoading(false); // 로딩 종료 (성공/실패 관계없이)
        }
    };

    // 부서 생성 또는 수정 처리
    // DeptForm에서 폼 제출 시 호출됩니다.
    const handleSubmit = async (formData) => {
        try {
            if (editingDept) {
                // editingDept가 있으면 수정 모드
                await departmentApi.update(editingDept.id, formData);
                showToast('부서가 수정되었습니다.');
            } else {
                // editingDept가 null이면 생성 모드
                await departmentApi.create(formData);
                showToast('부서가 생성되었습니다.');
            }
            setEditingDept(null);    // 수정 모드 종료 → 등록 폼으로 돌아감
            await loadDepartments(); // 목록 새로고침
        } catch (err) {
            showToast(err.message || '저장 실패', true);
        }
    };

    // 부서 삭제 처리
    // DeptList에서 삭제 버튼 클릭 시 호출됩니다.
    const handleDelete = async (id) => {
        if (!confirm(`정말로 ID ${id} 부서를 삭제하시겠습니까?`)) return;
        try {
            await departmentApi.delete(id);
            showToast('부서가 삭제되었습니다.');
            await loadDepartments(); // 목록 새로고침
        } catch (err) {
            showToast(err.message || '삭제 실패', true);
        }
    };

    // ── 화면 렌더링 ──────────────────────────────────────────────────
    // <>...</> = React Fragment. DOM에 div를 추가하지 않고 여러 요소를 묶을 때 사용합니다.
    return (
        <>
            {/*
                DeptForm에게 데이터(props)를 전달합니다.
                editingDept : 수정 중인 부서 (null이면 등록 모드)
                onSubmit    : 폼 제출 시 호출할 함수
                onCancel    : 수정 취소 시 editingDept를 null로 초기화
            */}
            <DeptForm
                editingDept={editingDept}
                onSubmit={handleSubmit}
                onCancel={() => setEditingDept(null)}
            />

            {/*
                DeptSearch에게 전체 부서 목록을 전달합니다.
                (select 드롭다운 옵션을 채우기 위해서)
            */}
            <DeptSearch
                departments={departments}
                showToast={showToast}
            />

            {/*
                DeptList에게 목록 데이터와 이벤트 핸들러를 전달합니다.
                onEdit   : 수정 버튼 클릭 시 → editingDept를 해당 부서로 설정
                onDelete : 삭제 버튼 클릭 시 → handleDelete 호출
            */}
            <DeptList
                departments={departments}
                loading={loading}
                onEdit={setEditingDept}
                onDelete={handleDelete}
                onRefresh={loadDepartments}
            />
        </>
    );
}
