# 🛡️ OWASP Security Command Center (Group 5)

> **Trung tâm Điều khiển & Kiểm thử Bảo mật Lỗ hổng Web Real-Time trên nền tảng Node.js Engine**

![Node.js Version](https://img.shields.io/badge/Node.js-v14%2B-green.svg)
![Security Standard](https://img.shields.io/badge/OWASP-Top%2010-blue.svg)
![Theme](https://img.shields.io/badge/UI-Cyberpunk%20Matrix-neon.svg)

---

## 📖 1. Mô tả tổng quan

**OWASP Security Command Center** là một môi trường thử nghiệm an toàn thông tin (Security Lab Engine) tương tác trực tiếp, được xây dựng phục vụ Bài tập lớn môn **Bảo mật Ứng dụng và Hệ thống**.

Dự án mô phỏng thực tế kịch bản khai thác lỗ hổng và cơ chế phòng thủ (Secure vs Unsafe) đối với 3 lỗ hổng bảo mật phổ biến nhất theo chuẩn OWASP Top 10. Hệ thống tích hợp bảng chỉ số bảo mật real-time (Security Metrics) và màn hình nhật ký kiểm thử dòng lệnh (Live Audit Terminal).

---

## ⚙️ 2. Kiến trúc Công nghệ

* **Backend Core:** Node.js (Sử dụng thuần module gốc `http` và `url`, tối ưu hiệu năng, không phụ thuộc thư viện ngoài).
* **Frontend UI:** HTML5, CSS3 Custom Variables (Chủ đề Cyberpunk Darknet, Matrix Neon), FontAwesome Icons.
* **Tương tác dữ liệu:** Asynchronous Fetch API (`app.js`), giao tiếp qua RESTful JSON APIs.
* **Môi trường khởi chạy:** Windows Command Line / Linux Terminal / macOS (`http://localhost:3000`).

---

## 🧪 3. Danh sách Lỗ hổng Thử nghiệm

| STT | Lỗ hổng Bảo mật | Kịch bản Tấn công (Unsafe) | Cơ chế Phòng thủ (Safe) |
| :---: | :--- | :--- | :--- |
| **01** | **SQL Injection (SQLi)** | Chèn chuỗi `' OR '1'='1` bypass xác thực tài khoản. | Tham số hóa đầu vào (Parameterized Matching). |
| **02** | **Reflected XSS** | Chèn mã độc `<script>alert('XSS')</script>` vào DOM. | Lọc và mã hóa ký tự đặc biệt (HTML Sanitization). |
| **03** | **IDOR Attack** | Thay đổi ID đường dẫn nhằm xem giỏ hàng người khác. | Kiểm tra quyền truy cập cấp đối tượng (RBAC Authorization). |

---

## 🚀 4. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu hệ thống
* Đã cài đặt [Node.js](https://nodejs.org/) (Phiên bản v14 trở lên).
* Đã cài đặt [Git](https://git-scm.com/).

### Các bước thực hiện

1. **Clone Repository về máy:**
   ```bash
   git clone https://github.com/Tên_Account_GitHub/owasp-security-command-center.git
   ```

2. **Di chuyển vào thư mục dự án:**
   ```bash
   cd owasp-security-command-center
   ```

3. **Khởi chạy Server:**
   ```bash
   node server.js
   ```

4. **Truy cập ứng dụng:**
   Mở trình duyệt bất kỳ (Chrome, Edge, Firefox) và truy cập vào địa chỉ:
   ```text
   http://localhost:3000
   ```

---

## 👥 5. Thành viên Thực hiện (Nhóm 5)

* **Thành viên 1:** [Họ và tên] - *Trưởng nhóm / Backend Core Engine*
* **Thành viên 2:** [Họ và tên] - *Security Tester / SQLi Module*
* **Thành viên 3:** [Họ và tên] - *Security Tester / Reflected XSS Module*
* **Thành viên 4:** [Họ và tên] - *Security Tester / IDOR Module*
* **Thành viên 5:** [Họ và tên] - *Technical Reporter / UI & Docs Specialist*

---
*Báo cáo Bài tập lớn Môn Bảo mật Ứng dụng & Hệ thống - 2026*