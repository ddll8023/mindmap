import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  type MenuItemConstructorOptions,
} from "electron/main";
import { shell } from "electron/common";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { DesktopCommand } from "./shared/types";

const MAX_MARKDOWN_BYTES = 10 * 1024 * 1024;

let mainWindow: BrowserWindow | null = null;

function getRendererUrl(): string | undefined {
  return MAIN_WINDOW_VITE_DEV_SERVER_URL;
}

function getSafeName(value: string, fallback: string): string {
  const name = path
    .basename(value)
    .replace(/[<>:"/\\|?*]/g, "-")
    .split("")
    .map((character) => (character.charCodeAt(0) < 32 ? "-" : character))
    .join("")
    .trim();
  return name || fallback;
}

function withExtension(name: string, extension: string): string {
  return name.toLowerCase().endsWith(extension)
    ? name
    : `${name}${extension}`;
}

async function writeFileAtomically(
  filePath: string,
  data: string | Uint8Array,
  encoding?: BufferEncoding,
): Promise<void> {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    if (typeof data === "string") {
      await fs.writeFile(temporaryPath, data, encoding ?? "utf8");
    } else {
      await fs.writeFile(temporaryPath, data);
    }
    await fs.rename(temporaryPath, filePath);
  } finally {
    await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
  }
}

async function openMarkdown(): Promise<{
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
}> {
  const result = await dialog.showOpenDialog({
    title: "导入 Markdown",
    properties: ["openFile"],
    filters: [
      { name: "Markdown 文件", extensions: ["md", "markdown"] },
      { name: "文本文件", extensions: ["txt"] },
      { name: "所有文件", extensions: ["*"] },
    ],
  });

  const filePath = result.filePaths[0];
  if (result.canceled || !filePath) return { canceled: true };

  const fileStats = await fs.stat(filePath);
  if (fileStats.size > MAX_MARKDOWN_BYTES) {
    throw new Error("Markdown 文件超过 10 MB，暂不支持导入。");
  }

  return {
    canceled: false,
    filePath,
    fileName: path.basename(filePath),
    content: await fs.readFile(filePath, "utf8"),
  };
}

async function saveSvg(payload: {
  content: string;
  suggestedName: string;
}): Promise<{ canceled: boolean; filePath?: string }> {
  const result = await dialog.showSaveDialog({
    title: "导出 SVG",
    defaultPath: path.join(
      app.getPath("downloads"),
      withExtension(getSafeName(payload.suggestedName, "mindmap"), ".svg"),
    ),
    filters: [{ name: "SVG 图片", extensions: ["svg"] }],
  });

  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFileAtomically(result.filePath, payload.content, "utf8");
  return { canceled: false, filePath: result.filePath };
}

async function savePng(payload: {
  data: ArrayBuffer;
  suggestedName: string;
}): Promise<{ canceled: boolean; filePath?: string }> {
  const result = await dialog.showSaveDialog({
    title: "导出 PNG",
    defaultPath: path.join(
      app.getPath("downloads"),
      withExtension(getSafeName(payload.suggestedName, "mindmap"), ".png"),
    ),
    filters: [{ name: "PNG 图片", extensions: ["png"] }],
  });

  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFileAtomically(result.filePath, new Uint8Array(payload.data));
  return { canceled: false, filePath: result.filePath };
}

function registerIpcHandlers(): void {
  ipcMain.handle("document:open-markdown", openMarkdown);
  ipcMain.handle("export:save-svg", (_event, payload: Parameters<typeof saveSvg>[0]) =>
    saveSvg(payload),
  );
  ipcMain.handle("export:save-png", (_event, payload: Parameters<typeof savePng>[0]) =>
    savePng(payload),
  );
}

function sendCommand(command: DesktopCommand): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("desktop:command", command);
}

function buildApplicationMenu(): void {
  const fileMenu: MenuItemConstructorOptions = {
    label: "文件",
    submenu: [
      {
        label: "导入 Markdown…",
        accelerator: "CmdOrCtrl+O",
        click: () => sendCommand("import-markdown"),
      },
      { type: "separator" },
      {
        label: "导出 SVG…",
        accelerator: "CmdOrCtrl+Shift+S",
        click: () => sendCommand("export-svg"),
      },
      {
        label: "导出 PNG…",
        accelerator: "CmdOrCtrl+Alt+Shift+S",
        click: () => sendCommand("export-png"),
      },
      { type: "separator" },
      { role: "quit" },
    ],
  };

  const template: MenuItemConstructorOptions[] = [
    ...(process.platform === "darwin"
      ? [
        {
          label: "开放思维导图",
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        } satisfies MenuItemConstructorOptions,
      ]
      : []),
    fileMenu,
    { label: "编辑", role: "editMenu" },
    { label: "视图", role: "viewMenu" },
    { label: "窗口", role: "windowMenu" },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    title: "开放思维导图",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) void shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const devUrl = getRendererUrl();
    const isLocalRenderer =
      url.startsWith("file:") || (devUrl !== undefined && url.startsWith(devUrl));
    if (!isLocalRenderer) {
      event.preventDefault();
      if (url.startsWith("https://")) void shell.openExternal(url);
    }
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  buildApplicationMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
