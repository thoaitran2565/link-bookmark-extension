# ⚡ Smart Bookmark Extension (Game & Cartoon Edition)

Một tiện ích mở rộng (Chrome Extension Manifest V3) thông minh, hỗ trợ lưu trữ, phân nhóm đường dẫn trang web theo **Domain** tự động với giao diện **Cartoon & Cyber-Game** đầy màu sắc, mượt mà và trực quan.

---

## 🌟 Tính năng nổi bật

- **Lưu bookmark siêu tốc:** Tự động lấy Tiêu đề và URL của tab hiện tại.
- **Nhận diện trang đã lưu qua Icon Badge:** Tự động hiển thị dấu tích xanh `✓` trên biểu tượng Extension khi bạn đang duyệt một trang web đã được lưu.
- **Phân nhóm tự động theo Domain:** Các bookmark tự động được gom nhóm gọn gàng theo domain trang gốc.
- **Quản lý thông minh:**
  - Trang quản lý riêng (`manager.html`) đầy đủ không gian thao tác.
  - Sửa từng link lẻ hoặc đổi tên domain đồng loạt cho cả nhóm.
  - Ghi nhớ trạng thái đóng/mở nhóm khi sửa hoặc xóa link.
- **Lưu qua Context Menu:** Click chuột phải vào bất kỳ liên kết hoặc trang web nào để lưu nhanh.
- **Giao diện Cartoon & Game Style:** Đốm màu chuyển động (background blobs), hiệu ứng nút bấm 3D nảy (game buttons), viền đen hoạt hình nổi bật.

---

## 📁 Cấu trúc thư mục dự án

```text
link-bookmark-extension/
├── manifest.json       # Cấu hình Chrome Extension (Manifest V3)
├── popup.html          # Giao diện Popup lưu nhanh
├── popup.js            # Logic xử lý cho Popup
├── manager.html        # Trang Dashboard quản lý tất cả Bookmark
├── manager.js          # Logic xử lý cho trang Quản lý
├── background.js       # Service worker xử lý Context menu & Icon Badge
├── README.md           # Tài liệu hướng dẫn dự án
└── icons/              # Thư mục chứa biểu tượng Extension
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🛠️ Hướng dẫn cài đặt vào Chrome

1. Tải toàn bộ mã nguồn về một thư mục trên máy tính của bạn (ví dụ: `link-bookmark-extension`).
2. Mở trình duyệt Google Chrome và truy cập địa chỉ:
   ```text
   chrome://extensions/
   ```
3. Bật **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải màn hình.
4. Bấm vào nút **Tải tiện ích đã giải nén (Load unpacked)** ở góc trên bên trái.
5. Chọn thư mục `link-bookmark-extension` chứa dự án.
6. Ghim (Pin) biểu tượng **Smart Bookmark** lên thanh công cụ của Chrome để sử dụng.

---

## 🚀 Hướng dẫn sử dụng

1. **Lưu trang web:** Click trái vào biểu tượng Extension $\rightarrow$ Kiểm tra/Chỉnh sửa thông tin $\rightarrow$ Bấm **Lưu Bookmark Ngay**.
2. **Xóa/Sửa trang hiện tại:** Khi mở Popup trên trang web đã lưu, giao diện sẽ tự động chuyển sang 2 nút **Cập Nhật** và **Xóa Link**.
3. **Mở trang quản lý:** Bấm vào nút **📋 Mở Trang Quản Lý** ở Popup để mở giao diện quản lý toàn màn hình.
4. **Lưu nhanh qua chuột phải:** Right-click vào liên kết bất kỳ trên trình duyệt $\rightarrow$ Chọn **🔖 Lưu liên kết này vào Smart Bookmarks**.

---

## 🛠️ Công nghệ sử dụng

- **JavaScript (ES6+)**
- **Chrome Extension API (Manifest V3):** `chrome.storage.local`, `chrome.tabs`, `chrome.action`, `chrome.contextMenus`.
- **CSS3:** Flexbox, CSS Grid, CSS Variables, Animations & Custom Keyframes.