import { useEffect, useState } from "react";
import "./App.css";
import Sublink from "./components/Sublink";
import Play from "./Play";
import { getVersion } from "@tauri-apps/api/app";
import { JSON_URL } from "./constants";

type Json = {
  date: string;
  latestPatchNotes: string;
  version: string;
};

function App() {
  const [json, setJson] = useState<Json>();
  const [appVersion, setAppVersion] = useState("");

  const getGithubJson = async () => {
    fetch(JSON_URL)
      .then((response) => response.json())
      .then((data) => setJson(data));
  };

  const getAppVersion = async () => {
    const appVersion = await getVersion();
    setAppVersion(appVersion);
  };

  useEffect(() => {
    // prevent right click menu on prod
    if (!import.meta.env.DEV) {
      document.oncontextmenu = (event) => {
        event.preventDefault();
      };
    }
    getAppVersion();
    getGithubJson();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[url('./assets/bg.png')] bg-fixed bg-contain bg-center">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex"></div>

      <div className="relative grid place-items-center before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <h1 className="text-sm font-bold place-items-center">
          Project Diablo 2 SP
        </h1>
        <h1 className="text-4xl font-bold place-items-center">Reawakening</h1>
      </div>

      <div className="mb-12 flex text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left space-x-4">
        <Sublink
          url="https://www.reddit.com/r/ProjectDiablo2/comments/1ei9uxy/pd2_single_player_reawakening/"
          title="Reddit"
        />
        <Sublink
          url="https://docs.google.com/document/d/e/2PACX-1vTqp7Uys-XhuvmhnynkNjRt2Z8e0DdEXGOJ66JhgRUDMajI9jWIxw5va9pukdOU_xotWZzO-_zdPdah/pub"
          title="Guidebook"
        />
        <Sublink
          url="https://docs.google.com/document/d/e/2PACX-1vQE6uMONqjF13ZNqvtWQUDYVXOppJFETGHqvMYF2BBgKZmc-4BXn8DdQplQdjlJHpWCtBJiTU6eG85H/pub"
          title="List of Patch Notes"
        />
      </div>

      <div className="mb-12 flex text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left space-x-4">
        <a
          href={json?.latestPatchNotes || ""}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 min-w-64"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">Latest Patch Notes</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-40">
            v{json?.version} - {json?.date}
          </p>
        </a>
        <Play />
      </div>
      <div className="absolute bottom-0 right-0 p-2"><p className="text-xs opacity-20">v{appVersion}</p></div>
    </div>
  );
}

export default App;
