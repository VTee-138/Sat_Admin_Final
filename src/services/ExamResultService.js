import { get, REACT_APP_API_BASE_URL } from "../common/apiClient";

const PATH_EXAM_RESULT = "/exam-result";

const getExamResults = async (assessmentId, page = 1, limit = 10) => {
  const params = new URLSearchParams();
  if (assessmentId) params.append("assessmentId", assessmentId);
  params.append("page", String(page));
  params.append("limit", String(limit));
  return await get(`${PATH_EXAM_RESULT}?${params.toString()}`);
};

export { getExamResults };

// Download excel of exam results by assessment
export const exportExamResultsExcel = async (assessmentId) => {
  const params = new URLSearchParams();
  params.append("assessmentId", assessmentId);

  const jwt = localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt"))
    : "";

  const response = await fetch(
    `${REACT_APP_API_BASE_URL}${PATH_EXAM_RESULT}/export?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: jwt?.token ? `Bearer ${jwt.token}` : undefined,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Export failed");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exam_results_${assessmentId}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  return { message: "Export thành công" };
};
