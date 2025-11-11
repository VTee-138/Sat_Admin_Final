import React from "react";
import { Button, InputAdornment, TextField } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import PaletteIcon from "@mui/icons-material/Palette";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";

export default function FolderForm({
  formData,
  handleChangeInputFolder,
  handleInsertFolder,
  isEditing,
  handleUpdateFolder,
  handleCancelForm,
}) {
  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg mb-[50px]">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isEditing ? "Cập nhật thông tin thư mục" : "Tạo thư mục mới"}
      </h2>
      <div className="mb-5 flex justify-around flex-wrap">
        <TextField
          label="Tên thư mục *"
          name="name"
          value={formData?.name}
          className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
          onChange={handleChangeInputFolder}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FolderIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
        <TextField
          label="Mô tả"
          name="description"
          value={formData?.description}
          onChange={handleChangeInputFolder}
          className="md:w-[300px] w-[100%] label-text"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DescriptionIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
      </div>

      <div className="mb-5 flex justify-around flex-wrap">
        <TextField
          label="Màu sắc"
          name="color"
          value={formData?.color}
          className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
          onChange={handleChangeInputFolder}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PaletteIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          type="color"
        />
        <div className="md:w-[300px] w-[100%] flex items-center gap-2">
          <span className="text-sm text-gray-600">Màu hiện tại:</span>
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: formData?.color }}
          ></div>
        </div>
      </div>

      <div className="mb-5 flex justify-around flex-wrap px-[130px] gap-4">
        {isEditing ? (
          <>
            <Button
              variant="contained"
              component="label"
              className="label-text md:w-[200px] w-[100%] py-[10px]"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpdateFolder}
            >
              Cập nhật thư mục
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
              onClick={handleInsertFolder}
            >
              Tạo thư mục
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
