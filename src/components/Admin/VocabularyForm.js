import React, { useState } from "react";
import { Button, InputAdornment, MenuItem, TextField } from "@mui/material";
import { BookOpen } from "lucide-react";
import TranslateIcon from "@mui/icons-material/Translate";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { FileText } from "lucide-react";
import FolderIcon from "@mui/icons-material/Folder";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";

export default function VocabularyForm({
  formData,
  listFolders,
  handleChangeInputVocabulary,
  handleInsertVocabulary,
  isEditing,
  handleUpdateVocabulary,
  handleCancelForm,
  handleImportExcel,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importFolderId, setImportFolderId] = useState("");
  const [showImportSection, setShowImportSection] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setSelectedFile(file);
      } else {
        alert("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        event.target.value = null;
      }
    }
  };

  const handleImportSubmit = () => {
    if (!selectedFile) {
      alert("Vui lòng chọn file Excel");
      return;
    }
    if (!importFolderId) {
      alert("Vui lòng chọn thư mục");
      return;
    }
    handleImportExcel(selectedFile, importFolderId);
    setSelectedFile(null);
    setImportFolderId("");
    setShowImportSection(false);
  };

  const downloadTemplate = () => {
    // Tạo template Excel
    const templateData = [
      ["Từ vựng", "Nghĩa", "Phát âm", "Ví dụ", "Trạng thái"],
      [
        "upgrade",
        "nâng cấp",
        "/ˈʌpɡreɪd/",
        "We need to upgrade our system",
        "not_learned",
      ],
      [
        "machine",
        "máy móc",
        "/məˈʃiːn/",
        "This machine is very efficient",
        "not_learned",
      ],
      [
        "abuse",
        "lạm dụng",
        "/əˈbjuːs/",
        "Don't abuse your power",
        "not_learned",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vocabulary Template");
    XLSX.writeFile(wb, "vocabulary_template.xlsx");
  };
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mb-[50px]">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Cập nhật thông tin từ vựng" : "Tạo từ vựng mới"}
      </h2>

      {/* Import Excel Section */}
      {!isEditing && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              Import từ vựng từ Excel
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
                className="text-blue-600 border-blue-600"
              >
                Tải template
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowImportSection(!showImportSection)}
                className="text-blue-600 border-blue-600"
              >
                {showImportSection ? "Ẩn" : "Hiện"} Import
              </Button>
            </div>
          </div>

          {showImportSection && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  select
                  label="Chọn thư mục *"
                  value={importFolderId}
                  onChange={(e) => setImportFolderId(e.target.value)}
                  className="w-full"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FolderIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  {listFolders.map((folder) => (
                    <MenuItem key={folder._id} value={folder._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        ></div>
                        {folder.name}
                      </div>
                    </MenuItem>
                  ))}
                </TextField>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    {selectedFile ? (
                      <span className="text-green-600">
                        📄 {selectedFile.name}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Chọn file Excel (.xlsx, .xls)
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  onClick={handleImportSubmit}
                  disabled={!selectedFile || !importFolderId}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Import Excel
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowImportSection(false);
                    setSelectedFile(null);
                    setImportFolderId("");
                  }}
                >
                  Hủy
                </Button>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-2">📋 Hướng dẫn:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    File Excel phải có header: "Từ vựng", "Nghĩa" (bắt buộc)
                  </li>
                  <li>Các cột tùy chọn: "Phát âm", "Ví dụ", "Trạng thái"</li>
                  <li>
                    Trạng thái có thể là: not_learned, learned, needs_review
                  </li>
                  <li>Tải template mẫu để tham khảo định dạng</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      {!isEditing && (
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 bg-white">HOẶC</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
      )}

      <div className="mb-5 flex justify-around flex-wrap">
        <TextField
          label="Từ vựng *"
          name="word"
          value={formData?.word}
          className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
          onChange={handleChangeInputVocabulary}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BookOpen />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
        <TextField
          label="Nghĩa *"
          name="meaning"
          value={formData?.meaning}
          onChange={handleChangeInputVocabulary}
          className="md:w-[300px] w-[100%] label-text"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TranslateIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
      </div>

      <div className="mb-5 flex justify-around flex-wrap">
        <TextField
          label="Phát âm"
          name="pronunciation"
          value={formData?.pronunciation}
          className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
          onChange={handleChangeInputVocabulary}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <VolumeUpIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
        <TextField
          label="Ví dụ"
          name="example"
          value={formData?.example}
          onChange={handleChangeInputVocabulary}
          className="md:w-[300px] w-[100%] label-text"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FileText />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
      </div>

      <div className="mb-5 flex justify-around flex-wrap">
        <TextField
          select
          label="Thư mục *"
          name="folderId"
          value={formData?.folderId}
          onChange={handleChangeInputVocabulary}
          className="label-text md:w-[300px] w-[100%] lg:mb-0 mb-5"
          variant="standard"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FolderIcon />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            shrink: true,
          }}
        >
          {listFolders.map((folder) => (
            <MenuItem key={folder._id} value={folder._id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: folder.color }}
                ></div>
                {folder.name}
              </div>
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Trạng thái"
          name="status"
          value={formData?.status}
          onChange={handleChangeInputVocabulary}
          className="label-text md:w-[300px] w-[100%]"
          variant="standard"
          InputLabelProps={{
            shrink: true,
          }}
        >
          {[
            { value: "not_learned", label: "Chưa học" },
            { value: "learned", label: "Đã học" },
            { value: "needs_review", label: "Cần ôn lại" },
          ].map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className="mb-5 flex justify-around flex-wrap px-[130px] gap-4">
        {isEditing ? (
          <>
            <Button
              variant="contained"
              component="label"
              className="label-text md:w-[200px] w-[100%] py-[10px]"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpdateVocabulary}
            >
              Cập nhật từ vựng
            </Button>
            <Button
              variant="outlined"
              component="label"
              className="label-text md:w-[150px] w-[100%] py-[10px]"
              startIcon={<CancelIcon />}
              onClick={handleCancelForm}
            >
              Hủy
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              component="label"
              className="label-text md:w-[200px] w-[100%] py-[10px]"
              startIcon={<CloudUploadIcon />}
              onClick={handleInsertVocabulary}
            >
              Tạo từ vựng
            </Button>
            <Button
              variant="outlined"
              component="label"
              className="label-text md:w-[150px] w-[100%] py-[10px]"
              startIcon={<CancelIcon />}
              onClick={handleCancelForm}
            >
              Hủy
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
