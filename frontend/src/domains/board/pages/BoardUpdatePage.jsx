import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send } from "lucide-react";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  AlignLeft,
  Paperclip,
  CheckCircle,
  Image,
  Trash2,
} from "lucide-react";
import { WSCard, WSButton } from "../../../components/common/CommonWidgets";
import {
  WSInput,
  WSSelect,
  WSTextarea,
  WSFileUploadZone,
  WSCalendarpicker,
  WSFileList,
} from "../../../components/common/FormComponents";
import s from "./BoardCreatePage.module.css";
import { getMyInfo, getPostById } from "../services/boardApi";
import useAuthContext from "../../../store/AuthContext";

const CATEGORY_OPTIONS = [
  { value: "notice", label: "공지사항", color: "#EF4444" },
  { value: "dept", label: "부서게시판", color: "#8B5CF6" },
  { value: "free", label: "자유게시판", color: "#10B981" },
];

const fileIconColor = {
  PDF: "#EF4444",
  XLSX: "#10B981",
  PPTX: "#F59E0B",
  DOCX: "#3B82F6",
  PNG: "#06B6D4",
  ZIP: "#F97316",
  default: "#6B7280",
};

const TOOLBAR_ITEMS = ["굵게", "기울임", "밑줄", "목록"];

export default function BoardNew() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("free");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [boardName, setBoardName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { accessToken } = useAuthContext();
  const { boardId, postId } = useParams();
  const [myDepartmentName, setMyDepartmentName] = useState("");
  const MAX_CHARS = 3000;

  //파일 추가
  const addFiles = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles.map((f) => ({ file: f }))]);
  };

  //파일 삭제(index)
  const removeFiles = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isValid =
    title.trim().length > 0 && category !== "" && content.trim().length > 0;

  // function addFiles(newFiles) {
  //   const mapped = newFiles.map((f, i) => ({
  //     id: `file-${Date.now()}-${i}`,
  //     name: f.name,
  //     size:
  //       f.size > 1024 * 1024
  //         ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
  //         : `${(f.size / 1024).toFixed(0)} KB`,
  //     type: f.name.split(".").pop()?.toUpperCase() || "FILE",
  //   }));
  //   setFiles((prev) => [...prev, ...mapped].slice(0, 10));
  // }
  const getCategoryValue = (boardName) => {
    const found = CATEGORY_OPTIONS.find(
      (opt) => opt.label.replace(/\s/g, "") === boardName.replace(/\s/g, ""),
    );
    return found ? found.value : "free";
  };

  useEffect(() => {
    getPostById(boardId, postId, accessToken).then((data) => {
      console.log("카테고리 세팅값:", getCategoryValue(data.boardName));
      setTitle(data.title);
      setContent(data.content);
      setCategory(getCategoryValue(data.boardName));
    });

    // 내 정보 조회(부서명 세팅)
    getMyInfo(accessToken).then((data) => {
      console.log("부서명:", data.departmentName);
      setMyDepartmentName(data.departmentName);
    });
  }, []);

  function handleFileDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileInput(e) {
    if (e.target.files) addFiles(Array.from(e.target.files));
  }

  function handleSubmit() {
    if (!isValid) return;
    setSubmitted(true);
    setTimeout(() => navigate("/board"), 1800);
  }

  if (submitted) {
    return (
      <div className={s.successScreen}>
        <div className={s.successCard}>
          <div className={s.successIcon}>
            <CheckCircle size={40} className={s.successIconGlyph} />
          </div>
          <div className={s.successCopy}>
            <p className={s.successTitle}>게시글이 등록되었습니다</p>
            <p className={s.successDesc}>게시판으로 이동합니다...</p>
          </div>
          <div className={s.successBadge}>게시판으로 이동 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.root}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <button onClick={() => navigate("/board")} className={s.backBtn}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className={s.pageTitle}>게시글 수정</h1>
          </div>
        </div>
      </div>

      <div className={s.layout}>
        <div className={s.colMain}>
          <WSCard
            title="게시글 기본 정보"
            subtitle="게시판 분류와 제목을 입력하세요"
          >
            <div className={s.formGrid}>
              <div>
                <label className={s.label}>
                  게시판 분류 <span className={s.required}>*</span>
                </label>
                <div className={s.catRow}>
                  {CATEGORY_OPTIONS.map((opt) => {
                    const active = category === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setCategory(opt.value)}
                        className={`${s.catBtn} ${active ? s.catBtnActive : ""}`}
                        style={{
                          "--cat-color": opt.color,
                          "--cat-bg": opt.color + "15",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {category === "dept" && (
                  <div>
                    <label className={s.label}>부서명</label>
                    <input
                      type="text"
                      value={myDepartmentName}
                      readOnly
                      className={s.input}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={s.label}>
                  제목 <span className={s.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="게시글 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className={s.input}
                />
                <div className={s.charCount}>{title.length}/100</div>
              </div>
            </div>
          </WSCard>

          <div className={s.contentCardWrap}>
            <WSCard
              title="내용"
              subtitle="게시글 본문을 작성하세요"
              action={
                <span
                  className={`${s.contentCount} ${content.length > MAX_CHARS * 0.9 ? s.contentCountWarn : ""}`}
                >
                  {content.length}/{MAX_CHARS}
                </span>
              }
            >
              <div className={s.toolbar}>
                {TOOLBAR_ITEMS.map((btn, i) =>
                  btn === "|" ? (
                    <div key={i} className={s.toolbarSep} />
                  ) : (
                    <button key={i} className={s.toolbarBtn}>
                      {btn}
                    </button>
                  ),
                )}
              </div>
              <textarea
                placeholder="내용을 입력하세요. 팀원들과 공유하고 싶은 내용을 자유롭게 작성해 주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CHARS}
                className={s.textarea}
              />
            </WSCard>
          </div>
        </div>

        <div className={`${s.col} ${s.colSide}`}>
          <WSCard title="첨부파일">
            <WSFileUploadZone
              onFilesAdded={addFiles}
              isDragging={isDragging}
              onDragStateChange={setIsDragging}
              icon={<Paperclip size={28} />}
              accept=".pdf,.ppt,.xlsx,.pptx"
              label="파일을 드래그하거나 클릭하여 업로드"
              helperText="PDF, DOCX, XLSX, PPTX - 최대 50MB"
            />

            <WSFileList
              files={files.map(({ file }) => file)}
              onRemove={removeFiles}
            />
          </WSCard>

          <div className={s.actionsCol}>
            <WSButton
              label="작업 등록"
              icon={<Send size={16} />}
              onClick={handleSubmit}
              disabled={!isValid}
              className={s.submitBtn}
            />
            <button onClick={() => navigate("/board")} className={s.cancelBtn}>
              취소하고 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
