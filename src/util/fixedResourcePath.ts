import { resourceDir } from "@tauri-apps/api/path";

export const fixedResourcePath = async () => {
  const resourcePath = await resourceDir();
  const fixedResourcePath = resourcePath.replace("\\\\?\\", "");
  return fixedResourcePath;
};
