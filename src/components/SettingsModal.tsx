import {
  Button,
  Checkbox,
  CSSProperties,
  Modal,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { LauncherSettings, ProjectDiabloSettings } from "../types";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import {
  LAUNCHER_SETTINGS_STRING,
  PROJECT_DIABLO_SETTINGS_STRING,
} from "../constants";
import { fixedResourcePath } from "../util/fixedResourcePath";
import { downloadAllFiles } from "../util/downloadAll";
import { open } from "@tauri-apps/api/dialog";

type SettingsModalType = {
  opened: boolean;
  close: () => void;
  launcherSettings: LauncherSettings;
  setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>;
};

const modalContent: CSSProperties = {
  backgroundColor: "#0a0a0a",
  borderColor: "#6b7280",
};

const modalHeader: CSSProperties = {
  backgroundColor: "#0a0a0a",
};

const checkboxDescription = (
  <div>
    <p>Uniques, sets, and runewords are prevented from drops/creation</p>
    <p className="mt-2">
      <span className="text-red-500">Warning</span>: Changing this too often has
      potential to brick your characters/stash. Make sure to always backup!
    </p>
  </div>
);

function SettingsModal({ opened, close, setIsDownloading }: SettingsModalType) {
  const [tempSettings, setTempSettings] = useState<LauncherSettings>({
    craftingLeague: false,
  });
  const [projectDiabloTempSettings, setProjectDiabloTempSettings] =
    useState<ProjectDiabloSettings>({
      classic_game_settings: {
        audio: {
          sound_mixer: 0,
          master_volume: 0,
          music_volume: 0,
          positional_bias: 0,
          npc_speech: 2,
          options_music: 0,
        },
        video: {
          contrast: 34,
          gamma: 155,
          perspective: 0,
          light_quality: 2,
          blended_shadows: 1,
        },
        map: {
          automapfade: 3,
          automap_centers: 1,
          automap_party: 1,
          automap_party_names: 1,
          automap_left: 1,
          automapmode: 0,
        },
        ui: {
          show_hp_text: 1,
          show_mp_text: 1,
          help_menu: 1,
          popuphireling: 1,
          always_run: 1,
          mini_panel: 0,
        },
        bnet: {
          skip_to_open: 0,
          aux_battle_net: "",
          lasttcpip: "",
          preferred_realm: "ProjectD2",
          default_channel: "",
          last_bnet: "",
          max_player: 8,
          diff_level: 2,
          lvl_rest: 666,
          selected_game_server: 1,
        },
        other: {
          lng_file: "",
          installpath: "C:\\Program Files (x86)\\PD2-Reawakening\\",
          save_path: "C:\\Program Files (x86)\\PD2-Reawakening\\Save",
        },
      },
      pd2_game_settings: {
        equipment_lock: { enabled: true, hotkey: "None" },
      },
    });

  const readLauncherSettings = async () => {
    const path = await fixedResourcePath();
    const launcherSettings: LauncherSettings = JSON.parse(
      await readTextFile(`${path}\\${LAUNCHER_SETTINGS_STRING}`)
    );

    return launcherSettings;
  };

  const readProjectDiabloSettings = async () => {
    const path = await fixedResourcePath();
    const text: ProjectDiabloSettings = JSON.parse(
      await readTextFile(`${path}\\${PROJECT_DIABLO_SETTINGS_STRING}`)
    );

    return text;
  };

  const onClose = async () => {
    const launcherSettings = await readLauncherSettings();
    const projectDiabloSettings = await readProjectDiabloSettings();
    setTempSettings(launcherSettings);
    setProjectDiabloTempSettings(projectDiabloSettings);
    close();
  };

  const onSave = async () => {
    const path = await fixedResourcePath();
    await writeTextFile({
      path: `${path}\\${LAUNCHER_SETTINGS_STRING}`,
      contents: JSON.stringify(tempSettings),
    });
    await writeTextFile({
      path: `${path}\\${PROJECT_DIABLO_SETTINGS_STRING}`,
      contents: JSON.stringify(projectDiabloTempSettings),
    });

    close();
    setIsDownloading(true);
    await downloadAllFiles(tempSettings);
    setIsDownloading(false);
  };

  const changeSavePath = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath:
        projectDiabloTempSettings?.classic_game_settings.other.save_path,
    });

    if (selected)
      setProjectDiabloTempSettings((currState) => ({
        ...currState,
        classic_game_settings: {
          ...currState.classic_game_settings,
          other: {
            ...currState.classic_game_settings.other,
            save_path: selected as string,
          },
        },
      }));
  };

  useEffect(() => {
    (async () => {
      const launcherSettings = await readLauncherSettings();
      const projectDiabloSettings = await readProjectDiabloSettings();
      setProjectDiabloTempSettings(projectDiabloSettings);
      setTempSettings(launcherSettings);
    })();
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Settings"
      centered
      size="70%"
      styles={{
        content: modalContent,
        header: modalHeader,
      }}
      overlayProps={{
        backgroundOpacity: 0.65,
        blur: 5,
      }}
    >
      <Checkbox
        checked={tempSettings.craftingLeague}
        onChange={(e) =>
          setTempSettings({ craftingLeague: e.currentTarget.checked })
        }
        label="Crafting League"
        color="red"
        description={checkboxDescription}
      />
      <TextInput
        mt="md"
        label="Save Path"
        description="The directory that your characters and stash saves are located"
        value={projectDiabloTempSettings?.classic_game_settings.other.save_path}
        disabled
      />
      <Button mt="8px" color="dark" onClick={changeSavePath}>
        Change Save Path
      </Button>
      <div className="flex justify-end w-full pt-8">
        <button
          onClick={onClose}
          className="group rounded-md border border-transparent p-2 m-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 min-w-20"
        >
          <p className="opacity-80">Cancel</p>
        </button>
        <button
          onClick={onSave}
          className="group rounded-md border border-transparent p-2 m-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 bg-neutral-800 min-w-20"
        >
          <p className="opacity-80">Save</p>
        </button>
      </div>
    </Modal>
  );
}

export default SettingsModal;
