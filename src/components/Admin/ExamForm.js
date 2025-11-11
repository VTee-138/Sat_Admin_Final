import React, { useRef, useState } from "react";
import {
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import BadgeIcon from "@mui/icons-material/Badge";
import LinkIcon from "@mui/icons-material/Link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import Slide from "@mui/material/Slide";
import { styled } from "@mui/material/styles";
import AnswerQuestion from "./AnswerQuestion";
import ViewQuestion from "./ViewQuestion";
import ViewExam from "./ViewExam";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ExamForm({
  formQuestionData,
  errors,
  handleChangeInputQuestion,
  listKeys,
  question,
  handleChangeSelectQuestions,
  refs,
  handleChangeUploadFileQuestions,
  handleChangeContentQuestions,
  handleChangeInputAnswer,
  setOpenDialogQuestion,
  upLoadImageQuestions,
  openDialogQuestion,
  // handleChangeDateStartTime,
  // handleChangeDateEndTime,
  handleFileUpload,
  handleInsertExam,
  setOpenDialogExam,
  openDialogExam,
  questionsData,
  isEditing,
  handleUpdateExam,
  upLoadImageExam,
  handleValidateQuestions,
  answer,
  setAnswer,
}) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
            {isEditing ? "✏️ Chỉnh sửa đề thi" : "📝 Tạo đề thi mới"}
          </h1>
          <p className="text-blue-100 text-center mt-2">
            {isEditing
              ? "Cập nhật thông tin đề thi của bạn"
              : "Tạo một đề thi trắc nghiệm mới"}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </span>
              Thông tin cơ bản
            </h2>

            <div className="space-y-6">
              <TextField
                label="Tên đề thi"
                name="title"
                value={formQuestionData.title}
                className="w-full"
                error={errors.title}
                helperText={errors.title ? "Tên đề thi là bắt buộc" : ""}
                onChange={handleChangeInputQuestion}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon className="text-blue-500" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="medium"
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TextField
                  type="number"
                  label="Số câu hỏi"
                  name="numberOfQuestions"
                  value={formQuestionData?.numberOfQuestions}
                  onChange={handleChangeInputQuestion}
                  className="w-full"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="number"
                  label="Thời gian (phút)"
                  name="time"
                  value={formQuestionData?.time}
                  className="w-full"
                  onChange={handleChangeInputQuestion}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select
                  label="Môn học"
                  name="subject"
                  value={formQuestionData?.subject}
                  onChange={handleChangeInputQuestion}
                  className="w-full"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                >
                  {["TOÁN", "TIẾNG ANH"].map((option, key) => (
                    <MenuItem key={key} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TextField
                  select
                  label="Module"
                  name="module"
                  value={formQuestionData?.module}
                  onChange={handleChangeInputQuestion}
                  className="w-full"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                >
                  {["MODULE 1", "MODULE 2-EASY", "MODULE 2-DIFFICULT"].map(
                    (option, key) => (
                      <MenuItem key={key} value={option}>
                        {option}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </span>
              Quản lý câu hỏi
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TextField
                  select
                  label="Chọn câu hỏi"
                  name="question"
                  value={question?.question}
                  onChange={handleChangeSelectQuestions}
                  className="w-full"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                >
                  {listKeys.length > 0
                    ? listKeys.map((option, key) => (
                        <MenuItem key={key} value={option}>
                          {option}
                        </MenuItem>
                      ))
                    : Array.from({ length: 50 }, (v, i) => `Câu ${i + 1}`).map(
                        (option, key) => (
                          <MenuItem key={key} value={option}>
                            {option}
                          </MenuItem>
                        )
                      )}
                </TextField>

                <Button
                  component="label"
                  variant="contained"
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  startIcon={<CloudUploadIcon />}
                  size="large"
                >
                  📄 Nhập đề thi (.docx)
                  <VisuallyHiddenInput
                    type="file"
                    accept=".txt,.docx"
                    ref={refs.inputRefQuestion}
                    onChange={handleChangeUploadFileQuestions}
                  />
                </Button>
              </div>

              <TextField
                label="Nội dung câu hỏi"
                className="w-full"
                multiline
                value={question?.contentQuestions}
                name="contentQuestions"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeContentQuestions}
                maxRows={6}
                minRows={3}
                variant="outlined"
              />

              <AnswerQuestion
                question={question}
                errors={errors}
                handleChangeInputAnswer={handleChangeInputAnswer}
                answer={answer}
                setAnswer={setAnswer}
              />

              {/* Image Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                {question?.imageUrl ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={question.imageUrl}
                        alt={`Ảnh ${question?.question}`}
                        className="max-w-full max-h-48 mx-auto rounded-lg shadow-md object-contain"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ Đã có ảnh
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={refs.imageRefQuestion}
                      onChange={upLoadImageQuestions}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-4">📷</div>
                    <p className="text-gray-600 mb-4">
                      Tải ảnh {question?.question} lên (nếu có)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      ref={refs.imageRefQuestion}
                      onChange={upLoadImageQuestions}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons for Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outlined"
                  className="h-12 border-blue-600 text-blue-600 hover:bg-blue-50"
                  startIcon={<UploadFileIcon />}
                  onClick={() => setOpenDialogQuestion(true)}
                  size="large"
                >
                  👁️ Xem câu hỏi
                </Button>
                <Button
                  variant="outlined"
                  className="h-12 border-blue-600 text-blue-600 hover:bg-blue-50"
                  startIcon={<UploadFileIcon />}
                  onClick={() => setOpenDialogExam(true)}
                  size="large"
                >
                  📋 Xem đề thi
                </Button>
              </div>
            </div>
          </div>

          {/* Time Settings */}
          {/* <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </span>
              Thời gian thi
            </h2>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DateTimePicker"]}>
                    <DateTimePicker
                      className="w-full"
                      label="Thời gian bắt đầu"
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      name="startTime"
                      value={formQuestionData.startTime}
                      onChange={handleChangeDateStartTime}
                      ampm={false}
                    />
                  </DemoContainer>
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DateTimePicker"]}>
                    <DateTimePicker
                      className="w-full"
                      label="Thời gian kết thúc"
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      value={formQuestionData.endTime}
                      name="endTime"
                      onChange={handleChangeDateEndTime}
                      ampm={false}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </div>
            </div>
          </div> */}

          {/* Answer Summary Section */}
          {Object.keys(answer || {}).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  3
                </span>
                Tổng hợp đáp án
              </h2>

              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-green-800">
                    📋 Danh sách đáp án đã chọn ({Object.keys(answer).length}{" "}
                    câu)
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      {
                        Object.keys(answer).filter(
                          (key) => answer[key] && answer[key] !== ""
                        ).length
                      }{" "}
                      / {Object.keys(answer).length} đã hoàn thành
                    </div>

                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => {
                        const dataStr = JSON.stringify(answer, null, 2);
                        const dataBlob = new Blob([dataStr], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "answers.json";
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      📥 Xuất JSON
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {Object.entries(answer).map(([questionKey, answerValue]) => (
                    <div
                      key={questionKey}
                      className="bg-white rounded-lg p-4 border border-green-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {questionKey}
                        </span>
                        {answerValue && answerValue !== "" ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            ✓
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            ⚠
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {Array.isArray(answerValue)
                          ? answerValue.join(";")
                          : answerValue && answerValue !== ""
                          ? answerValue
                          : "Chưa có đáp án"}
                      </div>
                    </div>
                  ))}
                </div>

                {Object.keys(answer).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có đáp án nào
                    </h3>
                    <p className="text-gray-500">
                      Hãy chọn câu hỏi và nhập đáp án để bắt đầu
                    </p>
                  </div>
                )}

                {Object.keys(answer).filter(
                  (key) => !answer[key] || answer[key] === ""
                ).length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⚠️</span>
                      <span className="text-yellow-800">
                        Còn{" "}
                        {
                          Object.keys(answer).filter(
                            (key) => !answer[key] || answer[key] === ""
                          ).length
                        }{" "}
                        câu chưa có đáp án
                      </span>
                    </div>
                  </div>
                )}

                {Object.keys(answer).length > 0 &&
                  Object.keys(answer).filter(
                    (key) => answer[key] && answer[key] !== ""
                  ).length === Object.keys(answer).length && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">✅</span>
                        <span className="text-green-800 font-medium">
                          Tất cả {Object.keys(answer).length} câu đã có đáp án
                          đầy đủ!
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Final Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                {Object.keys(answer || {}).length > 0 ? "4" : "3"}
              </span>
              Hoàn tất
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <Button
                variant="outlined"
                component="label"
                className="h-14 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                startIcon={<UploadFileIcon />}
                size="large"
              >
                📤 Upload Đáp án
                <input
                  ref={refs.inputRef}
                  type="file"
                  accept=".json"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button> */}

              <Button
                variant="outlined"
                className="h-14 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                startIcon={<CheckCircleIcon />}
                onClick={handleValidateQuestions}
                size="large"
              >
                ✅ Kiểm tra câu hỏi
              </Button>

              {isEditing ? (
                <Button
                  variant="contained"
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUpdateExam}
                  size="large"
                >
                  💾 Cập nhật đề thi
                </Button>
              ) : (
                <Button
                  variant="contained"
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleInsertExam}
                  size="large"
                >
                  🚀 Tạo đề thi
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {openDialogQuestion && (
        <ViewQuestion
          openDialog={openDialogQuestion}
          setOpenDialog={setOpenDialogQuestion}
          q={question}
        />
      )}

      {openDialogExam && (
        <ViewExam
          openDialog={openDialogExam}
          setOpenDialog={setOpenDialogExam}
          questionsData={questionsData}
          answer={answer}
        />
      )}
    </div>
  );
}
