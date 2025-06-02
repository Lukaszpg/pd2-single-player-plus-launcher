export type Sublink = {
  title: string;
  url: string;
};

export type LauncherJson = {
  sublinks: Sublink[];
};

export type LauncherSettings = {
  isPlugy: boolean;
};

export type Json = {
  date: string;
  latestPatchNotes: string;
  version: string;
  dataChecksum: string;
};

export type PlayType = {
  latestJson?: Json;
};

export type ProjectDiabloSettings = {
  classic_game_settings: {
    audio: {
      sound_mixer: number;
      master_volume: number;
      music_volume: number;
      positional_bias: number;
      npc_speech: number;
      options_music: number;
    };
    video: {
      contrast: number;
      gamma: number;
      perspective: number;
      light_quality: number;
      blended_shadows: number;
    };
    map: {
      automapfade: number;
      automap_centers: number;
      automap_party: number;
      automap_party_names: number;
      automap_left: number;
      automapmode: number;
    };
    ui: {
      show_hp_text: number;
      show_mp_text: number;
      help_menu: number;
      popuphireling: number;
      always_run: number;
      mini_panel: number;
    };
    bnet: {
      skip_to_open: number;
      aux_battle_net: string;
      lasttcpip: string;
      preferred_realm: string;
      default_channel: string;
      last_bnet: string;
      max_player: number;
      diff_level: number;
      lvl_rest: number;
      selected_game_server: number;
    };
    other: {
      lng_file: string;
      installpath: string;
      save_path: string;
    };
  };
  pd2_game_settings: {
    equipment_lock: {
      enabled: boolean;
      hotkey: string;
    };
  };
};
