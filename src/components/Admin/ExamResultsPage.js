import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { TablePagination, TableContainer, Paper } from "@mui/material";
import { TablePagination, TableContainer, Paper } from "@mui/material";
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");

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
          page + 1,
          rowsPerPage,
          search
        );
        setResults(res?.data || []);
        setTotalItems(res?.totalItems || 0);
        setTotalItems(res?.totalItems || 0);
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
  }, [selectedAssessment, page, rowsPerPage, search]);

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
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm (theo tên, email, tên lớp)
          </label>
          <input
            type="text"
            className="w-1/3 px-3 py-2 border rounded-md"
            placeholder="Nhập tên, email hoặc tên lớp để tìm kiếm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0); // Reset về trang đầu khi search
            }}
          />
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
        <TableContainer component={Paper}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">#</th>
                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                    Họ tên
                  </th>
                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                    Tên lớp
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
                    <td className="p-4 text-center" colSpan={9}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : results && results.length ? (
                  results.map((r, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        {page * rowsPerPage + idx + 1}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        {r.fullName}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        {r.className || "-"}
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
                    <td className="p-4 text-center" colSpan={9}>
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TableContainer>
        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong ${count}`
          }
        />
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong ${count}`
          }
        />
      </div>
    </div>
  );
}
