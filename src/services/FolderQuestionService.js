import { del, get, post, put } from "../common/apiClient";

const FolderQuestionService = {
  // Lấy danh sách thư mục câu hỏi
  getFolderQuestions: async (page = 1, limit = 20, search = null) => {
    try {
      let url = `/folder-question?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      return await get(url);
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin chi tiết thư mục câu hỏi
  getFolderQuestionById: async (folderId) => {
    return await get(`/folder-question/${folderId}`);
  },

  // Tạo thư mục câu hỏi mới
  createFolderQuestion: async (folderData) => {
    return await post("/folder-question", folderData);
  },

  // Cập nhật thư mục câu hỏi
  updateFolderQuestion: async (folderId, folderData) => {
    return await put(`/folder-question/${folderId}`, folderData);
  },

  // Xóa thư mục câu hỏi
  deleteFolderQuestion: async (folderId) => {
    return await del(`/folder-question/${folderId}`);
  },

  // Tạo thư mục câu hỏi bởi Admin (nếu cần endpoint riêng)
  createFolderQuestionByAdmin: async (folderData) => {
    return await post("/folder-question/admin", folderData);
  },
};

export default FolderQuestionService;
