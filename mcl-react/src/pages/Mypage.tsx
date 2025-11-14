import React, { useMemo } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";

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
  { key: "benefits", name: "포인트/혜택", icon: Gift },
];

// 대시보드
const dashboardStyle: React.CSSProperties = {
  padding: "15px",
  marginTop: "10px",
  marginBottom: "10px",
  //backgroundColor: "#fff",
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
// 2. 탭별 컨텐츠 컴포넌트 (Placeholder)
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
          <h2>{user.nickname} 님</h2>
          <p>함께한 시간을 요약해 드릴게요.</p>
        </div>
      </div>

      {/* 활동 요약 섹션 */}
      <div className="dashboard-container">
        {/* 최근 작성 글 자리 */}
        <div className="dashboard-box" style={dashboardBoxStyle}>
          <h3>
            <Pen size={17} />
            &nbsp;최근 작성 글
          </h3>
          <ul>
            <li>최근 글 제목 1 (2025.11.10)</li>
            <li>최근 글 제목 2 (2025.11.08)</li>
            <li>최근 글 제목 3 (2025.11.05)</li>
            <li>더 보기 &gt;</li>
          </ul>
        </div>

        {/* 최근 작성 댓글 자리 */}
        <div className="dashboard-box" style={dashboardBoxStyle}>
          <h3>
            <MessageSquareMore size={17} />
            &nbsp;최근 작성 댓글
          </h3>
          <ul>
            <li>댓글 내용 요약 1 (2025.11.11)</li>
            <li>댓글 내용 요약 2 (2025.11.09)</li>
            <li>댓글 내용 요약 3 (2025.11.07)</li>
            <li>더 보기 &gt;</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 기타 탭 Placeholder
const PlaceholderContent: React.FC<{ tabName: string }> = ({ tabName }) => (
  <div className="p-8 bg-white rounded-xl shadow-lg text-center h-64 flex flex-col justify-center items-center">
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
      case "profile":
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
      <div style={dashboardStyle}>
        {/* 탭 네비게이션 영역 */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-8 bg-white rounded-t-lg shadow-md">
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
