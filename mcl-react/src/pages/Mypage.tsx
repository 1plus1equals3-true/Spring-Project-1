import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import type { UserInfo } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import { API_BASE_URL, PUBLIC_IMAGE_PATH } from "../config/defaultconfig";
import {
  Pen,
  MessageSquareMore,
  ClipboardList,
  Settings,
  User,
  Clock10,
  Gift,
  KeyRound,
  Image,
  Calendar,
} from "lucide-react";
import {
  Trash2,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "../styles/Mypage.css"; // 추출된 CSS 파일 import

// 닉네임 유효성 검사 함수 (2~10자, 한글/영어/숫자)
const validateNickname = (nickname: string): string => {
  const trimmedNickname = nickname.trim();
  const regex = /^[a-zA-Z0-9가-힣]+$/;

  if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
    return "닉네임은 2자 이상 10자 이하입니다.";
  }
  if (!regex.test(trimmedNickname)) {
    return "닉네임은 한글, 영어, 숫자만 사용할 수 있습니다.";
  }
  return "";
};

// 비밀번호 유효성 검사 함수 (8~20자, 영문, 숫자, 특수문자 포함) - DTO 패턴과 일치
const validateNewPassword = (password: string): string => {
  const regex = /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\W)(?=\S+$).{8,20}/;
  if (!regex.test(password)) {
    return "비밀번호는 8~20자이며, 영문, 숫자, 특수문자를 포함해야 합니다.";
  }
  return "";
};

// -----------------------------------------------------------------------
// 1. 상수 및 스타일 정의
// -----------------------------------------------------------------------

const DEFAULT_PROFILE_IMAGE =
  "https://placehold.co/100x100/dddddd/888888?text=P";
const API_PREFIX = "/api/v1/members/update";

interface Tab {
  key: string;
  name: string;
  icon: React.ElementType;
}

interface RecentBoard {
  idx: number;
  title: string;
  regdate: string | number[];
}

interface RecentComment {
  idx: number;
  boardIdx: number;
  ment: string;
  regdate: string | number[];
}

// DTO
interface MyPost {
  idx: number;
  title: string;
  regdate: string | number[];
  boardType: string;
}
interface MyComment {
  idx: number;
  ment: string;
  regdate: string | number[];
  boardIdx: number;
}
// 응답 껍데기
interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}

const TABS: Tab[] = [
  { key: "dashboard", name: "대시보드", icon: ClipboardList },
  // { key: "settings", name: "사용자 설정", icon: Settings },
  { key: "profile", name: "정보 수정", icon: User },
  { key: "history", name: "활동 기록", icon: Clock10 },
  // { key: "benefits", name: "포인트", icon: Gift },
];

// 이미지 경로 생성 헬퍼 함수 (Sidebar.tsx와 동일)
const getProfileImageUrl = (imagePath: string | null): string => {
  if (!imagePath) {
    return DEFAULT_PROFILE_IMAGE;
  }
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const publicPath = PUBLIC_IMAGE_PATH.startsWith("/")
    ? PUBLIC_IMAGE_PATH
    : `/${PUBLIC_IMAGE_PATH}`;

  const cleanedPath = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;
  return `${baseUrl}${publicPath}/${cleanedPath}`;
};

// -----------------------------------------------------------------------
// 2. 탭별 컨텐츠 컴포넌트
// -----------------------------------------------------------------------

