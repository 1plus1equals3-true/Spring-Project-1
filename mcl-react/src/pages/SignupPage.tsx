import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/defaultconfig"; // ⬅️ 원본 경로 복원
import Header from "../components/layout/Header"; // ⬅️ 원본 경로 복원

// 회원가입 폼 데이터를 위한 타입 정의
interface SignupFormData {
  userid: string;
  pwd: string;
  nickname: string;
  birth: string; // YYYY-MM-DD
  profileImage: File | null; // 파일 객체 저장
}

// 유효성 검사 메시지 및 상태를 위한 타입 정의
interface ValidationState {
  isValid: boolean; // 기본 정규식 및 길이 만족 여부
  isDuplicated: boolean; // 중복 여부 (API 결과)
  message: string;
  checkStatus: "idle" | "checking" | "checked"; // 중복 검사 상태
}

interface ValidationMessages {
  userid: ValidationState;
  pwd: ValidationState;
  nickname: ValidationState;
}

// 비밀번호 정규식 (백엔드와 동일: 8~20자, 영문, 숫자, 특수문자 포함)
const PWD_REGEX = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\W)(?=\S+$).{8,20}$/;

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    userid: "",
    pwd: "",
    nickname: "",
    birth: "",
    profileImage: null,
  });

  const initialValidationState: ValidationState = {
    isValid: false,
    isDuplicated: true, // 기본값: 중복이라고 가정하고 시작 (ID/Nickname용)
    message: "",
    checkStatus: "idle",
  };

  const [validationMessages, setValidationMessages] =
    useState<ValidationMessages>({
      userid: {
        ...initialValidationState,
        message: "아이디는 5~15자 영문, 숫자만 가능합니다.",
      },
      pwd: {
        ...initialValidationState,
        // PWD는 중복 검사가 없으므로 isDuplicated를 false로 초기화합니다.
        isDuplicated: false,
        message: "비밀번호는 8~20자, 영문, 숫자, 특수문자를 포함해야 합니다.",
      },
      nickname: {
        ...initialValidationState,
        message: "닉네임은 2~10자 한글, 영문, 숫자만 가능합니다.",
      },
    });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // -------------------------------------------------------------------------
  // 1. 유효성 검사 로직
  // -------------------------------------------------------------------------

  /**
   * 아이디 및 닉네임 기본 유효성(길이, 문자 종류) 검사
   */
  const validateField = (
    name: keyof ValidationMessages,
    value: string
  ): boolean => {
    let isValid = false;
    let message = "";

    if (name === "userid") {
      // 아이디: 5~15자, 영문, 숫자
      isValid = /^[a-zA-Z0-9]{5,15}$/.test(value);
      message = isValid
        ? "✅ 아이디 형식 만족"
        : "아이디는 5~15자 영문, 숫자만 가능합니다.";
    } else if (name === "pwd") {
      // 비밀번호: 8~20자, 영문, 숫자, 특수문자 포함
      isValid = PWD_REGEX.test(value);
      message = isValid
        ? "✅ 비밀번호 형식 만족"
        : "비밀번호는 8~20자, 영문, 숫자, 특수문자를 포함해야 합니다.";
    } else if (name === "nickname") {
      // 닉네임: 2~10자, 한글, 영문, 숫자
      isValid = /^[가-힣a-zA-Z0-9]{2,10}$/.test(value);
      message = isValid
        ? "✅ 닉네임 형식 만족"
        : "닉네임은 2~10자 한글, 영문, 숫자만 가능합니다.";
    }

    setValidationMessages((prev) => {
      const newState = {
        ...prev[name],
        isValid,
        message:
          // 이미 checkStatus가 checked인 경우, 메시지는 checkDuplication 결과에 의해 관리되어야 함
          isValid && prev[name].checkStatus !== "checked"
            ? message
            : isValid
            ? prev[name].message // 유효성 통과 후 중복확인 메시지 유지
            : message, // 유효성 실패 시 메시지 변경
      };

      // ⭐️ PWD 필드의 isDuplicated 상태는 변경하지 않고, ID/Nickname 필드에만 유효성 실패 시 중복 상태를 초기화합니다.
      if (name !== "pwd") {
        // ID/Nickname 필드 처리: isValid가 false가 되면 isDuplicated를 true로 설정하여 다시 검사를 유도
        newState.isDuplicated = !isValid ? true : prev[name].isDuplicated;
      }
      // PWD의 isDuplicated는 초기값(false)을 유지합니다.

      return {
        ...prev,
        [name]: newState,
      };
    });
    return isValid;
  };

  /**
   * 아이디/닉네임 중복 검사 API 호출 (useCallback 의존성 제거)
   * @param name - 필드 이름 ('userid' 또는 'nickname')
   * @param value - 현재 입력 값
   * @param isValid - 현재 값의 기본 유효성 통과 여부
   */
  const checkDuplication = useCallback(
    async (name: "userid" | "nickname", value: string, isValid: boolean) => {
      if (value.length === 0) return;

      // 1. 기본 유효성 미만족 시 API 호출 중단
      if (!isValid) {
        setValidationMessages((prev) => ({
          ...prev,
          [name]: {
            ...prev[name],
            isDuplicated: true,
            checkStatus: "checked", // API 호출을 막기 위해 잠시 checked로 설정
            message: prev[name].message, // validateField에서 설정된 오류 메시지 유지
          },
        }));
        return;
      }

      setValidationMessages((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          checkStatus: "checking",
          message: "⏳ 중복 확인 중...",
        },
      }));

      const endpoint = name === "userid" ? "/check-userid" : "/check-nickname";
      const param = name === "userid" ? `userid=${value}` : `nickname=${value}`;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/auth${endpoint}?${param}`
        );
        const isDuplicated = response.data as boolean; // true: 중복, false: 사용 가능

        setValidationMessages((prev) => ({
          ...prev,
          [name]: {
            ...prev[name],
            isDuplicated,
            checkStatus: "checked",
            message: isDuplicated
              ? `❌ 이미 사용 중인 ${
                  name === "userid" ? "아이디" : "닉네임"
                }입니다.`
              : `✅ 사용 가능한 ${
                  name === "userid" ? "아이디" : "닉네임"
                }입니다.`,
          },
        }));
      } catch (error) {
        console.error(`${name} 중복 확인 오류:`, error);
        setValidationMessages((prev) => ({
          ...prev,
          [name]: {
            ...prev[name],
            isDuplicated: true,
            checkStatus: "checked",
            message: "서버 오류로 중복 확인에 실패했습니다.",
          },
        }));
      }
    },
    [] // 💡 빈 배열로 변경: setValidationMessages에 함수형 업데이트를 사용하여 의존성 제거
  );

  // -------------------------------------------------------------------------
  // 2. 이벤트 핸들러
  // -------------------------------------------------------------------------

  /**
   * 일반 텍스트 입력 필드 변경 핸들러
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 실시간 기본 유효성 검사 (아이디, 비밀번호, 닉네임)
    if (name === "userid" || name === "pwd" || name === "nickname") {
      // 💡 아이디나 닉네임 값이 변경되면 중복 확인 상태를 초기화 (다시 검사해야 함)
      if (name !== "pwd") {
        setValidationMessages((prev) => ({
          ...prev,
          [name]: { ...prev[name], checkStatus: "idle" },
        }));
      }
      validateField(name, value);
    }
  };

  /**
   * 아이디 입력 시 디바운스 적용 후 중복 검사 실행
   */
  useEffect(() => {
    // ⭐️ formData에서 직접 userid 값을 가져와 사용합니다.
    const currentUserId = formData.userid;
    const { isValid, checkStatus, isDuplicated } = validationMessages.userid;

    // ⭐️ 중복 확인이 이미 완료되었고, 사용 가능 상태(isDuplicated: false)이면 API 호출 스킵
    if (checkStatus === "checked" && !isDuplicated) {
      return;
    }

    const timer = setTimeout(() => {
      if (currentUserId.length > 0 && isValid) {
        // checkDuplication 함수에 isValid 상태를 전달
        checkDuplication("userid", currentUserId, isValid);
      }
    }, 1000); // 디바운스

    return () => clearTimeout(timer); // 클린업 함수
    // ⭐️ 의존성 배열을 formData.userid로 수정하여 스코프 오류 해결
  }, [formData.userid, validationMessages.userid.isValid, checkDuplication]);

  /**
   * 닉네임 입력 시 디바운스 적용 후 중복 검사 실행
   */
  useEffect(() => {
    // ⭐️ formData에서 직접 nickname 값을 가져와 사용합니다.
    const currentNickname = formData.nickname;
    const { isValid, checkStatus, isDuplicated } = validationMessages.nickname;

    // ⭐️ 중복 확인이 이미 완료되었고, 사용 가능 상태(isDuplicated: false)이면 API 호출 스킵
    if (checkStatus === "checked" && !isDuplicated) {
      return;
    }

    const timer = setTimeout(() => {
      if (currentNickname.length > 0 && isValid) {
        // checkDuplication 함수에 isValid 상태를 전달
        checkDuplication("nickname", currentNickname, isValid);
      }
    }, 1000); // 디바운스

    return () => clearTimeout(timer); // 클린업 함수
    // ⭐️ 의존성 배열을 formData.nickname로 수정하여 스코프 오류 해결
  }, [
    formData.nickname,
    validationMessages.nickname.isValid,
    checkDuplication,
  ]);
  // 💡 의존성 배열에서 checkStatus와 isDuplicated를 제거하고, 조건문으로 제어

  /**
   * 파일 입력 필드 변경 핸들러 및 미리보기 URL 관리 (기존 로직 유지)
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    setFormData((prev) => ({ ...prev, profileImage: file }));

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // 컴포넌트 언마운트 시 URL 해제 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 비밀번호 토글 핸들러
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // -------------------------------------------------------------------------
  // 3. 폼 제출 및 최종 검사
  // -------------------------------------------------------------------------

  /**
   * 모든 유효성 검사 통과 여부 확인
   */
  const isFormValid = React.useMemo(() => {
    const isIdValid =
      validationMessages.userid.isValid &&
      !validationMessages.userid.isDuplicated &&
      validationMessages.userid.checkStatus === "checked";
    const isPwdValid = validationMessages.pwd.isValid;
    const isNicknameValid =
      validationMessages.nickname.isValid &&
      !validationMessages.nickname.isDuplicated &&
      validationMessages.nickname.checkStatus === "checked";

    // 필수 필드 (아이디, 비밀번호, 닉네임)의 데이터 존재 여부
    const isRequiredFilled =
      formData.userid.length > 0 &&
      formData.pwd.length > 0 &&
      formData.nickname.length > 0;

    return isRequiredFilled && isIdValid && isPwdValid && isNicknameValid;
  }, [formData, validationMessages]);

  /**
   * 폼 제출 핸들러 (회원가입 API 호출)
   */
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ⭐️ 1차: 최종 프론트엔드 유효성 검사
    if (!isFormValid) {
      setError(
        "입력된 정보를 다시 확인해 주세요. 모든 필수 조건이 만족되어야 합니다."
      );
      return;
    }

    const formPayload = new FormData();
    formPayload.append("userid", formData.userid);
    formPayload.append("pwd", formData.pwd);
    formPayload.append("nickname", formData.nickname);
    if (formData.birth) {
      formPayload.append("birth", formData.birth);
    }
    if (formData.profileImage) {
      formPayload.append("profileImage", formData.profileImage);
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/signup`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        // 201 Created -> ⭐️ 성공 페이지로 즉시 이동
        navigate("/signup-success");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : "회원가입에 실패했습니다. 정보를 다시 확인해 주세요.";
        // 백엔드 중복 오류는 여기서 최종 처리
        setError(errorMessage);
      } else {
        setError("네트워크 오류 또는 서버 접속에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 유효성 검사 메시지 컴포넌트
   */
  const ValidationMessage: React.FC<{ validation: ValidationState }> = ({
    validation,
  }) => {
    // 메시지 색상 결정
    const getColor = () => {
      // 1. 중복 확인 중일 때
      if (validation.checkStatus === "checking") return "gray";

      // 2. 기본 유효성 검사 실패 (모든 필드)
      if (!validation.isValid) return "red";

      // 3. 유효성 검사 통과 후 처리
      if (validation.isValid) {
        // ID/Nickname: 중복이면 빨간색, 아니면 녹색
        // PWD: isDuplicated가 false로 초기화되어 있으므로, isValid만 true면 녹색
        if (validation.isDuplicated) {
          return "red";
        } else {
          return "green";
        }
      }

      // 기본
      return "gray";
    };

    return (
      <p
        style={{
          fontSize: "0.85em",
          color: getColor(),
          marginTop: "5px",
          marginBottom: "5px",
        }}
      >
        {validation.message}
      </p>
    );
  };

  return (
    <div>
      <Header />
      <div
        style={{
          maxWidth: "450px",
          margin: "80px auto",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#007bff",
            marginBottom: "30px",
          }}
        >
          회원가입 🚀
        </h1>
        <form onSubmit={handleSignupSubmit} encType="multipart/form-data">
          {/* 아이디 */}
          <p style={labelStyle}>아이디</p>
          <input
            type="text"
            name="userid"
            placeholder="아이디 (5~15자, 영문/숫자)"
            value={formData.userid}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
          <ValidationMessage validation={validationMessages.userid} />

          {/* 비밀번호 */}
          <p style={labelStyle}>비밀번호</p>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="pwd"
              placeholder="비밀번호 (8~20자, 영문/숫자/특수문자 포함)"
              value={formData.pwd}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={toggleButtonStyle}
            >
              {showPassword ? "숨기기" : "보기"}
            </button>
          </div>
          <ValidationMessage validation={validationMessages.pwd} />

          {/* 닉네임 */}
          <p style={labelStyle}>닉네임</p>
          <input
            type="text"
            name="nickname"
            placeholder="닉네임 (2~10자, 한글/영문/숫자)"
            value={formData.nickname}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
          <ValidationMessage validation={validationMessages.nickname} />

          {/* 생일 */}
          <p style={labelStyle}>생년월일 (선택 사항)</p>
          <input
            type="date"
            name="birth"
            value={formData.birth}
            onChange={handleInputChange}
            style={{ ...inputStyle, height: "40px" }}
          />

          {/* 프로필 사진 */}
          <p style={labelStyle}>프로필 사진 (선택 사항)</p>
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="프로필 미리보기"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ddd",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "0 auto",
                  lineHeight: "100px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "50%",
                  border: "1px dashed #aaa",
                  color: "#888",
                }}
              >
                No Image
              </div>
            )}
          </div>
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleFileChange}
            style={fileInputStyle}
          />

          {/* 에러 메시지 표시 영역 (폼 제출 시 오류) */}
          {error && (
            <p
              style={{
                color: "red",
                fontSize: "0.9em",
                textAlign: "center",
                marginBottom: "15px",
                fontWeight: "bold",
                padding: "10px",
                backgroundColor: "#ffeeee",
                borderRadius: "5px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !isFormValid} // ⭐️ 유효성 검사 실패 시 버튼 비활성화
            style={{
              ...buttonStyle,
              backgroundColor: isLoading || !isFormValid ? "#ccc" : "#007bff",
            }}
          >
            {isLoading ? "등록 중..." : "가입하기"}
          </button>
        </form>
        <p
          style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9em" }}
        >
          이미 계정이 있으신가요?
          <a
            onClick={() => navigate("/login")}
            style={{
              color: "#007bff",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            로그인
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

// 💡 재사용 가능한 스타일 정의
const labelStyle: React.CSSProperties = {
  marginTop: "15px",
  marginBottom: "5px",
  fontSize: "0.95em",
  color: "#333",
  fontWeight: "600",
};

const inputStyle: React.CSSProperties = {
  width: "calc(100%)",
  margin: "5px 0",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px",
  boxSizing: "border-box", // 패딩이 너비에 포함되도록 설정
};

const fileInputStyle: React.CSSProperties = {
  width: "calc(100%)",
  margin: "5px 0 15px 0",
  padding: "5px",
  border: "1px solid #ddd",
  borderRadius: "5px",
  backgroundColor: "#f9f9f9",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  margin: "25px 0 10px 0",
  padding: "15px",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background-color 0.3s",
};

const toggleButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  right: "10px",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  padding: "5px",
  cursor: "pointer",
  fontSize: "0.85em",
  color: "#007bff",
  fontWeight: "bold",
  zIndex: 10,
};
