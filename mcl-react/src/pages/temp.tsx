import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
// 현재 단일 파일 환경에서 외부 의존성 제거를 위해 Mock 함수와 컴포넌트를 사용합니다.
// import { useSearchParams, useLocation, useNavigate } from "react-router-dom"; // Mock 사용
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

// =======================================================================
// MOCK 및 설정 통합 (외부 의존성 해결)
// =======================================================================

// 1. Mock Router Hooks (단일 파일 환경을 위해 더미 함수 정의)
const useSearchParams = () => {
  // 탭 상태를 내부에서 관리하도록 변경
  const [tab, setTab] = useState("dashboard");
  const get = (key) => (key === "tab" ? tab : null);
  const setSearchParams = (params) => {
    if (params.tab) {
      setTab(params.tab);
    } else {
      setTab("dashboard");
    }
  };
  return [{ get }, setSearchParams];
};
const useNavigate = () => (path) => console.log(`Maps to: ${path}`);
const useLocation = () => ({ pathname: "/mypage" });

// 2. Mock 타입 및 설정
interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  birthday: string | null; // YYYY-MM-DDTHH:MM:SSZ 형식 가정
}
const API_BASE_URL = "http://mockapi.com";
const PUBLIC_IMAGE_PATH = "public/images";

// 3. Mock Auth Context
const mockUser: UserInfo = {
  id: "user_12345",
  email: "user@example.com",
  nickname: "여행자김",
  profileImageUrl: "https://placehold.co/100x100/3498db/ffffff?text=U", // 더미 이미지
  birthday: "1990-05-20T00:00:00Z",
};

const useAuth = () => ({
  isLoggedIn: true,
  user: mockUser,
  isLoading: false,
});

// 4. Mock MainLayout Component
const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div className="max-w-6xl mx-auto">{children}</div>
  </div>
);
// =======================================================================

// -----------------------------------------------------------------------
// 1. 상수 및 스타일 정의
// -----------------------------------------------------------------------

const DEFAULT_PROFILE_IMAGE =
  "https://placehold.co/100x100/dddddd/888888?text=P";

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

// 대시보드
const dashboardStyle: React.CSSProperties = {
  padding: "15px",
  marginTop: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #eee",
  transition: "background-color 0.2s, box-shadow 0.2s",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

// 대시보드 박스
const dashboardBoxStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: "15px",
  marginTop: "10px",
  marginBottom: "10px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "1px solid #eee",
  transition: "background-color 0.2s, box-shadow 0.2s",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

// Sidebar의 프로필 스타일을 재사용
const profileAreaStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "15px 0",
  marginTop: "10px",
  marginBottom: "10px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "1px solid #eee",
  transition: "background-color 0.2s, box-shadow 0.2s",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

// Sidebar의 프로필사진 스타일을 재사용
const profileImageStyle: React.CSSProperties = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #007bff",
  marginBottom: "10px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

// 이미지 경로 생성 헬퍼 함수
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
  // Mock 환경이므로 실제 API 경로는 사용하지 않고, 썸네일로 대체
  return `https://placehold.co/100x100/3498db/ffffff?text=${encodeURIComponent(
    cleanedPath
  )}`;
};

// 닉네임 유효성 검사 함수 (2~10자)
const validateNickname = (nickname: string): string => {
  const regex = /^[a-zA-Z0-9가-힣]{2,10}$/;
  if (!regex.test(nickname)) {
    return "닉네임은 2자 이상 10자 이하이며, 한글, 영어, 숫자만 사용할 수 있습니다.";
  }
  return "";
};

// -----------------------------------------------------------------------
// 2. 탭별 컨텐츠 컴포넌트
// -----------------------------------------------------------------------