// 대시보드 컴포넌트
const DashboardContent: React.FC<{
  user: UserInfo;
  onTabChange: (key: string) => void;
}> = ({ user, onTabChange }) => {
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const navigate = useNavigate();

  // 날짜 포맷 헬퍼
  const formatDate = (dateInput: string | number[]) => {
    if (Array.isArray(dateInput))
      return `${dateInput[0]}.${dateInput[1]}.${dateInput[2]}`;
    return new Date(dateInput).toLocaleDateString();
  };

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBoards, resComments] = await Promise.all([
          apiClient.get<RecentBoard[]>("/api/v1/members/me/recent-boards"),
          apiClient.get<RecentComment[]>("/api/v1/members/me/recent-comments"),
        ]);
        setRecentBoards(resBoards.data);
        setRecentComments(resComments.data);
      } catch (err) {
        console.error("대시보드 데이터 로드 실패", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* 프로필 요약 */}
      <div className="profile-summary">
        <img
          src={getProfileImageUrl(user.profileImageUrl)}
          alt="프로필 사진"
          className="profile-img-large"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
          }}
        />
        <div className="profile-info">
          <h2>{user.nickname} 님</h2>
          <span>Level {user.grade}</span>
          <p>
            {user.birth
              ? `생일 : ${user.birth.substring(0, 10)}`
              : "생일 정보 없음"}{" "}
            | 환영합니다! 오늘도 즐거운 하루 되세요.
          </p>
        </div>
      </div>

      {/* 활동 요약 그리드 */}
      <div className="activity-grid">
        {/* 최근 작성 글 */}
        <div className="activity-box">
          <div className="box-title">
            <Pen size={18} /> 최근 작성 글
          </div>
          <ul className="activity-list">
            {recentBoards.length > 0 ? (
              recentBoards.map((board) => (
                <li
                  key={board.idx}
                  className="activity-item"
                  onClick={() => navigate(`/board/free/${board.idx}`)}
                >
                  <span className="truncate">{board.title}</span>
                  <span className="activity-date">
                    {formatDate(board.regdate)}
                  </span>
                </li>
              ))
            ) : (
              <li className="activity-item text-gray">작성한 글이 없습니다.</li>
            )}
          </ul>
          <span className="more-link" onClick={() => onTabChange("history")}>
            더 보기 &gt;
          </span>
        </div>

        {/* 최근 댓글 */}
        <div className="activity-box">
          <div className="box-title">
            <MessageSquareMore size={18} /> 최근 작성 댓글
          </div>
          <ul className="activity-list">
            {recentComments.length > 0 ? (
              recentComments.map((comment) => (
                <li
                  key={comment.idx}
                  className="activity-item"
                  onClick={() => navigate(`/board/free/${comment.boardIdx}`)}
                >
                  <span className="truncate">{comment.ment}</span>
                  <span className="activity-date">
                    {formatDate(comment.regdate)}
                  </span>
                </li>
              ))
            ) : (
              <li className="activity-item text-gray">
                작성한 댓글이 없습니다.
              </li>
            )}
          </ul>
          <span className="more-link" onClick={() => onTabChange("history")}>
            더 보기 &gt;
          </span>
        </div>
      </div>
    </div>
  );
};

// 폼 섹션 컨테이너
const FormContainer: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="form-section">
    <h3>
      <Icon size={20} /> {title}
    </h3>
    {children}
  </div>
);

interface ProfileEditContentProps {
  user: UserInfo;
  // useAuth에서 사용자 정보를 업데이트하는 함수를 받는다고 가정
  updateUser: (data: Partial<UserInfo>) => void;
}

