import * as fs from "@tauri-apps/api/fs";
import { getClient, RequestOptions, ResponseType } from "@tauri-apps/api/http";

export const download = async (url: string, dest: string, options?: RequestOptions) => {
    await fs.writeBinaryFile(
      dest,
      (
        await (
          await getClient()
        ).get(url, {
          ...(options || {}),
          responseType: ResponseType.Binary,
        })
      ).data as any
    );
  };