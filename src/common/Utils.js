function toLowerCaseNonAccentVietnamese(str) {
  str = str.toLowerCase();
  //     We can also use this instead of from line 11 to line 17
  //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
  //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
  //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
  //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
  //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
  //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
  //     str = str.replace(/\u0111/g, "d");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  str = str.replaceAll(" ", "_");
  return str;
}

function convertStringToFloat(strN) {
  if (typeof strN !== "number") {
    // Thay thế dấu phẩy bằng dấu chấm
    const replacedStr = strN.replace(",", ".");
    // Chuyển đổi chuỗi thành số thực
    strN = parseFloat(replacedStr);

    if (Number.isNaN(strN)) {
      return "";
    }
    return strN;
  }

  return strN;
}

function validateGoogleDriveUrl(url) {
  const regex =
    /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view(\?|(\?usp=sharing)?)?$/;
  const match = url.match(regex);
  if (match) {
    return true;
  } else {
    return false;
  }
}

// Hàm để xác định giá trị so sánh giảm dần
function descendingComparator(a, b, orderBy) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Chuyển đổi chuỗi số thành number nếu cần thiết
  if (typeof aValue === "number" && !isNaN(aValue)) {
    aValue = parseFloat(aValue);
  }

  if (typeof bValue === "number" && !isNaN(bValue)) {
    bValue = parseFloat(bValue);
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }

  // Nếu giá trị bằng nhau, sắp xếp theo id (hoặc trường khác)
  const createdAtA = a.createdAt || "";
  const createdAtB = b.createdAt || "";

  if (createdAtB < createdAtA) {
    return -1;
  }
  if (createdAtB > createdAtA) {
    return 1;
  }

  return 0; // Trường hợp bằng nhau
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const checkLatexAdvanced = (parts) => {
  let isCheckLatext = true;
  // Biểu thức chính quy nâng cao để kiểm tra LaTeX
  parts = parts
    .trim()
    .split("\t")
    .filter(Boolean)
    .filter((e) => e !== " ");

  for (const part of parts) {
    if (!kiemTraLatexAdvanced(part)) {
      isCheckLatext = false;
      break;
    }
  }

  return isCheckLatext;
};

function isValidJsonObject(input) {
  if (typeof input !== "string") return false;

  // Kiểm tra chuỗi có phải là JSON object
  if (input.trim().startsWith("{") && input.trim().endsWith("}")) {
    try {
      const parsed = JSON.parse(input);
      return typeof parsed === "object" && parsed !== null;
    } catch (error) {
      return false; // Không thể parse => Không hợp lệ
    }
  }

  return false; // Không phải dạng JSON object
}

const generateUUID = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uuid = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    uuid += chars[randomIndex];
  }
  return uuid;
};

