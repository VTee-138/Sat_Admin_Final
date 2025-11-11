import axios from "axios";
import { decryptData } from "./decryption";

const REACT_APP_API_BASE_URL = "https://server.10sat.edu.vn/api/v2";
// const REACT_APP_API_BASE_URL = "http://localhost:4000/api/v2";
// const REACT_APP_API_BASE_URL = "https://api.10sat.io.vn/api/v2";

export const REACT_APP_API_UPLOAD_URL = "https://server.10sat.edu.vn";
// export const REACT_APP_API_UPLOAD_URL = "http://localhost:4000";
// Tạo instance Axios
const apiClient = axios.create({
  baseURL: REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      const data = JSON.parse(jwt);
      config.headers["Authorization"] = `Bearer ${data.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => decryptData(response.data),
  (error) => {
    if (error.response) {
      //   // Xử lý lỗi 401, 403, 500, v.v.
      if (error.response.status === 401) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        // Chỉ redirect nếu không phải đang ở trang login/
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Các hàm HTTP tiện dụng
export const get = (url, config = {}) => apiClient.get(url, config);
export const post = (url, data, config = {}) =>
  apiClient.post(url, data, config);
export const put = (url, data, config = {}) => apiClient.put(url, data, config);
export const del = (url, config = {}) => apiClient.delete(url, config);
export const patch = (url, data, config = {}) =>
  apiClient.patch(url, data, config);

export { REACT_APP_API_BASE_URL };
export default apiClient;
