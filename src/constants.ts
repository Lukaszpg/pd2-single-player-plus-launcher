import { LauncherSettings, LaunchArgument } from "./types";

export const DLL_URL =
  "https://github.com/Lukaszpg/PD2-Single-Player-Plus-mod/releases/latest/download/BH.dll";
export const LAUNCHER_JSON_URL =
  "https://gist.githubusercontent.com/Lukaszpg/567ce75f1828f7226af890c26a350d90/raw";
export const JSON_URL =
  "https://raw.githubusercontent.com/Lukaszpg/PD2-Single-Player-Plus-mod/refs/heads/main/pd2-single-player-plus.json";
export const MPQ_URL =
  "https://github.com/Lukaszpg/PD2-Single-Player-Plus-mod/releases/latest/download/pd2data.mpq";
export const LATEST_RELEASE_URL =
  "https://github.com/Lukaszpg/PD2-Single-Player-Plus-mod/releases/latest/download";
export const LOOT_FILTER_URL = 
  ""

export const LOOT_FILTER_STRING = "loot.filter"
export const DLL_STRING = "BH.dll";
export const JSON_STRING = "pd2-single-player-plus.json";
export const LAUNCHER_SETTINGS_STRING = "pd2-single-player-plus-launcher.json";
export const MPQ_STRING = "pd2data.mpq";
export const PLUGY_STRING = "PlugY.exe";
export const DIABLO2_STRING = "Diablo II.exe";
export const PROJECTD2_STRING = "ProjectD2";
export const PROJECT_DIABLO_SETTINGS_STRING = "ProjectDiablo.json";

/** Command line arguments offered as checkboxes in the settings. */
export const COMMON_LAUNCH_ARGS: LaunchArgument[] = [
  {
    value: "-direct",
    label: "-direct",
    description: "Load game data from the data folder instead of the MPQ archives.",
  },
  {
    value: "-txt",
    label: "-txt",
    description: "Load .txt data files. Usually used together with -direct.",
  },
  {
    value: "-3dfx",
    label: "-3dfx",
    description: "Use the Glide (3dfx) renderer. Already enabled when playing without PlugY.",
  },
  {
    value: "-skiptobnet",
    label: "-skiptobnet",
    description: "Skip the Battle.net menu and go straight into single player.",
  },
  {
    value: "-w",
    label: "-w",
    description: "Run the game in windowed mode.",
  },
  {
    value: "-ns",
    label: "-ns",
    description: "Start the game without sound.",
  },
  {
    value: "-lq",
    label: "-lq",
    description: "Force low quality graphics.",
  },
];

export const DEFAULT_LAUNCHER_SETTINGS: LauncherSettings = {
  isPlugy: false,
  gamePath: "",
  launchArgs: [],
  customArgs: "",
};
