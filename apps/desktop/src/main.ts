import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  type MenuItemConstructorOptions,
} from "electron/main";
import { shell } from "electron/common";
import { xmindBufferToKm } from "@ljheee/xmind-parser";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { DesktopCommand, OpenXMindResult } from "./shared/types";
import { convertXMindSheetsToMarkdown } from "./shared/xmind-markdown";

const MAX_XMIND_BYTES = 50 * 1024 * 1024;

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

const LAST_EXPORT_DIRECTORY_FILE = "last-export-directory.json";
let lastExportDirectory: string | undefined;

function getExportDirectorySettingsPath(): string {
  return path.join(app.getPath("userData"), LAST_EXPORT_DIRECTORY_FILE);
}

async function loadLastExportDirectory(): Promise<void> {
  try {
    const savedDirectory = JSON.parse(
      await fs.readFile(getExportDirectorySettingsPath(), "utf8"),
    ) as unknown;
    if (typeof savedDirectory !== "string" || !savedDirectory) return;
    if ((await fs.stat(savedDirectory)).isDirectory()) {
      lastExportDirectory = savedDirectory;
    }
  } catch {
    // Fall back to the Downloads folder when no valid preference is stored.
  }
}

function getExportDefaultPath(suggestedName: string, extension: string): string {
  const directory = lastExportDirectory ?? app.getPath("downloads");
  return path.join(
    directory,
    withExtension(getSafeName(suggestedName, "mindmap"), extension),
  );
}

async function rememberExportDirectory(filePath: string): Promise<void> {
  const directory = path.dirname(filePath);
  lastExportDirectory = directory;
  try {
    await writeFileAtomically(
      getExportDirectorySettingsPath(),
      JSON.stringify(directory),
      "utf8",
    );
  } catch {
    // A preference write failure must not make a successful export fail.
  }
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

async function openXMind(): Promise<OpenXMindResult> {
  const result = await dialog.showOpenDialog({
    title: "导入 XMind",
    properties: ["openFile"],
    filters: [
      { name: "XMind 文件", extensions: ["xmind"] },
      { name: "所有文件", extensions: ["*"] },
    ],
  });

  const filePath = result.filePaths[0];
  if (result.canceled || !filePath) return { canceled: true };

  const fileStats = await fs.stat(filePath);
  if (fileStats.size > MAX_XMIND_BYTES) {
    throw new Error("XMind 文件超过 50 MB，暂不支持导入。");
  }

  const fileName = path.basename(filePath);
  try {
    const fileBuffer = await fs.readFile(filePath);
    const arrayBuffer = Uint8Array.from(fileBuffer).buffer;
    const sheets = await xmindBufferToKm(arrayBuffer);
    const converted = convertXMindSheetsToMarkdown(sheets, fileName);

    return {
      canceled: false,
      filePath,
      fileName,
      content: converted.markdown,
      warnings: converted.warnings,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "文件格式无法识别";
    throw new Error(`无法导入 XMind 文件：${reason}`);
  }
}

async function saveSvg(payload: {
  content: string;
  suggestedName: string;
}): Promise<{ canceled: boolean; filePath?: string }> {
  const result = await dialog.showSaveDialog({
    title: "导出 SVG",
    defaultPath: getExportDefaultPath(payload.suggestedName, ".svg"),
    filters: [{ name: "SVG 图片", extensions: ["svg"] }],
  });

  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFileAtomically(result.filePath, payload.content, "utf8");
  await rememberExportDirectory(result.filePath);
  return { canceled: false, filePath: result.filePath };
}

async function savePng(payload: {
  data: ArrayBuffer;
  suggestedName: string;
}): Promise<{ canceled: boolean; filePath?: string }> {
  const result = await dialog.showSaveDialog({
    title: "导出 PNG",
    defaultPath: getExportDefaultPath(payload.suggestedName, ".png"),
    filters: [{ name: "PNG 图片", extensions: ["png"] }],
  });

  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFileAtomically(result.filePath, new Uint8Array(payload.data));
  await rememberExportDirectory(result.filePath);
  return { canceled: false, filePath: result.filePath };
}

async function saveXMind(payload: {
  data: ArrayBuffer;
  suggestedName: string;
}): Promise<{ canceled: boolean; filePath?: string }> {
  const result = await dialog.showSaveDialog({
    title: "导出 XMind",
    defaultPath: getExportDefaultPath(payload.suggestedName, ".xmind"),
    filters: [{ name: "XMind 文件", extensions: ["xmind"] }],
  });

  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFileAtomically(result.filePath, new Uint8Array(payload.data));
  await rememberExportDirectory(result.filePath);
  return { canceled: false, filePath: result.filePath };
}

function registerIpcHandlers(): void {
  ipcMain.handle("document:open-xmind", openXMind);
  ipcMain.handle("export:save-svg", (_event, payload: Parameters<typeof saveSvg>[0]) =>
    saveSvg(payload),
  );
  ipcMain.handle("export:save-png", (_event, payload: Parameters<typeof savePng>[0]) =>
    savePng(payload),
  );
  ipcMain.handle("export:save-xmind", (_event, payload: Parameters<typeof saveXMind>[0]) =>
    saveXMind(payload),
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
        label: "导入 XMind…",
        accelerator: "CmdOrCtrl+O",
        click: () => sendCommand("import-xmind"),
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
      {
        label: "导出 XMind…",
        accelerator: "CmdOrCtrl+Shift+X",
        click: () => sendCommand("export-xmind"),
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

app.whenReady().then(async () => {
  await loadLastExportDirectory();
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
