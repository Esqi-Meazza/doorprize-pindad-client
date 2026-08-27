import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";

if (process.platform === "win32") {
  execFileSync("powershell.exe", [
    "-NoProfile",
    "-Command",
    "$connections = Get-NetTCPConnection -State Listen -LocalPort 5173 -ErrorAction SilentlyContinue; $connections | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }",
  ], { stdio: "inherit" });
}

const vitePath = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const viteProcess = spawn(process.execPath, [vitePath, ...process.argv.slice(2)], {
  stdio: "inherit",
});

viteProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
