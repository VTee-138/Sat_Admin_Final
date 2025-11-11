import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search, Folder, HelpCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Tooltip } from "@mui/material";
import FolderQuestionForm from "./FolderQuestionForm";
import ConfirmationDialog from "./ConfirmationDialog";
import FolderQuestionService from "../../services/FolderQuestionService";

const configDate = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Ho_Chi_Minh",
};

export default function FolderQuestions() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3954d9",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [isEditing, setIsEditing] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [listFolderQuestions, setListFolderQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  // State cho confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const handleFetch = async () => {
    try {
      const response = await FolderQuestionService.getFolderQuestions(
        currentPage,
        limit,
        searchQuery || null
      );
      setListFolderQuestions(response?.data || []);
      setTotalPages(response?.totalPages || 1);
      setCurrentPage(response?.currentPage || 1);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Lỗi khi tải danh sách thư mục câu hỏi";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!isSearch) {
      handleFetch();
    }
  }, [currentPage]);

  useEffect(() => {
    if (isSearch) {
      handleFetch();
    }
  }, [isSearch]);

  const handleEditFolder = (folder) => {
    setIsEditing(folder._id);
    setFormData({
      name: folder.name,
      description: folder.description || "",
      color: folder.color || "#3954d9",
    });
    setShowForm(true);
  };

  const handleDeleteFolder = async (id) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFolder = async () => {
    try {
      await FolderQuestionService.deleteFolderQuestion(deleteItemId);
      toast.success("Xóa thư mục câu hỏi thành công");
      setListFolderQuestions(
        listFolderQuestions.filter((folder) => folder?._id !== deleteItemId)
      );
    } catch (error) {
      const message =
        error?.response?.data?.message || "Lỗi khi xóa thư mục câu hỏi";
      toast.error(message);
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleInsertFolder = async () => {
    if (validateForm()) {
      try {
        const res = await FolderQuestionService.createFolderQuestion(formData);
        if (res && res.data) {
          setListFolderQuestions([res.data, ...listFolderQuestions]);
          toast.success("Tạo thư mục câu hỏi thành công");
          setFormData({
            name: "",
            description: "",
            color: "#3954d9",
          });
          setShowForm(false);
        }
      } catch (error) {
        const message =
          error?.response?.data?.message || "Lỗi khi tạo thư mục câu hỏi";
        toast.error(message);
      }
    }
  };

  const handleUpdateFolder = async () => {
    if (validateForm()) {
      try {
        const res = await FolderQuestionService.updateFolderQuestion(
          isEditing,
          formData
        );
        if (res && res.data) {
          setListFolderQuestions(
            listFolderQuestions.map((folder) =>
              folder._id === isEditing ? res.data : folder
            )
          );
          toast.success("Cập nhật thư mục câu hỏi thành công");
          setFormData({
            name: "",
            description: "",
            color: "#3954d9",
          });
          setIsEditing(null);
          setShowForm(false);
        }
      } catch (error) {
        const message =
          error?.response?.data?.message || "Lỗi khi cập nhật thư mục câu hỏi";
        toast.error(message);
      }
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Tên thư mục không được để trống");
      return false;
    }
    return true;
  };

  const handleChangeInput = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    setIsSearch(true);
    setCurrentPage(1); // Reset về trang đầu khi search
    handleFetch(); // Call API với searchQuery
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(null);
    setFormData({
      name: "",
      description: "",
      color: "#3954d9",
    });
  };

  const resetSearch = () => {
    setSearchQuery("");
    setIsSearch(false);
    setCurrentPage(1);
    // handleFetch sẽ được gọi tự động qua useEffect khi searchQuery thay đổi
  };

  return (
    <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Quản Lý Thư Mục Câu Hỏi
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Thêm Thư Mục
          </button>
        </div>

        {/* Folder Form */}
        {showForm && (
          <FolderQuestionForm
            isEditing={isEditing}
            formData={formData}
            handleInsertFolder={handleInsertFolder}
            handleChangeInput={handleChangeInput}
            handleUpdateFolder={handleUpdateFolder}
            handleCancelForm={handleCancelForm}
          />
        )}

        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:flex-1 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Tìm kiếm thư mục câu hỏi..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </button>
            {isSearch && (
              <button
                onClick={resetSearch}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Folder Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    STT
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Thư mục
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Mô tả
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Số câu hỏi
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Tác giả
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Ngày tạo
                  </th>
                  <th className="p-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {listFolderQuestions.length > 0 ? (
                  listFolderQuestions.map((folder, index) => (
                    <tr
                      key={folder?._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 text-xs sm:text-sm">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: folder?.color || "#3954d9",
                            }}
                          ></div>
                          <span className="text-xs sm:text-sm font-medium truncate">
                            {folder?.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <span className="text-xs sm:text-sm text-gray-600 truncate block">
                          {folder?.description || "—"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <span className="text-xs sm:text-sm font-medium text-blue-600">
                            {folder?.questionCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            folder?.author === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {folder?.author === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="p-3 text-xs sm:text-sm text-gray-600">
                        {new Date(folder?.createdAt).toLocaleDateString(
                          "vi-VN",
                          configDate
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Tooltip title="Sửa thư mục">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const headings =
                                  document.querySelectorAll("h2");

                                // Duyệt tìm h2 có nội dung đúng
                                for (const h2 of headings) {
                                  if (
                                    h2.textContent.trim() ===
                                    "Cập nhật thông tin thư mục"
                                  ) {
                                    h2.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                    break;
                                  }
                                }
                                handleEditFolder(folder);
                              }}
                              className="text-blue-500 hover:text-blue-700 transition p-1"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Xóa thư mục">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteFolder(folder?._id);
                              }}
                              className="text-red-500 hover:text-red-700 transition p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-8 text-center text-gray-500 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Folder className="w-12 h-12 text-gray-300" />
                        <span>Không có thư mục câu hỏi nào</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 gap-4">
            <span className="text-xs sm:text-sm text-gray-700">
              Trang {`${currentPage} / ${totalPages}`}
              {isSearch && searchQuery && (
                <span className="ml-2 text-blue-600">
                  (Kết quả tìm kiếm: "{searchQuery}")
                </span>
              )}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(p - 1, 1));
                  if (isSearch) handleFetch();
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs sm:text-sm bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Trước
              </button>
              <button
                onClick={() => {
                  setCurrentPage((p) => (p < totalPages ? p + 1 : p));
                  if (isSearch) handleFetch();
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs sm:text-sm bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteFolder}
        title="Xác nhận xóa thư mục câu hỏi"
        message="Bạn có chắc chắn muốn xóa thư mục câu hỏi này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
