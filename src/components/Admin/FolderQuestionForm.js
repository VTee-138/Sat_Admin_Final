import React from "react";
import { Button, InputAdornment, TextField } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import PaletteIcon from "@mui/icons-material/Palette";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";

const colorOptions = [
  { value: "#3954d9", label: "Xanh dương", color: "#3954d9" },
  { value: "#e74c3c", label: "Đỏ", color: "#e74c3c" },
  { value: "#2ecc71", label: "Xanh lá", color: "#2ecc71" },
  { value: "#f39c12", label: "Cam", color: "#f39c12" },
  { value: "#9b59b6", label: "Tím", color: "#9b59b6" },
  { value: "#1abc9c", label: "Xanh ngọc", color: "#1abc9c" },
  { value: "#34495e", label: "Xám đen", color: "#34495e" },
  { value: "#e67e22", label: "Cam đậm", color: "#e67e22" },
  { value: "#95a5a6", label: "Xám", color: "#95a5a6" },
  { value: "#d63031", label: "Đỏ đậm", color: "#d63031" },
];

export default function FolderQuestionForm({
  formData,
  handleChangeInput,
  handleInsertFolder,
  isEditing,
  handleUpdateFolder,
  handleCancelForm,
}) {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mb-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Cập nhật thông tin thư mục" : "Tạo thư mục câu hỏi mới"}
      </h2>

      <div className="space-y-6">
        {/* Tên thư mục */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Tên thư mục *"
            name="name"
            value={formData?.name || ""}
            onChange={handleChangeInput}
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
          />

          {/* Màu sắc */}
          <TextField
            select
            label="Màu sắc"
            name="color"
            value={formData?.color || "#3954d9"}
            onChange={handleChangeInput}
            className="w-full"
            variant="outlined"
            size="small"
            SelectProps={{
              native: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PaletteIcon />
                </InputAdornment>
              ),
            }}
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
        </div>

        {/* Mô tả */}
        <TextField
          label="Mô tả"
          name="description"
          value={formData?.description || ""}
          onChange={handleChangeInput}
          className="w-full"
          variant="outlined"
          size="small"
          multiline
          rows={3}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DescriptionIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Preview màu sắc */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Preview:</span>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: formData?.color || "#3954d9" }}
            ></div>
            <span className="text-sm font-medium">
              {formData?.name || "Tên thư mục"}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          {isEditing ? (
            <>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleUpdateFolder}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Cập nhật thư mục
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelForm}
                className="border-gray-400 text-gray-600 hover:bg-gray-50 px-6 py-2"
              >
                Hủy
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleInsertFolder}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                Tạo thư mục
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelForm}
                className="border-gray-400 text-gray-600 hover:bg-gray-50 px-6 py-2"
              >
                Hủy
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
