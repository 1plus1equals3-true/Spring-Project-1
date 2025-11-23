import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import BoardHeader from "../components/layout/BoardHeader";
import TextEditor from "../components/sections/TiptapComponent";
import { API_BASE_URL } from "../config/defaultconfig";
import { Loader2 } from "lucide-react";

import "../styles/BoardEditorPage.css";

// 1. 인터페이스 정의 (컴포넌트 내부 또는 상단)
interface UploadedImageInfo {
  idx: number;
  url: string;
}

// 게시글 작성 폼 데이터 타입
interface PostCreationFormData {
  title: string;
  content: string; // HTML content from the editor
  boardType: "NOTICE" | "FREE";
  fileIdxList: number[];
}

// 게시글 수정 폼 데이터 타입 (idx 포함)
interface PostUpdateFormData extends PostCreationFormData {
  idx: number; // 수정 시 필요
}

interface BoardDetailResponse {
  idx: number;
  boardType: "NOTICE" | "FREE";
  title: string;
  content: string;
  attachments: {
    idx: number;
    originalName: string;
    fileUrl: string;
  }[];
}

const BoardEditorPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const boardType: "NOTICE" | "FREE" =
    type?.toUpperCase() === "NOTICE" ? "NOTICE" : "FREE";
  const isEditMode = id !== undefined;
  const postId = isEditMode ? parseInt(id as string, 10) : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ⭐️ 첨부된 파일들의 ID 목록을 관리하는 State
  // const [fileIdxList, setFileIdxList] = useState<number[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageInfo[]>([]);

  const [loading, setLoading] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const headerTitle = boardType === "NOTICE" ? "공지사항" : "자유게시판";
  const pageTitle = isEditMode ? `${headerTitle} 수정` : `${headerTitle} 작성`;
  const pageDescription = isEditMode
    ? "기존 게시글을 수정합니다."
    : "새로운 게시글을 작성합니다.";

  // ⭐️ TextEditor에서 이미지가 업로드 되었을 때 호출되는 함수
  const handleImageUploaded = (newFileIdx: number, newFileUrl: string) => {
    console.log("이미지 업로드 됨:", newFileIdx, newFileUrl);
    setUploadedImages((prev) => [
      ...prev,
      { idx: newFileIdx, url: newFileUrl },
    ]);
  };

  const fetchPostData = useCallback(async () => {
    if (!isEditMode || !postId) return;

    setLoading(true);
    setInitialLoadError(null);
    try {
      const response = await apiClient.get<BoardDetailResponse>(
        `/api/v1/board/${postId}`
      );
      const post = response.data;

      if (post.boardType !== boardType) {
        setInitialLoadError("게시글의 타입이 요청 경로와 일치하지 않습니다.");
        return;
      }

      setTitle(post.title);
      setContent(post.content);

      if (post.attachments) {
        // 서버에서 받은 attachments를 우리 상태 포맷에 맞게 변환
        const initialImages = post.attachments.map((att) => ({
          idx: att.idx,
          // 백엔드 FileAttachmentResponse에서 fileUrl은 전체 경로라고 가정
          // 만약 상대경로라면 API_BASE_URL을 붙여줘야 함
          url: att.fileUrl.startsWith("http")
            ? att.fileUrl
            : `${API_BASE_URL}${att.fileUrl}`,
        }));
        setUploadedImages(initialImages);
      }
    } catch (err) {
      console.error("게시글 로드 오류:", err);
      setInitialLoadError("게시글 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isEditMode, postId, boardType]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  const handleSubmit = async () => {
    if (title.trim() === "") {
      setMessage({ type: "error", text: "제목을 입력해주세요." });
      return;
    }
    if (content.trim() === "" || content.trim() === "<p></p>") {
      setMessage({ type: "error", text: "내용을 입력해주세요." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // ⭐️ [핵심 로직] 실제 본문에 남아있는 이미지 ID만 추출
      // content(HTML 문자열) 안에 해당 이미지의 URL이 포함되어 있는가?
      const finalFileIdxList = uploadedImages
        .filter((image) => content.includes(image.url))
        .map((image) => image.idx);

      console.log("최종 전송될 파일 ID 목록:", finalFileIdxList);

      // 공통 데이터 준비
      const commonData = {
        title,
        content,
        boardType,
        fileIdxList: finalFileIdxList,
      };

      if (isEditMode && postId) {
        const postData: PostUpdateFormData = {
          idx: postId,
          ...commonData,
        };

        await apiClient.put(`/api/v1/board/update`, postData);

        setMessage({
          type: "success",
          text: "게시글이 성공적으로 수정되었습니다.",
        });

        setTimeout(() => {
          navigate(`/board/${type}/${postId}`);
        }, 1000);
      } else {
        // POST: 작성
        const postData: PostCreationFormData = {
          ...commonData,
        };

        const response = await apiClient.post<number>(
          `/api/v1/board/create`,
          postData
        );

        // 백엔드가 Long(ID)을 바로 반환하므로 response.data가 ID입니다.
        const newPostId = response.data;

        setMessage({
          type: "success",
          text: "게시글이 성공적으로 작성되었습니다.",
        });

        setTimeout(() => {
          navigate(`/board/${type}/${newPostId}`);
        }, 1000);
      }
    } catch (err) {
      console.error("게시글 처리 오류:", err);
      const errorMsg = isEditMode
        ? "게시글 수정에 실패했습니다."
        : "게시글 작성에 실패했습니다.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (Render: Loading, Error, Message 부분은 기존 코드와 동일) ...
  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <Loader2 className="spinner" size={48} />
        </div>
      </MainLayout>
    );
  }

  if (initialLoadError) {
    return (
      <MainLayout>
        <div className="error-box">
          <p className="font-bold">오류 발생</p>
          <p>{initialLoadError}</p>
          <button onClick={() => navigate(-1)} className="error-box-button">
            이전 페이지로 돌아가기
          </button>
        </div>
      </MainLayout>
    );
  }

  const messageBoxClass = message
    ? `message-box message-box--${message.type}`
    : "";

  return (
    <MainLayout>
      <div className="board-editor-container">
        <BoardHeader title={pageTitle} description={pageDescription} />

        {message && (
          <div className={messageBoxClass} role="alert">
            {message.text}
          </div>
        )}

        <div className="editor-form">
          <div>
            <label htmlFor="post-title" className="form-label">
              제목
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시글 제목을 입력하세요."
              className="title-input"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="form-label">내용</label>
            <TextEditor
              initialContent={content}
              onContentChange={setContent}
              onImageUpload={handleImageUploaded} // ⭐️ 콜백 전달
              editable={!isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              onClick={() => navigate(-1)}
              type="button"
              className="button button--cancel"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              className="button button--submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="button-spinner" size={18} />
                  {isEditMode ? "수정 중..." : "작성 중..."}
                </>
              ) : isEditMode ? (
                "수정 완료"
              ) : (
                "작성 완료"
              )}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BoardEditorPage;
