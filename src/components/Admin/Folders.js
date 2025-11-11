import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, Search } from "lucide-react";
import { toast } from "react-toastify";
import { Tooltip } from "@mui/material";
import FolderForm from "./FolderForm";
import ConfirmationDialog from "./ConfirmationDialog";
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

export default function Folders() {
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
  const [listFolders, setListFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  // State cho confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const handleFetch = async () => {
    try {
      const response = await FolderService.getFolders(
        currentPage,
        limit,
        searchQuery || null
      );
      setListFolders(response?.data || []);
      setTotalPages(response?.totalPages || 1);
      setCurrentPage(response?.currentPage || 1);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Lỗi khi tải danh sách thư mục";
      toast.error(message);
    }
  };

  useEffect(() => {
    handleFetch();
  }, [currentPage, searchQuery]);

  const handleEditFolder = (folder) => {
    setIsEditing(true);
    setFormData({
      _id: folder._id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
    });
    setShowForm(true);
  };

  const handleDeleteFolder = async (id) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFolder = async () => {
    try {
      await FolderService.deleteFolder(deleteItemId);
      toast.success("Xóa thư mục thành công");
      setListFolders(
        listFolders.filter((folder) => folder?._id !== deleteItemId)
      );
    } catch (error) {
      const message = error?.response?.data?.message || "Lỗi khi xóa thư mục";
      toast.error(message);
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleInsertFolder = async () => {
    if (validateForm()) {
      try {
        const res = await FolderService.createFolder(formData);
        if (res && res.data) {
          setListFolders([res.data, ...listFolders]);
          toast.success("Tạo thư mục thành công");
          setFormData({
            name: "",
            description: "",
            color: "#3954d9",
          });
          setShowForm(false);
        }
      } catch (error) {
        const message = error?.response?.data?.message || "Lỗi khi tạo thư mục";
        toast.error(message);
      }
    }
  };

  const handleUpdateFolder = async () => {
    if (validateForm()) {
      try {
        console.log("🚀 ~ handleUpdateFolder ~ formData:", formData);
        const res = await FolderService.updateFolder(formData._id, formData);

        if (res && res.data) {
          setListFolders(
            listFolders.map((folder) =>
              folder._id === formData._id ? res.data : folder
            )
          );
          toast.success("Cập nhật thư mục thành công");
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
          error?.response?.data?.message || "Lỗi khi cập nhật thư mục";
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

  const handleChangeInputFolder = (event) => {
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
    setCurrentPage(1); // Reset về trang đầu tiên khi search
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
      name: "",
      description: "",
      color: "#3954d9",
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearch(false);
    setCurrentPage(1);
  };

  return (
    <div className="p-[30px] overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Quản Lý Thư Mục</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Thêm Thư Mục
        </button>
      </div>

      {/* Folder Form */}
      {showForm && (
        <FolderForm
          isEditing={isEditing}
          formData={formData}
          handleInsertFolder={handleInsertFolder}
          handleChangeInputFolder={handleChangeInputFolder}
          handleUpdateFolder={handleUpdateFolder}
          handleCancelForm={handleCancelForm}
        />
      )}

      {/* Search Input */}
      <div className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Tìm kiếm thư mục..."
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
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="px-4 py-2 bg-gray-500 text-white rounded-md flex items-center gap-2 hover:bg-gray-600 transition"
          >
            Xóa tìm kiếm
          </button>
        )}
      </div>

      {/* Folder Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">No</th>
                <th className="p-3 text-left">Id</th>
                <th className="p-3 text-left">Tên thư mục</th>
                <th className="p-3 text-left">Mô tả</th>
                <th className="p-3 text-left">Màu sắc</th>
                <th className="p-3 text-left">Tác giả</th>
                <th className="p-3 text-left">Ngày tạo</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {listFolders.length > 0 ? (
                listFolders.map((folder, index) => (
                  <tr
                    key={folder?._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{folder?._id}</td>
                    <td className="p-3 font-medium">{folder?.name}</td>
                    <td className="p-3">
                      {folder?.description || "Không có mô tả"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: folder?.color }}
                        ></div>
                        <span className="text-sm">{folder?.color}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Tooltip title={folder?.userId?._id} placement="top">
                        <span>{folder?.author}</span>
                      </Tooltip>
                    </td>
                    <td className="p-3">
                      {new Date(folder?.createdAt).toLocaleDateString(
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
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Sửa thư mục"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteFolder(folder?._id);
                          }}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Xóa thư mục"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    Không có thư mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between p-4 items-center">
          <div className="flex items-center gap-4">
            <span>Trang {`${currentPage} / ${totalPages}`}</span>
            {searchQuery && (
              <span className="text-sm text-gray-600">
                Kết quả tìm kiếm cho: "{searchQuery}"
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Trước
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => (p < totalPages ? p + 1 : p))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteFolder}
        title="Xác nhận xóa thư mục"
        message="Bạn có chắc chắn muốn xóa thư mục này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
