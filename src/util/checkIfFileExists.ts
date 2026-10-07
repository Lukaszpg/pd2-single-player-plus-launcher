import { exists } from "@tauri-apps/api/fs";
import { gameDirectory } from "./gamePath";

export async function checkIfFileExists(fileName: string) {
  const path = await gameDirectory();
  const fileExistStatus = await exists(`${path}\\${fileName}`);

  return fileExistStatus;
}
