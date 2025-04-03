import cp from "child_process";
import sudo from "sudo-prompt";

import { EOL, isWindows } from "./helpers";

var options = {
  name: "Electron",
  // icns: "/Applications/Electron.app/Contents/Resources/Electron.icns", // (optional)
};

export const HOSTS_FILE_PATH = isWindows()
  ? "C:/Windows/System32/drivers/etc/hosts"
  : "/etc/hosts";
export async function setPermissions() {
  sudo.exec("chmod 666 /etc/hosts", options, function (error, stdout, stderr) {
    if (error) throw error;
    console.log("success.");
  });
}
export function getPermissions(): string {
  const res = cp.execSync("stat -f '%OLp' /etc/hosts");

  return res.toString().trim();
}
