import React, { useEffect, useRef, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AssessmentForm from "./AssessmentForm";
import ConfirmationDialog from "./ConfirmationDialog";

import { Tooltip } from "@mui/material";
import {
  createAssessment,
  deleteAssessment,
  getAssessments,
} from "../../services/AssessmentService";
// import axios from "axios";
import { toLowerCaseNonAccentVietnamese } from "../../common/Utils";
import { getExamByIds } from "../../services/ExamService";
// import UploadService from "../../services/UploadService";
// import { REACT_APP_API_UPLOAD_URL } from "../../common/apiClient";
import dayjs from "dayjs";

// const configDate = {
//   day: "2-digit",
//   month: "2-digit",
//   year: "numeric",
//   hour: "2-digit",
//   minute: "2-digit",
//   second: "2-digit",
//   hour12: false,
//   timeZone: "Asia/Ho_Chi_Minh", // hoặc remove nếu dùng UTC
// };

export default function Assessment() {
  // ]);
  const [formData, setFormData] = useState({
    title: "",
    imgUrl: "",
    totalTime: 0,
    totalQuestion: 0,
    startTime: dayjs().format("YYYY-MM-DDTHH:mm"),
    deadlineTime: dayjs().add(1, "day").format("YYYY-MM-DDTHH:mm"),
    noDeadline: false,
    classes: [],
    classesInput: "",
  });
  const [childExamIDs, setChildExamIDs] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;
  const [isEditing, setIsEditing] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [listAssessments, setListAssessments] = useState([]);
  // const examsPerPage = 5;
  // const indexOfLastExam = currentPage * examsPerPage;
  const [searchQuery, setSearchQuery] = useState("");
  const imageRefDoc = useRef(null);

  // State cho confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const handleFetch = async () => {
    try {
      const response = await getAssessments(currentPage, limit, searchQuery);
      setListAssessments(response?.data);
      setTotalPages(response?.totalPages);
      setCurrentPage(response?.currentPage);
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
    }
  };

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleEditAssessment = async (assessment) => {
    setIsEditing(true);
    setFormData({
      ...assessment,
      title: assessment?.title?.text,
      startTime: assessment?.startTime
        ? dayjs(assessment.startTime).format("YYYY-MM-DDTHH:mm")
        : dayjs().format("YYYY-MM-DDTHH:mm"),
      deadlineTime: assessment?.deadlineTime
        ? dayjs(assessment.deadlineTime).format("YYYY-MM-DDTHH:mm")
        : "",
      noDeadline: assessment?.deadlineTime ? false : true,
      classes: assessment?.classes || [],
      classesInput: (assessment?.classes || []).join(", "),
    });
    setChildExamIDs(assessment?.childExamIDs);
    try {
      const response = await getExamByIds({ ids: assessment?.childExamIDs });
      if (response && response.data) {
        setSelectedExams(response.data);
      }
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
    }
  };

  const handleDeleteAssessment = async (id) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAssessment = async () => {
    try {
      const res = await deleteAssessment(deleteItemId);
      toast.success(res?.message);
      setListAssessments(
        listAssessments.filter((Assessment) => Assessment?._id !== deleteItemId)
      );
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleInsertAssessment = async () => {
    const uniquechildExamIDs = [...new Set(childExamIDs)];
    if (validateForm()) {
      try {
        const res = await createAssessment({
          ...formData,
          title: {
            text: formData.title.toUpperCase(),
            code: toLowerCaseNonAccentVietnamese(formData.title).toUpperCase(),
          },
          childExamIDs: uniquechildExamIDs,
          startTime: new Date(formData.startTime),
          deadlineTime:
            formData.noDeadline || !formData.deadlineTime
              ? null
              : new Date(formData.deadlineTime),
        });
        if (res && res.data) {
          setListAssessments([res.data, ...listAssessments]);
          handleFetch();
          toast.success(res?.message);
          setFormData({
            title: "",
            imgUrl: "",
            totalTime: 0,
            totalQuestion: 0,
            startTime: dayjs().format("YYYY-MM-DDTHH:mm"),
            deadlineTime: "",
            noDeadline: false,
            classes: [],
            classesInput: "",
          });
          setChildExamIDs([]);
          setSelectedExams([]);
          setIsEditing(false);
        }
      } catch (error) {
        const message = error?.response?.data?.message;
        toast.error(message);
      }
    }
  };

  const handleUpdateAssessment = async () => {
    const uniquechildExamIDs = [...new Set(childExamIDs)];
    if (validateForm()) {
      try {
        const res = await createAssessment({
          ...formData,
          title: {
            text: formData.title.toUpperCase(),
            code: toLowerCaseNonAccentVietnamese(formData.title).toUpperCase(),
          },
          childExamIDs: uniquechildExamIDs,
          startTime: new Date(formData.startTime),
          deadlineTime:
            formData.noDeadline || !formData.deadlineTime
              ? null
              : new Date(formData.deadlineTime),
        });
        if (res && res.data) {
          setListAssessments(
            listAssessments.map((e) => (e._id === res.data?._id ? res.data : e))
          );
          handleFetch();
          toast.success(res?.message);
          setFormData({
            title: "",
            imgUrl: "",
            totalTime: 0,
            totalQuestion: 0,
            startTime: dayjs().format("YYYY-MM-DDTHH:mm"),
            deadlineTime: "",
            noDeadline: false,
            classes: [],
            classesInput: "",
          });
          setChildExamIDs([]);
          setSelectedExams([]);
          setIsEditing(false);
        }
      } catch (error) {
        const message = error?.response?.data?.message;
        toast.error(message);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      imgUrl: "",
      totalTime: 0,
      totalQuestion: 0,
      startTime: dayjs().format("YYYY-MM-DDTHH:mm"),
      deadlineTime: "",
      noDeadline: false,
      classes: [],
      classesInput: "",
    });
    setChildExamIDs([]);
    setSelectedExams([]);
  };
  const validateForm = () => {
    if (!formData.title) {
      toast.error("Vui lòng nhập tiêu đề");
      return false;
    }

    if (!formData.imgUrl) {
      toast.error("Vui lòng tải lên hình ảnh bài thi");
      return false;
    }

    if (childExamIDs.length === 0) {
      toast.error("Vui lòng thêm ít nhất một đề thi");
      return false;
    }

    if (!formData.startTime) {
      toast.error("Vui lòng chọn thời gian bắt đầu");
      return false;
    }

    // Deadline can be optional when noDeadline is true
    if (!formData.noDeadline && !formData.deadlineTime) {
      toast.error("Vui lòng chọn Thời gian hạn nộp hoặc bật Không thời hạn");
      return false;
    }

    // Kiểm tra Thời gian hạn nộp phải sau thời gian bắt đầu
    if (
      !formData.noDeadline &&
      new Date(formData.deadlineTime) <= new Date(formData.startTime)
    ) {
      toast.error("Thời gian hạn nộp phải sau thời gian bắt đầu");
      return false;
    }

    return true;
  };

  const handleChangeInputAssessment = (event) => {
    let { name, value } = event.target;
    if (name === "role") {
      const role = value === "Admin" ? 1 : 0;
      setFormData({
        ...formData,
        [name]: role,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (searchQuery) {
      setIsSearch(true);
    } else {
      setIsSearch(false);
    }
    setCurrentPage(1); // Reset page on search
    handleFetch(); // Fetch data with query
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (searchQuery) {
        setIsSearch(true);
      } else {
        setIsSearch(false);
      }
      handleSearch(); // Trigger search when Enter is pressed
    }
  };

  // Legacy uploader kept for reference
  // const uploadProfileImg = async (formFileData) => {
  //   try {
  //     const res = await axios.post(
  //       "https://api.cloudinary.com/v1_1/dpu3ggw2m/image/upload",
  //       formFileData
  //     );
  //     const { url, asset_id, etag } = res.data;
  //     return { url, asset_id, etag };
  //   } catch (error) {
  //     const message = error?.response?.data?.message;
  //     toast.error(message);
  //   }
  // };

  // const upLoadImageAssessment = async (event) => {
  //   try {
  //     const file = event.target?.files[0];
  //     if (file) {
  //       const formData = new FormData();
  //       formData.append("file", file);
  //       formData.append("upload_preset", "labthink");
  //       formData.append("cloud_name", "dpu3ggw2m");
  //       const image = await uploadProfileImg(formData);

  //       if (image && image.url) {
  //         setFormData((prevFormData) => ({
  //           ...prevFormData,
  //           imgUrl: image.url,
  //         }));
  //         toast.success("Tải ảnh lên thành công");
  //         imageRefDoc.current.value = null;
  //       } else {
  //         toast.error("Tải ảnh lên thất bại");
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const upLoadImageAssessment = async (event) => {
    try {
      const file = event.target?.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error("Chỉ cho phép upload file ảnh!");
          return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File quá lớn! Kích thước tối đa là 5MB.");
          return;
        }

        // Chuyển đổi ảnh sang base64
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64Image = e.target.result;

          console.log("upLoadImageAssessment ~ base64Image created");
          setFormData((prevFormData) => ({
            ...prevFormData,
            imgUrl: base64Image,
          }));

          toast.success("Tải ảnh lên thành công (base64)");
          imageRefDoc.current.value = null;
        };

        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          toast.error("Lỗi khi đọc file ảnh");
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const message = error?.message || "Lỗi khi tải ảnh lên";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-xl">
              <h1 className="text-3xl font-bold text-white text-center flex items-center justify-center">
                <span className="mr-3">📝</span>
                Quản Lý Bài Thi
                <span className="ml-3">✨</span>
              </h1>
              <p className="text-blue-100 text-center mt-2">
                Tạo và quản lý các bài thi cho hệ thống
              </p>
            </div>
          </div>

          {/* Assessment Form */}
          <AssessmentForm
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
            handleInsertAssessment={handleInsertAssessment}
            handleChangeInputAssessment={handleChangeInputAssessment}
            handleUpdateAssessment={handleUpdateAssessment}
            upLoadImageAssessment={upLoadImageAssessment}
            imageRefDoc={imageRefDoc}
            childExamIDs={childExamIDs}
            setChildExamIDs={setChildExamIDs}
            selectedExams={selectedExams}
            setSelectedExams={setSelectedExams}
            handleCancelEdit={handleCancelEdit}
          />

          {/* Assessment List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  📋
                </span>
                Danh sách bài thi
              </h2>

              {/* Search Input */}
              <div className="mt-4 flex items-center space-x-3">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="🔍 Tìm kiếm bài thi..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên Bài Thi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian thi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lớp học
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listAssessments.length > 0 ? (
                    listAssessments.map((assessment) => (
                      <tr key={assessment?._id} className="hover:bg-gray-50">
                        <Tooltip title={assessment?._id} placement="top">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                              {assessment?._id?.slice(0, 8)}...
                            </span>
                          </td>
                        </Tooltip>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="text-sm font-medium text-gray-900"
                            title={assessment?.title?.text}
                          >
                            {assessment?.title?.text}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assessment?.childExamIDs?.length || 0} đề thi
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div className="text-xs text-blue-600">
                              <strong>Bắt đầu:</strong>{" "}
                              {assessment?.startTime
                                ? dayjs(assessment.startTime).format(
                                    "DD/MM/YYYY HH:mm"
                                  )
                                : "N/A"}
                            </div>
                            <div className="text-xs text-red-600">
                              <strong>Kết thúc:</strong>{" "}
                              {assessment?.deadlineTime === "KTH"
                                ? "Không thời hạn"
                                : assessment?.deadlineTime
                                ? dayjs(assessment.deadlineTime).format(
                                    "DD/MM/YYYY HH:mm"
                                  )
                                : "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assessment?.classes?.join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const headings =
                                  document.querySelectorAll("h1");

                                // Duyệt tìm h2 có nội dung đúng
                                for (const h2 of headings) {
                                  if (
                                    h2.textContent.trim() === "Cập Nhật Bài Thi"
                                  ) {
                                    h2.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                    break;
                                  }
                                }
                                handleEditAssessment(assessment);
                              }}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200"
                              title="Chỉnh sửa bài thi"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteAssessment(assessment?._id);
                              }}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                              title="Xóa bài thi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          Không có bài thi nào
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {listAssessments.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang{" "}
                  <span className="font-medium">
                    {isSearch ? "1" : currentPage}
                  </span>{" "}
                  của{" "}
                  <span className="font-medium">
                    {isSearch ? "1" : totalPages}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1 || isSearch}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => (p < totalPages ? p + 1 : p))
                    }
                    disabled={currentPage === totalPages || isSearch}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteAssessment}
        title="Xác nhận xóa bài thi"
        message="Bạn có chắc chắn muốn xóa bài thi này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </>
  );
}
