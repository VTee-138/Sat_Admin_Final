import CryptoJS from "crypto-js";

// Khóa bí mật - nên lưu trong biến môi trường (.env)
// Lưu ý: Cần phải cẩn thận khi lưu khóa ở phía client
const SECRET_KEY =
  process.env.REACT_APP_ENCRYPTION_SECRET_KEY ||
  "your-secret-key-at-least-32-characters";

// Hàm giải mã dữ liệu
export const decryptData = (encryptedData) => {
  try {
    // Kiểm tra xem dữ liệu có được mã hóa không
    if (!encryptedData || !encryptedData.encrypted) {
      return encryptedData;
    }
    // Giải mã dữ liệu
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData.data,
      SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    // Chuyển đổi chuỗi JSON thành đối tượng JavaScript
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};
