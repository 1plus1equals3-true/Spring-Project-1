import React, { useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import type { UserInfo } from "../context/AuthContext";
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
// 1. 상수 및 스타일 정의 (사용되지 않는 인라인 스타일 제거)
// -----------------------------------------------------------------------

const DEFAULT_PROFILE_IMAGE =
  "https://placehold.co/100x100/dddddd/888888?text=P";
const API_PREFIX = "/api/v1/members/update";

interface Tab {
  key: string;
  name: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { key: "dashboard", name: "대시보드", icon: ClipboardList },
  { key: "settings", name: "사용자 설정", icon: Settings },
  { key: "profile", name: "정보 수정", icon: User },
  { key: "history", name: "활동 기록", icon: Clock10 },
  { key: "benefits", name: "포인트", icon: Gift },
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
const DashboardContent: React.FC<{ user: UserInfo }> = ({ user }) => {
  return (
    <div className="space-y-6-container">
      {" "}
      {/* space-y-6 대체 */}
      {/* 프로필 요약 섹션 - 임시 스타일 적용 */}
      <div className="profile-area-summary form-container">
        <img
          src={getProfileImageUrl(user.profileImageUrl)}
          alt="프로필 사진"
          className="profile-preview-image" // 기존 프로필 이미지 스타일 재활용
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
          }}
        />
        <div>
          <h2 className="text-xl font-bold">{user.nickname} 님</h2>
          <span>회원 등급: Level {user.grade}</span>
          <p>
            {user.birth
              ? `생일: ${user.birth.substring(0, 10)}`
              : "생일 정보 없음"}{" "}
            | 함께한 시간을 요약해 드릴게요.
          </p>
        </div>
      </div>
      {/* 활동 요약 섹션 */}
      <div className="dashboard-container space-y-4-form">
        {/* 최근 작성 글 자리 */}
        <div className="dashboard-box form-container">
          <h3 className="text-lg font-semibold flex items-center mb-2">
            <Pen className="w-4 h-4 mr-2" />
            최근 작성 글
          </h3>
          <ul className="list-disc ml-5 text-gray-700">
            <li>최근 글 제목 1 (2025.11.10)</li>
            <li>최근 글 제목 2 (2025.11.08)</li>
            <li>최근 글 제목 3 (2025.11.05)</li>
            <li className="text-blue-500 cursor-pointer">더 보기 &gt;</li>
          </ul>
        </div>

        {/* 최근 작성 댓글 자리 */}
        <div className="dashboard-box form-container">
          <h3 className="text-lg font-semibold flex items-center mb-2">
            <MessageSquareMore className="w-4 h-4 mr-2" />
            최근 작성 댓글
          </h3>
          <ul className="list-disc ml-5 text-gray-700">
            <li>댓글 내용 요약 1 (2025.11.11)</li>
            <li>댓글 내용 요약 2 (2025.11.09)</li>
            <li>댓글 내용 요약 3 (2025.11.07)</li>
            <li className="text-blue-500 cursor-pointer">더 보기 &gt;</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 폼 섹션 컨테이너 헬퍼 컴포넌트 (추출된 클래스 적용)
const FormContainer: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="form-container">
    <h3>
      <Icon /> {title}
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
    <div className="space-y-6-container">
      {" "}
      {/* space-y-6 대체 */}
      {/* 알림 메시지 - Tailwind 클래스 유지 (alert-message 클래스가 Tailwind를 기반으로 정의됨) */}
      {message && (
        <div
          className={`alert-message ${
            message.type === "success" ? "success" : "error"
          }`}
        >
          {message.text}
        </div>
      )}
      {/* 1. 프로필 사진 변경 */}
      <FormContainer title="프로필 사진 변경" icon={Image}>
        <form onSubmit={handleProfileImageUpload} className="form-layout">
          {" "}
          {/* space-y-4 대체 */}
          <div className="profile-image-upload-container">
            <img
              src={previewUrl}
              alt="프로필 미리보기"
              className="profile-preview-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="inputFileNone"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="file-select-button"
            >
              {selectedFile ? "파일 다시 선택" : "사진 선택"}
            </button>
            {selectedFile && (
              <p className="file-name-display">
                선택된 파일: {selectedFile.name}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={!selectedFile}
            className="form-submit-button"
          >
            프로필 사진 업로드
          </button>
        </form>
      </FormContainer>
      {/* 2. 닉네임 변경 */}
      <FormContainer title="닉네임 변경" icon={Pen}>
        <form onSubmit={handleNicknameChange} className="form-layout">
          {" "}
          {/* space-y-4 대체 */}
          <div>
            <label htmlFor="newNickname" className="form-label">
              새 닉네임
            </label>
            <input
              type="text"
              id="newNickname"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="form-input"
              placeholder="닉네임 (2~10자, 한글/영어/숫자)"
              minLength={2}
              maxLength={10}
            />
          </div>
          <p className="helper-text">
            2자 이상 10자 이하, 한글/영어/숫자만 사용 가능합니다.
          </p>
          <button type="submit" className="form-submit-button">
            닉네임 변경
          </button>
        </form>
      </FormContainer>
      {/* 3. 생일 변경 */}
      <FormContainer title="생일 변경" icon={Calendar}>
        <form onSubmit={handleBirthdayChange} className="form-layout">
          {" "}
          {/* space-y-4 대체 */}
          <div>
            <label htmlFor="newBirthday" className="form-label">
              새 생일
            </label>
            <input
              type="date"
              id="newBirthday"
              value={newBirthday}
              onChange={(e) => setNewBirthday(e.target.value)}
              className="form-input"
              max={new Date().toISOString().substring(0, 10)} // 오늘 날짜 이후 선택 불가
            />
          </div>
          <button type="submit" className="form-submit-button">
            생일 변경
          </button>
        </form>
      </FormContainer>
      {/* 4. 비밀번호 변경 */}
      <FormContainer title="비밀번호 변경" icon={KeyRound}>
        <form onSubmit={handlePasswordChange} className="form-layout">
          {" "}
          {/* space-y-4 대체 */}
          <div>
            <label htmlFor="currentPassword" className="form-label">
              현재 비밀번호
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input"
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="form-label">
              새 비밀번호
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              placeholder="새 비밀번호 (8~20자, 영문, 숫자, 특수문자)"
              minLength={8}
              maxLength={20}
            />
          </div>
          <button type="submit" className="form-submit-button">
            비밀번호 변경
          </button>
        </form>
      </FormContainer>
    </div>
  );
};

// 기타 탭 Placeholder (추출된 클래스 적용)
const PlaceholderContent: React.FC<{ tabName: string }> = ({ tabName }) => (
  <div className="placeholder-content">
    <h3>"{tabName}" 페이지입니다.</h3>
    <p>여기에 해당 탭의 기능을 구현할 예정입니다.</p>
  </div>
);

// -----------------------------------------------------------------------
// 3. MyPage 메인 컴포넌트 (추출된 클래스 적용)
// -----------------------------------------------------------------------

const MyPage: React.FC = () => {
  // useAuth에서 updateUser 함수를 추가로 받아와 ProfileEditContent에 전달합니다.
  const { isLoggedIn, user, isLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL에서 현재 탭을 가져오거나, 없으면 'dashboard'를 기본값으로 사용합니다.
  const activeTabKey = searchParams.get("tab") || "dashboard";

  // 로그인 상태 확인 및 리디렉션 처리
  React.useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // 사용자 정보 로딩 완료 후, 로그인되지 않았다면 로그인 페이지로 이동
      navigate("/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  if (isLoading || !isLoggedIn || !user) {
    // 로딩 중이거나 로그인되지 않은 경우 (리디렉션 전)
    return (
      <MainLayout>
        <div className="text-center p-8">
          <p className="text-lg font-medium text-gray-600">
            인증 정보 확인 중...
          </p>
        </div>
      </MainLayout>
    );
  }

  // 탭 클릭 핸들러: URL의 'tab' 파라미터 변경
  const handleTabChange = (key: string) => {
    if (key === "dashboard") {
      // 대시보드는 쿼리 파라미터 없이 깔끔하게 URL을 설정합니다.
      setSearchParams({});
    } else {
      setSearchParams({ tab: key });
    }
  };

  // 현재 활성화된 탭의 내용 렌더링
  const renderContent = useMemo(() => {
    const activeTab = TABS.find((t) => t.key === activeTabKey) || TABS[0];

    switch (activeTab.key) {
      case "dashboard":
        return <DashboardContent user={user} />;
      case "settings":
        return <PlaceholderContent tabName={activeTab.name} />;
      case "profile":
        // updateUser 함수를 ProfileEditContent에 전달
        return <ProfileEditContent user={user} updateUser={updateUser} />;
      case "history":
        return <PlaceholderContent tabName={activeTab.name} />;
      case "benefits":
        return <PlaceholderContent tabName={activeTab.name} />;
      default:
        return <DashboardContent user={user} />;
    }
  }, [activeTabKey, user, updateUser]);

  return (
    // MainLayout 내부 콘텐츠 영역에 CSS 클래스 적용
    <MainLayout>
      <div className="app-container">
        {" "}
        {/* 전체 레이아웃 클래스 적용 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          마이페이지 관리
        </h1>
        <div className="main-content-box">
          {" "}
          {/* 주요 컨텐츠 박스 클래스 적용 */}
          {/* 탭 네비게이션 영역 */}
          <div className="tab-navigation">
            {" "}
            {/* 탭 컨테이너 클래스 적용 */}
            {TABS.map((tab) => {
              const isActive = tab.key === activeTabKey;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`tab-button ${isActive ? "active" : ""}`} // 탭 버튼 클래스 및 활성화 상태 적용
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
          {/* 컨텐츠 영역 */}
          <div className="mypage-content">{renderContent}</div>
        </div>
      </div>
    </MainLayout>
  );
};
export default MyPage;
