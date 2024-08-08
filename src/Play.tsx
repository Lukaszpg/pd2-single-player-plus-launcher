import { Command } from "@tauri-apps/api/shell";
import { message } from "@tauri-apps/api/dialog";
import { DLL_STRING, JSON_STRING, MPQ_STRING, PLUGY_STRING } from "./constants";
import { checkIfFileExists } from "./util/checkIfFileExists";
import { Json, LauncherSettings } from "./types";
import { downloadAllFiles } from "./util/downloadAll";
import { Loader } from "@mantine/core";

type PlayType = {
  latestJson: Json | null | undefined;
  launcherSettings: LauncherSettings;
  localJson: Json | null | undefined;
  isDownloading: boolean;
  setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>;
  readLocalJson: () => Promise<void>;
};

export default function Play({
  latestJson,
  launcherSettings,
  localJson,
  isDownloading,
  setIsDownloading,
  readLocalJson,
}: PlayType) {
  const play = new Command("PlugY");

  const onPlay = async () => {
    const dllExists = await checkIfFileExists(DLL_STRING);
    const mpqExists = await checkIfFileExists(MPQ_STRING);
    const plugyExists = await checkIfFileExists(PLUGY_STRING);
    const localJsonExists = await checkIfFileExists(JSON_STRING);

    if (!plugyExists) {
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
      localJson?.version === latestJson?.version
    ) {
      play.execute();
    } else {
      setIsDownloading(true);
      await downloadAllFiles(launcherSettings);
      setIsDownloading(false);

      play.execute();
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
            PD2 SP: Reawakening
          </p>
        </>
      )}
    </button>
  );
}
