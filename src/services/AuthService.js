import jwtDecode from "jwt-decode";
import { get, post } from "../common/apiClient";

const PATH_AUTH = "/auth";
const login = async (body) => {
  return await post(PATH_AUTH + "/login-admin", body, {
    withCredentials: true, // Cho phép gửi cookie trong request
  });
};

const checkJwtExistsAndExpired = () => {
  const jwt = localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt"))
    : "";
  if (!jwt || !jwt.token) {
    localStorage.clear();
    return false; // Nếu không có token, coi như không hợp lệ
  }

  try {
    // Giải mã token và trích xuất trường exp
    const { exp } = jwtDecode(jwt.token);
    if (!exp) {
      localStorage.clear(); // Xóa tất cả thông tin trong localStorage
      return false; // Nếu không có trường exp, coi như không hợp lệ
    }

    // Lấy thời gian hiện tại tính bằng giây kể từ Unix Epoch
    const now = Date.now() / 1000;

    if (exp < now) {
      localStorage.clear(); // Xóa tất cả thông tin trong localStorage
      return false; // Token đã hết hạn
    }

    return true; // Token còn hiệu lực
  } catch (error) {
    localStorage.clear(); // Xóa tất cả thông tin trong localStorage nếu có lỗi khi giải mã token
    return false; // Nếu có lỗi khi giải mã token, coi như không hợp lệ
  }
};
export { login, checkJwtExistsAndExpired };
