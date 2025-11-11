import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Search,
  FileDownload,
  LocalFireDepartment,
  EmojiEvents,
  TrendingUp,
  CheckCircle,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import StreakService from "../../services/StreakService";
import { decryptData } from "../../common/decryption";
import * as XLSX from "xlsx";

export default function StreakManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchStreakData();
  }, [page, rowsPerPage, search]);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const response = await StreakService.getAllUsersStreak(
        page + 1,
        rowsPerPage,
        search
      );
      const decryptedData = decryptData(response);
      setData(decryptedData.data || []);
      setTotalItems(decryptedData.totalItems || 0);
    } catch (error) {
      console.error("Error fetching streak data:", error);
      toast.error("Lỗi khi tải dữ liệu streak");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      toast.info("Đang chuẩn bị dữ liệu xuất Excel...");

      const response = await StreakService.exportAllUsersStreak();
      const decryptedData = decryptData(response);
      const exportData = decryptedData.data || [];

      if (exportData.length === 0) {
        toast.warning("Không có dữ liệu để xuất");
        return;
      }

      // Prepare data for Excel
      const excelData = exportData.map((item, index) => ({
        STT: index + 1,
        "Họ và Tên": item.fullName,
        Email: item.email,
        "Số điện thoại": item.phoneNumber,
        Trường: item.school,
        "Streak hiện tại": item.currentStreak,
        "Streak dài nhất": item.longestStreak,
        "Tổng ngày hoàn thành": item.totalDaysCompleted,
        "Ngày streak gần nhất": item.lastStreakDate,
        "Câu hỏi hôm nay": item.todayQuestionsCompleted,
        "Câu đúng hôm nay": item.todayQuestionsCorrect,
        "Từ vựng hôm nay": item.todayVocabulariesCompleted,
        "Từ đúng hôm nay": item.todayVocabulariesCorrect,
        "Độ chính xác từ vựng (%)": item.todayVocabularyAccuracy,
        "Đạt streak hôm nay": item.todayStreakAchieved,
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Streak Data");

      // Set column widths
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 25 }, // Họ và Tên
        { wch: 30 }, // Email
        { wch: 15 }, // Số điện thoại
        { wch: 25 }, // Trường
        { wch: 15 }, // Streak hiện tại
        { wch: 15 }, // Streak dài nhất
        { wch: 18 }, // Tổng ngày
        { wch: 18 }, // Ngày gần nhất
        { wch: 15 }, // Câu hỏi
        { wch: 15 }, // Câu đúng
        { wch: 15 }, // Từ vựng
        { wch: 15 }, // Từ đúng
        { wch: 20 }, // Độ chính xác
        { wch: 18 }, // Đạt streak
      ];
      ws["!cols"] = colWidths;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Streak_Report_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      toast.success(`Đã xuất ${exportData.length} bản ghi thành công!`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Lỗi khi xuất Excel");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return "error";
    if (streak >= 14) return "warning";
    if (streak >= 7) return "success";
    if (streak >= 3) return "info";
    return "default";
  };

  return (
    <Box sx={{ p: 3, maxHeight: "100vh", overflow: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <LocalFireDepartment sx={{ fontSize: 40, color: "#FF5722" }} />
        <Typography variant="h4" fontWeight="bold">
          Quản Lý Streak
        </Typography>
      </Stack>

      {/* Search and Export */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ minWidth: 120 }}
            >
              Tìm kiếm
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={
                exporting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <FileDownload />
                )
              }
              onClick={handleExportExcel}
              disabled={exporting}
              sx={{ minWidth: 150 }}
            >
              {exporting ? "Đang xuất..." : "Xuất Excel"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell>
                    <strong>STT</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Họ và Tên</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <LocalFireDepartment sx={{ fontSize: 18 }} />
                      <strong>Streak</strong>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <EmojiEvents sx={{ fontSize: 18 }} />
                      <strong>Kỷ lục</strong>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <TrendingUp sx={{ fontSize: 18 }} />
                      <strong>Tổng ngày</strong>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Ngày gần nhất</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Hôm nay</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                      <Typography sx={{ mt: 2 }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        Không có dữ liệu
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.userId} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.currentStreak}
                          color={getStreakColor(row.currentStreak)}
                          size="small"
                          icon={<LocalFireDepartment />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.longestStreak}
                          variant="outlined"
                          size="small"
                          icon={<EmojiEvents />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {row.totalDaysCompleted}
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(row.lastStreakDate)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip
                          title={
                            <Box>
                              <Typography variant="caption">
                                Câu hỏi: {row.todayProgress.questionsCompleted}{" "}
                                ({row.todayProgress.questionsCorrect} đúng)
                              </Typography>
                              <br />
                              <Typography variant="caption">
                                Từ vựng:{" "}
                                {row.todayProgress.vocabulariesCompleted} (
                                {row.todayProgress.vocabulariesCorrect} đúng)
                              </Typography>
                            </Box>
                          }
                        >
                          <Chip
                            label={
                              row.todayProgress.streakAchieved
                                ? "Hoàn thành"
                                : "Chưa"
                            }
                            color={
                              row.todayProgress.streakAchieved
                                ? "success"
                                : "default"
                            }
                            size="small"
                            icon={
                              row.todayProgress.streakAchieved ? (
                                <CheckCircle />
                              ) : null
                            }
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trong ${count}`
            }
          />
        </CardContent>
      </Card>
    </Box>
  );
}
