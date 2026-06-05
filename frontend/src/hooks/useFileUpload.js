import { useState } from "react";
import { uploadFile, deleteFiles } from "../domains/file/services/FileApi";

export default function useFileUpload(accessToken, refType) {
  const [files, setFiles] = useState([]); //파일 목록
  const [uploadUrls, setUploadUrls] = useState([]); //DB에 저장할 URL 목록
  const [isDragging, setIsDragging] = useState(false); //드래그 상태
  const [fileId, setFileId] = useState(0);

  // 파일 추가
  const addFiles = async (newFiles) => {
    // 화면에 파일 추가
    setFiles((prev) => [...prev, ...newFiles.map((file) => ({ file }))]);

    // 스토리지에 업로드
    const fileData = new FormData();
    newFiles.forEach((file) => fileData.append("file", file));

    // 스토리지에 업로드가 있으면, URL sessionStorage 임시 저장
    if (result?.data.filePath) {
      const saved = JSON.parse(sessionStorage.getItem("uploadUrls") || "[]"); //불러오기
      const updated = [...saved, result.data.filePath];
      sessionStorage.setItem("uploadUrls", JSON.stringify(updated)); //저장하기
      setUploadUrls(updated);
      setFileId(result.data.id);
    }
  };

  // 파일 삭제
  const removeFiles = async (index) => {
    // 화면에 파일 제거
    setFiles((prev) => prev.filter((_, i) => i !== index));

    // DB삭제
    await deleteFiles(accessToken, fileId);

    // 스토리지, URL sessionStorage 목록 제거
    const updated = uploadUrls.filter((_, i) => i !== index);
    sessionStorage.setItem("uploadUrls", JSON.stringify(updated));
    setUploadUrls(updated);
    setFileId(0);
  };

  // 최종 저장 후 초기화
  const clearFiles = () => {
    setFiles([]);
    setUploadUrls([]);
    setFileId(0);
    sessionStorage.removeItem("uploadUrls");
  };

  return {
    files,
    setFiles,
    uploadUrls,
    isDragging,
    setIsDragging,
    addFiles,
    removeFiles,
    clearFiles,
  };
}
