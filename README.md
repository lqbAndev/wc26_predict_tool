# World Cup 2026 Prediction Tool

Web app mô phỏng World Cup 2026 theo format 48 đội, chạy hoàn toàn ở frontend bằng React + TypeScript + Vite + Tailwind CSS.

## Tính năng chính

- 12 bảng đấu từ A đến L với đúng 48 đội theo đề bài.
- Mỗi trận vòng bảng có nút `Dự đoán`, random tỉ số và danh sách cầu thủ ghi bàn.
- Bảng xếp hạng mỗi bảng tự cập nhật theo điểm, hiệu số, bàn thắng và tie-break ổn định.
- Bảng `Best 3rd Place` xếp hạng 12 đội đứng thứ 3 và làm nổi bật Top 8 đội đi tiếp.
- Knock-out Stage gồm:
  - Round of 32
  - Round of 16
  - Quarter Finals
  - Semi Finals
  - Final
  - Third Place Match
- Logic knock-out theo mô phỏng thực tế hơn:
  - Bước 1: mô phỏng tỉ số sau 90 phút.
  - Bước 2: nếu hòa, mô phỏng tiếp tỉ số sau 120 phút.
  - Bước 3: nếu vẫn hòa sau 120 phút, bấm `Đá penalty` để chốt đội thắng.
- Ở Round of 32, card trận hiển thị thêm nguồn gốc đội (`Group X - 1st/2nd/3rd`).
- Từ Round of 16 trở đi, card chỉ tập trung vào nhánh đấu và kết quả.
- Bảng `Vua phá lưới` tổng hợp xuyên suốt từ vòng bảng đến chung kết.
- `Try Again` reset toàn bộ state và xóa localStorage.
- Refresh trang không làm mất dữ liệu.

## Giao diện Knock-out hiện tại

- Bracket kiểu simulator, tách 3 view:
  - `Pathway 1`
  - `Pathway 2`
  - `Finals`
- Card trận tự chứa đầy đủ thông tin cần thiết:
  - Tên đội, cờ đội
  - Trạng thái trận
  - Tỉ số 90 phút
  - Tỉ số 120 phút (nếu có)
  - Penalty (nếu có)
  - Scorers
- Final và Third Place Match hiển thị trong tab `Finals`.

## Kiến trúc thư mục

```text
src/
  components/
  data/
  hooks/
  types/
  utils/
public/
  flags/
```

## Chạy local

```bash
npm install
npm run dev
```

Mặc định Vite chạy dev server và toàn bộ state mô phỏng được lưu trong `localStorage`.

## Build production

```bash
npm run build
npm run preview
```

## Ghi chú kỹ thuật

- Không dùng backend, không dùng database server.
- Dữ liệu đội tuyển và cầu thủ đều nằm trong source code.
- Cờ quốc gia dùng asset SVG local trong `public/flags/`, có fallback nội bộ.
- Danh sách cầu thủ là dataset mô phỏng, tổ chức theo static data để dễ thay thế sau này.
- Penalty chỉ dùng để xác định đội thắng và không cộng vào bảng vua phá lưới.
- Bracket knock-out được seed theo cơ chế ổn định:
  - 12 đội nhất bảng
  - 12 đội nhì bảng
  - 8 đội hạng ba tốt nhất
- LocalStorage có normalize để tương thích khi model knockout được mở rộng.

## Scripts

- `npm run dev`: chạy local.
- `npm run build`: build production.
- `npm run preview`: preview bản build.
