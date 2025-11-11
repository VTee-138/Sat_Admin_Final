import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAssessments } from "../../services/AssessmentService";
import {
  getExamResults,
  exportExamResultsExcel,
} from "../../services/ExamResultService";

export default function ExamResultsPage() {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        // load many assessments at once
        const res = await getAssessments(1, 200, "");
        setAssessments(res?.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Lỗi tải danh sách bài thi"
        );
      }
    };
    loadAssessments();
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      if (!selectedAssessment) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await getExamResults(
          selectedAssessment,
          currentPage,
          limit
        );
        setResults(res?.data || []);
        setTotalPages(res?.totalPages || 1);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Lỗi tải kết quả bài thi"
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [selectedAssessment, currentPage]);

  // Không cần ghép môn nữa, API đã trả sẵn totalScore và cacheTotalScore

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Kết Quả Bài Thi
      </h2>

      <div className="flex flex-col gap-4 mb-6">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn Bài Thi
          </label>
          <select
            className="w-1/3 px-3 py-2 border rounded-md"
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
          >
            <option value="">-- Chọn bài thi --</option>
            {assessments.map((a) => (
              <option key={a?._id} value={a?._id}>
                {a?.title?.text || a?.title || a?._id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={() =>
              selectedAssessment && exportExamResultsExcel(selectedAssessment)
            }
            disabled={!selectedAssessment}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">#</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                  Họ tên
                </th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                  Tiếng Anh
                </th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                  Toán
                </th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                  Tổng điểm
                </th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                  Thời gian làm (phút)
                </th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                  Điểm lần trước
                </th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                  Xếp hạng
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-center" colSpan={7}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : results && results.length ? (
                results.map((r, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">{idx + 1}</td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {r.fullName}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {r.englishScore ?? 0}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {r.mathScore ?? 0}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {r.totalScore ?? 0}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {r.examCompletedTime ?? 0}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {r.cacheTotalScore ?? 0}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {r.ranking}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center" colSpan={7}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between p-4 items-center gap-2">
          <span className="text-sm">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors text-sm"
            >
              Trước
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => (p < totalPages ? p + 1 : p))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors text-sm"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