const ProfileEditContent: React.FC<ProfileEditContentProps> = ({
  user,
  updateUser,
}) => {
  // 상태 관리: 비밀번호
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // 상태 관리: 닉네임
  const [newNickname, setNewNickname] = useState(user.nickname);
  // 상태 관리: 생일 (YYYY-MM-DD 형식으로 변환)
  const initialBirthday = user.birth ? user.birth.substring(0, 10) : "";
  const [newBirthday, setNewBirthday] = useState(initialBirthday);
  // 상태 관리: 프로필 사진
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(
    getProfileImageUrl(user.profileImageUrl)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 알림 메시지 상태
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // 공통 API 호출 헬퍼
  const callApi = useCallback(
    async (
      url: string,
      method: "PATCH",
      body: FormData | object
    ): Promise<boolean> => {
      try {
        const isFormData = body instanceof FormData;

        // 실제 구현 시, Authorization: `Bearer ${token}` 헤더가 필요합니다.
        const headers: HeadersInit = isFormData
          ? {}
          : { "Content-Type": "application/json" };

        const response = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers,
          body: isFormData ? body : JSON.stringify(body),
          credentials: "include",
        });

        if (!response.ok) {
          // 서버에서 에러 메시지(String)를 응답했다고 가정
          // 401 Unauthorized 에러를 포함하여 처리
          const errorText =
            (await response.text()) || "알 수 없는 서버 오류가 발생했습니다.";
          showMessage(
            `업데이트 실패: ${response.status} (${response.statusText}): ${errorText}`,
            "error"
          );
          return false;
        }

        // 성공 시
        showMessage("정보가 성공적으로 업데이트되었습니다.", "success");
        return true;
      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
        showMessage("네트워크 오류 또는 서버 접속에 실패했습니다.", "error");
        return false;
      }
    },
    []
  );

  // 1. 프로필 사진 변경 핸들러
  const handleProfileImageUpload = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFile) {
        showMessage("업로드할 파일을 선택해주세요.", "error");
        return;
      }

      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const success = await callApi(
        `${API_PREFIX}/profile-image`,
        "PATCH",
        formData
      );

      if (success) {
        // 성공 시 로컬 상태 초기화 및 사용자 정보 업데이트
        setSelectedFile(null);
        window.location.reload(); // 임시로 새로고침 로직 사용
        // updateUser({ profileImageUrl: "새로운 이미지 경로" }); // 실제 경로로 업데이트하기

        // input 요소 초기화 (같은 파일을 다시 선택할 수 있게)
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [selectedFile, callApi]
  );

  // 2. 닉네임 변경 핸들러
  const handleNicknameChange = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedNickname = newNickname.trim();

      if (trimmedNickname === user.nickname) {
        showMessage("닉네임에 변경 사항이 없습니다.", "error");
        return;
      }

      const validationError = validateNickname(trimmedNickname);
      if (validationError) {
        showMessage(`닉네임 수정 오류: ${validationError}`, "error");
        return;
      }

      const body = { nickname: trimmedNickname };
      const success = await callApi(`${API_PREFIX}/nickname`, "PATCH", body);

      if (success) {
        // 성공 시 로컬 상태 업데이트
        updateUser({ nickname: trimmedNickname });
      }
    },
    [newNickname, user.nickname, callApi, updateUser]
  );

  // 3. 생일 변경 핸들러
  const handleBirthdayChange = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!newBirthday) {
        showMessage("생일을 선택해주세요.", "error");
        return;
      }

      if (newBirthday === initialBirthday) {
        showMessage("생일에 변경 사항이 없습니다.", "error");
        return;
      }

      // DTO에서 LocalDate 타입을 사용하므로, YYYY-MM-DD 형식의 문자열로 전송
      const body = { birth: newBirthday };
      const success = await callApi(`${API_PREFIX}/birth`, "PATCH", body);

      if (success) {
        // 성공 시 로컬 상태 업데이트 (실제로는 user.birth가 LocalDate 형태의 문자열로 가정)
        updateUser({ birth: newBirthday + "T00:00:00" });
      }
    },
    [newBirthday, initialBirthday, callApi, updateUser]
  );

  // 4. 비밀번호 변경 핸들러
  const handlePasswordChange = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!currentPassword || !newPassword) {
        showMessage("모든 비밀번호 필드를 채워주세요.", "error");
        return;
      }

      const validationError = validateNewPassword(newPassword);
      if (validationError) {
        showMessage(`새 비밀번호 오류: ${validationError}`, "error");
        return;
      }

      // DTO는 currentPassword와 newPassword만 필요합니다.
      const body = { currentPassword, newPassword };
      const success = await callApi(`${API_PREFIX}/password`, "PATCH", body);

      if (success) {
        // 성공 시 입력 필드 초기화
        setCurrentPassword("");
        setNewPassword("");
      }
    },
    [currentPassword, newPassword, callApi]
  );

  // 프로필 파일 선택 시
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setSelectedFile(null);
        setPreviewUrl(getProfileImageUrl(user.profileImageUrl));
      }
    },
    [user.profileImageUrl]
  );

  return (
    <div>
      {message && (
        <div className={`alert-message ${message.type}`}>{message.text}</div>
      )}

      {/* 1. 프로필 사진 */}
      <FormContainer title="프로필 사진 변경" icon={Image}>
        <form onSubmit={handleProfileImageUpload}>
          <div className="upload-area">
            <img
              src={previewUrl}
              alt="프로필 미리보기"
              className="profile-img-large"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="file-select-btn"
            >
              {selectedFile ? "다시 선택" : "사진 선택"}
            </button>
            {selectedFile && (
              <span className="file-name">{selectedFile.name}</span>
            )}
          </div>
          <button type="submit" disabled={!selectedFile} className="submit-btn">
            업로드
          </button>
        </form>
      </FormContainer>

      {/* 2. 닉네임 */}
      <FormContainer title="닉네임 변경" icon={Pen}>
        <form onSubmit={handleNicknameChange}>
          <div className="input-group">
            <label className="input-label">새 닉네임</label>
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="text-input"
              placeholder="2~10자, 한글/영어/숫자"
              maxLength={10}
            />
          </div>
          <p className="helper-text">한글, 영문, 숫자만 사용 가능합니다.</p>
          <button type="submit" className="submit-btn">
            변경
          </button>
        </form>
      </FormContainer>

      {/* 3. 생일 */}
      <FormContainer title="생일 변경" icon={Calendar}>
        <form onSubmit={handleBirthdayChange}>
          <div className="input-group">
            <label className="input-label">생일</label>
            <input
              type="date"
              value={newBirthday}
              onChange={(e) => setNewBirthday(e.target.value)}
              className="text-input"
              max={new Date().toISOString().substring(0, 10)}
            />
          </div>
          <button type="submit" className="submit-btn">
            변경
          </button>
        </form>
      </FormContainer>

      {/* 4. 비밀번호 */}
      <FormContainer title="비밀번호 변경" icon={KeyRound}>
        <form onSubmit={handlePasswordChange}>
          <div className="input-group">
            <label className="input-label">현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="text-input"
              placeholder="현재 비밀번호를 입력하세요."
            />
          </div>
          <div className="input-group">
            <label className="input-label">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="text-input"
              placeholder="8~20자, 영문+숫자+특수문자"
            />
          </div>
          <button type="submit" className="submit-btn">
            변경
          </button>
        </form>
      </FormContainer>
    </div>
  );
};

