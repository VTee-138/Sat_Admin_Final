import React, { useEffect, useRef, useState } from "react";
import { Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import dayjs from "dayjs";
import mammoth from "mammoth";
import {
  checkLatexContent,
  extractQuestionRange,
  isBreak,
  isNumeric,
  isTitleAnswers,
  isValidateContentQuestion,
  toLowerCaseNonAccentVietnamese,
  validateGoogleDriveUrl,
} from "../../common/Utils";
import { toast } from "react-toastify";
import axios from "axios";
import QuestionBankService from "../../services/QuestionBankService";
import UploadService from "../../services/UploadService";
import ConfirmationDialog from "./ConfirmationDialog";
import { Tooltip, TablePagination, TableContainer, Paper } from "@mui/material";
import { REACT_APP_API_UPLOAD_URL } from "../../common/apiClient";
import QuestionBankForm from "./QuestionBankForm";

const configDate = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Ho_Chi_Minh", // hoặc remove nếu dùng UTC
};

export default function QuestionBank() {
  // ]);
  const [formQuestionData, setFormData] = useState({
    subject: "",
  });

  // Fix scroll issue
  useEffect(() => {
    // Đảm bảo body có thể scroll
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    // Reset any fixed heights
    const appRoot = document.getElementById("root");
    if (appRoot) {
      appRoot.style.height = "auto";
      appRoot.style.minHeight = "100vh";
      appRoot.style.overflow = "visible";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const refs = {
    inputRef: useRef(null),
    inputRefQuestion: useRef(null),
    imageRefQuestion: useRef(null),
    imageRefAnswerQuestion: useRef(null),
    imageRefExam: useRef(null),
  };
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditing, setIsEditing] = useState(null);
  const [openDialogQuestion, setOpenDialogQuestion] = useState(false);
  const [openDialogExam, setOpenDialogExam] = useState(false);
  const [rows, setRows] = useState([]);
  const [listQuestions, setListQuestions] = useState([]);
  const [answer, setAnswer] = useState({});
  console.log("🚀 ~ QuestionBank ~ answer:", answer);
  const [listKeys, setListKeys] = useState([]);
  const [question, setQuestion] = useState({
    question: "Câu 1",
    contentQuestions: "",
    imageUrl: "",
    type: "",
    difficulty: "",
    questionType: "",
  });
  const [questionsData, setQuestionsData] = useState([]);
  console.log("🚀 ~ QuestionBank ~ questionsData:", questionsData);
  const [errors, setErrors] = useState({
    subject: false,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // State cho confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const handleDeleteQuestion = async (id) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    try {
      const res = await QuestionBankService.deleteQuestion(deleteItemId);
      toast.success(res?.message);
      setListQuestions(
        listQuestions.filter((question) => question?._id !== deleteItemId)
      );
      handleFetch(); // Refresh danh sách
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
    } finally {
      setDeleteItemId(null);
    }
  };

  const upLoadImageQuestions = async (event) => {
    try {
      const file = event.target?.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error("Chỉ cho phép upload file ảnh!");
          return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File quá lớn! Kích thước tối đa là 5MB.");
          return;
        }

        // Chuyển đổi ảnh sang base64
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64Image = e.target.result;

          console.log("upLoadImageQuestions ~ base64Image created");
          setQuestion({
            ...question,
            imageUrl: base64Image,
          });

          const ques = questionsData.find(
            (e) => e.question === question.question
          );
          if (ques) {
            ques.imageUrl = base64Image;
          }

          toast.success("Tải ảnh lên thành công (base64)");
          refs.imageRefQuestion.current.value = null;
        };

        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          toast.error("Lỗi khi đọc file ảnh");
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const message = error?.message || "Lỗi khi tải ảnh lên";
      toast.error(message);
    }
  };

  const upLoadImageExam = async (event) => {
    try {
      const file = event.target?.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error("Chỉ cho phép upload file ảnh!");
          return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File quá lớn! Kích thước tối đa là 5MB.");
          return;
        }

        // Chuyển đổi ảnh sang base64
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64Image = e.target.result;

          console.log("upLoadImageExam ~ base64Image created");
          setFormData({
            ...formQuestionData,
            imgUrl: base64Image,
          });

          toast.success("Tải ảnh lên thành công (base64)");
          refs.imageRefExam.current.value = null;
        };

        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          toast.error("Lỗi khi đọc file ảnh");
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const message = error?.message || "Lỗi khi tải ảnh lên";
      toast.error(message);
    }
  };

  const setDataInputQuestion = (key, parsedData) => {
    if (parsedData.length > 0) {
      const tempObjectQuestion = parsedData.find((e) => key == e["question"]);
      if (tempObjectQuestion) {
        setQuestion(tempObjectQuestion);
      }
      return;
    }
    setQuestion({
      question: key,
      contentQuestions: "",
      imageUrl: "",
      difficulty: "",
      questionType: "",
    });
  };

  const handleFetch = async () => {
    try {
      const filters = {};
      if (searchQuery) {
        filters.search = searchQuery;
      }
      if (formQuestionData.subject) {
        filters.subject = formQuestionData.subject;
      }

      const response = await QuestionBankService.getQuestions(
        page + 1,
        rowsPerPage,
        filters
      );

      setListQuestions(response?.data?.questions || []);
      setTotalItems(response?.data?.pagination?.totalItems || 0);
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
    }
  };

  useEffect(() => {
    handleFetch();
  }, [page, rowsPerPage]);

  // Reset to page 0 when search query changes and fetch data
  useEffect(() => {
    if (searchQuery !== "") {
      setPage(0);
      // Fetch data with search query
      handleFetch();
    } else {
      // If search query is empty, fetch data immediately
      handleFetch();
    }
  }, [searchQuery]);

  // không cần xử lý hàm này nữa vì đã có hàm processQuestionsFromDocx
  // function processQuestionsFromFileAdvanced(data) {
  //   if (!data) return [];

  //   const lines = data
  //     .split("\n")
  //     ?.filter((e) => e.replace(/\r/g, "").trim() !== "")
  //     .filter(Boolean);
  //   let questionsArray = [];
  //   let currentQuestion = null;
  //   let currentQuestionMQ = null;
  //   let tempQ = "";
  //   for (let i = 0; i < lines.length; i++) {
  //     let line = lines[i].trim() || "";

  //     if (line.startsWith("Câu")) {
  //       // const question_uuid = generateUUID();
  //       if (currentQuestion) {
  //         questionsArray.push(currentQuestion);
  //       }

  //       if (currentQuestionMQ && currentQuestionMQ?.contentQuestions) {
  //         questionsArray.push(currentQuestionMQ);
  //         currentQuestionMQ = null;
  //       }
  //       const cq = line.split(/[:.](.+)/)[1]?.trim() || "";
  //       tempQ =
  //         line.match(/(Câu \d+)/)?.[0] || line.match(/(Câu hỏi \d+)/)?.[0];
  //       currentQuestion = {
  //         question:
  //           line.match(/(Câu \d+)/)?.[0] || line.match(/(Câu hỏi \d+)/)?.[0],
  //         contentQuestions: cq,
  //         items: [],
  //         type: "TLN",
  //         subQuestion: "",
  //         explanation: "",
  //       };
  //       let isCheckLatext = false;
  //       for (let j = i + 1; j < lines.length; j++) {
  //         let line_question = lines[j].trim() || "";

  //         if (
  //           isBreak(line_question, isCheckLatext) ||
  //           line_question.startsWith("MQ:")
  //         ) {
  //           break;
  //         }
  //         if (currentQuestion.contentQuestions) {
  //           currentQuestion.contentQuestions += "\n" + line_question;
  //         } else {
  //           currentQuestion.contentQuestions += line_question;
  //         }
  //       }
  //     } else if (
  //       line.startsWith("A.") ||
  //       line.startsWith("B.") ||
  //       line.startsWith("C.") ||
  //       line.startsWith("D.") ||
  //       line.startsWith("A)") ||
  //       line.startsWith("B)") ||
  //       line.startsWith("C)") ||
  //       line.startsWith("D)")
  //     ) {
  //       currentQuestion.type = "TN";
  //       let lineArr = line.split(/(?=[ABCD][\.\)]\s?)/);
  //       const contentAnswerA = lineArr.find(
  //         (e) => e?.startsWith("A.") || e?.startsWith("A)")
  //       );
  //       const contentAnswerB = lineArr.find(
  //         (e) => e?.startsWith("B.") || e?.startsWith("B)")
  //       );
  //       const contentAnswerC = lineArr.find(
  //         (e) => e?.startsWith("C.") || e?.startsWith("C)")
  //       );
  //       const contentAnswerD = lineArr.find(
  //         (e) => e?.startsWith("D.") || e?.startsWith("D)")
  //       );
  //       if (contentAnswerA) {
  //         if (!currentQuestion.contentAnswerA) {
  //           // Handle both A. and A) formats
  //           const isParenFormat = contentAnswerA.startsWith("A)");
  //           currentQuestion.contentAnswerA = isParenFormat
  //             ? contentAnswerA.startsWith("A) ")
  //               ? contentAnswerA.substring(3)
  //               : contentAnswerA.substring(2)
  //             : contentAnswerA.startsWith("A. ")
  //             ? contentAnswerA.substring(3)
  //             : contentAnswerA.substring(2);

  //           for (let j = i + 1; j < lines.length; j++) {
  //             let line_A = lines[j].trim() || "";
  //             if (
  //               line_A.startsWith("B.") ||
  //               line_A.startsWith("C.") ||
  //               line_A.startsWith("D.") ||
  //               line_A.startsWith("B)") ||
  //               line_A.startsWith("C)") ||
  //               line_A.startsWith("D)")
  //             ) {
  //               break;
  //             }

  //             if (
  //               line_A.startsWith("Câu") ||
  //               isTitleAnswers(line_A) ||
  //               line_A.startsWith("MQ:")
  //             ) {
  //               break;
  //             }

  //             currentQuestion.contentAnswerA += "\n" + line_A;
  //           }
  //         }
  //       }
  //       if (contentAnswerB) {
  //         if (!currentQuestion.contentAnswerB) {
  //           // Handle both B. and B) formats
  //           const isParenFormat = contentAnswerB.startsWith("B)");
  //           currentQuestion.contentAnswerB = isParenFormat
  //             ? contentAnswerB.startsWith("B) ")
  //               ? contentAnswerB.substring(3)
  //               : contentAnswerB.substring(2)
  //             : contentAnswerB.startsWith("B. ")
  //             ? contentAnswerB.substring(3)
  //             : contentAnswerB.substring(2);

  //           for (let j = i + 1; j < lines.length; j++) {
  //             let line_B = lines[j].trim() || "";

  //             if (
  //               line_B.startsWith("C.") ||
  //               line_B.startsWith("D.") ||
  //               line_B.startsWith("C)") ||
  //               line_B.startsWith("D)")
  //             ) {
  //               break;
  //             }

  //             if (
  //               line_B.startsWith("Câu") ||
  //               isTitleAnswers(line_B) ||
  //               line_B.startsWith("MQ:")
  //             ) {
  //               break;
  //             }
  //             currentQuestion.contentAnswerB += "\n" + line_B;
  //           }
  //         }
  //       }
  //       if (contentAnswerC) {
  //         if (!currentQuestion.contentAnswerC) {
  //           // Handle both C. and C) formats
  //           const isParenFormat = contentAnswerC.startsWith("C)");
  //           currentQuestion.contentAnswerC = isParenFormat
  //             ? contentAnswerC.startsWith("C) ")
  //               ? contentAnswerC.substring(3)
  //               : contentAnswerC.substring(2)
  //             : contentAnswerC.startsWith("C. ")
  //             ? contentAnswerC.substring(3)
  //             : contentAnswerC.substring(2);

  //           for (let j = i + 1; j < lines.length; j++) {
  //             let line_C = lines[j].trim() || "";

  //             if (line_C.startsWith("D.") || line_C.startsWith("D)")) {
  //               break;
  //             }
  //             if (
  //               line_C.startsWith("Câu") ||
  //               isTitleAnswers(line_C) ||
  //               line_C.startsWith("MQ:")
  //             ) {
  //               break;
  //             }
  //             currentQuestion.contentAnswerC += "\n" + line_C;
  //           }
  //         }
  //       }
  //       if (contentAnswerD) {
  //         if (!currentQuestion.contentAnswerD) {
  //           // Handle both D. and D) formats
  //           const isParenFormat = contentAnswerD.startsWith("D)");
  //           currentQuestion.contentAnswerD = isParenFormat
  //             ? contentAnswerD.startsWith("D) ")
  //               ? contentAnswerD.substring(3)
  //               : contentAnswerD.substring(2)
  //             : contentAnswerD.startsWith("D. ")
  //             ? contentAnswerD.substring(3)
  //             : contentAnswerD.substring(2);

  //           for (let j = i + 1; j < lines.length; j++) {
  //             let line_D = lines[j].trim() || "";

  //             if (
  //               line_D.startsWith("Câu") ||
  //               isTitleAnswers(line_D) ||
  //               line_D.startsWith("MQ:")
  //             ) {
  //               break;
  //             }
  //             currentQuestion.contentAnswerD += "\n" + line_D;
  //           }
  //         }
  //       }
  //     } else if (line.startsWith("SUB:") || line.startsWith("sub:")) {
  //       currentQuestion.subQuestion = line.substring(4).trim();

  //       for (let j = i + 1; j < lines.length; j++) {
  //         let line_sub = lines[j].trim() || "";
  //         if (
  //           line_sub.startsWith("A.") ||
  //           line_sub.startsWith("B.") ||
  //           line_sub.startsWith("C.") ||
  //           line_sub.startsWith("D.") ||
  //           line_sub.startsWith("A)") ||
  //           line_sub.startsWith("B)") ||
  //           line_sub.startsWith("C)") ||
  //           line_sub.startsWith("D)")
  //         ) {
  //           break;
  //         }
  //         currentQuestion.subQuestion += "\n" + line_sub;
  //       }
  //     } else if (
  //       line.startsWith("Explanation:") ||
  //       line.startsWith("EXPLANATION:")
  //     ) {
  //       // Trường hợp 1: Explanation cùng dòng
  //       const explanationMatch = line.match(/^Explanation:\s*(.+)/i);
  //       if (explanationMatch && explanationMatch[1].trim()) {
  //         currentQuestion.explanation = explanationMatch[1].trim();
  //       } else {
  //         // Trường hợp 2: Explanation ở dòng riêng, đọc nội dung từ dòng tiếp theo
  //         for (let j = i + 1; j < lines.length; j++) {
  //           let line_explanation = lines[j].trim() || "";

  //           // Nếu gặp câu hỏi mới hoặc đáp án thì dừng
  //           if (
  //             line_explanation.startsWith("Câu") ||
  //             line_explanation.startsWith("A.") ||
  //             line_explanation.startsWith("B.") ||
  //             line_explanation.startsWith("C.") ||
  //             line_explanation.startsWith("D.") ||
  //             line_explanation.startsWith("A)") ||
  //             line_explanation.startsWith("B)") ||
  //             line_explanation.startsWith("C)") ||
  //             line_explanation.startsWith("D)") ||
  //             line_explanation.startsWith("MQ:")
  //           ) {
  //             break;
  //           }

  //           // Thêm vào explanation
  //           if (line_explanation && line_explanation.length > 0) {
  //             if (currentQuestion.explanation) {
  //               currentQuestion.explanation += "\n" + line_explanation;
  //             } else {
  //               currentQuestion.explanation = line_explanation;
  //             }
  //           }
  //         }
  //       }
  //     } else if (
  //       line.startsWith("Đáp án:") ||
  //       line.startsWith("DA:") ||
  //       line.startsWith("Trả lời:")
  //     ) {
  //       currentQuestion.type = "TLN";
  //     }
  //   }
  //   if (currentQuestion) {
  //     questionsArray.push(currentQuestion);
  //   }

  //   // Validate questionsArray trước khi return
  //   const isValid = validateQuestionsArray(questionsArray);
  //   if (!isValid) {
  //     console.log("❌ Validation failed for questions from .txt file");
  //     return []; // Return empty array nếu validation fail
  //   }

  //   // const resultvalidateQuestion = validateQuestion(questionsArray);
  //   // if (!resultvalidateQuestion?.flag) {
  //   //   resultvalidateQuestion.messageArr.forEach((message) =>
  //   //     toast.error(message || "Lỗi", {
  //   //       autoClose: 25000, // 25 giây
  //   //       closeOnClick: true,
  //   //       pauseOnHover: true,
  //   //       draggable: true,
  //   //     })
  //   //   );

  //   //   return [];
  //   // }
  //   toast.success("Nhập câu hỏi thành công");
  //   console.log(
  //     " processQuestionsFromFileAdvanced ~ questionsArray:",
  //     questionsArray
  //   );
  //   return questionsArray;
  // }

  // Hàm xử lý file .docx
  async function processQuestionsFromDocxEN(file) {
    try {
      // Store uploaded images URLs
      const uploadedImages = new Map();
      // Store temporary image data for conditional upload
      const tempImageData = new Map();

      // Đọc file .docx và chuyển đổi sang HTML với định dạng
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            // Giữ nguyên định dạng bold, italic, underline
            "b => strong",
            "i => em",
            "u => u",
            // Thêm các định dạng khác
            "strike => del", // Gạch ngang
            "sub => sub", // Subscript
            "sup => sup", // Superscript
            // Color formatting
            "p[style-name='Heading 1'] => h1",
            "p[style-name='Heading 2'] => h2",
            "p[style-name='Heading 3'] => h3",
            // List formatting - cải thiện
            "p[style-name='List Paragraph'] => li",
            "p[style-name='ListParagraph'] => li",
            "p[style-name='Bullet List'] => li",
            "p[style-name='BulletList'] => li",
            // Font colors và highlights
            "r[style-name='Red Text'] => span.text-red",
            "r[style-name='Blue Text'] => span.text-blue",
            "r[style-name='Green Text'] => span.text-green",
            "r[style-name='Highlight'] => mark",
            // Có thể thêm các style mapping khác nếu cần
          ],
          // Thêm options để preserve formatting tốt hơn
          includeDefaultStyleMap: true,
          includeEmbeddedStyleMap: true,
          // Convert functions cho images - validation trước rồi upload
          convertImage: mammoth.images.imgElement(async function (image) {
            try {
              console.log(
                "Processing image from Word document for validation..."
              );

              // Read image as buffer
              const imageBuffer = await image.read();

              // Tạo unique key cho image
              const imageKey = `temp-image-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`;

              // Lưu thông tin image để upload sau nếu validation thành công
              tempImageData.set(imageKey, {
                buffer: imageBuffer,
                contentType: image.contentType,
                altText: image.altText || "Image from Word document",
                originalName: `word-image-${Date.now()}.${
                  image.contentType.split("/")[1]
                }`,
              });

              // Tạo base64 tạm thời cho việc validation và hiển thị
              const base64 = `data:${image.contentType};base64,${Buffer.from(
                imageBuffer
              ).toString("base64")}`;

              console.log("Image processed for validation. Key:", imageKey);

              return {
                src: base64,
                alt: image.altText || "Image from Word document",
                "data-temp-key": imageKey, // Đánh dấu để upload sau
                class: "mx-auto",
              };
            } catch (error) {
              console.error("Error processing image for validation:", error);
              return {
                src: "",
                alt: "Error loading image",
              };
            }
          }),
          // Transform cho các element đặc biệt
          transformDocument: mammoth.transforms.paragraph(function (element) {
            // Xử lý bullet points và numbering
            if (element.numbering) {
              // Nếu là numbered list
              if (element.numbering.level !== undefined) {
                return {
                  ...element,
                  styleId: "numbered-list",
                  styleName: "Numbered List",
                };
              } else {
                // Bullet list
                return {
                  ...element,
                  styleId: "bullet-list",
                  styleName: "Bullet List",
                };
              }
            }

            return element;
          }),
        }
      );

      console.log(
        "Total images stored for conditional upload:",
        tempImageData.size
      );

      // Post-process HTML để wrap li elements trong ul
      let processedHtmlContent = result.value;

      // Clean up và format lists
      const cleanupLists = (html) => {
        // Remove br tags ở đầu và cuối content
        html = html.replace(/^(\s*<br\s*\/?>)+/gi, "");
        html = html.replace(/(\s*<br\s*\/?>)+$/gi, "");

        // Remove multiple consecutive br tags
        html = html.replace(/(<br\s*\/?>){2,}/gi, "<br/>");

        // Wrap consecutive li elements trong ul tags
        html = html.replace(
          /(<li[^>]*>.*?<\/li>)(\s*<li[^>]*>.*?<\/li>)*/g,
          function (match) {
            return "<ul>" + match + "</ul>";
          }
        );

        // Remove nested ul trong ul (nếu có)
        html = html.replace(/<ul>\s*<ul>/g, "<ul>");
        html = html.replace(/<\/ul>\s*<\/ul>/g, "</ul>");

        // Đảm bảo li elements có content
        html = html.replace(/<li[^>]*>\s*<\/li>/g, "");

        // Remove br tags ngay sau opening tags và trước closing tags
        html = html.replace(/(<[^\/][^>]*>)\s*<br\s*\/?>/gi, "$1");
        html = html.replace(/<br\s*\/?>\s*(<\/[^>]+>)/gi, "$1");

        return html;
      };

      processedHtmlContent = cleanupLists(processedHtmlContent);

      const htmlContent = processedHtmlContent;
      console.log("HTML content from docx:", htmlContent);

      // Parse HTML để tách câu hỏi
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      // Lấy tất cả text nodes và elements
      const allContent = doc.body.innerHTML;

      // Debug: log raw HTML content
      console.log("Raw HTML from mammoth:", allContent);

      // Tách thành các dòng, giữ nguyên HTML tags và loại bỏ dòng trống
      const lines = allContent
        .split(/<\/p>|<br\s*\/?>/)
        .map((line) => line.replace(/<p[^>]*>/g, "").trim())
        .filter((line) => line && line !== "" && line.length > 0); // Xóa dòng trống

      console.log("Parsed lines after filtering:", lines);

      let questionsArray = [];
      let currentQuestion = null;

      // Helper function để clean content
      const cleanContent = (content) => {
        if (!content) return content;

        // Remove br tags ở đầu và cuối
        content = content.replace(/^(\s*<br\s*\/?>)+/gi, "");
        content = content.replace(/(\s*<br\s*\/?>)+$/gi, "");

        // Replace multiple consecutive br tags
        content = content.replace(/(<br\s*\/?>){3,}/gi, "<br/><br/>");

        return content.trim();
      };

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim() || "";
        // // Skip empty lines
        if (!line || line.length === 0) continue;

        if (/^\s*\d+\./.test(line)) {
          // Kiểm tra nếu là câu hỏi mới (bắt đầu bằng số như "1.", "2.", etc.)
          const questionMatch = line.match(/^(\d+)\.\s*(.*)/);
          // Lưu câu hỏi trước đó nếu có
          if (currentQuestion) {
            questionsArray.push(currentQuestion);
          }

          const questionNumber = questionMatch[1];
          const questionContent = questionMatch[2];

          currentQuestion = {
            question: `Câu ${questionNumber}`,
            contentQuestions: cleanContent(questionContent),
            type: "TN", // Mặc định là trắc nghiệm
            contentAnswerA: "",
            contentAnswerB: "",
            contentAnswerC: "",
            contentAnswerD: "",
            correctAnswer: "",
            explanation: "",
            questionType: "",
            difficulty: "",
          };

          // Đọc tiếp để lấy phần còn lại của câu hỏi (cho đến khi gặp đáp án)
          for (let j = i + 1; j < lines.length; j++) {
            let nextLine = lines[j].trim() || "";

            // Nếu gặp đáp án A, B, C, D thì dừng
            if (
              nextLine.match(
                /^(?:<strong>)?([ABCD])[\.\)]\s*(.+?)(?:<\/strong>)?$/
              )
            ) {
              break;
            }

            // Nếu gặp câu hỏi tiếp theo thì dừng
            if (/^\s*\d+\./.test(nextLine)) {
              break;
            }

            // Nếu gặp Explanation thì dừng (sẽ xử lý riêng)
            if (
              nextLine.match(/^Explanation:/i) ||
              nextLine.match(/^questionType:/i) ||
              nextLine.match(/^difficultyType:/i)
            ) {
              break;
            }

            // Thêm vào nội dung câu hỏi nếu không phải dòng trống
            if (nextLine && nextLine.length > 0) {
              currentQuestion.contentQuestions += "<br/>" + nextLine;
            }
          }
        }

        // Kiểm tra nếu là đáp án A, B, C, D
        const answerMatch = line.match(
          /^(?:<strong>)?([ABCD])[\.\)]\s*(.+?)(?:<\/strong>)?$/
        );

        if (answerMatch && currentQuestion) {
          const answerLetter = answerMatch[1];
          let answerContent = answerMatch[2];
          // Phương pháp detect đáp án đúng tốt hơn
          let isBold = false;

          console.log(`🔍 Checking line for bold: ${line}`);

          // Phương pháp 1: Parse line thành DOM để kiểm tra chính xác
          const tempDoc = parser.parseFromString(
            `<div>${line}</div>`,
            "text/html"
          );

          const boldElements = tempDoc.querySelectorAll("strong, b");

          // Kiểm tra xem có tag bold nào chứa pattern đáp án không
          boldElements.forEach((boldEl) => {
            const boldText = boldEl.textContent || boldEl.innerText;
            console.log(`Found bold element: "${boldText}"`);
            if (boldText && boldText.match(/^[ABCD][\.\)]\s*/)) {
              isBold = true;
              console.log(`✅ Found bold answer pattern: ${boldText}`);
            }
          });

          // Phương pháp 2: Kiểm tra nếu toàn bộ line nằm trong bold tag
          if (!isBold) {
            const wholeBoldMatch = line.match(
              /<(strong|b)[^>]*>([^<]*[ABCD][\.\)][^<]*)<\/(strong|b)>/
            );
            if (wholeBoldMatch) {
              isBold = true;
              console.log(`✅ Found whole line bold: ${wholeBoldMatch[2]}`);
            }
          }

          // Phương pháp 3: Kiểm tra nếu đáp án được bao bọc bởi bold
          if (!isBold) {
            const answerInBold = line.match(
              /<(strong|b)[^>]*>.*?([ABCD][\.\)].*?)<\/(strong|b)>/
            );
            if (answerInBold) {
              isBold = true;
              console.log(`✅ Found answer in bold: ${answerInBold[2]}`);
            }
          }

          // Phương pháp 4: Fallback - kiểm tra simple contains
          if (!isBold) {
            isBold =
              answerContent.includes("<strong>") ||
              answerContent.includes("<b>") ||
              line.includes("<strong>") ||
              line.includes("<b>") ||
              // Kiểm tra pattern **text** (markdown bold)
              answerContent.includes("**");
          }

          if (isBold) {
            currentQuestion.correctAnswer = answerLetter;
            console.log(
              `✅ FINAL: Detected correct answer for ${currentQuestion.question}: ${answerLetter}`
            );
            console.log(`Bold content: ${line}`);
          } else {
            console.log(`❌ No bold detected for ${answerLetter}: ${line}`);
          }

          // Đọc tiếp để lấy phần còn lại của đáp án (nếu có nhiều dòng)
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();

            // Nếu gặp đáp án khác hoặc câu hỏi mới hoặc Explanation thì dừng
            if (
              nextLine.match(
                /^(?:<strong>)?([ABCD])[\.\)]\s*(.+?)(?:<\/strong>)?$/
              ) ||
              /^\s*\d+\./.test(nextLine) ||
              nextLine.match(/^Explanation:/i)
            ) {
              break;
            }

            if (
              nextLine.match(/^Explanation:/i) ||
              nextLine.match(/^questionType:/i) ||
              nextLine.match(/^difficultyType:/i)
            ) {
              break;
            }
            // Thêm vào nội dung đáp án nếu không phải dòng trống
            if (nextLine && nextLine.length > 0) {
              answerContent += "<br/>" + nextLine;
            }
          }

          // Gán vào đáp án tương ứng
          switch (answerLetter) {
            case "A":
              currentQuestion.contentAnswerA = cleanContent(answerContent);
              break;
            case "B":
              currentQuestion.contentAnswerB = cleanContent(answerContent);
              break;
            case "C":
              currentQuestion.contentAnswerC = cleanContent(answerContent);
              break;
            case "D":
              currentQuestion.contentAnswerD = cleanContent(answerContent);
              break;
          }
        }

        if (line.match(/^questionType:/i) && currentQuestion) {
          console.log(`🔍 Found questionType line: ${line}`);

          // Trường hợp 1: Explanation cùng dòng
          const questionTypeMatch = line.match(/^questionType:\s*(.+)/i);

          currentQuestion.questionType = cleanContent(
            questionTypeMatch[1].trim()
          );
          console.log(
            `✅ Same line questionType: ${currentQuestion.questionType}`
          );
        }

        if (line.match(/^difficultyType:/i) && currentQuestion) {
          console.log(`🔍 Found difficultyType line: ${line}`);

          // Trường hợp 1: Explanation cùng dòng
          const questionTypeMatch = line.match(/^difficultyType:\s*(.+)/i);

          currentQuestion.difficulty = cleanContent(
            questionTypeMatch[1].trim()
          );
          console.log(
            `✅ Same line difficultyType: ${currentQuestion.difficulty}`
          );
        }

        // Kiểm tra nếu là Explanation
        if (line.match(/^Explanation:/i) && currentQuestion) {
          console.log(`🔍 Found Explanation line: ${line}`);

          // Trường hợp 1: Explanation cùng dòng
          const explanationMatch = line.match(/^Explanation:\s*(.+)/i);
          if (explanationMatch && explanationMatch[1].trim()) {
            currentQuestion.explanation = cleanContent(
              explanationMatch[1].trim()
            );
            console.log(
              `✅ Same line explanation: ${currentQuestion.explanation}`
            );

            // Tiếp tục đọc các dòng tiếp theo để lấy phần explanation còn lại
            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j].trim();

              // Nếu gặp câu hỏi mới thì dừng
              if (/^\s*\d+\./.test(nextLine)) {
                break;
              }
              if (
                nextLine.match(/^questionType:/i) ||
                nextLine.match(/^difficultyType:/i)
              ) {
                break;
              }
              // Nếu có nội dung explanation tiếp theo
              if (nextLine && nextLine.length > 0) {
                currentQuestion.explanation += "<br/>" + nextLine;
                console.log(
                  `📝 Extended explanation: ${currentQuestion.explanation}`
                );
              }
            }
          } else {
            // Trường hợp 2: Explanation ở dòng riêng, nội dung ở dòng sau
            console.log(`🔍 Looking for explanation in next lines...`);

            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j].trim();

              // Nếu gặp câu hỏi mới thì dừng
              if (/^\s*\d+\./.test(nextLine)) {
                break;
              }

              if (
                nextLine.match(/^questionType:/i) ||
                nextLine.match(/^difficultyType:/i)
              ) {
                break;
              }
              // Nếu có nội dung explanation
              if (nextLine && nextLine.length > 0) {
                if (currentQuestion.explanation) {
                  currentQuestion.explanation += "<br/>" + nextLine;
                } else {
                  currentQuestion.explanation = cleanContent(nextLine);
                }
                console.log(
                  `✅ Multi-line explanation updated: ${currentQuestion.explanation}`
                );
              }
            }
          }
        }
      }

      // Thêm câu hỏi cuối cùng
      if (currentQuestion) {
        questionsArray.push(currentQuestion);
      }

      // Tự động tạo answer object từ các đáp án đúng đã được detect
      const autoAnswer = {};
      questionsArray.forEach((q, index) => {
        if (q.correctAnswer) {
          autoAnswer[q.question] = q.correctAnswer;
        } else {
          // Nếu không detect được đáp án đúng, mặc định là A
          autoAnswer[q.question] = "X";
          toast.error("Không tìm thấy đáp án đúng cho câu hỏi: " + q.question);
        }
      });

      console.log("Auto-generated answer object:", autoAnswer);

      // Cập nhật answer state với dữ liệu tự động tạo
      setAnswer(autoAnswer);

      const detectedAnswers = Object.keys(autoAnswer).filter(
        (key) => autoAnswer[key] !== "X"
      ).length;

      const successMessage =
        uploadedImages.size > 0
          ? `Nhập câu hỏi từ file Word thành công! Đã detect ${detectedAnswers} đáp án đúng và upload ${uploadedImages.size} ảnh.`
          : `Nhập câu hỏi từ file Word thành công! Đã detect ${detectedAnswers} đáp án đúng tự động.`;

      // Log explanation statistics
      const questionsWithExplanation = questionsArray.filter(
        (q) => q.explanation && q.explanation.trim().length > 0
      );
      console.log(
        `📝 Found ${questionsWithExplanation.length} questions with explanations`
      );
      questionsWithExplanation.forEach((q) => {
        console.log(`✅ ${q.question}: ${q.explanation.substring(0, 100)}...`);
      });
      console.log("✅ QuestionsArray:", questionsArray);
      // Validate questionsArray trước khi return
      const isValid = validateQuestionsArrayEN(questionsArray);
      if (!isValid) {
        console.log("❌ Validation failed for questions from .docx file");
        toast.error(
          "Validation thất bại. Ảnh sẽ không được upload lên server."
        );
        // return []; // Return empty array nếu validation fail
        return questionsArray; // Trả về với base64 images
      }

      toast.success(successMessage + " (ảnh sử dụng base64)");
      return questionsArray; // Trả về với base64 images nếu upload failed
    } catch (error) {
      console.error("Error processing docx file:", error);
      toast.error("Lỗi khi xử lý file Word: " + error.message);
      return [];
    }
  }

  async function processQuestionsFromDocxMath(file) {
    try {
      // Store uploaded images URLs
      const uploadedImages = new Map();
      // Store temporary image data for conditional upload
      const tempImageData = new Map();

      // Đọc file .docx và chuyển đổi sang HTML với định dạng
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            // Giữ nguyên định dạng bold, italic, underline
            "b => strong",
            "i => em",
            "u => u",
            // Thêm các định dạng khác
            "strike => del", // Gạch ngang
            "sub => sub", // Subscript
            "sup => sup", // Superscript
            // Color formatting
            "p[style-name='Heading 1'] => h1",
            "p[style-name='Heading 2'] => h2",
            "p[style-name='Heading 3'] => h3",
            // List formatting - cải thiện
            "p[style-name='List Paragraph'] => li",
            "p[style-name='ListParagraph'] => li",
            "p[style-name='Bullet List'] => li",
            "p[style-name='BulletList'] => li",
            // Font colors và highlights
            "r[style-name='Red Text'] => span.text-red",
            "r[style-name='Blue Text'] => span.text-blue",
            "r[style-name='Green Text'] => span.text-green",
            "r[style-name='Highlight'] => mark",
            // Table styles
            "table => table.word-table",
            "tr => tr.word-table-row",
            "td => td.word-table-cell",
            "th => th.word-table-header",
            "tbody => tbody.word-table-body",
            "thead => thead.word-table-head",
            // Có thể thêm các style mapping khác nếu cần
          ],
          // Thêm options để preserve formatting tốt hơn
          includeDefaultStyleMap: true,
          includeEmbeddedStyleMap: true,
          // Convert functions cho images - tạm thời chỉ tạo base64 cho validation
          convertImage: mammoth.images.imgElement(async function (image) {
            try {
              console.log(
                "Processing image from Word document for validation..."
              );

              // Read image as buffer
              const imageBuffer = await image.read();

              // Tạo unique key cho image
              const imageKey = `temp-image-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`;

              // Lưu thông tin image để upload sau nếu validation thành công
              tempImageData.set(imageKey, {
                buffer: imageBuffer,
                contentType: image.contentType,
                altText: image.altText || "Image from Word document",
                originalName: `word-image-${Date.now()}.${
                  image.contentType.split("/")[1]
                }`,
              });

              // Tạo base64 tạm thời cho việc validation và hiển thị
              const base64 = `data:${image.contentType};base64,${Buffer.from(
                imageBuffer
              ).toString("base64")}`;

              console.log("Image processed for validation. Key:", imageKey);

              return {
                src: base64,
                alt: image.altText || "Image from Word document",
                "data-temp-key": imageKey, // Đánh dấu để upload sau
                class: "mx-auto",
              };
            } catch (error) {
              console.error("Error processing image for validation:", error);
              return {
                src: "",
                alt: "Error loading image",
              };
            }
          }),
          // Transform cho các element đặc biệt
          transformDocument: mammoth.transforms.paragraph(function (element) {
            // Xử lý bullet points và numbering
            if (element.numbering) {
              // Nếu là numbered list
              if (element.numbering.level !== undefined) {
                return {
                  ...element,
                  styleId: "numbered-list",
                  styleName: "Numbered List",
                };
              } else {
                // Bullet list
                return {
                  ...element,
                  styleId: "bullet-list",
                  styleName: "Bullet List",
                };
              }
            }

            return element;
          }),
        }
      );

      console.log(
        "Total images stored for conditional upload:",
        tempImageData.size
      );

      // Post-process HTML để wrap li elements trong ul
      let processedHtmlContent = result.value;

      // Clean up và format lists
      const cleanupLists = (html) => {
        // Remove br tags ở đầu và cuối content
        html = html.replace(/^(\s*<br\s*\/?>)+/gi, "");
        html = html.replace(/(\s*<br\s*\/?>)+$/gi, "");

        // Remove multiple consecutive br tags
        html = html.replace(/(<br\s*\/?>){2,}/gi, "<br/>");

        // Wrap consecutive li elements trong ul tags
        html = html.replace(
          /(<li[^>]*>.*?<\/li>)(\s*<li[^>]*>.*?<\/li>)*/g,
          function (match) {
            return "<ul>" + match + "</ul>";
          }
        );

        // Remove nested ul trong ul (nếu có)
        html = html.replace(/<ul>\s*<ul>/g, "<ul>");
        html = html.replace(/<\/ul>\s*<\/ul>/g, "</ul>");

        // Đảm bảo li elements có content
        html = html.replace(/<li[^>]*>\s*<\/li>/g, "");

        // Remove br tags ngay sau opening tags và trước closing tags
        html = html.replace(/(<[^\/][^>]*>)\s*<br\s*\/?>/gi, "$1");
        html = html.replace(/<br\s*\/?>\s*(<\/[^>]+>)/gi, "$1");

        return html;
      };

      processedHtmlContent = cleanupLists(processedHtmlContent);

      const htmlContent = processedHtmlContent;
      console.log("HTML content from docx:", htmlContent);

      // Parse HTML để tách câu hỏi
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      // Lấy tất cả text nodes và elements
      const allContent = doc.body.innerHTML;

      // Debug: log raw HTML content
      console.log("Raw HTML from mammoth:", allContent);

      // Tách thành các dòng, giữ nguyên HTML tags và loại bỏ dòng trống
      const lines = allContent
        .split(/<\/p>|<br\s*\/?>/)
        .map((line) => line.replace(/<p[^>]*>/g, "").trim())
        .filter((line) => line && line !== "" && line.length > 0); // Xóa dòng trống

      console.log("Parsed lines after filtering:", lines);

      let questionsArray = [];
      let currentQuestion = null;

      // Helper function để clean content
      const cleanContent = (content) => {
        if (!content) return content;

        // Remove br tags ở đầu và cuối
        content = content.replace(/^(\s*<br\s*\/?>)+/gi, "");
        content = content.replace(/(\s*<br\s*\/?>)+$/gi, "");

        // Replace multiple consecutive br tags
        content = content.replace(/(<br\s*\/?>){3,}/gi, "<br/><br/>");

        return content.trim();
      };

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim() || "";
        console.log(
          "🚀 ~ processQuestionsFromDocxMath ~ line:",
          line,
          line.includes("&lt;")
        );
        // // Skip empty lines
        if (!line || line.length === 0) continue;

        if (/^\s*\d+\./.test(line)) {
          // Kiểm tra nếu là câu hỏi mới (bắt đầu bằng số như "1.", "2.", etc.)
          // const questionMatch = line.match(/^(?:<[^>]+>)*(\d+)\.\s*(.*)/);
          const questionMatch = line.match(/^(\d+)\.\s*(.*)/);

          // Lưu câu hỏi trước đó nếu có
          if (currentQuestion) {
            questionsArray.push(currentQuestion);
          }

          const questionNumber = questionMatch[1];
          const questionContent = questionMatch[2];

          currentQuestion = {
            question: `Câu ${questionNumber}`,
            contentQuestions: cleanContent(questionContent),
            type: "TN", // Mặc định là trắc nghiệm
            contentAnswerA: "",
            contentAnswerB: "",
            contentAnswerC: "",
            contentAnswerD: "",
            correctAnswer: "",
            explanation: "",
            questionType: "",
            difficulty: "",
          };

          // Đọc tiếp để lấy phần còn lại của câu hỏi (cho đến khi gặp đáp án)
          for (let j = i + 1; j < lines.length; j++) {
            let nextLine = lines[j].trim() || "";

            // Nếu gặp đáp án A, B, C, D thì dừng
            if (
              nextLine.match(
                /^(?:<\/td><\/tr><\/tbody><\/table>)?\s*(?:<strong>)?([ABCD])[\.\)]\s*(.+?)(?:<\/strong>)?$/i
              )
            ) {
              break;
            }

            // Nếu gặp đáp án TLN thì dừng
            if (
              nextLine.match(
                /^(?:<strong>)?Answer:\s*(-?(?:\d*\.\d+|\d+\/\d+|\d+)(?:;-?(?:\d*\.\d+|\d+\/\d+|\d+))*)(?:<\/strong>)?$/i
              )
            ) {
              break;
            }

            // Nếu gặp câu hỏi tiếp theo thì dừng
            if (/^\s*\d+\./.test(nextLine)) {
              break;
            }

            // Nếu gặp Explanation thì dừng (sẽ xử lý riêng)
            if (
              nextLine.match(/^Explanation:/i) ||
              nextLine.match(/^questionType:/i) ||
              nextLine.match(/^difficultyType:/i)
            ) {
              break;
            }

            // Thêm vào nội dung câu hỏi nếu không phải dòng trống
            if (nextLine && nextLine.length > 0) {
              currentQuestion.contentQuestions += "<br/>" + nextLine;
            }
          }
        }

        // Kiểm tra nếu là đáp án A, B, C, D
        const answerMatch = line.match(
          /^(?:<\/td><\/tr><\/tbody><\/table>)?\s*(?:<strong>)?([ABCD])[\.\)]\s*(.+?)(?:<\/strong>)?$/i
        );

        const answerMatchTLN = line.match(
          /^(?:<strong>)?Answer:\s*(-?(?:\d*\.\d+|\d+\/\d+|\d+)(?:;-?(?:\d*\.\d+|\d+\/\d+|\d+))*)(?:<\/strong>)?$/i
        );
        console.log(
          "🚀 ~ processQuestionsFromDocxMath ~ answerMatchTLN:",
          answerMatchTLN
        );
        if (answerMatch && currentQuestion) {
          const answerLetter = answerMatch[1];
          let answerContent = answerMatch[2];
          // Phương pháp detect đáp án đúng tốt hơn
          let isBold = false;

          console.log(`🔍 Checking line for bold: ${line}`);

          // Phương pháp 1: Parse line thành DOM để kiểm tra chính xác
          const tempDoc = parser.parseFromString(
            `<div>${line}</div>`,
            "text/html"
          );

          const boldElements = tempDoc.querySelectorAll("strong, b");

          // Kiểm tra xem có tag bold nào chứa pattern đáp án không
          boldElements.forEach((boldEl) => {
            const boldText = boldEl.textContent || boldEl.innerText;
            console.log(`Found bold element: "${boldText}"`);
            if (boldText && boldText.match(/^[ABCD][\.\)]\s*/)) {
              isBold = true;
              console.log(`✅ Found bold answer pattern: ${boldText}`);
            }
          });

          // Phương pháp 2: Kiểm tra nếu toàn bộ line nằm trong bold tag
          if (!isBold) {
            const wholeBoldMatch = line.match(
              /<(strong|b)[^>]*>([^<]*[ABCD][\.\)][^<]*)<\/(strong|b)>/
            );
            if (wholeBoldMatch) {
              isBold = true;
              console.log(`✅ Found whole line bold: ${wholeBoldMatch[2]}`);
            }
          }

          // Phương pháp 3: Kiểm tra nếu đáp án được bao bọc bởi bold
          if (!isBold) {
            const answerInBold = line.match(
              /<(strong|b)[^>]*>.*?([ABCD][\.\)].*?)<\/(strong|b)>/
            );
            if (answerInBold) {
              isBold = true;
              console.log(`✅ Found answer in bold: ${answerInBold[2]}`);
            }
          }

          // Phương pháp 4: Fallback - kiểm tra simple contains
          if (!isBold) {
            isBold =
              answerContent.includes("<strong>") ||
              answerContent.includes("<b>") ||
              line.includes("<strong>") ||
              line.includes("<b>") ||
              // Kiểm tra pattern **text** (markdown bold)
              answerContent.includes("**");
          }

          if (isBold) {
            currentQuestion.correctAnswer = answerLetter;
            console.log(
              `✅ FINAL: Detected correct answer for ${currentQuestion.question}: ${answerLetter}`
            );
            console.log(`Bold content: ${line}`);
          } else {
            console.log(`❌ No bold detected for ${answerLetter}: ${line}`);
          }

          // Đọc tiếp để lấy phần còn lại của đáp án (nếu có nhiều dòng)
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();

            // Nếu gặp đáp án khác hoặc câu hỏi mới hoặc Explanation thì dừng
            if (
              nextLine.match(
                /^(?:<\/td><\/tr><\/tbody><\/table>)?\s*(?:<strong>)?([ABCD])[\.\)]\s*(.+?)(?:<\/strong>)?$/i
              ) ||
              /^\s*\d+\./.test(nextLine) ||
              nextLine.match(/^Explanation:/i)
            ) {
              break;
            }

            if (
              nextLine.match(/^Explanation:/i) ||
              nextLine.match(/^questionType:/i) ||
              nextLine.match(/^difficultyType:/i)
            ) {
              break;
            }

            // Thêm vào nội dung đáp án nếu không phải dòng trống
            if (nextLine && nextLine.length > 0) {
              answerContent += "<br/>" + nextLine;
            }
          }

          // Gán vào đáp án tương ứng
          switch (answerLetter) {
            case "A":
              currentQuestion.contentAnswerA = cleanContent(answerContent);
              break;
            case "B":
              currentQuestion.contentAnswerB = cleanContent(answerContent);
              break;
            case "C":
              currentQuestion.contentAnswerC = cleanContent(answerContent);
              break;
            case "D":
              currentQuestion.contentAnswerD = cleanContent(answerContent);
              break;
          }
        } else if (answerMatchTLN && currentQuestion) {
          currentQuestion.type = "TLN";
          delete currentQuestion.contentAnswerA;
          delete currentQuestion.contentAnswerB;
          delete currentQuestion.contentAnswerC;
          delete currentQuestion.contentAnswerD;
          if (answerMatchTLN) {
            currentQuestion.correctAnswer = answerMatchTLN[1]
              ?.split(";")
              ?.map((n) => (isNumeric(n) ? parseFloat(n) : n));
          } else {
            toast.error(
              "Đáp án đúng cho câu hỏi: " +
                currentQuestion.question +
                " không đúng định dạng"
            );
          }
        }

        if (line.match(/^questionType:/i) && currentQuestion) {
          console.log(`🔍 Found questionType line: ${line}`);

          // Trường hợp 1: Explanation cùng dòng
          const questionTypeMatch = line.match(/^questionType:\s*(.+)/i);

          currentQuestion.questionType = cleanContent(
            questionTypeMatch[1].trim()
          );
          console.log(
            `✅ Same line questionType: ${currentQuestion.questionType}`
          );
        }

        if (line.match(/^difficultyType:/i) && currentQuestion) {
          console.log(`🔍 Found difficultyType line: ${line}`);

          // Trường hợp 1: Explanation cùng dòng
          const questionTypeMatch = line.match(/^difficultyType:\s*(.+)/i);

          currentQuestion.difficulty = cleanContent(
            questionTypeMatch[1].trim()
          );
          console.log(
            `✅ Same line difficultyType: ${currentQuestion.difficulty}`
          );
        }
        // Kiểm tra nếu là Explanation
        if (line.match(/^Explanation:/i) && currentQuestion) {
          console.log(`🔍 Found Explanation line: ${line}`);

          // Trường hợp 1: Explanation cùng dòng
          const explanationMatch = line.match(/^Explanation:\s*(.+)/i);
          if (explanationMatch && explanationMatch[1].trim()) {
            currentQuestion.explanation = cleanContent(
              explanationMatch[1].trim()
            );
            console.log(
              `✅ Same line explanation: ${currentQuestion.explanation}`
            );

            // Tiếp tục đọc các dòng tiếp theo để lấy phần explanation còn lại
            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j].trim();

              // Nếu gặp câu hỏi mới thì dừng
              if (/^\s*\d+\./.test(nextLine)) {
                break;
              }

              if (
                nextLine.match(/^questionType:/i) ||
                nextLine.match(/^difficultyType:/i)
              ) {
                break;
              }
              // Nếu có nội dung explanation tiếp theo
              if (nextLine && nextLine.length > 0) {
                currentQuestion.explanation += "<br/>" + nextLine;
                console.log(
                  `📝 Extended explanation: ${currentQuestion.explanation}`
                );
              }
            }
          } else {
            // Trường hợp 2: Explanation ở dòng riêng, nội dung ở dòng sau
            console.log(`🔍 Looking for explanation in next lines...`);

            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j].trim();

              // Nếu gặp câu hỏi mới thì dừng
              if (/^\s*\d+\./.test(nextLine)) {
                break;
              }

              if (
                nextLine.match(/^questionType:/i) ||
                nextLine.match(/^difficultyType:/i)
              ) {
                break;
              }

              // Nếu có nội dung explanation
              if (nextLine && nextLine.length > 0) {
                if (currentQuestion.explanation) {
                  currentQuestion.explanation += "<br/>" + nextLine;
                } else {
                  currentQuestion.explanation = cleanContent(nextLine);
                }
                console.log(
                  `✅ Multi-line explanation updated: ${currentQuestion.explanation}`
                );
              }
            }
          }
        }
      }

      // Thêm câu hỏi cuối cùng
      if (currentQuestion) {
        questionsArray.push(currentQuestion);
      }

      // Tự động tạo answer object từ các đáp án đúng đã được detect
      const autoAnswer = {};
      questionsArray.forEach((q, index) => {
        if (q.correctAnswer) {
          autoAnswer[q.question] = q.correctAnswer;
        } else {
          // Nếu không detect được đáp án đúng, mặc định là A
          autoAnswer[q.question] = "X";
          toast.error("Không tìm thấy đáp án đúng cho câu hỏi: " + q.question);
        }
      });

      console.log("Auto-generated answer object:", autoAnswer);

      // Cập nhật answer state với dữ liệu tự động tạo
      setAnswer(autoAnswer);

      const detectedAnswers = Object.keys(autoAnswer).filter(
        (key) => autoAnswer[key] !== "X"
      ).length;

      const successMessage =
        uploadedImages.size > 0
          ? `Nhập câu hỏi từ file Word thành công! Đã detect ${detectedAnswers} đáp án đúng và upload ${uploadedImages.size} ảnh.`
          : `Nhập câu hỏi từ file Word thành công! Đã detect ${detectedAnswers} đáp án đúng tự động.`;

      // Log explanation statistics
      const questionsWithExplanation = questionsArray.filter(
        (q) => q.explanation && q.explanation.trim().length > 0
      );
      console.log(
        `📝 Found ${questionsWithExplanation.length} questions with explanations`
      );
      questionsWithExplanation.forEach((q) => {
        console.log(`✅ ${q.question}: ${q.explanation.substring(0, 100)}...`);
      });
      console.log("✅ QuestionsArray:", questionsArray);
      // Validate questionsArray trước khi return
      const isValid = validateQuestionsArrayMath(questionsArray);
      if (!isValid) {
        console.log("❌ Validation failed for questions from .docx file");
        toast.error(
          "Validation thất bại. Ảnh sẽ không được upload lên server."
        );
        // return []; // Return empty array nếu validation fail
        return questionsArray; // Trả về với base64 images
      }

      toast.success(successMessage + " (ảnh sử dụng base64)");
      return questionsArray; // Trả về với base64 images nếu upload failed
    } catch (error) {
      console.error("Error processing docx file:", error);
      toast.error("Lỗi khi xử lý file Word: " + error.message);
      return [];
    }
  }

  const validateQuestion = (questionsArray) => {
    let flag = true;
    let messageArr = [];
    const listQ = questionsArray.filter((question) => question?.type !== "MQ");
    if (formQuestionData.type === "TSA") {
      if (
        listQ.length !== 40 &&
        formQuestionData.subject === "TƯ DUY TOÁN HỌC"
      ) {
        flag = false;
        messageArr.push("Đề TƯ DUY TOÁN HỌC phải có đầy đủ 40 câu hỏi");
      } else if (
        listQ.length !== 20 &&
        formQuestionData.subject === "TƯ DUY ĐỌC HIỂU"
      ) {
        flag = false;
        messageArr.push("Đề TƯ DUY ĐỌC HIỂU Lý phải có đầy đủ 20 câu hỏi");
      } else if (
        listQ.length !== 40 &&
        formQuestionData.subject === "TƯ DUY KHOA HỌC"
      ) {
        flag = false;
        messageArr.push("Đề TƯ DUY KHOA HỌC phải có đầy đủ 40 câu hỏi");
      }
    }
    for (let index = 0; index < questionsArray.length; index++) {
      const question = questionsArray[index];
      if (isValidateContentQuestion(question?.contentQuestions)) {
        flag = false;
        messageArr.push(question?.question + ": Nội dung câu hỏi bị sai");
      }
      if (question?.type === "TN") {
        if (
          !question?.contentAnswerA ||
          !question?.contentAnswerB ||
          !question?.contentAnswerC ||
          !question?.contentAnswerD
        ) {
          flag = false;
          messageArr.push(
            question?.question +
              ": Câu trắc nghiệm bị thiếu đáp án A, B, C hoặc D"
          );
        }
      }
      if (question?.type === "TLN_M") {
        if (!question?.contentY1 || !question?.contentY2) {
          flag = false;
          messageArr.push(
            question?.question +
              ": Câu hỏi trả lời nhiều mệnh đề bị thiếu mệnh đề 1, 2"
          );
        }
      } else if (question?.type === "MA") {
        if (!question?.contentC1 || !question?.contentC2) {
          flag = false;
          messageArr.push(
            question?.question +
              ": Câu hỏi chọn nhiều đáp án bị thiếu nội dung đáp án tích chọn 1, 2"
          );
        }
      } else if (question?.type === "DS") {
        if (!question?.contentYA || !question?.contentYB) {
          flag = false;
          messageArr.push(
            question?.question + ": Câu hỏi đúng sai bị thiếu mệnh đề a), b)"
          );
        }
      } else if (question?.type === "KT") {
        if (
          !question?.contentY1 ||
          !question?.contentY2 ||
          !question?.items[0] ||
          !question?.items[1] ||
          !question?.items[2] ||
          !question?.items[4]
        ) {
          flag = false;
          messageArr.push(
            question?.question +
              ": Câu hỏi kéo thả thiếu một số đáp án kéo thả hoặc mệnh đề"
          );
        }
      }
    }
    return { flag, messageArr };
  };
  const handleEditQuestion = (questionItem) => {
    setIsEditing(questionItem._id);
    setFormData({
      subject: questionItem.subject,
    });

    // Chuyển đổi question từ QuestionBankModel sang format form
    const formattedQuestion = {
      _id: questionItem._id,
      question: "Câu 1",
      contentQuestions: questionItem.contentQuestion,
      type: questionItem.type,
      difficulty: questionItem.difficulty,
      questionType: questionItem.questionType.text,
      explanation: questionItem.explanation,
      correctAnswer: questionItem.correctAnswer,
      imageUrl: questionItem.imageUrl || "", // ✅ Thêm imageUrl (đã là base64 từ server)
    };

    if (questionItem.type === "TN" && questionItem.contentAnswer) {
      formattedQuestion.contentAnswerA =
        questionItem.contentAnswer.contentAnswerA;
      formattedQuestion.contentAnswerB =
        questionItem.contentAnswer.contentAnswerB;
      formattedQuestion.contentAnswerC =
        questionItem.contentAnswer.contentAnswerC;
      formattedQuestion.contentAnswerD =
        questionItem.contentAnswer.contentAnswerD;
    }

    setQuestion(formattedQuestion);
    setQuestionsData([formattedQuestion]);
    setListKeys(["Câu 1"]);
    setAnswer({ "Câu 1": questionItem.correctAnswer });
  };

  const handleChangeContentQuestions = (event) => {
    const { name, value } = event.target;
    setQuestion({
      ...question,
      [name]: value,
    });
    const ques = questionsData.find((e) => e.question === question.question);
    if (ques) {
      if (name === "contentQuestions") {
        ques.contentQuestions = value;
      } else if (name === "difficulty") {
        ques.difficulty = value;
      } else if (name === "questionType") {
        ques.questionType = value;
      }
    }
  };

  const handleChangeInputQuestion = (event) => {
    let { name, value } = event.target;
    if (name === "numberOfQuestions" || name === "time") {
      const roundedValue = Math.round(parseFloat(value));
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: isNaN(roundedValue) ? "" : roundedValue,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (value) {
      setErrors({
        ...errors,
        [name]: false,
      });
    }
  };

  const handleChangeDateStartTime = (date) => {
    setFormData({
      ...formQuestionData,
      // startTime: date,
    });
  };

  const handleChangeDateEndTime = (date) => {
    setFormData({
      ...formQuestionData,
      endTime: date,
    });
  };

  const handleCreateQuestions = async () => {
    if (!validateForm()) {
      return;
    }

    // Validate questionsData trước khi tạo câu hỏi
    if (questionsData && questionsData.length > 0) {
      const isQuestionsValid =
        formQuestionData.subject === "ENGLISH"
          ? validateQuestionsArrayEN(questionsData)
          : validateQuestionsArrayMath(questionsData);
      if (!isQuestionsValid) {
        toast.error(
          "Vui lòng kiểm tra và hoàn thiện thông tin các câu hỏi trước khi tạo!"
        );
        return;
      }
    } else {
      toast.error("Vui lòng thêm câu hỏi trước khi tạo!");
      return;
    }

    // Chuyển đổi questionsData sang format phù hợp với QuestionBankModel
    const formattedQuestions = questionsData.map((q) => {
      let question = {
        _id: q._id,
        contentQuestion: q.contentQuestions,
        correctAnswer: q.correctAnswer,
        subject: formQuestionData.subject,
        type: q.type,
        explanation: q.explanation,
        difficulty: q.difficulty,
        questionType: q.questionType,
        imageUrl: q.imageUrl,
      };
      if (q.type === "TN") {
        question.contentAnswer = {
          contentAnswerA: q.contentAnswerA,
          contentAnswerB: q.contentAnswerB,
          contentAnswerC: q.contentAnswerC,
          contentAnswerD: q.contentAnswerD,
        };
      }
      return question;
    });

    try {
      console.log("formattedQuestions", formattedQuestions);
      let res;
      if (isEditing) {
        res = await QuestionBankService.updateMultipleQuestions(
          formattedQuestions
        );
      } else {
        res = await QuestionBankService.createMultipleQuestions(
          formattedQuestions
        );
      }
      toast.success(res.message);
      handleFetch(); // Refresh danh sách

      // Reset form
      setFormData({
        subject: "",
      });
      setDataInputQuestion("", []);
      setQuestionsData([]);
      setAnswer({});
      setListKeys([]);
      setQuestion({
        question: "Câu 1",
        contentQuestions: "",
        imageUrl: "",
        type: "",
        difficulty: "",
        questionType: "",
      });
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Lấy file từ input

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result); // Parse nội dung JSON
          setAnswer(json); // Cập nhật trạng thái với dữ liệu từ JSON
          toast.success("Upload file đáp án thành công");
        } catch (error) {
          console.error("Error parsing JSON:", error);
          // Xử lý lỗi nếu cần, ví dụ như hiển thị thông báo cho người dùng
        } finally {
          refs.inputRef.current.value = null;
        }
      };

      reader.onerror = (e) => {
        console.error("File could not be read:", e.target.error);
        refs.inputRef.current.value = null;
        // Xử lý lỗi đọc file
      };

      reader.readAsText(file); // Đọc file dưới dạng text
    }
  };

  const validateForm = () => {
    if (!formQuestionData.subject) {
      toast.error("Vui lòng chọn môn học");
      return false;
    }
    return true;
  };
  const handleUpdateQuestions = async () => {
    // Tương tự như handleCreateQuestions nhưng cho update
    await handleCreateQuestions();
  };

  const handleChangeUploadFileQuestions = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        let data = [];

        // Kiểm tra loại file
        if (file.name.endsWith(".docx")) {
          // Xử lý file .docx
          if (formQuestionData.subject === "ENGLISH") {
            data = await processQuestionsFromDocxEN(file);
          } else if (formQuestionData.subject === "MATH") {
            data = await processQuestionsFromDocxMath(file);
          } else {
            toast.error("Vui lòng chọn môn học trước khi upload file .docx");
          }
        } else {
          toast.error("Chỉ hỗ trợ file .docx");
          refs.inputRefQuestion.current.value = null;
          return;
        }

        // Xử lý data từ file .docx
        if (data.length > 0) {
          const keys = data.map((e) => e.question);
          setListKeys(keys);
          setQuestionsData(
            data.map((item, index) => ({
              ...item,
              imageUrl: questionsData[index]?.imageUrl,
            }))
          );
          setDataInputQuestion(keys[0], data);
          toast.dismiss("processing");
          toast.dismiss("uploading");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast.dismiss("processing");
        toast.dismiss("uploading");
        toast.error("Lỗi khi xử lý file: " + error.message);
      }

      refs.inputRefQuestion.current.value = null;
    }
  };

  const handleChangeSelectQuestions = (event) => {
    const { name, value } = event.target;
    setDataInputQuestion(value, questionsData);
  };

  const handleChangeInputAnswer = (event) => {
    let { name, value } = event.target;
    if (
      question?.type === "KT" &&
      ["A>", "B>", "C>", "D>", "E>", "F>"].includes(name)
    ) {
      const newItems = question?.items.map((item, i) => {
        if (item.id === name) {
          return { id: name, content: value };
        }
        return { ...item };
      });
      setQuestion({
        ...question,
        items: newItems,
      });
    } else {
      setQuestion({
        ...question,
        [name]: value,
      });

      // Sync với questionsData
      const ques = questionsData.find((e) => e.question === question.question);
      if (ques) {
        ques[name] = value;
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // if (!e.target.value) {
    //   setIsSearch(false);
    // }
  };

  const handleSearch = () => {
    setPage(0); // Reset page on search
    handleFetch();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(); // Trigger search when Enter is pressed
    }
  };

  // Function validate questionsArray
  const validateQuestionsArrayEN = (questionsArray) => {
    const requiredFields = [
      "question",
      "contentQuestions",
      "type",
      "contentAnswerA",
      "contentAnswerB",
      "contentAnswerC",
      "contentAnswerD",
      "correctAnswer",
      "questionType",
      "difficulty",
      "explanation",
    ];

    const errors = [];

    questionsArray.forEach((q, index) => {
      // Chỉ validate cho câu hỏi trắc nghiệm (type = "TN")
      if (q.type === "TN") {
        requiredFields.forEach((field) => {
          const value = q[field];

          // Kiểm tra nếu field bị rỗng hoặc chỉ chứa whitespace
          if (!value || (typeof value === "string" && value.trim() === "")) {
            const fieldName = {
              question: "Câu hỏi",
              contentQuestions: "Nội dung câu hỏi",
              type: "Loại câu hỏi",
              contentAnswerA: "Đáp án A",
              contentAnswerB: "Đáp án B",
              contentAnswerC: "Đáp án C",
              contentAnswerD: "Đáp án D",
              correctAnswer: "Đáp án đúng",
              questionType: "Loại câu hỏi",
              difficulty: "Độ khó",
              explanation: "Giải thích",
            }[field];

            errors.push(
              `${q.question || `Câu ${index + 1}`}: Thiếu ${fieldName}`
            );
          }
        });
      } else {
        // Với các loại câu hỏi khác, chỉ validate các trường cơ bản
        const basicFields = [
          "question",
          "contentQuestions",
          "type",
          "correctAnswer",
          "questionType",
          "difficulty",
          "explanation",
        ];
        basicFields.forEach((field) => {
          const value = q[field];
          if (!value || (typeof value === "string" && value.trim() === "")) {
            const fieldName = {
              question: "Câu hỏi",
              contentQuestions: "Nội dung câu hỏi",
              type: "Loại câu hỏi",
              correctAnswer: "Đáp án đúng",
              questionType: "Loại câu hỏi",
              difficulty: "Độ khó",
              explanation: "Giải thích",
            }[field];

            errors.push(
              `${q.question || `Câu ${index + 1}`}: Thiếu ${fieldName}`
            );
          }
        });
      }
    });

    // Hiển thị errors
    if (errors.length > 0) {
      errors.forEach((error) => {
        toast.error(error, {
          autoClose: 7000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });

      console.log("❌ Validation errors:", errors);
      return false;
    }

    console.log("✅ All questions validated successfully");
    return true;
  };

  // Function validate questionsArray
  const validateQuestionsArrayMath = (questionsArray) => {
    const requiredFields = [
      "question",
      "contentQuestions",
      "type",
      "contentAnswerA",
      "contentAnswerB",
      "contentAnswerC",
      "contentAnswerD",
      "correctAnswer",
      "questionType",
      "difficulty",
      "explanation",
    ];

    const errors = [];

    questionsArray.forEach((q, index) => {
      // Chỉ validate cho câu hỏi trắc nghiệm (type = "TN")
      if (q.type === "TN") {
        requiredFields.forEach((field) => {
          const value = q[field];

          // Kiểm tra nếu field bị rỗng hoặc chỉ chứa whitespace
          if (!value || (typeof value === "string" && value.trim() === "")) {
            const fieldName = {
              question: "Câu hỏi",
              contentQuestions: "Nội dung câu hỏi",
              type: "Loại câu hỏi",
              contentAnswerA: "Đáp án A",
              contentAnswerB: "Đáp án B",
              contentAnswerC: "Đáp án C",
              contentAnswerD: "Đáp án D",
              correctAnswer: "Đáp án đúng",
              questionType: "Loại câu hỏi",
              difficulty: "Độ khó",
              explanation: "Giải thích",
            }[field];

            errors.push(
              `${q.question || `Câu ${index + 1}`}: Thiếu ${fieldName}`
            );
          }
        });
      } else {
        // Với các loại câu hỏi khác, chỉ validate các trường cơ bản
        const basicFields = [
          "question",
          "contentQuestions",
          "type",
          "correctAnswer",
          "questionType",
          "difficulty",
          "explanation",
        ];
        basicFields.forEach((field) => {
          const value = q[field];
          if (!value || (typeof value === "string" && value.trim() === "")) {
            const fieldName = {
              question: "Câu hỏi",
              contentQuestions: "Nội dung câu hỏi",
              type: "Loại câu hỏi",
              correctAnswer: "Đáp án đúng",
              questionType: "Loại câu hỏi",
              difficulty: "Độ khó",
              explanation: "Giải thích",
            }[field];

            errors.push(
              `${q.question || `Câu ${index + 1}`}: Thiếu ${fieldName}`
            );
          } else if (
            field === "correctAnswer" &&
            Array.isArray(value) &&
            value.length === 0
          ) {
            errors.push(
              `${q.question || `Câu ${index + 1}`}: Thiếu đáp án đúng`
            );
          }
        });
      }
    });

    // Hiển thị errors
    if (errors.length > 0) {
      errors.forEach((error) => {
        toast.error(error, {
          autoClose: 7000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });

      console.log("❌ Validation errors:", errors);
      return false;
    }

    console.log("✅ All questions validated successfully");
    return true;
  };

  const handleValidateQuestions = () => {
    if (questionsData && questionsData.length > 0) {
      const isValid =
        formQuestionData.subject === "ENGLISH"
          ? validateQuestionsArrayEN(questionsData)
          : validateQuestionsArrayMath(questionsData);
      if (isValid) {
        toast.success(`✅ Tất cả ${questionsData.length} câu hỏi đều hợp lệ!`);
      }
    } else {
      toast.warning("Chưa có câu hỏi nào để validate!");
    }
  };
  return (
    <>
      <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-xl">
              <h1 className="text-3xl font-bold text-white text-center flex items-center justify-center">
                <span className="mr-3">📚</span>
                Quản Lý Ngân Hàng Câu hỏi
                <span className="ml-3">✨</span>
              </h1>
              <p className="text-blue-100 text-center mt-2">
                Tạo, chỉnh sửa và quản lý tất cả câu hỏi
              </p>
            </div>
          </div>

          {/* Exam Form */}
          <QuestionBankForm
            formQuestionData={formQuestionData}
            questionsData={questionsData}
            errors={errors}
            handleChangeInputQuestion={handleChangeInputQuestion}
            listKeys={listKeys}
            question={question}
            handleChangeSelectQuestions={handleChangeSelectQuestions}
            refs={refs}
            handleChangeUploadFileQuestions={handleChangeUploadFileQuestions}
            handleChangeContentQuestions={handleChangeContentQuestions}
            handleChangeInputAnswer={handleChangeInputAnswer}
            setOpenDialogQuestion={setOpenDialogQuestion}
            openDialogQuestion={openDialogQuestion}
            setOpenDialogExam={setOpenDialogExam}
            openDialogExam={openDialogExam}
            upLoadImageQuestions={upLoadImageQuestions}
            // handleChangeDateStartTime={handleChangeDateStartTime}
            handleChangeDateEndTime={handleChangeDateEndTime}
            handleFileUpload={handleFileUpload}
            handleInsertExam={handleCreateQuestions}
            handleUpdateExam={handleUpdateQuestions}
            upLoadImageExam={upLoadImageExam}
            isEditing={isEditing}
            handleValidateQuestions={handleValidateQuestions}
            answer={answer}
            setAnswer={setAnswer}
          />

          {/* Exam List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  📋
                </span>
                Danh sách câu hỏi
              </h2>

              {/* Search Input */}
              <div className="mt-4 flex items-center space-x-3">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="🔍 Tìm kiếm câu hỏi..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Table */}
            <TableContainer component={Paper}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Nội dung câu hỏi
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Loại câu hỏi
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Môn học
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Độ khó
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {listQuestions.length > 0 &&
                      listQuestions.map((question, index) => (
                        <tr
                          key={question?._id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Tooltip title={question?._id} placement="top">
                              <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                {question?._id?.slice(0, 5)}...
                                {question?._id?.slice(-5)}
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 max-w-xs truncate">
                              {question?.contentQuestion?.replace(
                                /<[^>]*>/g,
                                ""
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {question?.questionType?.text || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {question?.subject}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                question?.difficulty === "EASY"
                                  ? "bg-green-100 text-green-800"
                                  : question?.difficulty === "MEDIUM"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {question?.difficulty === "EASY"
                                ? "Dễ"
                                : question?.difficulty === "MEDIUM"
                                ? "Trung bình"
                                : "Khó"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {new Date(question?.createdAt).toLocaleDateString(
                                "vi-VN",
                                configDate
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const headings =
                                    document.querySelectorAll("p");

                                  // Duyệt tìm h2 có nội dung đúng
                                  for (const h2 of headings) {
                                    if (
                                      h2.textContent.trim() ===
                                      "Cập nhật thông tin câu hỏi"
                                    ) {
                                      h2.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                      break;
                                    }
                                  }
                                  handleEditQuestion(question);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Chỉnh sửa câu hỏi"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteQuestion(question?._id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Xóa câu hỏi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {listQuestions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có câu hỏi nào
                  </h3>
                  <p className="text-gray-500">
                    Tạo câu hỏi đầu tiên của bạn ngay bây giờ!
                  </p>
                </div>
              )}
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong ${count}`
              }
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteQuestion}
        title="Xác nhận xóa câu hỏi"
        message="Bạn có chắc chắn muốn xóa câu hỏi này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </>
  );
}
