import { contextBridge, ipcRenderer } from "electron";
import type { DesktopApi, DesktopCommand } from "./shared/types";

const desktopApi: DesktopApi = {
  openXMind: () => ipcRenderer.invoke("document:open-xmind"),
  saveSvg: (content, suggestedName) =>
    ipcRenderer.invoke("export:save-svg", { content, suggestedName }),
  savePng: (data, suggestedName) =>
    ipcRenderer.invoke("export:save-png", { data, suggestedName }),
  saveXMind: (data, suggestedName) =>
    ipcRenderer.invoke("export:save-xmind", { data, suggestedName }),
  onCommand: (listener) => {
    const handler = (_event: unknown, command: DesktopCommand) => {
      listener(command);
    };

    ipcRenderer.on("desktop:command", handler);
    return () => ipcRenderer.removeListener("desktop:command", handler);
  },
};

contextBridge.exposeInMainWorld("desktopApi", desktopApi);