const topics = [
  { label: "Tất cả các chuyên đề", key: "Tatca" },
  { label: "Tính đơn điệu của hàm số", key: "Hamso_Dondieu" },
  { label: "Cực trị của hàm số", key: "Hamso_Cuctri" },
  { label: "Giá trị lớn nhất và nhỏ nhất của hàm số", key: "Hamso_Minmax" },
  { label: "Khảo sát sự biên thiên và vẽ đồ thị hàm số", key: "Hamso_Khaosat" },
  { label: "Tiệm cận của đồ thị hàm số", key: "Hamso_Tiemcan" },
  { label: "Tương giao của đồ thị hàm số", key: "Hamso_Tuonggiao" },
  { label: "Tiếp tuyến của đồ thị hàm số", key: "Hamso_Tieptuyen" },
  {
    label: "Ứng dụng đạo hàm để giải bài toán thực tế",
    key: "Hamso_Toanthucte",
  },
  { label: "Vector và hệ tọa độ trong không gian", key: "Vector_Hetoado" },
  {
    label: "Ứng dụng vector để giải bài toán thực tế",
    key: "Vector_Toanthucte",
  },
  {
    label: "Khoảng biến thiên – Khoảng tứ phân vị của MSLGN",
    key: "Mausolieughepnhom_Khoangbienthien_Khoangtuphanvi",
  },
  {
    label: "Phương sai & độ lệch chuẩn của MSLGN",
    key: "Mausolieughepnhom_Phuongsai_Dolechchuan",
  },
  { label: "Nguyên hàm", key: "TichphanUngdung_Nguyeham" },
  { label: "Tích phân", key: "TichphanUngdung_Tichphan" },
  {
    label: "Ứng dụng tích phân (diện tích và thể tích)",
    key: "TichphanUngdung_Dientich_Thetich",
  },
  {
    label: "Ứng dụng tích phân giải bài toán thực tế",
    key: "TichphanUngdung_Toanthucte",
  },
  { label: "Hệ tọa độ trong Oxyz", key: "OXYZ_Hetoado" },
  {
    label: "Phương trình đường thẳng trong Oxyz",
    key: "OXYZ_Phuongtrinhduongthang",
  },
  {
    label: "Phương trình mặt phẳng trong Oxyz",
    key: "OXYZ_Phuongtrinhmatphang",
  },
  {
    label: "Phương trình mặt cầu trong Oxyz",
    key: "OXYZ_Phuongtrinhmatcau",
  },
  { label: "Cực trị trong Oxyz", key: "OXYZ_Cuctri" },
  {
    label: "Ứng dụng Oxyz để giải bài toán thực tế",
    key: "OXYZ_Toanthucte",
  },
  {
    label: "Xác suất có điều kiện",
    key: "Xacsuatcodieukien_Xacsuatcodieukien",
  },
  {
    label: "Công thức xác suất toàn phần và Bayes",
    key: "Xacsuatcodieukien_Xacsuattoanphan_Bayes",
  },
  {
    label: "Công thức xác suất Bernoulli",
    key: "Xacsuatcodieukien_Xacsuattoanphan_Bernoulli",
  },
  {
    label: "Giá trị lượng giác của góc lượng giác",
    key: "Luonggiac_Gocluonggiac",
  },
  { label: "Công thức lượng giác", key: "Luonggiac_Congthucluonggiac" },
  { label: "Hàm số lượng giác", key: "Luonggiac_Hamsoluonggiac" },
  {
    label: "Phương trình lượng giác",
    key: "Luonggiac_Phuongtrinhluonggiac",
  },
  {
    label: "Ứng dụng lượng giác để giải bài toán thực tế",
    key: "Luonggiac_Toanthucte",
  },
  {
    label: "Quy tắc cộng, Quy tắc nhân",
    key: "Xacsuat_Quytaccong_Quytacnhan",
  },
  {
    label: "Hoán vị - Tổ hợp - Chỉnh hợp",
    key: "Xacsuat_HoanVi_Tohop_ChinhHop",
  },
  {
    label: "Biến cố và định nghĩa cổ điển của xác suất",
    key: "Xacsuat_Bienco_Dinhnghiaxacsuat",
  },
  {
    label: "Biến cố hợp, biến cố giao, biến cố độc lập",
    key: "Xacsuat_Biencohop_Biencogiao_Biencodoclap",
  },
  { label: "Công thức cộng xác suất", key: "Xacsuat_Congthuccong" },
  {
    label: "Công thức nhân xác suất cho hai biến cố độc lập",
    key: "Xacsuat_Congthucnhan",
  },
  { label: "Nhị thức Newton", key: "Xacsuat_Nhithucnewton" },
  { label: "Dãy số", key: "Dayso_Dayso" },
  { label: "Cấp số nhân", key: "Dayso_Capsonhan" },
  { label: "Cấp sô cộng", key: "Dayso_Capsocong" },
  {
    label: "Ứng dụng dãy số để giải bài toán thực tế",
    key: "Dayso_Toanthucte",
  },
  { label: "Giới hạn của dãy số", key: "Gioihan_Gioihandayso" },
  { label: "Giới hạn của hàm số", key: "Gioihan_Gioihanhamso" },
  { label: "Hàm số liên tục", key: "Gioihan_Hamsolientuc" },
  {
    label: "Ứng dụng giới hạn để giải bài toán thực tế",
    key: "Gioihan_Toanthucte",
  },
  { label: "Góc trong không gian", key: "Hinhhockhonggian_Goc" },
  {
    label: "Khoảng cách trong không gian",
    key: "Hinhhockhonggian_Khoangcach",
  },
  { label: "Thể tích khối đa diện", key: "Hinhhockhonggian_Thetich" },
  { label: "Tỉ số thể tích", key: "Hinhhockhonggian_Tisothetich" },
  {
    label: "Tỉ số, thiết diện, quan hệ song song, quan hệ vuông góc",
    key: "Hinhhockhonggian_Tiso_Thietdien_Quanhesongsong_Quanhevuongoc",
  },
  { label: "Cực trị hình học không gian", key: "Hinhhockhonggian_Cuctri" },
  {
    label: "Ứng dụng hình học không gian để giải bài toán thực tế",
    key: "Hinhhockhonggian_Toanthucte",
  },
  {
    label: "Lũy thừa và hàm số lũy thừa trong mũ - logarit",
    key: "MuLogarit_Luythua_Hamsoluythua",
  },
  {
    label: "Phương trình, bất phương trình logarit",
    key: "MuLogarit_Phuongtrinh_Batphuongtrinh_Logarit",
  },
  {
    label: "Phương trình, bất phương trình mũ",
    key: "MuLogarit_Phuongtrinh_Batphuongtrinh_Mu",
  },
  {
    label: "Bài toán nghiệm nguyên trong trong mũ - logarit",
    key: "MuLogarit_Nghiemnguyen",
  },
  {
    label: "Bài toán chứa tham số trong trong mũ - logarit",
    key: "MuLogarit_Chuathamso",
  },
  { label: "Cực trị trong trong mũ - logarit", key: "MuLogarit_Minmax" },
  {
    label: "Ứng dụng mũ logarit để giải bài toán thực tế",
    key: "MuLogarit_Toanthucte",
  },
  { label: "Đạo hàm", key: "DaoHam" },
  {
    label: "Hình trụ, Hinh nón, Hình cầu",
    key: "TruNonCau_Tru_Non_Cau",
  },
  {
    label: "Bài toán thực tế liên quan đến hình trụ, nón, cầu",
    key: "TruNonCau_Toanthucte",
  },
  { label: "Tập hợp", key: "Taphop" },
  { label: "Mệnh đề", key: "Menhde" },
  {
    label:
      "Bài toán thực tế liên quan đến bất phương trình và hệ bất phương trình",
    key: "Batphuongtrinh_HeBatphuongtrinh_Toanthucte",
  },
  { label: "Hệ thức lượng trong tam giác", key: "Hethucluongtrongtamgiac" },
  {
    label: "Bài toán thực tế liên quan đến Hệ thức lượng trong tam giác",
    key: "Hethucluongtrongtamgiac_Toanthucte",
  },
  { label: "Vector", key: "Vector" },
  { label: "Hàm số, đồ thị và ứng dụng", key: "Hamso_Dothi_Ungdung" },
  { label: "Phương trình đường thẳng", key: "Oxy_Phuongtrinhduongthang" },
  { label: "Phương trình đường tròn", key: "Oxy_Phuongtrinhduongtron" },
  { label: "Ba đường conic", key: "Oxy_Baduongconic" },
  { label: "Số học", key: "Sohoc" },
];

