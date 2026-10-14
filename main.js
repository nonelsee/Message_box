const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// ---- Cấu hình dễ chỉnh ----
const APP_TITLE = 'Workspace Chat';        // Tên hiển thị trên taskbar / tray
const TOGGLE_SHORTCUT = 'CommandOrControl+Q'; // Phím tắt ẩn/hiện MẶC ĐỊNH (đổi được trong panel ⚙ của app)
const START_HIDDEN = false;                 // true = mở app là ẩn luôn, hiện bằng phím tắt
// ---------------------------

// Cài đặt người dùng chỉnh trong app (hiện có: phím tắt ẩn/hiện), lưu ở
// userData để giữ nguyên khi cập nhật code. TOGGLE_SHORTCUT chỉ là mặc định.
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
const settings = { toggleShortcut: TOGGLE_SHORTCUT };

function loadSettings() {
  try {
    Object.assign(settings, JSON.parse(fs.readFileSync(settingsFile(), 'utf8')));
  } catch (_) { /* chưa có file hoặc file hỏng -> dùng mặc định */ }
}

function saveSettings() {
  try {
    fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2));
  } catch (_) { /* không lưu được thì phím tắt vẫn chạy trong phiên này */ }
}

function registerToggle(accelerator) {
  try {
    return globalShortcut.register(accelerator, toggleWindow);
  } catch (_) {
    return false; // chuỗi accelerator không hợp lệ
  }
}

// Kích thước gốc của cửa sổ; "Cỡ cửa sổ" trong panel ⚙ scale quanh mốc này
const BASE_WIDTH = 420;
const BASE_HEIGHT = 560;

function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  const startHidden = START_HIDDEN || consumeRestartFlag();

  mainWindow = new BrowserWindow({
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    minWidth: 320,
    minHeight: 400,
    x: width - 440,
    y: 40,
    frame: false,           // bỏ thanh tiêu đề mặc định của OS -> dùng thanh tiêu đề tự vẽ trong index.html
    backgroundColor: '#242424', // nền tối ngay từ lúc load, tránh chớp trắng
    title: APP_TITLE,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: !startHidden,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,     // cho phép dùng <webview> để nhúng messenger.com
    },
  });

  Menu.setApplicationMenu(null); // bỏ menu bar (File/Edit/View...) cho gọn, giống app nội bộ

  mainWindow.loadFile('index.html');

  // Khi bấm nút "x" trên thanh tiêu đề giả -> ẩn xuống tray thay vì đóng hẳn
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Người dùng vừa ẩn/thu nhỏ cửa sổ -> lúc thích hợp để cài bản cập nhật đã tải
  const installSoon = () => setTimeout(installUpdateIfHidden, 2000);
  mainWindow.on('hide', installSoon);
  mainWindow.on('minimize', installSoon);
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'tray.png'));
  tray.setToolTip(APP_TITLE);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mở',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    {
      label: 'Ẩn',
      click: () => mainWindow.hide(),
    },
    { type: 'separator' },
    {
      label: 'Thoát',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

// ---- Tự cập nhật (electron-updater + GitHub Releases) ----
// Tải ngầm bản mới, chỉ cài khi cửa sổ đang ẩn để không làm gián đoạn người dùng.
// Cài xong app tự mở lại và vẫn ẩn (cờ restart-hidden) nên gần như không thấy gì.
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000; // app sống lâu trong tray -> kiểm tra định kỳ
let updateReady = false;

const restartFlag = () => path.join(app.getPath('userData'), 'restart-hidden');

function consumeRestartFlag() {
  try {
    const at = Number(fs.readFileSync(restartFlag(), 'utf8'));
    fs.unlinkSync(restartFlag());
    return Date.now() - at < 2 * 60 * 1000; // cờ cũ (lần cài trước lỗi) thì bỏ qua
  } catch (_) { return false; }
}

function installUpdateIfHidden() {
  if (!updateReady || !mainWindow || mainWindow.isVisible()) return;
  try { fs.writeFileSync(restartFlag(), String(Date.now())); } catch (_) {}
  isQuitting = true; // để nút "đóng" không chặn việc thoát
  autoUpdater.quitAndInstall(true, true); // cài im lặng + mở lại app
}

function setupAutoUpdate() {
  if (!app.isPackaged) return; // `npm start` không có bản phát hành để so -> bỏ qua
  autoUpdater.on('update-downloaded', () => {
    updateReady = true;
    installUpdateIfHidden(); // cửa sổ đang ẩn sẵn thì cài luôn, không thì chờ lần ẩn tới
  });
  autoUpdater.on('error', () => {}); // mất mạng / chưa có release -> lần kiểm tra sau thử lại
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  check();
  setInterval(check, UPDATE_CHECK_INTERVAL);
}

app.whenReady().then(() => {
  loadSettings();
  createWindow();
  createTray();
  setupAutoUpdate();

  // Đăng ký phím tắt ẩn/hiện đã lưu; nếu không được (chuỗi hỏng, app khác
  // đang giữ tổ hợp đó) thì lùi về mặc định để app luôn có phím ẩn/hiện.
  if (!registerToggle(settings.toggleShortcut)) {
    settings.toggleShortcut = TOGGLE_SHORTCUT;
    registerToggle(TOGGLE_SHORTCUT);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Phím tắt zoom (Ctrl +/-/0) bấm khi đang gõ trong webview sẽ không tới được
// trang host, nên bắt ở main process rồi chuyển về host để chỉnh + lưu một chỗ.
app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() !== 'webview') return;
  contents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' || !input.control || input.alt) return;
    let cmd = null;
    if (input.key === '=' || input.key === '+') cmd = 'in';
    else if (input.key === '-') cmd = 'out';
    else if (input.key === '0') cmd = 'reset';
    if (cmd && mainWindow) {
      event.preventDefault();
      mainWindow.webContents.send('zoom-command', cmd);
    }
  });
});

