import { Command } from "@tauri-apps/api/shell";
import { resourceDir } from "@tauri-apps/api/path";
import { download } from "./util/download";
import { useEffect, useState } from "react";
import { exists, readTextFile } from "@tauri-apps/api/fs";
import { message } from "@tauri-apps/api/dialog";
import { DLL_STRING, DLL_URL, JSON_STRING, JSON_URL, MPQ_STRING, MPQ_URL, PLUGY_STRING } from "./constants";

export default function Play() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("");
  const [fileExists, setFileExists] = useState({
    json: false,
    mpq: false,
    dll: false,
    plugy: false,
  });

  const play = new Command("PlugY");

  async function downloadAllFiles() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");

    await fetch(JSON_URL)
      .then((response) => response.json())
      .then(async (data) => {
        if (currentVersion !== data.version) {
          setIsDownloading(true);
          await download(MPQ_URL, `${fixedPath}/${MPQ_STRING}`);
          await download(DLL_URL, `${fixedPath}/${DLL_STRING}`);
          await download(
            JSON_URL,
            `${fixedPath}/pd2-reawakening.json`
          );
          setFileExists((prevState) => ({
            ...prevState,
            dll: true,
            json: true,
            mpq: true,
          }));
          setIsDownloading(false);
          setCurrentVersion(data.version);
        }
      });
  }

  async function checkIfJsonExists() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");
    const jsonExistStatus = await exists(`${fixedPath}\\${JSON_STRING}`);
    setFileExists((prevState) => ({ ...prevState, json: jsonExistStatus }));
  }

  async function checkIfMpqExists() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");
    const mpqExistStatus = await exists(`${fixedPath}\\${MPQ_STRING}`);
    setFileExists((prevState) => ({ ...prevState, mpq: mpqExistStatus }));
  }

  async function checkIfDllExists() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");
    const dllExistStatus = await exists(`${fixedPath}\\${DLL_STRING}`);
    setFileExists((prevState) => ({ ...prevState, dll: dllExistStatus }));
  }

  async function checkIfPlugyExists() {
    const resourcePath = await resourceDir();
    const fixedPath = resourcePath.replace("\\\\?\\", "");
    const plugyExistStatus = await exists(`${fixedPath}\\${PLUGY_STRING}`);
    setFileExists((prevState) => ({ ...prevState, plugy: plugyExistStatus }));
  }

  async function getCurrentVersion() {
    checkIfJsonExists();
    checkIfDllExists();
    checkIfMpqExists();
    checkIfPlugyExists();

    if (fileExists.json) {
      const resourcePath = await resourceDir();
      const fixedPath = resourcePath.replace("\\\\?\\", "");
      const currentVersionJson = await readTextFile(
        `${fixedPath}\\${JSON_STRING}`
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

        await fetch(JSON_URL)
          .then((response) => response.json())
          .then(async (data) => {
            if (
              currentVersion !== data.version ||
              !fileExists.dll ||
              !fileExists.json ||
              !fileExists.mpq
            ) {
              setIsDownloading(true);
              await download(MPQ_URL, `${fixedPath}/${MPQ_STRING}`);
              await download(DLL_URL, `${fixedPath}/${DLL_STRING}`);
              await download(
                JSON_URL,
                `${fixedPath}/${JSON_STRING}`
              );
              setFileExists((prevState) => ({
                ...prevState,
                dll: true,
                json: true,
                mpq: true,
              }));
              setIsDownloading(false);
              setCurrentVersion(data.version);
            }
          });

        if (!fileExists.plugy) {
          await message(
            `${PLUGY_STRING} not found. \n\nMake sure this launcher is installed in the same folder as ${PLUGY_STRING}.`,
            { title: "Error", type: "error" }
          );
        } else {
          play.execute();
        }
      }}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <h2 className="mb-3 text-2xl font-semibold min-w-44">Updating...</h2>
      ) : (
        <>
          <h2 className="mb-3 text-2xl font-semibold min-w-44">Play</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-40">
            PD2 SP: Reawakening
          </p>
        </>
      )}
    </button>
  );
}
