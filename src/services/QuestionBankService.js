import apiClient from "../common/apiClient";

const QuestionBankService = {
  // Tạo nhiều câu hỏi cùng lúc
  createMultipleQuestions: async (questions) => {
    const response = await apiClient.post("/question-bank/create-multiple", {
      questions,
    });
    return response;
  },

  updateMultipleQuestions: async (questions) => {
    const response = await apiClient.put("/question-bank/update-multiple", {
      questions,
    });
    return response;
  },

  // Lấy danh sách câu hỏi với phân trang và filter
  getQuestions: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const response = await apiClient.get(`/question-bank?${params}`);
    return response;
  },

  // Lấy câu hỏi theo ID
  getQuestionById: async (id) => {
    const response = await apiClient.get(`/question-bank/${id}`);
    return response;
  },

  // Cập nhật câu hỏi
  updateQuestion: async (id, questionData) => {
    const response = await apiClient.put(`/question-bank/${id}`, questionData);
    return response;
  },

  // Xóa câu hỏi
  deleteQuestion: async (id) => {
    const response = await apiClient.delete(`/question-bank/${id}`);
    return response;
  },

  // Xóa nhiều câu hỏi
  deleteMultipleQuestions: async (ids) => {
    const response = await apiClient.delete("/question-bank/multiple", {
      data: { ids },
    });
    return response;
  },

  // Lấy thống kê câu hỏi
  getQuestionStats: async () => {
    const response = await apiClient.get("/question-bank/stats");
    return response;
  },

  // Tìm kiếm câu hỏi nâng cao
  searchQuestions: async (searchCriteria) => {
    const response = await apiClient.post(
      "/question-bank/search",
      searchCriteria
    );
    return response;
  },

  // Lấy số lượng câu hỏi theo dạng
  getQuestionCountByCategory: async () => {
    const response = await apiClient.get("/question-bank/count-by-category");
    return response;
  },

  // Lấy câu hỏi theo dạng
  getQuestionsByType: async (
    questionType,
    subject,
    sortBy = "createdAt",
    sortOrder = "desc"
  ) => {
    const params = new URLSearchParams({
      questionType,
      subject,
      sortBy,
      sortOrder,
    });
    const response = await apiClient.get(`/question-bank/by-type?${params}`);
    return response;
  },

  // Lấy các dạng câu hỏi theo môn
  getQuestionTypes: async (subject) => {
    const response = await apiClient.get(
      `/question-bank/types?subject=${subject}`
    );
    return response;
  },

  // Tạo đề thi với filter
  generateFilteredExam: async (subject, filters) => {
    const response = await apiClient.post(
      "/question-bank/generate-filtered-exam",
      {
        subject,
        filters,
      }
    );
    return response;
  },

  // Tạo đề thi random
  generateRandomExam: async (subject, numberOfQuestions) => {
    const response = await apiClient.post(
      "/question-bank/generate-random-exam",
      {
        subject,
        numberOfQuestions,
      }
    );
    return response;
  },

  // Lấy thống kê để tạo đề
  getExamGenerationStats: async (subject) => {
    const response = await apiClient.get(
      `/question-bank/exam-stats?subject=${subject}`
    );
    return response;
  },
};

export default QuestionBankService;
