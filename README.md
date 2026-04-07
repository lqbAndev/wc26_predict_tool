# World Cup 2026 Prediction Tool

Web app mô phỏng World Cup 2026 theo format 48 đội, chạy hoàn toàn ở frontend bằng React + TypeScript + Vite + Tailwind CSS.

## Tính năng chính

- 12 bảng đấu từ A đến L với đúng 48 đội theo đề bài.
- Mỗi trận vòng bảng có nút `Dự đoán`, random tỉ số và danh sách cầu thủ ghi bàn.
- Bảng xếp hạng mỗi bảng tự cập nhật theo điểm, hiệu số, bàn thắng và alphabetical tie-break.
- Bảng `Best 3rd Place` xếp hạng 12 đội đứng thứ 3 và tô nổi Top 8 đội đi tiếp.
- Knock-out stage gồm Round of 32, Round of 16, Quarterfinals, Semifinals, Final.
- Nếu hòa ở knock-out, UX tách làm 2 bước: random 90 phút rồi bấm thêm `Đá penalty`.
- Bảng `Vua phá lưới` tổng hợp xuyên suốt từ vòng bảng đến chung kết.
- `Try Again` reset toàn bộ state và xóa localStorage.
- Refresh trang không làm mất dữ liệu.

## Kiến trúc thư mục

```text
src/
  components/
  data/
  hooks/
  types/
  utils/
```

## Chạy local

```bash
npm install
npm run dev
```

Mặc định Vite sẽ chạy dev server và toàn bộ state mô phỏng được lưu trong `localStorage`.

## Build production

```bash
npm run build
npm run preview
```

## Deploy lên GitHub Pages

Project đã cấu hình `base: './'` trong Vite để chạy ổn trên GitHub Pages mà không cần hardcode tên repository.

### Cách 1: dùng package `gh-pages`

```bash
npm install
npm run deploy
```

Lệnh này sẽ build thư mục `dist/` và publish lên nhánh `gh-pages`.

### Cách 2: deploy thủ công

```bash
npm run build
```

Sau đó dùng nội dung trong `dist/` để publish lên GitHub Pages theo workflow riêng của bạn.

## Ghi chú kỹ thuật

- Không dùng backend, không dùng database server.
- Dữ liệu đội tuyển và cầu thủ đều nằm trong source code.
- Cờ quốc gia dùng asset SVG local trong `public/flags/`, lấy từ nguồn `flag-icons` và có fallback nội bộ.
- Danh sách cầu thủ là dataset mô phỏng, được tạo ổn định từ local static data để dễ thay thế sau này.
- Penalty shoot-out chỉ dùng để xác định đội thắng và không cộng vào bảng vua phá lưới.
- Bracket knock-out được seed theo cơ chế ổn định:
  - 12 đội nhất bảng
  - 12 đội nhì bảng
  - 8 đội hạng ba tốt nhất

## Script

- `npm run dev`: chạy local.
- `npm run build`: build production.
- `npm run preview`: preview bản build.
- `npm run deploy`: publish lên `gh-pages`.
