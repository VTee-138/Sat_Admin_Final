# Quản Lý Thư Mục và Từ Vựng - Webtest-10SAT-Admin

## Tổng quan

Đã thêm 2 trang quản lý mới vào hệ thống Admin:

1. **Quản Lý Thư Mục** (`/folders`)
2. **Quản Lý Từ Vựng** (`/vocabularies`)

## Tính năng

### 1. Quản Lý Thư Mục

#### Chức năng:

- ✅ Xem danh sách thư mục với phân trang
- ✅ Thêm thư mục mới
- ✅ Sửa thông tin thư mục
- ✅ Xóa thư mục
- ✅ Tìm kiếm thư mục
- ✅ Hiển thị màu sắc thư mục

#### Các trường thông tin:

- **Tên thư mục** (bắt buộc)
- **Mô tả** (tùy chọn)
- **Màu sắc** (mặc định: #3954d9)
- **Người tạo**
- **Ngày tạo**

### 2. Quản Lý Từ Vựng

#### Chức năng:

- ✅ Xem danh sách từ vựng với phân trang
- ✅ Thêm từ vựng mới
- ✅ Sửa thông tin từ vựng
- ✅ Xóa từ vựng
- ✅ Tìm kiếm từ vựng
- ✅ Lọc theo thư mục
- ✅ Hiển thị trạng thái học tập

#### Các trường thông tin:

- **Từ vựng** (bắt buộc)
- **Nghĩa** (bắt buộc)
- **Phát âm** (tùy chọn)
- **Ví dụ** (tùy chọn)
- **Thư mục** (bắt buộc)
- **Trạng thái** (not_learned/learned/needs_review)
- **Ngày tạo**

## Cách sử dụng

### Truy cập trang:

1. Đăng nhập vào hệ thống Admin
2. Trong sidebar, chọn:
   - **"Thư mục"** để quản lý thư mục
   - **"Từ vựng"** để quản lý từ vựng

### Thêm mới:

1. Click nút **"Thêm Thư Mục"** hoặc **"Thêm Từ Vựng"**
2. Điền thông tin vào form
3. Click **"Tạo thư mục"** hoặc **"Tạo từ vựng"**

### Sửa:

1. Click icon **Edit** (✏️) trên dòng muốn sửa
2. Chỉnh sửa thông tin trong form
3. Click **"Cập nhật"**

### Xóa:

1. Click icon **Delete** (🗑️) trên dòng muốn xóa
2. Xác nhận trong hộp thoại

### Tìm kiếm:

- Nhập từ khóa vào ô tìm kiếm
- Click nút **"Tìm kiếm"** hoặc nhấn Enter

### Lọc (chỉ có ở trang Từ vựng):

- Chọn thư mục từ dropdown để lọc theo thư mục

## Cấu trúc file

```
src/
├── components/
│   └── Admin/
│       ├── Folders.js          # Trang quản lý thư mục
│       ├── FolderForm.js       # Form thêm/sửa thư mục
│       ├── Vocabularies.js     # Trang quản lý từ vựng
│       └── VocabularyForm.js   # Form thêm/sửa từ vựng
├── services/
│   ├── FolderService.js        # API service cho thư mục
│   └── VocabularyService.js    # API service cho từ vựng
└── common/
    └── apiClient.js            # HTTP client
```

## API Endpoints

### Thư mục:

- `GET /folder` - Lấy danh sách thư mục
- `POST /folder` - Tạo thư mục mới
- `PUT /folder/:id` - Cập nhật thư mục
- `DELETE /folder/:id` - Xóa thư mục

### Từ vựng:

- `GET /vocabulary` - Lấy danh sách từ vựng
- `POST /vocabulary` - Tạo từ vựng mới
- `PUT /vocabulary/:id` - Cập nhật từ vựng
- `DELETE /vocabulary/:id` - Xóa từ vựng
- `PATCH /vocabulary/:id/status` - Cập nhật trạng thái

## Lưu ý

- Tất cả thao tác đều yêu cầu quyền Admin
- Dữ liệu được mã hóa/giải mã tự động
- Responsive design cho mobile và desktop
- Toast notifications cho các thao tác thành công/lỗi
- Pagination tự động với 10 items/trang
