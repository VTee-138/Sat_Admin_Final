import { del, post } from "../common/apiClient";

class UploadService {
  // Upload ảnh cho câu hỏi
  async uploadQuestionImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    return await post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Xóa ảnh
  async deleteImage(filename) {
    return await del(`/upload/image/${filename}`);
  }
}

export default new UploadService();
