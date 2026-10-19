const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window-minimize'),
  hide: () => ipcRenderer.send('window-minimize-to-tray'),
  close: () => ipcRenderer.send('window-close'),
});

// Nhận lệnh zoom do main process bắt được từ phím tắt gõ bên trong webview,
// và cho phép đổi kích thước cửa sổ thật ("Cỡ cửa sổ" trong panel ⚙).
contextBridge.exposeInMainWorld('zoomBridge', {
  onCommand: (callback) => ipcRenderer.on('zoom-command', (_e, cmd) => callback(cmd)),
  setWindowScale: (factor) => ipcRenderer.send('set-window-scale', factor),
});

// Đọc/đổi phím tắt ẩn/hiện app và độ trong suốt cửa sổ từ panel cài đặt
contextBridge.exposeInMainWorld('settingsBridge', {
  getToggleShortcut: () => ipcRenderer.invoke('get-toggle-shortcut'),
  setToggleShortcut: (accelerator) => ipcRenderer.invoke('set-toggle-shortcut', accelerator),
  setWindowOpacity: (opacity) => ipcRenderer.send('set-window-opacity', opacity),
});
