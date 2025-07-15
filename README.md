
# HAUSummarize 🧠✨

**HAUSummarize** là một hệ thống tóm tắt nội dung văn bản và video sử dụng các công nghệ trí tuệ nhân tạo (AI). Dự án được phát triển nhằm phục vụ cho đề tài nghiên cứu khoa học **"Nghiên cứu và xây dựng ứng dụng tóm tắt nội dung của dữ liệu dựa trên các công nghệ trí tuệ nhân tạo"** tại Trường Đại học Kiến trúc Hà Nội.

## 🚀 Tính năng chính

- ✅ Tóm tắt văn bản đầu vào bằng mô hình AI.
- ✅ Tóm tắt nội dung video YouTube thông qua phân tích transcript.
- ✅ Cho phép người dùng tải lên video để tóm tắt nội dung bên trong.
- ✅ Giao diện người dùng hiện đại bằng React + Material UI.
- ✅ Backend sử dụng Flask, hỗ trợ xử lý tiếng Việt.
- ✅ Hỗ trợ mô hình huấn luyện riêng trên tập dữ liệu tiếng Việt.

## 🏗️ Kiến trúc hệ thống

```
Frontend (React + Material UI)
         ⬇
    Backend API (Flask)
         ⬇
Trích xuất nội dung ⟶ NLP model ⟶ Tóm tắt
         ⬇
     Trả kết quả người dùng
```

## 📂 Cấu trúc thư mục

```
HAUSummarize/
├── frontend/                    # Giao diện người dùng (React)
├── backend/                     # Flask API xử lý tóm tắt
├── text_summarization_model/    # Mô hình huấn luyện
├── data/                        # Tập dữ liệu văn bản & video
├── README.md
└── requirements.txt
```

## 🔧 Cài đặt nhanh

### 1. Clone repository

```bash
git clone https://github.com/wuaan0903/HAUSummarize.git
cd HAUSummarize
```

### 2. Cài đặt backend
## cài đặt python 3.10
```bash
py -3.10 -m pip install -r requirements.txt
python app.py
```

### 3. Cài đặt frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Truy cập web

Mở trình duyệt và truy cập: [http://localhost:5173](http://localhost:5173)

## 🧠 Huấn luyện mô hình

- Bộ dữ liệu bao gồm các cặp `văn bản - tóm tắt` tiếng Việt.
- Sử dụng mô hình Transformer để huấn luyện.
- Có thể tùy chỉnh và mở rộng theo nhu cầu.

## 📺 Demo

![demo](https://i.imgur.com/byUaf7B.png)

## 💡 Định hướng tương lai

- [ ] Tích hợp tóm tắt âm thanh (speech-to-text).
- [ ] Triển khai hệ thống trên server thật (VPS, Cloud).
- [ ] Cải thiện độ chính xác và tối ưu mô hình.
- [ ] Hỗ trợ tóm tắt theo ngữ cảnh (context-aware).

## 🤝 Đóng góp

Rất hoan nghênh mọi đóng góp! Bạn có thể:

1. Fork dự án
2. Tạo nhánh mới (`git checkout -b feature/ten-chuc-nang`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng XYZ'`)
4. Push lên nhánh của bạn (`git push origin feature/ten-chuc-nang`)
5. Tạo pull request

## 📬 Liên hệ

- **Nhóm Tác giả:** Nguyễn Minh Quân
                    Lại Hoàng Tú
- **Email:** [nminhquan933@gmail.com]
             [penmoding@gmail.com]
- **Trường:** Đại học Kiến trúc Hà Nội

---