// 대시보드 컴포넌트
const DashboardContent: React.FC<{ user: UserInfo }> = ({ user }) => {
  return (
    <div className="space-y-8">
      {/* 프로필 요약 섹션 */}
      <div style={profileAreaStyle}>
        <img
          src={getProfileImageUrl(user.profileImageUrl)}
          alt="프로필 사진"
          style={profileImageStyle}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
          }}
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {user.nickname} 님
          </h2>
          <p className="text-sm text-gray-500">
            함께한 시간을 요약해 드릴게요.
          </p>
        </div>
      </div>

      {/* 활동 요약 섹션 */}
      <div className="md:grid md:grid-cols-2 md:gap-4 dashboard-container">
        {/* 최근 작성 글 자리 */}
        <div className="dashboard-box" style={dashboardBoxStyle}>
          <h3 className="text-lg font-medium text-gray-700 flex items-center mb-2">
            <Pen size={17} className="mr-1 text-blue-500" />
            최근 작성 글
          </h3>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>최근 글 제목 1 (2025.11.10)</li>
            <li>최근 글 제목 2 (2025.11.08)</li>
            <li>최근 글 제목 3 (2025.11.05)</li>
            <li className="text-blue-500 hover:text-blue-700 cursor-pointer pt-1">
              더 보기 &gt;
            </li>
          </ul>
        </div>

        {/* 최근 작성 댓글 자리 */}
        <div className="dashboard-box" style={dashboardBoxStyle}>
          <h3 className="text-lg font-medium text-gray-700 flex items-center mb-2">
            <MessageSquareMore size={17} className="mr-1 text-green-500" />
            최근 작성 댓글
          </h3>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>댓글 내용 요약 1 (2025.11.11)</li>
            <li>댓글 내용 요약 2 (2025.11.09)</li>
            <li>댓글 내용 요약 3 (2025.11.07)</li>
            <li className="text-blue-500 hover:text-blue-700 cursor-pointer pt-1">
              더 보기 &gt;
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 정보 수정 컴포넌트
const ProfileEditContent: React.FC<{ user: UserInfo }> = ({ user }) => {
  // 상태 관리: 비밀번호
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 상태 관리: 닉네임
  const [newNickname, setNewNickname] = useState(user.nickname);

  // 상태 관리: 생일 (YYYY-MM-DD 형식으로 변환)
  const initialBirthday = user.birthday ? user.birthday.substring(0, 10) : "";
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

  // 1. 비밀번호 변경 핸들러 (더미)
  const handlePasswordChange = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage("모든 비밀번호 필드를 채워주세요.", "error");
        return;
      }
      if (newPassword !== confirmPassword) {
        showMessage("새 비밀번호와 확인이 일치하지 않습니다.", "error");
        return;
      }
      if (newPassword.length < 6) {
        showMessage("비밀번호는 최소 6자 이상이어야 합니다.", "error");
        return;
      }

      console.log("비밀번호 변경 시도:", { currentPassword, newPassword });
      showMessage("비밀번호가 성공적으로 변경되었습니다. (Mock)", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    [currentPassword, newPassword, confirmPassword]
  );

  // 2. 닉네임 변경 핸들러 (더미) - 2~10자 제약조건 적용
  const handleNicknameChange = useCallback(
    (e: React.FormEvent) => {
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

      console.log("닉네임 변경 시도:", { newNickname: trimmedNickname });
      showMessage(
        `닉네임이 '${trimmedNickname}'(으)로 변경되었습니다. (Mock)`,
        "success"
      );
    },
    [newNickname, user.nickname]
  );

  // 3. 프로필 사진 변경 핸들러
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    },
    []
  );

  const handleProfileImageUpload = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFile) {
        showMessage("업로드할 파일을 선택해주세요.", "error");
        return;
      }

      console.log("프로필 사진 업로드 시도:", selectedFile.name);
      showMessage(
        "프로필 사진이 성공적으로 업데이트되었습니다. (Mock)",
        "success"
      );
      setSelectedFile(null); // 업로드 후 파일 초기화
      // 실제 구현 시, 서버 응답 후 setPreviewUrl을 영구 URL로 업데이트해야 함.
    },
    [selectedFile]
  );

  // 4. 생일 변경 핸들러 (더미)
  const handleBirthdayChange = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBirthday) {
        showMessage("생일을 선택해주세요.", "error");
        return;
      }
      if (newBirthday === initialBirthday) {
        showMessage("생일에 변경 사항이 없습니다.", "error");
        return;
      }

      console.log("생일 변경 시도:", { newBirthday });
      showMessage(
        `생일이 '${newBirthday}'(으)로 변경되었습니다. (Mock)`,
        "success"
      );
    },
    [newBirthday, initialBirthday]
  );

  const FormContainer: React.FC<{
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
      <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center border-b pb-2">
        <Icon className="w-5 h-5 mr-2 text-blue-500" />
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 알림 메시지 */}
      {message && (
        <div
          className={`p-3 text-sm rounded-xl transition-all duration-300 ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 1. 비밀번호 변경 */}
      <FormContainer title="비밀번호 변경" icon={KeyRound}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              현재 비밀번호
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              새 비밀번호
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="새 비밀번호 (6자 이상)"
              minLength={6}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              새 비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>
          <button
            type="submit"
            className="w-full justify-center rounded-xl border border-transparent bg-blue-600 py-2 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            비밀번호 변경
          </button>
        </form>
      </FormContainer>

      {/* 2. 닉네임 변경 */}
      <FormContainer title="닉네임 변경" icon={Pen}>
        <form onSubmit={handleNicknameChange} className="space-y-4">
          <div>
            <label
              htmlFor="newNickname"
              className="block text-sm font-medium text-gray-700"
            >
              새 닉네임
            </label>
            <input
              type="text"
              id="newNickname"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="닉네임 (2~10자, 한글/영어/숫자)"
              minLength={2}
              maxLength={10}
            />
          </div>
          <p className="text-xs text-gray-500">
            2자 이상 10자 이하, 한글/영어/숫자만 사용 가능합니다.
          </p>
          <button
            type="submit"
            className="w-full justify-center rounded-xl border border-transparent bg-blue-600 py-2 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            닉네임 변경
          </button>
        </form>
      </FormContainer>

      {/* 3. 프로필 사진 변경 */}
      <FormContainer title="프로필 사진 변경" icon={Image}>
        <form onSubmit={handleProfileImageUpload} className="space-y-4">
          <div className="flex flex-col items-center">
            <img
              src={previewUrl}
              alt="프로필 미리보기"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 mb-4 shadow-inner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {selectedFile ? "파일 다시 선택" : "사진 선택"}
            </button>
            {selectedFile && (
              <p className="mt-2 text-xs text-gray-500 truncate max-w-full">
                선택된 파일: {selectedFile.name}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={!selectedFile}
            className="w-full justify-center rounded-xl border border-transparent bg-blue-600 py-2 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400"
          >
            프로필 사진 업로드
          </button>
        </form>
      </FormContainer>

      {/* 4. 생일 변경 */}
      <FormContainer title="생일 변경" icon={Calendar}>
        <form onSubmit={handleBirthdayChange} className="space-y-4">
          <div>
            <label
              htmlFor="newBirthday"
              className="block text-sm font-medium text-gray-700"
            >
              새 생일
            </label>
            <input
              type="date"
              id="newBirthday"
              value={newBirthday}
              onChange={(e) => setNewBirthday(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
          <button
            type="submit"
            className="w-full justify-center rounded-xl border border-transparent bg-blue-600 py-2 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            생일 변경
          </button>
        </form>
      </FormContainer>
    </div>
  );
};

// 기타 탭 Placeholder
const PlaceholderContent: React.FC<{ tabName: string }> = ({ tabName }) => (
  <div className="p-8 bg-white rounded-xl shadow-lg text-center h-64 flex flex-col justify-center items-center border border-gray-200">
    <h3 className="text-2xl font-bold text-gray-700 mb-4">
      "{tabName}" 페이지입니다.
    </h3>
    <p className="text-gray-500">여기에 해당 탭의 기능을 구현할 예정입니다.</p>
  </div>
);

// -----------------------------------------------------------------------
// 3. MyPage 메인 컴포넌트
// -----------------------------------------------------------------------

const MyPage: React.FC = () => {
  const { isLoggedIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { get, setSearchParams: setParams } = searchParams;

  // URL에서 현재 탭을 가져오거나, 없으면 'dashboard'를 기본값으로 사용합니다.
  const activeTabKey = get("tab") || "dashboard";

  // 로그인 상태 확인 및 리디렉션 처리
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // 사용자 정보 로딩 완료 후, 로그인되지 않았다면 로그인 페이지로 이동
      navigate("/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  if (isLoading || !isLoggedIn || !user) {
    // 로딩 중이거나 로그인되지 않은 경우 (리디렉션 전)
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-lg text-gray-500">인증 정보 확인 중...</p>
        </div>
      </MainLayout>
    );
  }

  // 탭 클릭 핸들러: URL의 'tab' 파라미터 변경
  const handleTabChange = (key: string) => {
    if (key === "dashboard") {
      // 대시보드는 쿼리 파라미터 없이 깔끔하게 URL을 설정합니다.
      setParams({});
    } else {
      setParams({ tab: key });
    }
  };

  // 현재 활성화된 탭의 내용 렌더링
  const renderContent = useMemo(() => {
    const activeTab = TABS.find((t) => t.key === activeTabKey) || TABS[0];

    switch (activeTab.key) {
      case "dashboard":
        return <DashboardContent user={user} />;
      case "profile":
        // 정보 수정 컴포넌트를 렌더링합니다.
        return <ProfileEditContent user={user} />;
      case "settings":
      case "history":
      case "benefits":
        return <PlaceholderContent tabName={activeTab.name} />;
      default:
        return <DashboardContent user={user} />;
    }
  }, [activeTabKey, user]);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">마이페이지</h1>
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-100">
        {/* 탭 네비게이션 영역 */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-8 rounded-t-lg">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTabKey;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  flex items-center px-4 py-3 font-medium text-sm transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? "border-b-4 border-blue-600 text-blue-600 bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
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
    </MainLayout>
  );
};

export default MyPage;