const checkLatexContent = (input) => {
  if (
    input.includes("Leftrightarrow") ||
    input.includes("Rightarrow") ||
    input.includes("Rightarrow") ||
    input.includes("=")
  ) {
    return false;
  }

  // Đếm số lần xuất hiện của các biểu thức LaTeX
  let inlineMath = (input.match(/\$(.*?)\$/g) || []).length;
  let blockMath = (input.match(/\\\[(.*?)\\\]/g) || []).length;

  // Loại bỏ các biểu thức LaTeX
  let cleaned = input.replace(/\$(.*?)\$/g, "").replace(/\\\[(.*?)\\\]/g, "");

  // Kiểm tra còn chữ cái không
  if (/[a-zA-Z\u00C0-\u024F]/.test(cleaned)) {
    return false;
  }

  // Kiểm tra số lượng $...$ và \[...\]
  if (inlineMath + blockMath >= 4) {
    return true;
  }

  // Nếu có đúng 1 `$...$` → false
  return false;
};

function kiemTraLatexAdvanced(part) {
  const patternAdvanced = /^(\\\[.*\\\]|\[.*\]|\$.*\$)$/;
  return patternAdvanced.test(part);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isBreak = (line_question, isCheckLatext) => {
  return (
    line_question.startsWith("A.") ||
    line_question.startsWith("B.") ||
    line_question.startsWith("C.") ||
    line_question.startsWith("D.") ||
    line_question.startsWith("A)") ||
    line_question.startsWith("B)") ||
    line_question.startsWith("C)") ||
    line_question.startsWith("D)") ||
    line_question.startsWith("a)") ||
    line_question.startsWith("b)") ||
    line_question.startsWith("c)") ||
    line_question.startsWith("d)") ||
    line_question.startsWith("1)") ||
    line_question.startsWith("2)") ||
    line_question.startsWith("3)") ||
    line_question.startsWith("4)") ||
    line_question.startsWith("c1)") ||
    line_question.startsWith("c2)") ||
    line_question.startsWith("c3)") ||
    line_question.startsWith("c4)") ||
    line_question.startsWith("1.") ||
    line_question.startsWith("2.") ||
    line_question.startsWith("3.") ||
    line_question.startsWith("4.") ||
    line_question.startsWith("Câu") ||
    line_question.startsWith("SUB") ||
    line_question.startsWith("sub") ||
    isTitleAnswers(line_question) ||
    line_question.startsWith("Đáp án:") ||
    line_question.startsWith("DA:") ||
    line_question.trim() === "Mệnh đề\tĐúng\tSai" ||
    isCheckLatext
  );
};

const isValidateContentQuestion = (line_question) => {
  return (
    line_question.startsWith("A.") ||
    line_question.startsWith("B.") ||
    line_question.startsWith("C.") ||
    line_question.startsWith("D.") ||
    line_question.startsWith("A)") ||
    line_question.startsWith("B)") ||
    line_question.startsWith("C)") ||
    line_question.startsWith("D)") ||
    line_question.startsWith("a)") ||
    line_question.startsWith("b)") ||
    line_question.startsWith("c)") ||
    line_question.startsWith("d)") ||
    line_question.startsWith("1)") ||
    line_question.startsWith("2)") ||
    line_question.startsWith("3)") ||
    line_question.startsWith("4)") ||
    line_question.startsWith("c1)") ||
    line_question.startsWith("c2)") ||
    line_question.startsWith("c3)") ||
    line_question.startsWith("c4)") ||
    line_question.startsWith("1.") ||
    line_question.startsWith("2.") ||
    line_question.startsWith("3.") ||
    line_question.startsWith("4.") ||
    line_question.startsWith("Câu")
  );
};

const isTitleAnswers = (line_question) => {
  line_question = line_question?.replace("\\t", " ")?.trim() || "";
  return (
    line_question.toLowerCase().startsWith("giải") ||
    line_question.toLowerCase().startsWith("lời giải") ||
    line_question.toLowerCase().startsWith("hướng dẫn giải") ||
    line_question.toLowerCase().startsWith("bài giải") ||
    line_question.toLowerCase().startsWith("hướng dẫn giải")
  );
};
function extractQuestionRange(text) {
  const regex = /(\d+)[^\d]+(\d+)/;
  const match = text.match(regex);
  if (!match) return [];

  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const isNumeric = (numericValue) => {
  if (numericValue.startsWith(".")) return false;
  if (numericValue === 0 || numericValue === "0") return true;
  if (!numericValue) return false;
  if (typeof numericValue === "string" && numericValue.includes(",")) {
    numericValue = numericValue.replace(",", ".");
  }
  if (numericValue.endsWith(".")) return false;
  return !isNaN(numericValue) && !isNaN(parseFloat(numericValue));
};

const calculateExpireAt = (expireAt) => {
  if (!expireAt) return 0;
  const expireAtt = new Date(expireAt);
  const now = new Date();

  // Tính số mili giây còn lại
  const diffMs = expireAtt - now;

  // Chuyển sang số ngày
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
export {
  calculateExpireAt,
  isNumeric,
  toLowerCaseNonAccentVietnamese,
  convertStringToFloat,
  validateGoogleDriveUrl,
  getComparator,
  stableSort,
  checkLatexAdvanced,
  isValidJsonObject,
  generateUUID,
  topics,
  // checkLatexAdvanced,
  kiemTraLatexAdvanced,
  sleep,
  isBreak,
  isTitleAnswers,
  checkLatexContent,
  isValidateContentQuestion,
  extractQuestionRange,
};
