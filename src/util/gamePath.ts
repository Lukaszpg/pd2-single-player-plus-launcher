import { fixedResourcePath } from "./fixedResourcePath";

let configuredGamePath: string | null = null;

/**
 * The directory the game files are read from, the game is started in and the
 * mod files (pd2data.mpq, BH.dll, ...) are downloaded to.
 *
 * Defaults to the folder the launcher itself lives in, which keeps the
 * "put the launcher next to Diablo II.exe" workflow working.
 */
export const gameDirectory = async () =>
  configuredGamePath ?? (await fixedResourcePath());

/** Applies the game directory from the launcher settings. Empty = launcher folder. */
export const setGameDirectory = (gamePath?: string | null) => {
  const trimmed = gamePath?.trim();
  configuredGamePath = trimmed ? trimmed.replace(/[\\/]+$/, "") : null;
};
