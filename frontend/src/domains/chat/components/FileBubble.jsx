import { getFileMeta } from "../../file/components/fileUtil";
import { Download } from "lucide-react";
import s from "../pages/ChatPage.module.css";

export function FileBubble({ file, onDownload }) {
  if (!file?.originalName) return null;
  const meta = getFileMeta(file.originalName);

  return (
    <div
      className={s.fileRow}
      onClick={() => {
        onDownload(file);
      }}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={`${file.originalName} 다운로드`}
    >
      <div className={s.fileLeft}>
        <div className={s.fileIcon} style={{ "--file-color": meta.color }}>
          {meta.label}
        </div>
        <div>
          <p className={s.fileName}>{file.originalName}</p>
          <p className={s.fileSize}>{file.fileSize}</p>
        </div>
      </div>
      <button
        className={s.attachDl}
        onClick={(e) => {
          e.stopPropagation();
          onDownload(file);
        }}
      >
        <Download size={18} />
      </button>
    </div>
  );
}
