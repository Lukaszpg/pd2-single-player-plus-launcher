import { exists } from "@tauri-apps/api/fs";
import { fixedResourcePath } from "./fixedResourcePath";

export async function checkIfFileExists(fileName: string) {
  const path = await fixedResourcePath();
  const fileExistStatus = await exists(`${path}\\${fileName}`);

  return fileExistStatus;
}
