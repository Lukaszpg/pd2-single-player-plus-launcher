import { Command } from "@tauri-apps/api/shell";
import { resourceDir } from "@tauri-apps/api/path";
import { download } from "./util/download";
import { useEffect, useState } from "react";
import { exists, readTextFile } from "@tauri-apps/api/fs";

export default function Play() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("");
  const [fileExists, setFileExists] = useState({
    json: false,
    mpq: false,
    dll: false,
  });

  const play = new Command("PlugY");
  const pd2dataLink =
    "https://github.com/synpoox/pd2-reawakening/releases/latest/download/pd2data.mpq";
  const bhLink =
    "https://github.com/synpoox/pd2-reawakening/releases/latest/download/BH.dll";
  const pd2ReawakeningJsonLink =
    "https://raw.githubusercontent.com/synpoox/pd2-reawakening/main/pd2-reawakening.json";

  async function downloadAllFiles() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");

    await fetch(pd2ReawakeningJsonLink)
      .then((response) => response.json())
      .then(async (data) => {

        if (currentVersion !== data.version) {
          setIsDownloading(true);
          await download(pd2dataLink, `${fixedPath}/pd2data.mpq`);
          await download(bhLink, `${fixedPath}/BH.dll`);
          await download(
            pd2ReawakeningJsonLink,
            `${fixedPath}/pd2-reawakening.json`
          );
          setFileExists({
            dll: true,
            json: true,
            mpq: true,
          });
          setIsDownloading(false);
          setCurrentVersion(data.version);
        }
      });
  }

  async function checkIfJsonExists() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");
    const jsonExistStatus = await exists(`${fixedPath}\pd2-reawakening.json`);
    setFileExists((prevState) => ({ ...prevState, json: jsonExistStatus }));
  }

  async function checkIfMpqExists() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");
    const mpqExistStatus = await exists(`${fixedPath}\pd2data.mpq`);
    setFileExists((prevState) => ({ ...prevState, mpq: mpqExistStatus }));
  }

  async function checkIfDllExists() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");
    const dllExistStatus = await exists(`${fixedPath}\BH.dll`);
    setFileExists((prevState) => ({ ...prevState, dll: dllExistStatus }));
  }

  async function getCurrentVersion() {
    checkIfJsonExists();
    checkIfDllExists();
    checkIfMpqExists();

    if (fileExists.json) {
      const resourcePath = await resourceDir();
      const fixedPath = resourcePath.replace("\\\\?\\", "");
      const currentVersionJson = await readTextFile(
        `${fixedPath}\pd2-reawakening.json`
      );

      setCurrentVersion(JSON.parse(currentVersionJson).version);
    } else {
      downloadAllFiles();
    }
  }

  useEffect(() => {
    getCurrentVersion();
  }, []);

  return (
    <button
      className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 items-center justify-center grid"
      onClick={async () => {
        await getCurrentVersion();

        const resourcePath = await resourceDir();
        const fixedPath = resourcePath.replace("\\\\?\\", "");

        await fetch(pd2ReawakeningJsonLink)
          .then((response) => response.json())
          .then(async (data) => {

            if (
              currentVersion !== data.version ||
              !fileExists.dll ||
              !fileExists.json ||
              !fileExists.mpq
            ) {
              setIsDownloading(true);
              await download(pd2dataLink, `${fixedPath}/pd2data.mpq`);
              await download(bhLink, `${fixedPath}/BH.dll`);
              await download(
                pd2ReawakeningJsonLink,
                `${fixedPath}/pd2-reawakening.json`
              );
              setFileExists({
                dll: true,
                json: true,
                mpq: true,
              });
              setIsDownloading(false);
              setCurrentVersion(data.version);
            }
          });

        play.execute();
      }}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <h2 className="mb-3 text-2xl font-semibold min-w-44">Updating...</h2>
      ) : (
        <>
          <h2 className="mb-3 text-2xl font-semibold min-w-44">Play</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-40">
            PD2: Reawakening
          </p>
        </>
      )}
    </button>
  );
}
