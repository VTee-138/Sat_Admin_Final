import React from "react";
import {
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Person3Icon from "@mui/icons-material/Person3";
import PasswordIcon from "@mui/icons-material/Password";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import NextPlanIcon from "@mui/icons-material/NextPlan";
import SchoolIcon from "@mui/icons-material/School";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import EventIcon from "@mui/icons-material/Event";
import moment from "moment";

export default function UserForm({
  formData,
  handleChangeInputUser,
  handleInsertUser,
  isEditing,
  handleUpdateUser,
  searchedParents,
  onSearchParent,
  onSelectParent,
  selectedParent,
  isSearchingParents,
}) {
  // Helper function to format date for UI (DD/MM/YYYY)
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const parsed = moment(dateValue);
    return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "";
  };

  return (
    <div className="py-4 sm:py-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mb-6 sm:mb-8 px-[6rem]">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
        {isEditing
          ? "Cập nhật thông tin người dùng"
          : "Tạo tài khoản người dùng"}
      </h2>

      {/* Email và Tên người dùng */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Email *"
          name="email"
          value={formData?.email}
          className="w-full"
          onChange={handleChangeInputUser}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          size="small"
        />
        <TextField
          label="Tên người dùng *"
          name="fullName"
          value={formData?.fullName}
          onChange={handleChangeInputUser}
          className="w-full"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person3Icon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          size="small"
        />
      </div>

      {/* Password và Role */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Password *"
          name="password"
          value={formData?.password}
          className="w-full"
          onChange={handleChangeInputUser}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PasswordIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          size="small"
        />
        <TextField
          select
          label="Role *"
          name="role"
          value={
            formData?.role === 1 ? "Admin" : formData?.role === 0 ? "User" : ""
          }
          onChange={handleChangeInputUser}
          className="w-full"
          variant="standard"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AdminPanelSettingsIcon />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            shrink: true,
          }}
        >
          {["Admin", "User"].map((option, key) => (
            <MenuItem key={key} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Person (Phụ huynh / Học sinh) */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          select
          label="Loại người dùng *"
          name="person"
          value={formData?.person || "HS"}
          onChange={handleChangeInputUser}
          className="w-full"
          variant="standard"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SchoolIcon />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            shrink: true,
          }}
        >
          <MenuItem value="HS">Học sinh (HS)</MenuItem>
          <MenuItem value="PH">Phụ huynh (PH)</MenuItem>
        </TextField>

        <TextField
          type="number"
          label="Số ngày hết hạn *"
          name="expireAt"
          value={formData?.expireAt}
          onChange={handleChangeInputUser}
          variant="standard"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <NextPlanIcon />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ shrink: true }}
        />
      </div>

      {/* Class and Important Dates */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Lớp học (class)"
          name="class"
          value={formData?.class || ""}
          onChange={handleChangeInputUser}
          className="w-full"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SchoolIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="text"
          label="Ngày bắt đầu (startDate) *"
          name="startDate"
          value={formatDateForInput(formData?.startDate)}
          onChange={handleChangeInputUser}
          className="w-full"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EventIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          size="small"
          placeholder="dd/mm/yyyy"
          InputLabelProps={{ shrink: true }}
        />
      </div>

      <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          type="text"
          label="Ngày dự kiến kết thúc (expectedEndDate) *"
          name="expectedEndDate"
          value={formatDateForInput(formData?.expectedEndDate)}
          onChange={handleChangeInputUser}
          className="w-full"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EventIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          size="small"
          placeholder="dd/mm/yyyy"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="text"
          label="Ngày dự kiến thi (expectedExamDate) *"
          name="expectedExamDate"
          value={formatDateForInput(formData?.expectedExamDate)}
          onChange={handleChangeInputUser}
          className="w-full"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EventIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          size="small"
          placeholder="dd/mm/yyyy"
          InputLabelProps={{ shrink: true }}
        />
      </div>

      {/* Search Phụ huynh - Chỉ hiển thị khi chọn Phụ huynh */}
      {formData?.person === "PH" && (
        <div className="mb-4 sm:mb-6">
          <Autocomplete
            options={searchedParents || []}
            getOptionLabel={(option) => `${option.email} - ${option.fullName}`}
            value={selectedParent}
            onChange={(event, newValue) => {
              onSelectParent(newValue);
            }}
            onInputChange={(event, newInputValue) => {
              if (newInputValue) {
                onSearchParent(newInputValue);
              }
            }}
            loading={isSearchingParents}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tìm kiếm học sinh *"
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <FamilyRestroomIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {isSearchingParents ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                helperText="Tìm kiếm email của học sinh để liên kết làm phụ huynh"
              />
            )}
            noOptionsText="Không tìm thấy học sinh nào"
          />
        </div>
      )}

      {/* Button */}
      <div className="flex justify-center">
        {isEditing ? (
          <Button
            variant="contained"
            component="label"
            className="w-full sm:w-auto px-6 py-2 sm:py-3"
            startIcon={<CloudUploadIcon />}
            onClick={handleUpdateUser}
          >
            Cập nhật tài khoản
          </Button>
        ) : (
          <Button
            variant="contained"
            component="label"
            className="w-full sm:w-auto px-6 py-2 sm:py-3"
            startIcon={<CloudUploadIcon />}
            onClick={handleInsertUser}
          >
            Tạo tài khoản
          </Button>
        )}
      </div>
    </div>
  );
}
