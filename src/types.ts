export type Sublink = {
  title: string;
  url: string;
};

export type LauncherJson = {
  sublinks: Sublink[];
};

export type LauncherSettings = {
  craftingLeague: boolean;
};

export type Json = {
  date: string;
  latestPatchNotes: string;
  version: string;
};

export type PlayType = {
  latestJson?: Json;
};
