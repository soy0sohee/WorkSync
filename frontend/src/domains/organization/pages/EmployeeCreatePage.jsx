import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../../../store/AuthContext";
import { ArrowLeft, Upload, User, Send, Paperclip } from "lucide-react";
import {
  WSAvatar,
  WSButton,
  WSCard,
} from "../../../components/common/CommonWidgets";
import {
  WSInput,
  WSFormField,
  WSSelect,
  WSTextarea,
  WSFileUploadZone,
  WSDatepicker,
  WSFileList,
} from "../../../components/common/FormComponents";
import s from "./EmployeeCreatePage.module.css";
import {
  getDepartments,
  getEmployee,
  uploadProfileImage,
  createEmpoyee,
  editDepartments,
} from "../services/organizationListApi";

// 직급
const JOB_GRADE_OPTIONS = [
  { key: "todo", label: "사원" },
  { key: "inProgress", label: "주임" },
  { key: "done", label: "대리" },
  { key: "done", label: "과장" },
  { key: "done", label: "부장" },
  { key: "done", label: "대표" },
];

// 권한
const ROLE_OPTIONS = [
  { key: "todo", label: "사원" },
  { key: "inProgress", label: "주임" },
  { key: "done", label: "대리" },
];

// 이미지
const MAX_SIZE_MB = 50;
const ALLOWED_EXT = [".png", ".jpg"];

export default function EmployeeAdd() {
  const { accessToken } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    emp_no: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    job_grade: "",
    role: "",
    department_id: "",
  });
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [departments, setDepartments] = useState([]);

  // 부서
  useEffect(() => {
    if (!accessToken) return;
    getDepartments(accessToken).then((data) => {
      // console.log(data);
      setDepartments(Array.isArray(data.data) ? data.data : []);
    });
  }, [accessToken]);
  const DEPT_OPTIONS = departments.map((dept) => ({
    key: dept.id,
    label: dept.name,
  }));

  const isValid = [
    form.emp_no.trim().length > 0,
    form.name.trim().length > 0,
    form.email.trim().length > 0,
    form.password.trim().length > 0,
  ];

  async function handleSubmit() {
    navigate("/organization");
  }

  return (
    <div>
      <div className={s.header}>
        <button onClick={() => navigate("/organization")} className={s.backBtn}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={s.pageTitle}>직원 추가</h1>
          <p className={s.pageSub}>새로운 직원 정보를 입력하세요</p>
        </div>
      </div>

      <div className={s.layout}>
        <div className={s.colMain}>
          <WSCard title="개인 정보" className={s.card}>
            <div className={s.formGrid}>
              <div className={s.row2}>
                <div>
                  <WSFormField label="사번" required>
                    <WSInput
                      type="text"
                      value={form.emp_no}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, emp_no: e.target.value }))
                      }
                      placeholder="사번 입력"
                      className={s.input}
                    />
                  </WSFormField>
                </div>
                <div>
                  <WSFormField label="이름" required>
                    <WSInput
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="이름 입력"
                      className={s.input}
                    />
                  </WSFormField>
                </div>
              </div>

              <div className={s.row2}>
                <div>
                  <WSFormField label="이메일" required>
                    <WSInput
                      type="text"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="example@gmail.com"
                      className={s.input}
                    />
                  </WSFormField>
                </div>
                <div>
                  <WSFormField label="비밀번호" required>
                    <WSInput
                      type="text"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="비밀번호 입력"
                      className={s.input}
                    />
                  </WSFormField>
                </div>
              </div>

              <div className={s.row2}>
                <div>
                  <WSFormField label="연락처" required>
                    <WSInput
                      type="text"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="000-0000-0000"
                      className={s.input}
                    />
                  </WSFormField>
                </div>
                <div>
                  <WSFormField label="입사일" required>
                    <WSDatepicker
                      startValue={form.start_date}
                      endValue={form.due_date}
                      onStartChange={(e) =>
                        setForm((p) => ({ ...p, start_date: e.target.value }))
                      }
                      onEndChange={(e) =>
                        setForm((p) => ({ ...p, due_date: e.target.value }))
                      }
                    />
                  </WSFormField>
                </div>
              </div>
            </div>
          </WSCard>

          <WSCard title="조직 배정" className={s.card}>
            <div className={s.row3}>
              <div>
                <WSFormField label="소속 부서" required>
                  <WSSelect
                    placeholder="부서 선택"
                    value={form.department_id}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, department_id: e.target.value }))
                    }
                    options={DEPT_OPTIONS.map((m) => ({
                      value: m.id,
                      label: m.label,
                    }))}
                  />
                </WSFormField>
              </div>
              <div>
                <WSFormField label="직급" required>
                  <WSSelect
                    placeholder="직급 선택"
                    value={form.job_grade}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, job_grade: e.target.value }))
                    }
                    options={JOB_GRADE_OPTIONS.map((m) => ({
                      value: m.id,
                      label: m.label,
                    }))}
                  />
                </WSFormField>
              </div>
              <div>
                <WSFormField label="권한" required>
                  <WSSelect
                    placeholder="권한 선택"
                    value={form.role}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, role: e.target.value }))
                    }
                    options={JOB_GRADE_OPTIONS.map((m) => ({
                      value: m.id,
                      label: m.label,
                    }))}
                  />
                </WSFormField>
              </div>
            </div>
          </WSCard>
        </div>

        <div>
          <WSCard title="프로필 이미지" className={`${s.card} ${s.colSide}`}>
            {/* <WSFileUploadZone
              onFilesAdded={addFiles}
              isDragging={isDragging}
              onDragStateChange={setIsDragging}
              icon={<Paperclip size={28} />}
              accept=".jpg, ,png"
              label="파일을 드래그하거나 클릭하여 업로드"
              helperText="JPG, PNG - 최대 50MB"
            />

            <WSFileList
              files={files.map(({ file }) => file)}
              onRemove={removeFiles}
            /> */}
          </WSCard>

          <div className={s.actionsCol}>
            <WSButton
              label="직원 등록"
              icon={<Send size={16} />}
              onClick={handleSubmit}
              disabled={!isValid}
              className={s.submitBtn}
            />
            <button
              onClick={() => navigate("/organization")}
              className={s.cancelBtn}
            >
              취소하고 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