app.on('window-all-closed', () => {
  // Không tự thoát khi đóng cửa sổ (macOS-style), app vẫn sống trong tray
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ---- IPC cho thanh tiêu đề giả (index.html gọi qua preload.js) ----
ipcMain.on('window-minimize-to-tray', () => {
  mainWindow.hide();
});

ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-close', () => {
  mainWindow.hide(); // "đóng" thực chất là ẩn xuống tray
});

// "Cỡ cửa sổ": phóng/thu kích thước cửa sổ thật (như kéo góc bằng chuột),
// neo góc trên-phải vì app mặc định nằm sát mép phải màn hình.
ipcMain.on('set-window-scale', (_e, factor) => {
  const f = Number(factor);
  if (!mainWindow || !Number.isFinite(f) || f < 0.5 || f > 2) return;
  const bounds = mainWindow.getBounds();
  const width = Math.round(BASE_WIDTH * f);
  const height = Math.round(BASE_HEIGHT * f);
  const x = Math.max(0, bounds.x + (bounds.width - width)); // giữ mép phải cố định
  mainWindow.setBounds({ x, y: bounds.y, width, height });
});

// ---- IPC cho panel cài đặt (⚙) ----
ipcMain.handle('get-toggle-shortcut', () => settings.toggleShortcut);

ipcMain.handle('set-toggle-shortcut', (_e, accelerator) => {
  if (typeof accelerator !== 'string' || !accelerator.trim()) return { ok: false };
  if (accelerator === settings.toggleShortcut) return { ok: true };

  try { globalShortcut.unregister(settings.toggleShortcut); } catch (_) {}
  if (registerToggle(accelerator)) {
    settings.toggleShortcut = accelerator;
    saveSettings();
    return { ok: true };
  }
  registerToggle(settings.toggleShortcut); // đăng ký lại phím cũ, không để app "câm"
  return { ok: false };
});
