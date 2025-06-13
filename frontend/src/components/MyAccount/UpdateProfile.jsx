// components/UpdateProfile.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router"; // Link from react-router-dom
import defaultProfileImg from "../../assets/profile_image.svg";
import useAuthStore from "../../store/authStore";

const UpdateProfile = () => {
  const nameRegex = /^(?!^\d+$)[\p{L}][\p{L}\p{N}\s.'-]*$/u;
  const USERNAME_MAX_LENGTH = 20;
  const BIO_MAX_LENGTH = 200;

  // useAuthStore에서 user와 updateUser 액션 가져오기
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser); // ✨ updateUser 액션 가져오기
  const navigate = useNavigate();

  const [userName, setUserName] = useState(user.username ?? "");
  const [nameMessage, setNameMessage] = useState("");

  const [bio, setBio] = useState(user.bio ?? "");
  const [bioMessage, setBioMessage] = useState("");

  const [showMessage, setShowMessage] = useState({
    showNameMessage: false,
    showBioMessage: false,
    changeSuccess: false,
    apiError: false, // ✨ API 오류 상태 추가
    apiErrorMessage: "", // ✨ API 오류 메시지 추가
  });

  const nameInputHandler = (e) => {
    const inputValue = e.target.value;
    setUserName(inputValue);

    setShowMessage((prevState) => ({ ...prevState, showNameMessage: false }));
    setNameMessage("");

    if (inputValue.trim() === "") {
      setNameMessage("Please type username.");
      setShowMessage((prevState) => ({ ...prevState, showNameMessage: true }));
      return;
    }

    if (inputValue.length > USERNAME_MAX_LENGTH) {
      setNameMessage(`Username muse be under ${USERNAME_MAX_LENGTH} characters.`);
      setShowMessage((prevState) => ({ ...prevState, showNameMessage: true }));
      return;
    }

    if (!nameRegex.test(inputValue)) {
      setNameMessage(
        "Username must start with a letter and can only contain letters, numbers, spaces, periods (.), apostrophes ('), hyphens (-), and cannot consist solely of numbers."
      );
      setShowMessage((prevState) => ({ ...prevState, showNameMessage: true }));
      return;
    }
  };

  const bioInputHandler = (e) => {
    const inputValue = e.target.value;
    setBio(inputValue);

    setShowMessage((prevState) => ({ ...prevState, showBioMessage: false }));
    setBioMessage("");

    if (inputValue.length > BIO_MAX_LENGTH) {
      setBioMessage(`Bio must be less than ${BIO_MAX_LENGTH} characters.`);
      setShowMessage((prevState) => ({ ...prevState, showBioMessage: true }));
    }
  };

  const submitUpdateProfileHandler = async (e) => {
    e.preventDefault();

    let isValid = true; // 폼 전체 유효성 검사 플래그
    setShowMessage((prevState) => ({ ...prevState, apiError: false, apiErrorMessage: "" })); // ✨ API 에러 메시지 초기화

    // --- 사용자 이름 유효성 검사 (Submit 시) ---
    if (userName.trim() === "") {
      setNameMessage("Please tye username.");
      setShowMessage((prevState) => ({ ...prevState, showNameMessage: true }));
      isValid = false;
    } else if (userName.length > USERNAME_MAX_LENGTH) {
      setNameMessage(`Username must be under ${USERNAME_MAX_LENGTH} characters.`);
      setShowMessage((prevState) => ({ ...prevState, showNameMessage: true }));
      isValid = false;
    } else if (!nameRegex.test(userName)) {
      setNameMessage(
        "Username must start with a letter and can only contain letters, numbers, spaces, periods (.), apostrophes ('), hyphens (-), and cannot consist solely of numbers."
      );
      setShowMessage((prevState) => ({ ...prevState, showNameMessage: true }));
      isValid = false;
    } else {
      setShowMessage((prevState) => ({ ...prevState, showNameMessage: false }));
      setNameMessage("");
    }

    // --- 자기소개 유효성 검사 (Submit 시) ---
    if (bio.length > BIO_MAX_LENGTH) {
        setBioMessage(`bio must be less than ${BIO_MAX_LENGTH} characters.`);
        setShowMessage((prevState) => ({ ...prevState, showBioMessage: true }));
        isValid = false;
    } else {
        setShowMessage((prevState) => ({ ...prevState, showBioMessage: false }));
        setBioMessage("");
    }

    if (!isValid) {
      return; // 유효성 검사 실패 시 제출 중단
    }

    // --- DB 업데이트 로직 ---
    try {
      const updateData = {};
      if (userName !== user.username) { // 이름이 변경되었을 경우에만 전송
        updateData.username = userName;
      }
      if (bio !== user.bio) { // 자기소개가 변경되었을 경우에만 전송
        updateData.bio = bio;
      }

      // 변경된 필드가 없으면 API 호출하지 않음
      if (Object.keys(updateData).length === 0) {
        setShowMessage((prevState) => ({ ...prevState, changeSuccess: true }));
        return;
      }

      const response = await fetch('http://localhost:5000/api/v1/users/updateMe', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization' 헤더는 HttpOnly 쿠키를 사용하므로 수동으로 추가할 필요 없음
        },
        body: JSON.stringify(updateData),
        credentials: 'include', // HttpOnly 쿠키를 요청에 포함
      });

      const data = await response.json();

      if (response.ok) {
        // API 응답에서 업데이트된 사용자 정보를 받아서 Zustand 스토어 업데이트
        updateUser(data.data.user); // ✨ updateUser 액션 호출
        setShowMessage((prevState) => ({ ...prevState, changeSuccess: true }));
      } else {
        // API 응답에 따른 오류 처리
        let errorMessage = "Failed to update profile. Please try again";
        if (data && data.message) { // 백엔드에서 제공하는 오류 메시지 사용
          errorMessage = data.message;
        } else if (response.status === 401) {
          errorMessage = "Not authenticated. please login.";
          // navigate('/sign-in'); // 필요시 로그인 페이지로 리다이렉트
        }
        setShowMessage((prevState) => ({ ...prevState, apiError: true, apiErrorMessage: errorMessage }));
      }
    } catch (error) {
      console.error("Network error:", error);
      setShowMessage((prevState) => ({ ...prevState, apiError: true, apiErrorMessage: "Network error" }));
    }
  };

  // --- Success message display ---
  if (showMessage.changeSuccess) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div
          className="p-8 bg-white rounded w-full md:max-w-xl lg:max-w-2xl"
          style={{
            boxShadow:
              "0px 5px 10px rgba(0,0,0,0.1), 0px 1.6px 3.6px rgba(0,0,0,0.1)",
          }}
        >
          <form className="flex flex-col m-6">
            <h1 className="text-xl font-normal mb-10">Your profile has been updated!</h1>

            <div className="flex justify-center items-center">
              <button
                className="py-1.5 px-8 rounded-sm border bg-blue text-white hover:bg-blue-hover transition-colors hover:cursor-pointer"
                onClick={() => navigate("/my-account")}
              >
                Ok
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Main Update Profile Form ---
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div
        className="p-8 bg-white rounded w-full md:max-w-xl lg:max-w-2xl"
        style={{
          boxShadow:
            "0px 5px 10px rgba(0,0,0,0.1), 0px 1.6px 3.6px rgba(0,0,0,0.1)",
        }}
      >
        <form className="flex flex-col" onSubmit={submitUpdateProfileHandler}>
          <h1 className="text-2xl font-normal mb-6">Profile Update</h1>
          <div className="mb-6">
            <p className="text-xs text-light-text">
              Update your personal information
            </p>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <div className="w-20 h-20 m-5 overflow-hidden rounded-full">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile image" referrerPolicy="no-referrer" className="rounded-full" />
              ) : (
                <img src={defaultProfileImg} alt="empty profile image" className="rounded-full" />
              )}
            </div>
          </div>
          {/* Username Input Field */}
          <div className="mb-6">
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              value={userName}
              type="text"
              placeholder="Please type your username"
              id="userName"
              className={`
                w-full p-2 border rounded-md shadow-sm
                focus:ring-blue-500 focus:border-blue-500
                ${showMessage.showNameMessage ? "border-red-500" : "border-gray-300"}
                text-gray-900 bg-white placeholder-gray-400
              `}
              onChange={nameInputHandler}
            />
            {showMessage.showNameMessage && (
              <p className="mt-1 text-sm text-red-600">{nameMessage}</p>
            )}
          </div>

          {/* Bio Input Field */}
          <div className="mb-6">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              value={bio}
              placeholder="Please introduce about yourself"
              id="bio"
              rows="4"
              className={`
                w-full p-2 border rounded-md shadow-sm
                focus:ring-blue-500 focus:border-blue-500
                ${showMessage.showBioMessage ? "border-red-500" : "border-gray-300"}
                text-gray-900 bg-white placeholder-gray-400 resize-y
              `}
              onChange={bioInputHandler}
            />
            <p className="mt-1 text-xs text-gray-500 text-right">
                {bio.length}/{BIO_MAX_LENGTH} character(s)
            </p>
            {showMessage.showBioMessage && (
              <p className="mt-1 text-sm text-red-600">{bioMessage}</p>
            )}
          </div>

          {/* ✨ API 오류 메시지 표시 */}
          {showMessage.apiError && (
            <p className="mb-4 text-sm text-red-600 text-center">
              {showMessage.apiErrorMessage}
            </p>
          )}

          <div className="flex">
            <button
              className="mr-6 py-1.5 px-8 rounded-sm border bg-blue text-white hover:bg-blue-hover transition-colors hover:cursor-pointer"
              type="submit"
            >
              Save
            </button>
            <Link
              className="text-blue py-1.5 hover:underline hover:cursor-pointer"
              to="/my-account"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;