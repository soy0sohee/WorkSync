import { useState, useRef } from "react";
import { uploadFile, deleteFile } from "../domains/file/services/fileApi";

export default function useFileUpload(accessToken, refType) {
  const [files, setFiles] = useState([]); //파일 목록
  const [uploadedFile, setUploadedFile] = useState([]); //DB에 저장할 URL 목록
  const [isDragging, setIsDragging] = useState(false); //드래그 상태
  const uploadedFileRef = useRef([]);

  // 파일 추가
  const addFiles = async (newFiles) => {
    // 화면에 파일 추가
    setFiles((prev) => [...prev, ...newFiles.map((file) => ({ file }))]);

    // 파일마다 개별 업로드
    for (const file of newFiles) {
      // 스토리지에 업로드
      const fileData = new FormData();
      fileData.append("file", file);
      const result = await uploadFile(accessToken, fileData, refType);

      // filePath, originalName, fileSize, mimeType 데이터 저장
      if (result?.data) {
        // ref 에 동기 저장
        uploadedFileRef.current = [
          ...uploadedFileRef.current,
          { ...result.data, isNew: true },
        ];
        setUploadedFile((prev) => [...prev, { ...result.data, isNew: true }]);
      }
    }
  };

  // 파일 삭제
  const removeFiles = async (index) => {
    const targetFile = files[index];
    console.log("targetFile: ", targetFile); // 구조 확인

    if (targetFile?.refId !== undefined) {
      // DB + 스토리지 삭제
      await deleteFile(accessToken, targetFile.refType, targetFile.refId);
    }

    // 화면에 파일 제거
    setFiles((prev) => prev.filter((_, i) => i !== index));
    // filePath, originalName, fileSize, mimeType 데이터 제거
    setUploadedFile((prev) => prev.filter((_, i) => i !== index));
  };

  // 최종 저장 후 초기화
  const clearFiles = () => {
    setFiles([]);
    setUploadedFile([]);
    uploadedFileRef.current = [];
  };

  return {
    files,
    setFiles,
    isDragging,
    setIsDragging,
    uploadedFile,
    uploadedFileRef,
    addFiles,
    removeFiles,
    clearFiles,
  };
}
