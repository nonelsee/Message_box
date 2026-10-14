# Workspace Chat — Hướng dẫn dùng

Đây là app desktop (Electron) nhúng bản web thật của Messenger, Facebook,
Instagram và TikTok vào một cửa sổ nhỏ, theme tối gọn gàng, có thể thu vào khay
hệ thống và ẩn/hiện nhanh bằng phím tắt.

## 1. Cài đặt (chỉ làm 1 lần)

Yêu cầu: máy đã cài **Node.js** (tải tại https://nodejs.org — bản LTS).

Mở Terminal / Command Prompt tại thư mục dự án (giải nén file zip ra trước),
sau đó chạy:

```bash
npm install
```

Lệnh này tải Electron về máy (chỉ chạy local, không gửi dữ liệu gì ra ngoài).

## 2. Chạy app

```bash
npm start
```

Lần đầu chạy, cửa sổ sẽ hiện trang đăng nhập Messenger thật — đăng nhập bình
thường như trên trình duyệt. Lần sau mở lại app sẽ nhớ đăng nhập (nhờ
`partition="persist:messenger"` trong code).

## 3. Các tab

Hàng tab ngay dưới thanh tiêu đề, chia theo 3 nhóm nền tảng:

| Tab | Mở trang | Ghi chú |
|---|---|---|
| **Chat** | messenger.com | Tab mặc định khi mở app |
| **Feed** | facebook.com | |
| **IG Chat** | instagram.com/direct/inbox | Tin nhắn Instagram |
| **IG** | instagram.com | |
| **TT Chat** | tiktok.com/messages | Tin nhắn TikTok |
| **TikTok** | tiktok.com | |

Mỗi tab chỉ thật sự tải trang ở lần đầu bạn bấm vào, nên mở app vẫn nhẹ.
Các tab dùng chung một phiên lưu trữ, nên đăng nhập Instagram ở tab **IG** là
tab **IG Chat** cũng vào luôn (TikTok tương tự).

Đăng nhập Instagram/TikTok nên dùng **email/số điện thoại + mật khẩu**. Nút
"Đăng nhập bằng Google" thường bị chính Google chặn trong trình duyệt nhúng
(báo "this browser or app may not be secure") — đây là giới hạn của Google,
không sửa được từ phía app.

Giao diện web của TikTok thiết kế cho màn hình rộng, ở cửa sổ mặc định 420px sẽ
khá chật — kéo rộng cửa sổ ra khi dùng tab TikTok.

Muốn thêm/bớt dịch vụ: sửa mảng `VIEWS` ở đầu phần `<script>` trong
`index.html`, mỗi dòng là một tab.

## 4. Các thao tác chính

| Hành động | Cách làm |
|---|---|
| Ẩn/hiện cửa sổ ngay lập tức | Bấm tổ hợp phím **Ctrl+Q** (đổi được trong panel ⚙) |
| Mở panel cài đặt | Bấm nút **⚙** trên thanh tiêu đề |
| Đổi phím tắt ẩn/hiện | ⚙ > bấm vào ô phím tắt > gõ tổ hợp mới (phải kèm Ctrl/Alt, hoặc dùng phím F1–F24 đứng một mình; Esc để huỷ) |
| Thu nhỏ xuống khay hệ thống | Bấm nút mũi tên (▼) trên thanh tiêu đề, hoặc bấm nút X (X không thoát app, chỉ ẩn) |
| Mở lại từ khay | Click vào icon ở khay hệ thống (system tray), hoặc chuột phải > "Mở" |
| Thoát hẳn app | Chuột phải vào icon khay > "Thoát" |
| Kéo di chuyển cửa sổ | Kéo vào vùng thanh tiêu đề tối phía trên |
| Thu nhỏ / phóng to nội dung trang web | ⚙ > nút **− / +** ở dòng "Cỡ nội dung", hoặc **Ctrl −** / **Ctrl +** (kể cả khi đang gõ trong khung chat); **Ctrl 0** hoặc bấm vào số % để về mặc định |
| Thu nhỏ / phóng to cửa sổ app | ⚙ > nút **− / +** ở dòng "Cỡ cửa sổ" — tác dụng y như kéo góc cửa sổ bằng chuột, mỗi nấc 10% quanh cỡ gốc 420×560; bấm vào số % để về 100% |

Hai mức này độc lập và đều được nhớ lại cho các lần mở sau. "Cỡ nội dung" có
mặc định responsive theo màn hình: màn lớn chạy scaling 100% (24"/27") là
**75%**, màn laptop scaling 125–150% là **90%** — nhờ vậy chữ trông nhỏ gọn
như nhau trên mọi màn hình. Kéo góc cửa sổ bằng chuột vẫn dùng bình thường,
"Cỡ cửa sổ" chỉ là cách chỉnh nhanh theo nấc.

## 5. Tuỳ chỉnh thêm

Phím tắt ẩn/hiện, cỡ nội dung và cỡ ứng dụng chỉnh ngay trong app qua panel
**⚙** — các giá trị này được lưu lại (phím tắt trong `settings.json` ở thư mục
dữ liệu của app, hai mức zoom trong localStorage) nên không mất khi tắt app.

Ngoài ra, mở file `main.js`, phần đầu file có mấy biến dễ chỉnh:

```js
const APP_TITLE = 'Workspace Chat';                 // đổi tên hiển thị taskbar/tray
const TOGGLE_SHORTCUT = 'CommandOrControl+Q';       // phím tắt MẶC ĐỊNH (panel ⚙ ghi đè được)
const START_HIDDEN = false;                         // true = mở app tự ẩn luôn
```

Muốn app tự khởi động cùng máy tính (ẩn sẵn), có thể thêm vào Startup folder
(Windows) hoặc Login Items (Mac) sau khi build (bước 6).

## 6. (Tuỳ chọn) Đóng gói thành file .exe / app chạy độc lập

Nếu muốn có file .exe để không cần cài Node.js mỗi lần:

```bash
npm run build-win   # ra file .exe trong thư mục dist/ (chạy trên Windows), KHÔNG đẩy lên GitHub
npm run build-mac   # ra app .app trong thư mục dist/ (chạy trên macOS)
```

## 7. Phát hành bản mới (người dùng tự cập nhật)

App bản đã cài tự hỏi GitHub Releases của repo `nonelsee/workspace-chat` xem có
bản mới không (lúc mở app và mỗi 4 giờ). Có thì tải ngầm, rồi tự cài vào lúc
cửa sổ đang ẩn xuống tray; app tự mở lại và vẫn ẩn. Người dùng không phải làm
gì. Cài đặt (phím tắt, đăng nhập...) được giữ nguyên.

Mỗi lần ra bản mới, chạy tại thư mục dự án:

```powershell
git add -A
git commit -m "Mô tả thay đổi"
npm version patch          # 1.0.0 -> 1.0.1 (tự commit + tạo tag v1.0.1); tính năng mới dùng minor
git push --follow-tags
$env:GH_TOKEN = "<token GitHub>"   # tạo ở github.com/settings/tokens, quyền repo; KHÔNG ghi vào file
npm run release-win        # build + đẩy .exe, latest.yml, .blockmap lên GitHub Release
```

Link tải cố định cho người dùng mới (luôn là bản mới nhất):
`https://github.com/nonelsee/workspace-chat/releases/latest/download/Workspace-Chat-Setup.exe`

Lưu ý: số `version` trong `package.json` **phải tăng** mỗi lần phát hành thì
app cũ mới nhận ra có bản mới. Bản đầu tiên (1.0.0) phải được cài tay một lần;
từ đó trở đi các bản sau tự cập nhật.

## Lưu ý quan trọng

- App này **chỉ là một "vỏ" giao diện** nhúng các trang web thật
  (messenger.com, facebook.com, instagram.com, tiktok.com) qua trình duyệt
  nhúng sẵn trong Electron (`<webview>`), không đăng nhập hộ, không đọc trộm
  hay gửi dữ liệu tin nhắn đi đâu cả — mọi thứ chạy hoàn toàn trên máy bạn,
  giống hệt việc bạn mở các trang đó trên Chrome. Ngoài các trang web bạn mở, app chỉ có thêm
  một kết nối: hỏi GitHub Releases xem có bản cập nhật mới không (không gửi kèm dữ liệu cá nhân).
- App chạy trên máy cá nhân của bạn. Nếu dùng trên máy công ty, hãy tuân thủ
  nội quy sử dụng thiết bị/mạng của công ty — app không nhằm mục đích che giấu
  việc sử dụng khỏi hệ thống giám sát.
- Theme tối lấy cảm hứng từ bảng màu của các app chat doanh nghiệp, nhưng app
  này không liên quan tới Microsoft Teams và không mạo danh sản phẩm nào.
