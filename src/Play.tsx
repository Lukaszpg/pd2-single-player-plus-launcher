import { message } from "@tauri-apps/api/dialog";
import { DLL_STRING, JSON_STRING, MPQ_STRING, PLUGY_STRING, DIABLO2_STRING } from "./constants";
import { checkIfFileExists } from "./util/checkIfFileExists";
import { Json, LauncherSettings } from "./types";
import { downloadAllFiles } from "./util/downloadAll";
import { Loader } from "@mantine/core";
import { calculateChecksum } from "./util/calculateChecksum";
import { invoke } from '@tauri-apps/api/tauri'
import { buildLaunchArgs } from "./util/launchArgs";
import { readLauncherSettings } from "./util/launcherSettings";
import { gameDirectory, setGameDirectory } from "./util/gamePath";

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

  const startGame = async (launcherSettings: LauncherSettings) => {
    const directory = await gameDirectory();
    // PlugY and the plain game executable are started by the Rust side so the
    // launcher can live anywhere and still launch the configured game folder.
    const exe = launcherSettings.isPlugy ? PLUGY_STRING : DIABLO2_STRING;
    const args = buildLaunchArgs(launcherSettings);

    try {
      await invoke("launch_game", { dir: directory, exe, args });
    } catch (error) {
      await message(
        `The game could not be started.\n\nDirectory: ${directory}\nCommand: ${exe} ${args.join(" ")}\n\n${error}`,
        { title: "Error", type: "error" }
      );
    }
  };

  const onPlay = async () => {
    const launcherSettings = await readLauncherSettings();
    setGameDirectory(launcherSettings.gamePath);
    const directory = await gameDirectory();
    const gameExe = launcherSettings.isPlugy ? PLUGY_STRING : DIABLO2_STRING;

    if (!(await checkIfFileExists(gameExe))) {
      await message(
        `${gameExe} was not found in:\n${directory}\n\n` +
          `Put the launcher into your game folder (the one with ${DIABLO2_STRING}) ` +
          `or set the game directory in the settings.`,
        { title: "Error", type: "error" }
      );
      return;
    }

    const dllExists = await checkIfFileExists(DLL_STRING);
    const mpqExists = await checkIfFileExists(MPQ_STRING);
    const localJsonExists = await checkIfFileExists(JSON_STRING);
    const currentChecksum = await calculateChecksum(MPQ_STRING);

    if (localJsonExists) await readLocalJson();

    if (
      dllExists &&
      mpqExists &&
      localJsonExists &&
      localJson?.version === latestJson?.version &&
	  currentChecksum === latestJson?.dataChecksum
    ) {
      await startGame(launcherSettings);
    } else {
      setIsDownloading(true);
      await downloadAllFiles();
      setIsDownloading(false);

      await startGame(launcherSettings);
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
