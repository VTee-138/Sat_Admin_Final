import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  TextField,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Button,
  InputAdornment,
  Popper,
  ClickAwayListener,
  Card,
  CardContent,
  Grid,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { getExamsMutiSearch } from "../../services/ExamService";

const MultiSearchInput = ({
  childExamIDs,
  setChildExamIDs,
  selectedExams,
  setSelectedExams,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredExams, setFilteredExams] = useState([]);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounce search function
  const debounceTimeout = useRef(null);

  const searchExams = useCallback(
    async (query) => {
      if (!query || query.trim() === "") {
        setFilteredExams([]);
        setIsOpen(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await getExamsMutiSearch(query.trim(), 20);
        if (response && response.data) {
          // Filter out already selected exams
          const filtered = response.data.filter(
            (exam) => !childExamIDs.includes(exam._id)
          );
          setFilteredExams(filtered);
          setIsOpen(filtered.length > 0);
        }
      } catch (error) {
        console.error("Error searching exams:", error);
        setFilteredExams([]);
        setIsOpen(false);
      } finally {
        setSearchLoading(false);
      }
    },
    [childExamIDs]
  );

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      searchExams(searchTerm);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, searchExams]);

  const addExam = (exam) => {
    const examId = exam._id;

    // Thêm _id vào mảng childExamIDs
    setChildExamIDs((prev) => {
      const newIds = [...prev, examId];
      return newIds;
    });

    // Thêm exam object vào mảng để hiển thị
    setSelectedExams((prev) => [...prev, exam]);

    // Remove the added exam from current search results
    setFilteredExams((prev) => prev.filter((e) => e._id !== examId));

    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeExam = (examId) => {
    setChildExamIDs((prev) => {
      const newIds = prev.filter((id) => id !== examId);
      return newIds;
    });

    setSelectedExams((prev) => prev.filter((exam) => exam._id !== examId));

    // If there's a current search term, refresh the search to include the removed exam
    if (searchTerm.trim()) {
      searchExams(searchTerm);
    }
  };

  const clearAll = () => {
    setChildExamIDs([]);
    setSelectedExams([]);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Backspace" &&
      searchTerm === "" &&
      selectedExams.length > 0
    ) {
      const lastExam = selectedExams[selectedExams.length - 1];
      removeExam(lastExam._id);
    }
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="subtitle1"
        className="text-gray-700 font-semibold mb-4 text-base"
      >
        Tìm kiếm và thêm đề thi *
      </Typography>

      {/* Search Input */}
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box sx={{ position: "relative", mb: 3 }}>
          <TextField
            ref={inputRef}
            fullWidth
            placeholder="Tìm kiếm đề thi theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchTerm.trim()) {
                searchExams(searchTerm);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {searchLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SearchIcon className="text-blue-500" />
                  )}
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                "&:hover fieldset": {
                  borderColor: "#3b82f6",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1d4ed8",
                  borderWidth: "2px",
                },
              },
            }}
          />

          {/* Dropdown Results */}
          <Popper
            open={isOpen && (filteredExams.length > 0 || searchLoading)}
            anchorEl={inputRef.current}
            placement="bottom-start"
            style={{
              width: inputRef.current?.offsetWidth,
              zIndex: 1300,
              marginTop: "8px",
            }}
          >
            <Paper
              elevation={8}
              sx={{
                maxHeight: 400,
                overflow: "auto",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
              }}
            >
              {searchLoading ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Đang tìm kiếm...
                  </Typography>
                </Box>
              ) : filteredExams.length > 0 ? (
                <List dense>
                  {filteredExams.map((exam) => (
                    <ListItem key={exam._id} disablePadding>
                      <ListItemButton
                        onClick={() => addExam(exam)}
                        sx={{
                          borderRadius: "8px",
                          margin: "4px 8px",
                          "&:hover": {
                            backgroundColor: "#f3f4f6",
                          },
                        }}
                      >
                        <Box sx={{ mr: 2 }}>
                          <AssignmentIcon className="text-blue-500" />
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight={600}>
                              {exam.title.text}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                📚 Môn: {exam.subject}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                ❓ {exam.numberOfQuestions} câu hỏi • ⏱️{" "}
                                {exam.time} phút
                              </Typography>
                            </Box>
                          }
                        />
                        <AddIcon className="text-green-500" fontSize="small" />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy đề thi nào
                  </Typography>
                </Box>
              )}
            </Paper>
          </Popper>
        </Box>
      </ClickAwayListener>

      {/* Summary and Clear Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          p: 2,
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          className="font-medium"
        >
          Đã chọn:{" "}
          <span className="font-bold text-blue-600">
            {selectedExams.length}
          </span>{" "}
          đề thi
        </Typography>
        {selectedExams.length > 0 && (
          <Button
            size="small"
            onClick={clearAll}
            startIcon={<ClearIcon />}
            sx={{
              color: "#ef4444",
              "&:hover": {
                backgroundColor: "#fef2f2",
              },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Xóa tất cả
          </Button>
        )}
      </Box>

      {/* Selected Exams Grid */}
      {selectedExams.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            className="font-semibold text-gray-700 mb-3"
          >
            Danh sách đề thi đã chọn:
          </Typography>
          <Grid container spacing={2}>
            {selectedExams.map((exam, index) => (
              <Grid item xs={12} sm={6} md={4} key={exam._id}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    "&:hover": {
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "#dbeafe",
                          borderRadius: "8px",
                          p: 1,
                          mr: 2,
                          minWidth: "fit-content",
                        }}
                      >
                        <QuizIcon className="text-blue-600" fontSize="small" />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Tooltip title={exam.title.text} placement="top">
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {exam.title.text}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        display="block"
                        className="text-gray-600 mb-1"
                      >
                        📚 <strong>Môn:</strong> {exam.subject}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        className="text-gray-600 mb-1"
                      >
                        ❓ <strong>Số câu:</strong> {exam.numberOfQuestions}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        className="text-gray-600"
                      >
                        ⏱️ <strong>Thời gian:</strong> {exam.time} phút
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      onClick={() => removeExam(exam._id)}
                      startIcon={<ClearIcon />}
                      fullWidth
                      sx={{
                        color: "#ef4444",
                        borderColor: "#ef4444",
                        "&:hover": {
                          backgroundColor: "#fef2f2",
                          borderColor: "#dc2626",
                        },
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                      variant="outlined"
                    >
                      Xóa
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {selectedExams.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            backgroundColor: "#f8fafc",
            borderRadius: "16px",
            border: "2px dashed #cbd5e1",
          }}
        >
          <AssignmentIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có đề thi nào được chọn
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sử dụng ô tìm kiếm phía trên để thêm đề thi vào bài kiểm tra
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MultiSearchInput;
