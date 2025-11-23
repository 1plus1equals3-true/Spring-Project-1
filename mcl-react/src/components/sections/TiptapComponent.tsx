import React, { useCallback, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Heading from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import apiClient from "../../api/apiClient";
import { API_BASE_URL } from "../../config/defaultconfig";

import "../../styles/TiptapComponent.css";

// 에디터의 상태와 내용을 관리하기 위한 Props 정의
interface TextEditorProps {
  initialContent: string;
  onContentChange: (html: string) => void;
  onImageUpload?: (fileIdx: number, fileUrl: string) => void;
  editable?: boolean; // 읽기 전용 여부 (기본: true)
}

// -----------------------------------------------------------
// 1. 메뉴 버튼 컴포넌트
// -----------------------------------------------------------

interface MenuButtonProps {
  onClick: () => void;
  icon: string;
  isActive?: boolean;
  title: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  onClick,
  icon,
  isActive,
  title,
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`menu-button ${isActive ? "active" : ""}`}
  >
    <span className="menu-button-icon">{icon}</span>
  </button>
);

// -----------------------------------------------------------
// 2. 메뉴바 컴포넌트
// -----------------------------------------------------------

interface MenuBarProps {
  editor: Editor | null;
  addImage: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, addImage }) => {
  if (!editor || !editor.isEditable) {
    return null;
  }

  // Link 버튼 클릭 핸들러
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL을 입력해주세요:", previousUrl);

    // 사용자가 취소한 경우
    if (url === null) {
      return;
    }

    // URL이 빈 문자열인 경우 링크 제거
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // URL 설정
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  }, [editor]);

  return (
    <div className="menu-bar">
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        icon="B"
        title="굵게"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        icon="I"
        title="기울임꼴"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        icon="U"
        title="밑줄"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        icon="H1"
        title="제목 1"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        icon="H2"
        title="제목 2"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon="•"
        title="글머리 기호 목록"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon="1."
        title="숫자 목록"
      />
      <MenuButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        icon="🔗"
        title="링크 삽입"
      />
      <MenuButton onClick={addImage} icon="🖼️" title="이미지 첨부" />
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        icon="↩"
        title="되돌리기"
      />
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        icon="↪"
        title="다시 실행"
      />
    </div>
  );
};

// -----------------------------------------------------------
// 3. 메인 Tiptap 에디터 컴포넌트
// -----------------------------------------------------------

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent,
  onContentChange,
  onImageUpload,
  editable = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor(
    {
      // Tiptap 확장 기능 설정
      extensions: [
        StarterKit.configure({
          // StarterKit에 포함된 기본 기능 중 일부를 비활성화하고,
          // 아래에서 별도로 더 많은 기능을 설정합니다.
          bold: false,
          italic: false,
          heading: false,
          listItem: false,
          bulletList: false,
          orderedList: false,
        }),
        // 필요한 확장 기능들
        Bold,
        Italic,
        Underline,
        Heading.configure({
          levels: [1, 2],
        }),
        ListItem,
        BulletList,
        OrderedList,
        Link.configure({
          openOnClick: true,
          // Tailwind 클래스 대신 CSS 파일에 정의된 스타일을 사용합니다.
          HTMLAttributes: {
            class: "editor-link", // TextEditor.css에서 .editor-content a 에 스타일 정의
          },
        }),
        Image.configure({
          inline: true, // 인라인 이미지 허용
          allowBase64: false, // Base64 대신 URL 사용
          HTMLAttributes: {
            class: "editor-image", // CSS 스타일링용 클래스
          },
        }),
      ],
      content: initialContent, // 초기 내용
      editable: editable, // 편집 가능 여부
      onUpdate: ({ editor }) => {
        // 내용이 업데이트 될 때마다 부모 컴포넌트에 HTML 콘텐츠 전달
        const html = editor.getHTML();
        onContentChange(html);
      },
      editorProps: {
        attributes: {
          // Tailwind 클래스 대신 CSS 파일에 정의된 .editor-content 클래스를 사용합니다.
          class: "editor-content",
        },
      },
    },
    [editable]
  ); // editable이 변경될 때 에디터 재설정

  // ⭐️ [핵심] 이미지 업로드 로직
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // 폼 데이터 생성
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post(
        `/api/v1/board/image-upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { fileIdx, fileUrl } = response.data;

      // 1. 에디터에 이미지 삽입 (접근 URL 사용)
      // 백엔드가 보낸 URL이 상대경로라면 API_BASE_URL을 붙여줘야 할 수도 있음.
      // 백엔드 코드에서 "/api/images/..." 형태의 절대 경로(Context Path 제외)를 준다면 그대로 사용.
      const fullUrl = `${API_BASE_URL}${fileUrl}`;

      editor.chain().focus().setImage({ src: fullUrl }).run();

      // 2. 부모 컴포넌트(BoardEditorPage)에 파일 ID(idx) 전달
      if (onImageUpload) {
        onImageUpload(fileIdx, fullUrl);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      // input 초기화 (같은 파일 다시 선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 이미지 버튼 클릭 시 숨겨진 input 클릭 트리거
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  // ----------------------------------------------------------

  // 에디터가 아직 로드되지 않은 경우
  if (!editor) {
    return <div className="editor-loading">에디터 로드 중...</div>;
  }

  return (
    <div className="text-editor-container">
      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
        accept="image/*" // 이미지 파일만 허용
      />

      {editable && <MenuBar editor={editor} addImage={triggerFileInput} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextEditor;
