import { useEffect, useState } from "react";

import "@mantine/core/styles.css";
import "./App.css";

import Sublink from "./components/Sublink";
import Play from "./Play";
import { getVersion } from "@tauri-apps/api/app";
import {
  JSON_STRING,
  JSON_URL,
  LAUNCHER_JSON_URL,
  LAUNCHER_SETTINGS_STRING,
} from "./constants";
import Settings from "./components/Settings";
import { MantineProvider } from "@mantine/core";
import { useDisclosure, useFetch } from "@mantine/hooks";
import SettingsModal from "./components/SettingsModal";
import { Json, LauncherJson, LauncherSettings } from "./types";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { checkIfFileExists } from "./util/checkIfFileExists";
import { downloadAllFiles } from "./util/downloadAll";
import { fixedResourcePath } from "./util/fixedResourcePath";

function App() {
  const [opened, { open, close }] = useDisclosure(false);
  const [localJson, setLocalJson] = useState<Json | null>();
  const [launcherSettings, setLauncherSettings] = useState<LauncherSettings>({
    craftingLeague: false,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [appVersion, setAppVersion] = useState("");

  const { data: latestJsonData } = useFetch<Json>(JSON_URL);
  const { data: launcherJsonData } = useFetch<LauncherJson>(LAUNCHER_JSON_URL);

  const readLauncherSettings = async () => {
    const path = await fixedResourcePath();
    const launcherSettingsExists = await exists(
      `${path}\\${LAUNCHER_SETTINGS_STRING}`
    );

    const newLauncherSettings: LauncherSettings = {
      craftingLeague: false,
    };

    if (launcherSettingsExists) {
      const readLauncherSettings: LauncherSettings = JSON.parse(
        await readTextFile(`${path}\\${LAUNCHER_SETTINGS_STRING}`)
      );
      setLauncherSettings(readLauncherSettings);
    } else {
      await writeTextFile({
        path: `${path}\\${LAUNCHER_SETTINGS_STRING}`,
        contents: JSON.stringify(newLauncherSettings),
      });
    }
  };

  const readLocalJson = async () => {
    const path = await fixedResourcePath();
    const readLocalJson: Json = JSON.parse(
      await readTextFile(`${path}\\${JSON_STRING}`)
    );

    if (latestJsonData) {
      if (readLocalJson.version !== latestJsonData.version) {
        setIsDownloading(true);
        await downloadAllFiles(launcherSettings);
        setIsDownloading(false);
      }
    }

    setLocalJson(readLocalJson);
  };

  useEffect(() => {
    if (!import.meta.env.DEV)
      document.oncontextmenu = (event) => event.preventDefault();

    (async () => {
      const appVersion = await getVersion();
      const localJsonExists = await checkIfFileExists(JSON_STRING);

      if (localJsonExists) {
        await readLocalJson();
      } else {
        setIsDownloading(true);
        await downloadAllFiles(launcherSettings);
        setIsDownloading(false);
      }

      await readLauncherSettings();
      setAppVersion(appVersion);
    })();
  }, [latestJsonData, launcherJsonData]);

  return (
    <MantineProvider>
      <SettingsModal
        opened={opened}
        close={close}
        launcherSettings={launcherSettings}
        setIsDownloading={setIsDownloading}
      />
      <div className="flex min-h-screen flex-col items-center justify-between bg-[url('./assets/bg.png')] bg-fixed bg-contain bg-center">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex"></div>

        <div className="relative grid place-items-center before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
          <h1 className="text-sm font-bold place-items-center">
            Project Diablo 2 SP
          </h1>
          <h1 className="text-4xl font-bold place-items-center">Reawakening</h1>

          <div className="mt-6 flex text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left space-x-2">
            {launcherJsonData?.sublinks.map((sublink, i) => (
              <Sublink title={sublink.title} url={sublink.url} key={i} />
            ))}
          </div>
        </div>

        <div className="mb-20 flex text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left space-x-4">
          <a
            href={latestJsonData?.latestPatchNotes || ""}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 min-w-64"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="mb-3 text-2xl font-semibold">Latest Patch Notes</h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-40">
              v{latestJsonData?.version} - {latestJsonData?.date}
            </p>
          </a>
          <Play
            latestJson={latestJsonData}
            launcherSettings={launcherSettings}
            localJson={localJson}
            isDownloading={isDownloading}
            setIsDownloading={setIsDownloading}
            readLocalJson={readLocalJson}
          />
        </div>
        <div className="absolute bottom-0 right-0 p-2">
          <p className="text-xs opacity-20">v{appVersion}</p>
        </div>
        <div className="absolute top-0 left-0">
          <Settings open={open} isDownloading={isDownloading} />
        </div>
      </div>
    </MantineProvider>
  );
}

export default App;
