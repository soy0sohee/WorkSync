import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { WSCard } from "../../../components/common/CommonWidgets";
import s from "./ApprovalFormPanel.module.css";

// 지출 결의서
// formValues: 현재 입력값 객체
// setFormValues: 입력값 업데이트 함수
function ExpenseForm({ formValues, setFormValues }) {
  // 사용 내역 행 목록 (처음엔 빈 행 1개)
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      date: "",
      category: "",
      description: "",
      amount: "",
      note: "",
    },
  ]);

  // "+ 사용 내역 추가" 버튼 클릭 시 빈 행 하나 추가
  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: "",
        category: "",
        description: "",
        amount: "",
        note: "",
      },
    ]);

  // 휴지통 버튼 클릭 시 해당 행 삭제
  const delRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  // 각 셀 입력값 변경 시 해당 행의 특정 key 값을 업데이트
  const updateRow = (id, key, value) => {
    const updated = rows.map((r) => (r.id === id ? { ...r, [key]: value } : r));
    setRows(updated);
    // 부모 ApprovalCreatePage의 formValues에도 반영
    setFormValues((prev) => ({ ...prev, items: updated }));
  };

  // 금액 합계 계산 (amount를 숫자로 변환 후 합산)
  const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const CATEGORIES = ["물품구입비", "교통비", "식비", "숙박비", "기타"];

  return (
    <WSCard
      title="사용 내역"
      subtitle="영수증은 첨부파일 또는 별도로 제출하세요"
    >
      {/* 행 추가 버튼 */}
      <button onClick={addRow} className={s.addRowBtn} type="button">
        <Plus size={14} />
        사용 내역 추가
      </button>

      {/* 행 목록 렌더링 */}
      {rows.map((row) => (
        <div key={row.id} className={s.tableRow}>
          {/* 일자 */}
          <input
            type="date"
            value={row.date}
            onChange={(e) => updateRow(row.id, "date", e.target.value)}
            className={s.tableInput}
            style={{ maxWidth: 140 }}
          />
          {/* 분류 선택 */}
          <select
            value={row.category}
            onChange={(e) => updateRow(row.id, "category", e.target.value)}
            className={s.tableSelect}
          >
            <option value="">분류 선택</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {/* 사용 내역 */}
          <input
            type="text"
            placeholder="사용 내역"
            value={row.description}
            onChange={(e) => updateRow(row.id, "description", e.target.value)}
            className={s.tableInput}
          />
          {/* 금액 */}
          <input
            type="number"
            placeholder="0"
            value={row.amount}
            onChange={(e) => updateRow(row.id, "amount", e.target.value)}
            className={s.tableInput}
            style={{ maxWidth: 100 }}
          />
          {/* 비고 */}
          <input
            type="text"
            placeholder="비고"
            value={row.note}
            onChange={(e) => updateRow(row.id, "note", e.target.value)}
            className={s.tableInput}
            style={{ maxWidth: 100 }}
          />
          {/* 행 삭제 버튼 */}
          <button
            onClick={() => delRow(row.id)}
            className={s.delRowBtn}
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {/* 합계 표시 */}
      <div className={s.totalRow}>
        <span className={s.totalLabel}>금액 합계</span>
        <span className={s.totalValue}>{total.toLocaleString()}원</span>
      </div>
    </WSCard>
  );
}

function BusinessTripForm() {
  return <div>출장 신청서 준비 중</div>;
}
function PurchaseForm() {
  return <div>구매 요청서 준비 중</div>;
}
function LeaveForm() {
  return <div>연차 신청서 준비 중</div>;
}

// 메인 패널
export default function ApprovalFormPanel({
  selectedForm,
  formValues,
  setFormValues,
}) {
  if (!selectedForm) return null;

  const { formType } = selectedForm;

  return (
    <div className={s.panel}>
      <div className={s.panelHeader}>
        <h2 className={s.panelTitle}>{formName}</h2>
        <p className={s.panelSub}>양식 내용을 입력하세요.</p>
      </div>
      {formType === "EXPENSE" && (
        <ExpenseForm formValues={formValues} setFormValues={setFormValues} />
      )}
      {formType === "LEAVE" && (
        <LeaveForm formValues={formValues} setFormValues={setFormValues} />
      )}
      {formType === "PURCHASE" && (
        <PurchaseForm formValues={formValues} setFormValues={setFormValues} />
      )}
      {formType === "BUSINESS_TRIP" && (
        <BusinessTripForm
          formValues={formValues}
          setFormValues={setFormValues}
        />
      )}
    </div>
  );
}
