import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search, BookOpen } from "lucide-react";
import { toast } from "react-toastify";
import { Tooltip, TablePagination, TableContainer, Paper } from "@mui/material";
import VocabularyForm from "./VocabularyForm";
import ConfirmationDialog from "./ConfirmationDialog";
import VocabularyService from "../../services/VocabularyService";
import FolderService from "../../services/FolderService";

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

export default function Vocabularies() {
  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    pronunciation: "",
    example: "",
    folderId: "",
    status: "not_learned",
    tags: [],
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditing, setIsEditing] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [listVocabularies, setListVocabularies] = useState([]);
  const [listFolders, setListFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [showForm, setShowForm] = useState(false);

  // State cho confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const handleFetch = async () => {
    try {
      const response = await VocabularyService.getVocabularies(
        page + 1,
        rowsPerPage,
        selectedFolderId || null,
        searchQuery || null
      );
      setListVocabularies(response?.data || []);
      setTotalItems(response?.totalItems || 0);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Lỗi khi tải danh sách từ vựng";
      toast.error(message);
    }
  };

  const handleFetchFolders = async () => {
    try {
      const response = await FolderService.getFolders(1, 1000);
      setListFolders(response?.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thư mục:", error);
    }
  };

  useEffect(() => {
    handleFetch();
  }, [page, rowsPerPage, selectedFolderId]);

  useEffect(() => {
    handleFetchFolders();
  }, []);

  const handleEditVocabulary = (vocabulary) => {
    setIsEditing(vocabulary._id);
    setFormData({
      word: vocabulary.word,
      meaning: vocabulary.meaning,
      pronunciation: vocabulary.pronunciation || "",
      example: vocabulary.example || "",
      folderId: vocabulary.folderId,
      status: vocabulary.status,
      tags: vocabulary.tags || [],
    });
    setShowForm(true);
  };

  const handleDeleteVocabulary = async (id) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteVocabulary = async () => {
    try {
      await VocabularyService.deleteVocabulary(deleteItemId);
      toast.success("Xóa từ vựng thành công");
      setListVocabularies(
        listVocabularies.filter(
          (vocabulary) => vocabulary?._id !== deleteItemId
        )
      );
    } catch (error) {
      const message = error?.response?.data?.message || "Lỗi khi xóa từ vựng";
      toast.error(message);
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleInsertVocabulary = async () => {
    if (validateForm()) {
      try {
        const res = await VocabularyService.createVocabulary(formData);
        if (res && res.data) {
          setListVocabularies([res.data, ...listVocabularies]);
          toast.success("Tạo từ vựng thành công");
          setFormData({
            word: "",
            meaning: "",
            pronunciation: "",
            example: "",
            folderId: "",
            status: "not_learned",
            tags: [],
          });
          setShowForm(false);
        }
      } catch (error) {
        const message = error?.response?.data?.message || "Lỗi khi tạo từ vựng";
        toast.error(message);
      }
    }
  };

  const handleUpdateVocabulary = async () => {
    if (validateForm()) {
      try {
        const res = await VocabularyService.updateVocabulary(
          isEditing,
          formData
        );
        if (res && res.data) {
          setListVocabularies(
            listVocabularies.map((vocabulary) =>
              vocabulary._id === isEditing ? res.data : vocabulary
            )
          );
          toast.success("Cập nhật từ vựng thành công");
          setFormData({
            word: "",
            meaning: "",
            pronunciation: "",
            example: "",
            folderId: "",
            status: "not_learned",
            tags: [],
          });
          setIsEditing(null);
          setShowForm(false);
        }
      } catch (error) {
        const message =
          error?.response?.data?.message || "Lỗi khi cập nhật từ vựng";
        toast.error(message);
      }
    }
  };

  const validateForm = () => {
    if (!formData.word.trim()) {
      toast.error("Từ vựng không được để trống");
      return false;
    }
    if (!formData.meaning.trim()) {
      toast.error("Nghĩa từ vựng không được để trống");
      return false;
    }
    if (!formData.folderId) {
      toast.error("Vui lòng chọn thư mục");
      return false;
    }
    return true;
  };

  const handleChangeInputVocabulary = (event) => {
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
    setPage(0);
    handleFetch();
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
      word: "",
      meaning: "",
      pronunciation: "",
      example: "",
      folderId: "",
      status: "not_learned",
      tags: [],
    });
  };

  const handleImportExcel = async (file, folderId) => {
    try {
      toast.info("Đang import từ vựng từ Excel...");
      const response = await VocabularyService.importVocabulariesFromExcel(
        file,
        folderId
      );

      if (response && response.data) {
        const {
          successCount,
          failCount,
          existingCount,
          errors,
          existingWords,
          totalProcessed,
        } = response.data;

        // Hiển thị kết quả import
        let message = `Import hoàn tất! Xử lý ${totalProcessed} dòng.\n`;
        message += `✅ Thành công: ${successCount} từ vựng\n`;

        if (existingCount > 0) {
          message += `⚠️ Đã tồn tại: ${existingCount} từ vựng\n`;
        }

        if (failCount > 0) {
          message += `❌ Thất bại: ${failCount} từ vựng\n`;
        }

        if (errors && errors.length > 0) {
          message += `\nLỗi:\n${errors.join("\n")}`;
        }

        if (existingWords && existingWords.length > 0) {
          message += `\nTừ vựng đã tồn tại: ${existingWords.join(", ")}`;
          if (existingCount > 10) {
            message += `... và ${existingCount - 10} từ khác`;
          }
        }

        if (successCount > 0) {
          toast.success(message);
          // Refresh danh sách từ vựng
          handleFetch();
        } else {
          toast.warning(message);
        }
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Lỗi khi import từ vựng";
      toast.error(message);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "not_learned":
        return "Chưa học";
      case "learned":
        return "Đã học";
      case "needs_review":
        return "Cần ôn lại";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "not_learned":
        return "bg-red-100 text-red-800";
      case "learned":
        return "bg-green-100 text-green-800";
      case "needs_review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-[30px] overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Quản Lý Từ Vựng</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Thêm Từ Vựng
        </button>
      </div>

      {/* Vocabulary Form */}
      {showForm && (
        <VocabularyForm
          isEditing={isEditing}
          formData={formData}
          listFolders={listFolders}
          handleInsertVocabulary={handleInsertVocabulary}
          handleChangeInputVocabulary={handleChangeInputVocabulary}
          handleUpdateVocabulary={handleUpdateVocabulary}
          handleCancelForm={handleCancelForm}
          handleImportExcel={handleImportExcel}
        />
      )}

      {/* Filter and Search */}
      <div className="mb-4 flex items-center space-x-4 flex-wrap">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Thư mục:</label>
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring"
          >
            <option value="">Tất cả thư mục</option>
            {listFolders.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="w-96 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Vocabulary Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <TableContainer component={Paper}>
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">No</th>
                  <th className="p-3 text-left">Từ vựng</th>
                  <th className="p-3 text-left">Nghĩa</th>
                  <th className="p-3 text-left">Phát âm</th>
                  <th className="p-3 text-left">Ví dụ</th>
                  <th className="p-3 text-left">Thư mục</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {listVocabularies.length > 0 ? (
                  listVocabularies.map((vocabulary, index) => (
                    <tr
                      key={vocabulary?._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">{vocabulary?.word}</td>
                      <td className="p-3">{vocabulary?.meaning}</td>
                      <td className="p-3">
                        {vocabulary?.pronunciation || "—"}
                      </td>
                      <td className="p-3 max-w-xs truncate">
                        {vocabulary?.example || "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: vocabulary?.folderId?.color,
                            }}
                          ></div>
                          <span className="text-sm">
                            {vocabulary?.folderId?.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            vocabulary?.status
                          )}`}
                        >
                          {getStatusText(vocabulary?.status)}
                        </span>
                      </td>
                      <td className="p-3">
                        {new Date(vocabulary?.createdAt).toLocaleDateString(
                          "vi-VN",
                          configDate
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2 h-full min-h-[40px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const headings = document.querySelectorAll("h2");

                              // Duyệt tìm h2 có nội dung đúng
                              for (const h2 of headings) {
                                if (
                                  h2.textContent.trim() ===
                                  "Cập nhật thông tin từ vựng"
                                ) {
                                  h2.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                  break;
                                }
                              }
                              handleEditVocabulary(vocabulary);
                            }}
                            className="text-blue-500 hover:text-blue-700 transition"
                            title="Sửa từ vựng"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteVocabulary(vocabulary?._id);
                            }}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Xóa từ vựng"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-gray-500">
                      Không có từ vựng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteVocabulary}
        title="Xác nhận xóa từ vựng"
        message="Bạn có chắc chắn muốn xóa từ vựng này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
