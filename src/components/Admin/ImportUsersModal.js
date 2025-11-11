import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  CloudUpload,
  Download,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { importUsersFromExcel } from "../../services/UserService";
import { toast } from "react-toastify";

export default function ImportUsersModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }

    try {
      setUploading(true);
      const response = await importUsersFromExcel(file);

      setResult(response.data);
      toast.success(response.message);

      if (response.data.success.length > 0) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error importing users:", error);
      toast.error(error.message || "Lỗi khi import users");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    const XLSX = require("xlsx");

    // Create sample data
    const sampleData = [
      {
        email: "student1@example.com",
        password: "password123",
        fullName: "Nguyen Van A",
        role: 0,
        person: "HS",
        class: "10A1",
        expireAt: 365,
        startDate: "2025-01-01",
        expectedEndDate: "2025-12-31",
        expectedExamDate: "2025-12-15",
        childEmail: "",
      },
      {
        email: "student2@example.com",
        password: "password123",
        fullName: "Tran Thi B",
        role: 0,
        person: "HS",
        class: "10A2",
        expireAt: 365,
        startDate: "2025-01-01",
        expectedEndDate: "2025-12-31",
        expectedExamDate: "2025-12-15",
        childEmail: "",
      },
      {
        email: "parent1@example.com",
        password: "password123",
        fullName: "Nguyen Van C",
        role: 0,
        person: "PH",
        class: "",
        expireAt: 365,
        startDate: "2025-01-01",
        expectedEndDate: "2025-12-31",
        expectedExamDate: "2025-12-15",
        childEmail: "student1@example.com",
      },
    ];

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Set column widths
    const wscols = [
      { wch: 25 }, // email
      { wch: 15 }, // password
      { wch: 20 }, // fullName
      { wch: 8 }, // role
      { wch: 10 }, // person
      { wch: 10 }, // class
      { wch: 12 }, // expireAt
      { wch: 15 }, // startDate
      { wch: 15 }, // expectedEndDate
      { wch: 15 }, // expectedExamDate
      { wch: 25 }, // childEmail
    ];
    worksheet["!cols"] = wscols;

    // Download
    XLSX.writeFile(workbook, "template_import_users.xlsx");
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", md: "80%", lg: "70%" },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Import Users từ Excel
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Hướng dẫn:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            • File Excel phải có các cột: email, password, fullName, role,
            person, class, expireAt, startDate, expectedEndDate,
            expectedExamDate
            <br />
            • role: 0 = User, 1 = Admin
            <br />
            • person: HS = Học sinh, PH = Phụ huynh
            <br />
            • expireAt: Số ngày hết hạn (số)
            <br />
            • Nếu person = PH, cần có cột childEmail (email của học sinh)
            <br />• Ngày tháng định dạng: YYYY-MM-DD hoặc DD/MM/YYYY
          </Typography>
        </Alert>

        {/* Download Template Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadTemplate}
          >
            Tải file mẫu (Template)
          </Button>
        </Box>

        {/* File Upload */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            border: "2px dashed #ccc",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <input
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            id="upload-excel-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-excel-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              Chọn File Excel
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              File đã chọn: <strong>{file.name}</strong>
            </Typography>
          )}
        </Box>

        {/* Upload Button */}
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            startIcon={
              uploading ? <CircularProgress size={20} /> : <CloudUpload />
            }
          >
            {uploading ? "Đang import..." : "Import Users"}
          </Button>
        </Box>

        {/* Results */}
        {result && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Kết quả Import
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Chip
                icon={<CheckCircle />}
                label={`Thành công: ${result.success.length}`}
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<Error />}
                label={`Lỗi: ${result.errors.length}`}
                color="error"
                variant="outlined"
              />
              <Chip
                label={`Tổng: ${result.total}`}
                color="default"
                variant="outlined"
              />
            </Box>

            {/* Success Table */}
            {result.success.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Users đã tạo thành công:
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Dòng</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Tên</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.success.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.row}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>{item.fullName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Error Table */}
            {result.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Lỗi:
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Dòng</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Lỗi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.errors.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.row}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error">
                              {item.error}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Modal>
  );
}
