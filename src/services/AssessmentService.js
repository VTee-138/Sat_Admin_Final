import { get, post, del, put } from "../common/apiClient";

const PATH_ASSESSMENT = "/assessment";

const createAssessment = async (body) => {
  return await post(PATH_ASSESSMENT, body);
};

const getAssessments = async (pageNumber, limit = 6, searchQuery) => {
  let query = "";
  if (!searchQuery) {
    query = `?page=${pageNumber}&limit=${limit}`;
  } else {
    query = `?page=${pageNumber}&limit=${limit}&q=${searchQuery}`;
  }
  return await get(PATH_ASSESSMENT + query);
};

const deleteAssessment = async (examId) => {
  return await del(PATH_ASSESSMENT + `/${examId}`);
};

const getAssessmentInfoById = async () => {
  return await get(PATH_ASSESSMENT + `/user-info`);
};

const totalAssessments = async () => {
  return await get(PATH_ASSESSMENT + `/total`);
};

export {
  createAssessment,
  getAssessments,
  deleteAssessment,
  getAssessmentInfoById,
  totalAssessments,
};
