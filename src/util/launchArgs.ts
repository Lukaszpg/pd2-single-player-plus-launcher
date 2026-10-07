import { LauncherSettings } from "../types";

/** Base argument used by each launch mode. */
export const baseLaunchArg = (isPlugy: boolean) => (isPlugy ? "-plugy" : "-3dfx");

/**
 * Splits the free form custom arguments into single arguments.
 * Double or single quotes keep values containing spaces together,
 * e.g. -mpq "C:\\my data\\pd2data.mpq".
 */
export const splitCustomArgs = (customArgs?: string): string[] => {
  if (!customArgs) return [];

  const args: string[] = [];
  let current = "";
  let quote: string | null = null;

  for (const char of customArgs) {
    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        args.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current) args.push(current);

  return args;
};

/**
 * All arguments the game is started with: the base argument of the selected
 * launch mode plus the extra arguments chosen in the settings. Duplicates are
 * dropped so a checked -3dfx is not passed twice.
 */
export const buildLaunchArgs = (settings: LauncherSettings): string[] => {
  const base = baseLaunchArg(settings.isPlugy);
  const seen = new Set([base.toLowerCase()]);
  const args = [base];

  const extra = [
    ...(settings.launchArgs ?? []).flatMap((arg) => splitCustomArgs(arg)),
    ...splitCustomArgs(settings.customArgs),
  ];

  for (const arg of extra) {
    const key = arg.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      args.push(arg);
    }
  }

  return args;
};

/** Arguments shown in the launcher for the current settings, for display purposes. */
export const describeLaunchArgs = (settings: LauncherSettings) =>
  buildLaunchArgs(settings).join(" ");
