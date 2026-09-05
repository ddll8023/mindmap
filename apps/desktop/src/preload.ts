import { contextBridge, ipcRenderer } from "electron";
import type { DesktopApi, DesktopCommand } from "./shared/types";

const desktopApi: DesktopApi = {
  openMarkdown: () => ipcRenderer.invoke("document:open-markdown"),
  saveSvg: (content, suggestedName) =>
    ipcRenderer.invoke("export:save-svg", { content, suggestedName }),
  savePng: (data, suggestedName) =>
    ipcRenderer.invoke("export:save-png", { data, suggestedName }),
  onCommand: (listener) => {
    const handler = (_event: unknown, command: DesktopCommand) => {
      listener(command);
    };

    ipcRenderer.on("desktop:command", handler);
    return () => ipcRenderer.removeListener("desktop:command", handler);
  },
};

contextBridge.exposeInMainWorld("desktopApi", desktopApi);