// 활동 기록 탭 (history)
const HistoryContent: React.FC<{ user: UserInfo }> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<"posts" | "comments">(
    "posts"
  );
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 데이터 로드
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeSubTab === "posts") {
        // 게시글 조회
        const res = await apiClient.get<PageResponse<MyPost>>(
          `/api/v1/members/me/boards?page=${page}&size=10`
        );
        setPosts(res.data.content);
        setTotalPages(res.data.totalPages);
      } else {
        // 댓글 조회
        const res = await apiClient.get<PageResponse<MyComment>>(
          `/api/v1/members/me/comments?page=${page}&size=10`
        );
        setComments(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSelectedIds([]); // 페이지 바뀌면 선택 초기화
    }
  }, [activeSubTab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 체크박스 핸들러
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentData = activeSubTab === "posts" ? posts : comments;
    const allIds = currentData.map((item) => item.idx);

    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  // 삭제 핸들러
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`선택한 ${selectedIds.length}개를 삭제하시겠습니까?`))
      return;

    try {
      const endpoint =
        activeSubTab === "posts"
          ? "/api/v1/board/delete-batch"
          : "/api/v1/board/comment/delete-batch";

      await apiClient.delete(endpoint, { data: selectedIds });

      alert("삭제되었습니다.");
      fetchData(); // 새로고침
    } catch (err) {
      alert("삭제 실패");
    }
  };

  // 날짜 포맷
  const formatDate = (dateInput: string | number[]) => {
    if (Array.isArray(dateInput))
      return `${dateInput[0]}.${dateInput[1]}.${dateInput[2]}`;
    return new Date(dateInput).toLocaleDateString();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0); // 상단 이동
    }
  };

  return (
    <div className="history-container">
      {/* 서브 탭 (글 / 댓글) */}
      <div className="sub-tabs">
        <button
          className={`sub-tab-btn ${activeSubTab === "posts" ? "active" : ""}`}
          onClick={() => {
            setActiveSubTab("posts");
            setPage(0);
          }}
        >
          작성 글
        </button>
        <button
          className={`sub-tab-btn ${
            activeSubTab === "comments" ? "active" : ""
          }`}
          onClick={() => {
            setActiveSubTab("comments");
            setPage(0);
          }}
        >
          작성 댓글
        </button>
      </div>

      {/* 툴바 (전체 선택 / 삭제) */}
      <div className="history-toolbar">
        <button className="toolbar-btn" onClick={toggleSelectAll}>
          {selectedIds.length > 0 &&
          selectedIds.length ===
            (activeSubTab === "posts" ? posts.length : comments.length) ? (
            <CheckSquare size={18} />
          ) : (
            <Square size={18} />
          )}
          전체 선택
        </button>
        {selectedIds.length > 0 && (
          <button className="toolbar-btn delete" onClick={handleDeleteSelected}>
            <Trash2 size={18} /> 선택 삭제 ({selectedIds.length})
          </button>
        )}
      </div>

      {/* 리스트 (테이블 형태) */}
      <div className="history-list">
        {(activeSubTab === "posts" ? posts : comments).length === 0 ? (
          <div className="empty-state">기록이 없습니다.</div>
        ) : (
          (activeSubTab === "posts" ? posts : comments).map((item: any) => (
            <div
              key={item.idx}
              className={`history-item ${
                selectedIds.includes(item.idx) ? "selected" : ""
              }`}
            >
              <div
                className="checkbox-area"
                onClick={() => toggleSelect(item.idx)}
              >
                {selectedIds.includes(item.idx) ? (
                  <CheckSquare size={20} color="#4f46e5" />
                ) : (
                  <Square size={20} color="#d1d5db" />
                )}
              </div>
              <div
                className="history-content-area"
                onClick={() => {
                  // 글이면 해당 글 상세로, 댓글이면 해당 글 상세로 이동
                  const targetId =
                    activeSubTab === "posts" ? item.idx : item.boardIdx;
                  navigate(`/board/free/${targetId}`); // 게시판 타입 구분 필요하면 데이터에 포함해야 함
                }}
              >
                <div className="item-title">
                  {activeSubTab === "posts" ? item.title : item.ment}
                </div>
                <div className="item-date">{formatDate(item.regdate)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ⭐️ [추가] 페이지네이션 UI */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="page-btn"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="page-info">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="page-btn"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

const PlaceholderContent: React.FC<{ tabName: string }> = ({ tabName }) => (
  <div className="placeholder-box">
    <h3>"{tabName}" 탭 준비 중</h3>
    <p>이 기능은 곧 업데이트될 예정입니다!</p>
  </div>
);

// --- 메인 페이지 ---
const MyPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabKey = searchParams.get("tab") || "dashboard";

  if (!user) return null;

  const handleTabChange = (key: string) => {
    if (key === "dashboard") setSearchParams({});
    else setSearchParams({ tab: key });
  };

  const renderContent = useMemo(() => {
    const activeTab = TABS.find((t) => t.key === activeTabKey) || TABS[0];
    switch (activeTab.key) {
      case "dashboard":
        return <DashboardContent user={user} onTabChange={handleTabChange} />;
      case "profile":
        return <ProfileEditContent user={user} updateUser={updateUser} />;
      case "history":
        return <HistoryContent user={user} />;
      default:
        return <PlaceholderContent tabName={activeTab.name} />;
    }
  }, [activeTabKey, user, updateUser]);

  return (
    <MainLayout>
      <div className="mypage-container">
        <h1 className="mypage-title">마이페이지</h1>

        <div className="mypage-box">
          <div className="tab-nav">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`tab-btn ${
                  tab.key === activeTabKey ? "active" : ""
                }`}
              >
                <tab.icon size={18} style={{ marginRight: "8px" }} />
                {tab.name}
              </button>
            ))}
          </div>

          <div className="tab-content">{renderContent}</div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyPage;
