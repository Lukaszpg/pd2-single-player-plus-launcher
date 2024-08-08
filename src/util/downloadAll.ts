import { LauncherSettings } from "../types";
import { download } from "./download";
import {
  DLL_STRING,
  JSON_STRING,
  JSON_URL,
  LATEST_RELEASE_URL,
  MPQ_STRING,
} from "../constants";
import { fixedResourcePath } from "./fixedResourcePath";

export const downloadAllFiles = async (launcherSettings: LauncherSettings) => {
  const path = await fixedResourcePath();

  if (launcherSettings.craftingLeague)
    await download(
      `${LATEST_RELEASE_URL}/crafting-league-${MPQ_STRING}`,
      `${path}/${MPQ_STRING}`
    );
  else
    await download(
      `${LATEST_RELEASE_URL}/${MPQ_STRING}`,
      `${path}/${MPQ_STRING}`
    );

  await download(
    `${LATEST_RELEASE_URL}/${DLL_STRING}`,
    `${path}/${DLL_STRING}`
  );
  await download(JSON_URL, `${path}/${JSON_STRING}`);
};
