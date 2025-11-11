import { get, post, del } from "../common/apiClient";

const PATH_EXAM = "/exam";

const insertOrUpdateExam = async (body) => {
  return await post(PATH_EXAM, body);
};

const getExams = async (pageNumber, limit = 6, searchQuery) => {
  let query = "";
  if (!searchQuery) {
    query = `?page=${pageNumber}&limit=${limit}`;
  } else {
    query = `?page=${pageNumber}&limit=${limit}&q=${searchQuery}`;
  }
  return await get(PATH_EXAM + query);
};
const activeExam = async (examId) => {
  return await post(PATH_EXAM + `/active/${examId}`);
};
const deleteExam = async (examId) => {
  return await del(PATH_EXAM + `/${examId}`);
};

const getExamsMutiSearch = async (searchQuery = "", limit = 20) => {
  let query = `?limit=${limit}`;
  if (searchQuery && searchQuery.trim()) {
    query += `&q=${encodeURIComponent(searchQuery.trim())}`;
  }
  return await get(PATH_EXAM + `/exams-muti-search${query}`);
};
const totalExams = async () => {
  return await get(PATH_EXAM + `/total`);
};

const getExamByIds = async (body) => {
  return await post(PATH_EXAM + `/ids`, body);
};

const getExamsByAssessmentId = async (assessmentId, page = 1, limit = 50) => {
  return await get(
    PATH_EXAM + `/by-assessmentId/${assessmentId}?page=${page}&limit=${limit}`
  );
};
export {
  insertOrUpdateExam,
  getExams,
  activeExam,
  deleteExam,
  totalExams,
  getExamsMutiSearch,
  getExamByIds,
  getExamsByAssessmentId,
};
