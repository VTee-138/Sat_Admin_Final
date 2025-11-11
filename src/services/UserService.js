import {
  get,
  post,
  del,
  put,
  REACT_APP_API_BASE_URL,
} from "../common/apiClient";

const PATH_USER = "/user";
const createUser = async (body) => {
  return await post(PATH_USER, body);
};

const updatePassword = async (body) => {
  return await put(PATH_USER + "/update-password", body);
};

const getUsers = async (pageNumber, limit = 6, searchQuery) => {
  let query = "";
  if (!searchQuery) {
    query = `?page=${pageNumber}&limit=${limit}`;
  } else {
    query = `?page=${pageNumber}&limit=${limit}&q=${searchQuery}`;
  }
  return await get(PATH_USER + query);
};

const deleteUser = async (examId) => {
  return await del(PATH_USER + `/${examId}`);
};

const getUserInfoById = async () => {
  return await get(PATH_USER + `/user-info`);
};

const totalUsers = async () => {
  return await get(PATH_USER + `/total`);
};

const activePremium = async (id, premium) => {
  return await put(PATH_USER + `/premium/${id}`, { premium });
};

const searchUsersByEmail = async (email) => {
  return await get(PATH_USER + `/search-by-email?email=${email}`);
};

const getUserById = async (id) => {
  return await get(PATH_USER + `/user/${id}`);
};

const importUsersFromExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const jwt = localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt"))
    : "";
  const response = await fetch(
    `${REACT_APP_API_BASE_URL}${PATH_USER}/import-excel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt?.token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Upload failed");
  }

  return await response.json();
};

const exportTrialUsers = async () => {
  const jwt = localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt"))
    : "";

  const response = await fetch(
    `${REACT_APP_API_BASE_URL}${PATH_USER}/export-trial-users`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt?.token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Export failed");
  }

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = "trial_users.xlsx";
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (filenameMatch && filenameMatch[1]) {
      filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ""));
    }
  }

  // Convert response to blob and download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return { message: "Export thành công" };
};

export {
  createUser,
  getUsers,
  updatePassword,
  deleteUser,
  getUserInfoById,
  totalUsers,
  activePremium,
  searchUsersByEmail,
  getUserById,
  importUsersFromExcel,
  exportTrialUsers,
};
