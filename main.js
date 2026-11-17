const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 900,
    minHeight: 700,
    center: true,
    title: "Primary Health Care (PHC) Mental Health Triage Kiosk",
    backgroundColor: '#f1f5f9',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: process.env.NODE_ENV === 'development'
    }
  });

  // Remove default menu for clean, distraction-free clinical kiosk interface
  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
