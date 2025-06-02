import { Command } from "@tauri-apps/api/shell";
import { message } from "@tauri-apps/api/dialog";
import { readTextFile } from "@tauri-apps/api/fs";
import { DLL_STRING, JSON_STRING, MPQ_STRING, PLUGY_STRING, LAUNCHER_SETTINGS_STRING } from "./constants";
import { checkIfFileExists } from "./util/checkIfFileExists";
import { Json, LauncherSettings } from "./types";
import { downloadAllFiles } from "./util/downloadAll";
import { fixedResourcePath } from "./util/fixedResourcePath";
import { Loader } from "@mantine/core";
import { calculateChecksum } from "./util/calculateChecksum";

type PlayType = {
  latestJson: Json | null | undefined;
  localJson: Json | null | undefined;
  isDownloading: boolean;
  setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>;
  readLocalJson: () => Promise<void>;
};

export default function Play({
  latestJson,
  localJson,
  isDownloading,
  setIsDownloading,
  readLocalJson
}: PlayType) {
	
	const readLauncherSettings = async () => {
	const path = await fixedResourcePath();
	const launcherSettings: LauncherSettings = JSON.parse(
	  await readTextFile(`${path}\\${LAUNCHER_SETTINGS_STRING}`)
	);

	return launcherSettings;
	};
  
  const playPlugy = new Command("PlugY", ["-plugy"]);
  const notPlugy = new Command("NotPlugy", ["-3dfx"]);

  const onPlay = async () => {
	const launcherSettings = await readLauncherSettings();
    const dllExists = await checkIfFileExists(DLL_STRING);
    const mpqExists = await checkIfFileExists(MPQ_STRING);
    const plugyExists = await checkIfFileExists(PLUGY_STRING);
    const localJsonExists = await checkIfFileExists(JSON_STRING);
	const currentChecksum = await calculateChecksum(MPQ_STRING);

    if (launcherSettings.isPlugy && !plugyExists) {
      await message(
        `${PLUGY_STRING} not found. \n\nMake sure this launcher is installed in the same folder as ${PLUGY_STRING}.`,
        { title: "Error", type: "error" }
      );
      return;
    }

    if (localJsonExists) await readLocalJson();

    if (
      dllExists &&
      mpqExists &&
      localJsonExists &&
      localJson?.version === latestJson?.version &&
	  currentChecksum === latestJson?.dataChecksum
    ) {
	  if(launcherSettings.isPlugy) {
        playPlugy.execute();
	  } else {
		notPlugy.execute();
	  }
    } else {
      setIsDownloading(true);
      await downloadAllFiles();
      setIsDownloading(false);

      if(launcherSettings.isPlugy) {
        playPlugy.execute();
	  } else {
		notPlugy.execute();
	  }
    }
  };

  return (
    <button
      className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 items-center justify-center grid"
      onClick={onPlay}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <span className="flex justify-center align-center min-w-48">
          <h2 className="mb-3 text-2xl font-semibold pr-4">Updating </h2>
          <Loader color="red" type="dots" />
        </span>
      ) : (
        <>
          <h2 className="mb-3 text-2xl font-semibold min-w-48">Play</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-40">
            PD2 Single Player+
          </p>
        </>
      )}
    </button>
  );
}
