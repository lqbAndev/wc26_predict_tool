# ⚽ Football Prediction Tool

> Nền tảng mô phỏng & dự đoán bóng đá đa giải đấu — hỗ trợ cả **Cup** và **League** — chạy hoàn toàn ở frontend.

---

## 🌍 Tầm nhìn

**Football Prediction Tool** là một nền tảng web cho phép người dùng mô phỏng và dự đoán kết quả của nhiều giải đấu bóng đá khác nhau. Dự án được xây dựng theo kiến trúc module, mỗi giải đấu là một competition độc lập với dữ liệu, logic và giao diện riêng.

### Giải đấu đã tích hợp

| Giải | Loại | Trạng thái |
|------|------|------------|
| 🏆 **FIFA World Cup 2026** | Cup (48 đội) | ✅ Hoạt động |
| 🏟️ *Các giải Cup khác* | Cup | 🔒 Coming Soon |
| 📊 *League Competitions* | League | 🔒 Coming Soon |

## 🚀 Tính năng nổi bật

- **Landing Page** ấn tượng với thiết kế minimalist và hiệu ứng động.
- **Competition Hub** — trung tâm điều hướng cho mọi giải đấu.
- **World Cup 2026 Simulator** đầy đủ:
  - 12 bảng đấu (A–L), 48 đội theo format FIFA.
  - Vòng bảng với random tỉ số thông minh & danh sách cầu thủ ghi bàn.
  - Bảng xếp hạng tự cập nhật + Best 3rd Place ranking.
  - Knock-out Stage: R32 → R16 → QF → SF → Final + Third Place.
  - Penalty Shootout chi tiết (nếu hòa sau 120 phút).
  - Head-to-Head so sánh 2 đội bất kỳ.
  - Tournament Recap tổng hợp giải đấu.
  - 3 kịch bản mô phỏng: Tiêu chuẩn / Kẻ mạnh / Ngựa ô.
- **Persistent state** — dữ liệu lưu LocalStorage, refresh không mất.

## 🏗️ Kiến trúc

```text
src/
├── pages/                  # Các trang chính (Landing, Hub)
├── competition/
│   └── wc26/              # Module World Cup 2026
│       ├── WC26App.tsx    # Entry point giải đấu
│       ├── components/    # UI components riêng
│       ├── data/          # Dữ liệu đội, cầu thủ
│       ├── hooks/         # Custom hooks
│       ├── types/         # TypeScript types
│       └── utils/         # Logic mô phỏng
├── App.tsx                # Router chính
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## ⚡ Chạy local

```bash
npm install
npm run dev
```

## 📦 Build production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **react-router-dom** (routing)
- **Lucide React** (icons)
- Không backend, không database — 100% frontend.

## 📋 Quản lý phiên bản

Xem thư mục `project_updates/` để theo dõi lịch sử cập nhật chi tiết.

| Phiên bản | Mô tả |
|-----------|--------|
| v2.0.0 | Chuyển đổi sang nền tảng đa giải đấu, Landing Page, Hub |
| v0.1.0 | Phiên bản WC2026 ban đầu |
