import { get } from "../common/apiClient";

const PATH_STREAK = "/streak";

// Admin: Lấy tất cả streak của users
const getAllUsersStreak = async (page = 1, limit = 20, search = "") => {
  return await get(
    `${PATH_STREAK}/admin/all?page=${page}&limit=${limit}&search=${search}`,
    {
      withCredentials: true,
    }
  );
};

// Admin: Export tất cả streak
const exportAllUsersStreak = async () => {
  return await get(`${PATH_STREAK}/admin/export`, {
    withCredentials: true,
  });
};

const StreakService = {
  getAllUsersStreak,
  exportAllUsersStreak,
};

export default StreakService;
