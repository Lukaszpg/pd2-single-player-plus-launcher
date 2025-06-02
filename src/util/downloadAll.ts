import { download } from "./download";
import {
  DLL_STRING,
  JSON_STRING,
  JSON_URL,
  LATEST_RELEASE_URL,
  MPQ_STRING,
} from "../constants";
import { fixedResourcePath } from "./fixedResourcePath";

export const downloadAllFiles = async () => {
  const path = await fixedResourcePath();

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
