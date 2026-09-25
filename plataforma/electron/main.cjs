const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// `npm run electron:dev` abre el servidor de Vite (debe estar corriendo `npm run dev`).
// `npm run electron` abre la versión compilada en dist/.
const MODO_DESARROLLO = process.argv.includes('--dev');

function crearVentana() {
  const ventana = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'OdontoSystem',
  });

  if (MODO_DESARROLLO) {
    ventana.loadURL('http://localhost:5173');
  } else {
    ventana.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  crearVentana();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
