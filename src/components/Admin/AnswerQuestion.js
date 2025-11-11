import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import React from "react";
import { isNumeric } from "../../common/Utils";
import { toast } from "react-toastify";

export default function AnswerQuestion({
  question,
  errors,
  handleChangeInputAnswer,
  answer,
  setAnswer,
}) {
  const handleAnswerChange = (event) => {
    const { value } = event.target;
    if (setAnswer && question?.question) {
      question.correctAnswer = value;
      if (question?.type === "TN") {
        setAnswer((prev) => ({
          ...prev,
          [question.question]: value,
        }));
      } else {
        question.correctAnswer = value
          .split(";")
          .map((item) => (isNumeric(item) ? parseFloat(item) : item));
        setAnswer((prev) => ({
          ...prev,
          [question.question]: [
            ...value
              .split(";")
              .map((item) => (isNumeric(item) ? parseFloat(item) : item)),
          ],
        }));
      }
    }
  };

  // Handle clear answer for current question
  const handleClearAnswer = () => {
    if (setAnswer && question?.question) {
      setAnswer((prev) => {
        const newAnswer = { ...prev };
        delete newAnswer[question.question];
        return newAnswer;
      });
    }
  };

  // Handle auto-fill answer from question data
  const handleAutoFillAnswer = () => {
    if (setAnswer && question?.question && question?.correctAnswer) {
      setAnswer((prev) => ({
        ...prev,
        [question.question]: question.correctAnswer,
      }));
    }
  };

  // Get current answer for the question
  const getCurrentAnswer = () => {
    if (answer && question?.question) {
      return Array.isArray(answer[question.question])
        ? answer[question.question].join(";")
        : answer[question.question] || "";
    }
    return "";
  };

  const handleAnswerQuestion = () => {
    switch (question?.type) {
      case "TN":
        return (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Các đáp án trắc nghiệm
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Đáp án A
                  </label>
                  <TextField
                    name="contentAnswerA"
                    value={question?.contentAnswerA}
                    className="w-full"
                    onChange={handleChangeInputAnswer}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    rows={2}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Đáp án B
                  </label>
                  <TextField
                    name="contentAnswerB"
                    value={question?.contentAnswerB}
                    className="w-full"
                    onChange={handleChangeInputAnswer}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    rows={2}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Đáp án C
                  </label>
                  <TextField
                    name="contentAnswerC"
                    value={question?.contentAnswerC}
                    className="w-full"
                    onChange={handleChangeInputAnswer}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    rows={2}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Đáp án D
                  </label>
                  <TextField
                    name="contentAnswerD"
                    value={question?.contentAnswerD}
                    className="w-full"
                    onChange={handleChangeInputAnswer}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    rows={2}
                  />
                </div>
              </div>

              {/* Answer Selection for TN */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <Typography variant="h6" className="text-green-800 mb-3">
                  🎯 Chọn đáp án đúng cho câu hỏi này
                </Typography>
                <div className="flex items-center space-x-2">
                  <FormControl fullWidth>
                    <InputLabel id="correct-answer-label">
                      Đáp án đúng
                    </InputLabel>
                    <Select
                      labelId="correct-answer-label"
                      value={getCurrentAnswer()}
                      label="Đáp án đúng"
                      onChange={handleAnswerChange}
                      className="bg-white"
                    >
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>

            {/* Explanation field */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <TextField
                label="Explanation (Giải thích đáp án)"
                className="w-full"
                multiline
                value={question?.explanation || ""}
                name="explanation"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={6}
                minRows={3}
                variant="outlined"
                placeholder="Nhập giải thích cho đáp án đúng..."
                helperText="Giải thích tại sao đáp án này đúng và các đáp án khác sai"
              />
            </div>
          </>
        );
      case "TLN":
        return (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Câu hỏi điền đáp án (TLN)
              </h3>

              {/* Answer Input for TLN */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Typography variant="h6" className="text-orange-800 mb-3">
                  ✏️ Nhập đáp án cho câu hỏi điền đáp án
                </Typography>
                <div className="flex items-center space-x-2">
                  <TextField
                    label="Đáp án điền đáp án"
                    className="w-full bg-white"
                    value={getCurrentAnswer()}
                    onChange={handleAnswerChange}
                    variant="outlined"
                    placeholder="Ví dụ: 5 hoặc 5;6 hoặc 5.5"
                    helperText="Có thể nhập số nguyên, số thập phân, phân số hoặc nhiều đáp án cách nhau bằng dấu ;"
                  />
                </div>
              </div>

              {/* Explanation field for TLN */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <TextField
                  label="Explanation (Lời giải chi tiết)"
                  className="w-full"
                  multiline
                  value={question?.explanation || ""}
                  name="explanation"
                  InputLabelProps={{ shrink: true }}
                  onChange={handleChangeInputAnswer}
                  maxRows={8}
                  minRows={4}
                  variant="outlined"
                  placeholder="Nhập lời giải chi tiết cho câu hỏi điền đáp án..."
                  helperText="Hướng dẫn cách giải từng bước để học sinh hiểu rõ cách làm"
                />
              </div>
            </div>
          </>
        );
      case "DS":
        return (
          <>
            <div className="mt-5 mb-5 px-[30px]">
              <TextField
                id="outlined-multiline-flexible"
                label="Mệnh đề a)"
                className="w-[100%] label-text"
                multiline
                value={question?.contentYA}
                name="contentYA"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={10}
                minRows={1}
              />
            </div>
            <div className="mt-5 mb-5 px-[30px]">
              <TextField
                id="outlined-multiline-flexible"
                label="Mệnh đề b)"
                className="w-[100%] label-text"
                multiline
                value={question?.contentYB}
                name="contentYB"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={10}
                minRows={1}
              />
            </div>
            <div className="mt-5 mb-5 px-[30px]">
              <TextField
                id="outlined-multiline-flexible"
                label="Mệnh đề c)"
                className="w-[100%] label-text"
                multiline
                value={question?.contentYC}
                name="contentYC"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={10}
                minRows={1}
              />
            </div>
            <div className="mt-5 mb-5 px-[30px]">
              <TextField
                id="outlined-multiline-flexible"
                label="Mệnh đề d)"
                className="w-[100%] label-text"
                multiline
                value={question?.contentYD}
                name="contentYD"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={10}
                minRows={1}
              />
            </div>
          </>
        );
      case "KT":
        return (
          <>
            {" "}
            <div className="mt-5 mb-5 flex justify-around flex-wrap">
              <TextField
                label="Kéo thả A"
                name="A>"
                value={question?.items[0]?.content}
                className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Kéo thả B"
                name="B>"
                value={question?.items[1]?.content}
                className="md:w-[300px] w-[100%] label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="mt-5 mb-5 flex justify-around flex-wrap">
              <TextField
                label="Kéo thả C"
                name="C>"
                value={question?.items[2]?.content}
                className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Kéo thả D"
                name="D>"
                value={question?.items[3]?.content}
                className="md:w-[300px] w-[100%] label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="mt-5 mb-5 flex justify-around flex-wrap">
              <TextField
                label="Kéo thả E"
                name="E>"
                value={question?.items[4]?.content}
                className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Kéo thả F"
                name="F>"
                value={question?.items[5]?.content}
                className="md:w-[300px] w-[100%] label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="mt-5 mb-5 px-[30px]">
              <TextField
                id="outlined-multiline-flexible"
                label="Câu hỏi 1"
                className="w-[100%] label-text"
                multiline
                value={question?.contentY1}
                name="contentY1"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={10}
                minRows={1}
              />
            </div>
            <div className="mt-5 mb-5 px-[30px]">
              <TextField
                id="outlined-multiline-flexible"
                label="Câu hỏi 2"
                className="w-[100%] label-text"
                multiline
                value={question?.contentY2}
                name="contentY2"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={10}
                minRows={1}
              />
            </div>
            <div className="mt-5 mb-5 px-[30px]">
              <TextField
                id="outlined-multiline-flexible"
                label="Câu hỏi 3"
                className="w-[100%] label-text"
                multiline
                value={question?.contentY3}
                name="contentY3"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={10}
                minRows={1}
              />
            </div>
            <div className="mt-5 mb-5 px-[30px]">
              <TextField
                id="outlined-multiline-flexible"
                label="Câu hỏi 4"
                className="w-[100%] label-text"
                multiline
                value={question?.contentY4}
                name="contentY4"
                InputLabelProps={{ shrink: true }}
                onChange={handleChangeInputAnswer}
                maxRows={10}
                minRows={1}
              />
            </div>
          </>
        );
      case "MA":
        return (
          <>
            <div className="mt-5 mb-5 flex justify-around flex-wrap">
              <TextField
                label="Đáp án Checkbox 1"
                name="contentAnswerA"
                value={question?.contentC1}
                className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Đáp án Checkbox 2"
                name="contentAnswerB"
                value={question?.contentC2}
                className="md:w-[300px] w-[100%] label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="mt-5 mb-5 flex justify-around flex-wrap">
              <TextField
                label="Đáp án Checkbox 3"
                name="contentAnswerC"
                value={question?.contentC3}
                className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Đáp án Checkbox 4"
                name="contentAnswerD"
                value={question?.contentC4}
                className="md:w-[300px] w-[100%] label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </>
        );
      case "TLN_M":
        return (
          <>
            <div className="mt-5 mb-5 flex justify-around flex-wrap">
              <TextField
                label="Đáp án A"
                name="contentY1"
                value={question?.contentY1}
                className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Đáp án B"
                name="contentY2"
                value={question?.contentY2}
                className="md:w-[300px] w-[100%] label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="mt-5 mb-5 flex justify-around flex-wrap">
              <TextField
                label="Đáp án C"
                name="contentY3"
                value={question?.contentY3}
                className="md:w-[300px] w-[100%] lg:mb-0 mb-5 label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Đáp án D"
                name="contentY4"
                value={question?.contentY4}
                className="md:w-[300px] w-[100%] label-text"
                onChange={handleChangeInputAnswer}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </>
        );
      default:
        break;
    }
  };
  return handleAnswerQuestion();
}
