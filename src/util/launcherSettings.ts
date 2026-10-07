import { exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import {
  DEFAULT_LAUNCHER_SETTINGS,
  LAUNCHER_SETTINGS_STRING,
} from "../constants";
import { LauncherSettings } from "../types";
import { fixedResourcePath } from "./fixedResourcePath";

export const launcherSettingsPath = async () =>
  `${await fixedResourcePath()}\\${LAUNCHER_SETTINGS_STRING}`;

/**
 * Fills in the missing fields of settings files written by older launcher
 * versions, so the launch arguments can be added without breaking upgrades.
 */
export const normalizeLauncherSettings = (
  settings?: Partial<LauncherSettings> | null
): LauncherSettings => {
  const launchArgs = settings?.launchArgs;

  return {
    ...DEFAULT_LAUNCHER_SETTINGS,
    ...(settings ?? {}),
    isPlugy: settings?.isPlugy ?? DEFAULT_LAUNCHER_SETTINGS.isPlugy,
    gamePath:
      typeof settings?.gamePath === "string"
        ? settings.gamePath
        : DEFAULT_LAUNCHER_SETTINGS.gamePath,
    launchArgs: Array.isArray(launchArgs)
      ? launchArgs.filter((arg) => typeof arg === "string")
      : [],
    customArgs:
      typeof settings?.customArgs === "string"
        ? settings.customArgs
        : DEFAULT_LAUNCHER_SETTINGS.customArgs,
  };
};

/** Reads the launcher settings, creating the file with defaults if missing. */
export const readLauncherSettings = async (): Promise<LauncherSettings> => {
  const path = await launcherSettingsPath();

  if (!(await exists(path))) {
    await writeLauncherSettings(DEFAULT_LAUNCHER_SETTINGS);
    return { ...DEFAULT_LAUNCHER_SETTINGS };
  }

  try {
    return normalizeLauncherSettings(
      JSON.parse(await readTextFile(path)) as Partial<LauncherSettings>
    );
  } catch {
    return { ...DEFAULT_LAUNCHER_SETTINGS };
  }
};

export const writeLauncherSettings = async (settings: LauncherSettings) => {
  await writeTextFile({
    path: await launcherSettingsPath(),
    contents: JSON.stringify(settings),
  });
};
