import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Close,
  CloudUpload,
  Download,
  DeleteSweep,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { deleteUsersByExcel } from "../../services/UserService";

export default function BulkDeleteUsersModal({ open, onClose, onSuccess }) {
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
      const response = await deleteUsersByExcel(file);
      setResult(response.data);
      toast.success(response.message);
      if (response.data.deletedCount > 0 && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting users by Excel:", error);
      toast.error(error.message || "Lỗi khi xóa tài khoản");
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
    const sampleData = [
      { email: "student1@example.com" },
      { email: "student2@example.com" },
      { email: "parent1@example.com" },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DeleteUsers");
    worksheet["!cols"] = [{ wch: 30 }];

    XLSX.writeFile(workbook, "template_delete_users.xlsx");
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", md: "70%", lg: "60%" },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Xóa tài khoản bằng Excel
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" component="div">
            • File Excel chỉ cần có <strong>1 cột email</strong> (header phải là
            <strong> email</strong>)<br />
            • Hệ thống sẽ xóa các tài khoản tương ứng nếu tìm thấy và không phải
            Admin
            <br />• Không thể hoàn tác, hãy kiểm tra kỹ trước khi thực hiện
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadTemplate}
          >
            Tải file mẫu (email)
          </Button>
        </Box>

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
            id="delete-users-excel"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="delete-users-excel">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              disabled={uploading}
              color="error"
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

        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleUpload}
            disabled={!file || uploading}
            startIcon={
              uploading ? <CircularProgress size={20} /> : <DeleteSweep />
            }
          >
            {uploading ? "Đang xóa..." : "Xóa tài khoản"}
          </Button>
        </Box>

        {result && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Kết quả xử lý
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
              <Chip
                icon={<CheckCircle />}
                label={`Đã xóa: ${
                  result.deletedCount || result.success.length
                }`}
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<ErrorIcon />}
                label={`Lỗi: ${result.errors.length}`}
                color="error"
                variant="outlined"
              />
              <Chip
                label={`Tổng dòng: ${result.totalRows}`}
                color="default"
                variant="outlined"
              />
            </Box>

            {result.success.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Đã xóa:
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Dòng</TableCell>
                        <TableCell>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.success.map((item, idx) => (
                        <TableRow key={`${item.email}-${idx}`}>
                          <TableCell>{item.row}</TableCell>
                          <TableCell>{item.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {result.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Không thể xóa:
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Dòng</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Lý do</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.errors.map((item, idx) => (
                        <TableRow key={`${item.email || "invalid"}-${idx}`}>
                          <TableCell>{item.row}</TableCell>
                          <TableCell>{item.email || "N/A"}</TableCell>
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
