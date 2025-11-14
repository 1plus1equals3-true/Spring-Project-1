import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config/defaultconfig";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// ⭐️ 2. Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ⭐️ 3. 전역 상태 변수 및 큐 함수 (최상위에 선언)
let isRefreshing = false;
let failedQueue: {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(true);
    }
  });
  failedQueue = [];
};

// -----------------------------------------------------------------------
// 4. 응답 인터셉터 설정 (Access Token 만료 처리 로직)
// -----------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // ⭐️ error.config를 확장된 타입으로 캐스팅하여 사용합니다.
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const errorMessage = (error.response?.data as any)?.message;

    // 401 Unauthorized 이고, 재시도 플래그가 설정되지 않은 요청에 대해서만 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Access Token 만료에 대한 JSON 메시지 확인 (백엔드와 일치하는지 확인)

      if (
        errorMessage !== "유효한 Access Token이 쿠키에 없거나 만료되었습니다."
      ) {
        // Refresh Token 재발급 대상 오류가 아니면 바로 reject
        return Promise.reject(error);
      }

      // Refreshing 중일 경우, 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          // 재발급 완료 후 원래 요청을 재시도
          failedQueue.push({
            resolve: () => resolve(apiClient(originalRequest)),
            reject,
          });
        });
      }

      // 재발급 시작
      isRefreshing = true;

      try {
        // 💡 Refresh Token 재발급 API 호출: withCredentials로 쿠키 자동 전송
        await axios.post(`${API_BASE_URL}/api/v1/auth/reissue`, null, {
          withCredentials: true,
        });

        // 재발급 성공 시
        isRefreshing = false;
        processQueue(null); // 큐에 있는 요청 처리 (새 쿠키로 재시도)

        return apiClient(originalRequest); // ⭐️ 원래 요청을 재시도
      } catch (refreshError) {
        // Refresh Token 재발급까지 실패하면 강제 로그아웃
        isRefreshing = false;
        processQueue(refreshError);

        // 강제 로그아웃 및 로그인 페이지로 리다이렉트
        // window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
