# 10SAT Admin Panel

## Tính năng mới: Đọc file Word (.docx)

### Hướng dẫn sử dụng chức năng nhập đề thi từ file Word

#### 1. Định dạng file Word yêu cầu:

**Cấu trúc câu hỏi:**

- Mỗi câu hỏi bắt đầu bằng số thứ tự: `1.`, `2.`, `3.`, v.v.
- Đáp án được đánh dấu: `A.`, `B.`, `C.`, `D.`
- **Đáp án đúng phải được định dạng đậm (Bold)**

**Ví dụ định dạng:**

```
1. Câu hỏi có thể có định dạng **bold**, *italic*, underline
Nội dung câu hỏi có thể nhiều dòng

A. Đáp án A bình thường
**B. Đáp án B được tô đậm (đáp án đúng)**
C. Đáp án C bình thường
D. Đáp án D bình thường

2. Câu hỏi thứ hai với LaTeX $x^2 + y^2 = z^2$

A. Đáp án A
B. Đáp án B
**C. Đáp án C được tô đậm (đáp án đúng)**
D. Đáp án D
```

#### 2. Các tính năng được hỗ trợ:

✅ **Định dạng văn bản cơ bản:**

- **Bold** (đậm)
- _Italic_ (nghiêng)
- Underline (gạch chân)
- ~~Strikethrough~~ (gạch ngang)
- Subscript (chỉ số dưới): H₂O
- Superscript (chỉ số trên): X²

✅ **Định dạng màu sắc:**

- Text màu đỏ, xanh dương, xanh lá
- Highlight (tô vàng background)
- Mark elements

✅ **Bullet points và Lists:**

- • Bullet points tròn
- ◦ White bullet
- ▪ Black small square
- ▫ White small square
- Numbered lists (1, 2, 3...)
- Nested lists support
- Auto-wrap li elements trong ul tags
- CSS styling với proper margins và indentation

✅ **Tables và Headings:**

- Tables với borders và styling
- Heading tags (H1, H2, H3, etc.)
- Table cells với padding

✅ **Công thức toán học:**

- LaTeX: `$x^2 + y^2 = z^2$`
- Tự động chuyển đổi và hiển thị đúng

✅ **Images:**

- Embedded images từ Word
- **Auto-upload to server** (không còn base64)
- **URL-based storage** tiết kiệm database
- **Fallback to base64** nếu upload thất bại
- **Progress tracking** với toast notifications
- **Error handling** với retry logic
- **Optimized performance** và storage

✅ **Tự động detect đáp án đúng:**

- Hệ thống tự động nhận dạng đáp án được tô đậm
- Tự động tạo file answer JSON
- Hiển thị số lượng đáp án đã detect được

#### 3. Cách sử dụng:

1. Chuẩn bị file Word (.docx) theo định dạng yêu cầu
2. Trong Admin Panel, click nút **"Nhập đề thi (.txt/.docx)"**
3. Chọn file .docx từ máy tính
4. Hệ thống sẽ:
   - Parse nội dung với định dạng HTML
   - Detect đáp án đúng tự động
   - Hiển thị thông báo số đáp án đã detect
   - Tạo sẵn answer object

#### 4. Lưu ý quan trọng:

⚠️ **Đảm bảo đáp án đúng được định dạng Bold**
⚠️ **Số thứ tự câu hỏi phải theo format: 1., 2., 3., ...**
⚠️ **Đáp án phải theo format: A., B., C., D.**

#### 5. Troubleshooting:

**Lỗi thường gặp:**

- File không đúng định dạng → Kiểm tra lại cấu trúc
- Không detect được đáp án đúng → Kiểm tra formatting Bold
- Định dạng bị mất → Sử dụng MathRenderer component để hiển thị
- Dòng trống xuất hiện → Đã được xử lý tự động xóa

**Debugging:**

- Mở Developer Console (F12) để xem log chi tiết
- Kiểm tra "Raw HTML from mammoth" để xem HTML được parse
- Xem "Parsed lines after filtering" để kiểm tra các dòng đã xử lý
- Log "Found bold element" sẽ hiển thị các element được detect bold
- "✅ FINAL: Detected correct answer" sẽ hiển thị đáp án đúng đã detect

**Giải pháp:**

- Sử dụng Word để tạo file đúng format
- Đảm bảo đáp án đúng được Bold trong Word (Ctrl+B)
- Kiểm tra console để debug chi tiết
- Thử format lại đáp án đúng nếu không detect được

**Ví dụ HTML output:**

```html
<strong>B. Đáp án đúng được tô đậm</strong> <b>C. Hoặc sử dụng tag b</b>
```

**Ví dụ định dạng chi tiết:**

```
1. Câu hỏi với nhiều định dạng

Nội dung có thể có:
- **Text đậm** và *text nghiêng*
- Text gạch chân và ~~text gạch ngang~~
- Công thức: $H_2O$ và $E = mc^2$
- • Bullet point với dấu chấm tròn
- Text màu đỏ hoặc xanh
- Highlight quan trọng

A. Đáp án A bình thường
**B. Đáp án B được tô đậm (đáp án đúng)**
C. Đáp án C có *italic* và subscript H₂O
D. Đáp án D với ~~strikethrough~~

2. Câu hỏi có bảng

| Cột 1 | Cột 2 |
|-------|--------|
| Data  | Value  |

A. Đáp án table
B. Đáp án khác
**C. Đáp án đúng với bảng**
D. Đáp án cuối
```

---

## Cài đặt và chạy

```bash
npm install
npm start
```

## Dependencies chính

- **mammoth**: Đọc file .docx và chuyển đổi sang HTML
- **html-react-parser**: Parse HTML content với định dạng
- **katex**: Render công thức toán học LaTeX
- **Material-UI**: UI components

---

_Cập nhật mới nhất: Hỗ trợ đọc file Word với định dạng Bold, Italic, Underline và tự động detect đáp án đúng_

#### 6. Image Processing Workflow:

**Từ Word Document đến Database:**

1. **Extract từ Word**: Mammoth extracts embedded images
2. **Auto-upload**: Images tự động upload lên server `/upload/image`
3. **URL conversion**: Base64 → Server URL (`http://localhost:4000/uploads/images/...`)
4. **Database storage**: Chỉ lưu URL, không lưu base64
5. **Performance**: Giảm 70-90% dung lượng database
6. **Fallback**: Nếu upload fail → fallback to base64

**Trước vs Sau:**

```
❌ Trước: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." (50KB+)
✅ Sau:   "http://localhost:4000/uploads/images/word-image-123.png" (50 bytes)
```
