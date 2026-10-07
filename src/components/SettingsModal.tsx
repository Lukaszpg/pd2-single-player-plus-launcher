import {
  Button,
  CSSProperties,
  Checkbox,
  Modal,
  Stack,
  TextInput,
  Group,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { LauncherSettings, ProjectDiabloSettings } from "../types";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import {
  COMMON_LAUNCH_ARGS,
  DEFAULT_LAUNCHER_SETTINGS,
  DIABLO2_STRING,
  PLUGY_STRING,
  PROJECT_DIABLO_SETTINGS_STRING,
} from "../constants";
import { fixedResourcePath } from "../util/fixedResourcePath";
import { gameDirectory, setGameDirectory } from "../util/gamePath";
import { downloadAllFiles } from "../util/downloadAll";
import { open } from "@tauri-apps/api/dialog";
import {
  readLauncherSettings,
  writeLauncherSettings,
} from "../util/launcherSettings";

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

const whiteLabel = { color: "white" };
const greyDescription = { color: "#9ca3af" };
const darkInput = { color: "white", backgroundColor: "#1a1a1a" };

const customArgsDescription =
  'Any other arguments, separated by spaces. Use quotes for values containing spaces, e.g. -mpq "C:\\my data\\pd2data.mpq"';

const checkboxDescription = (
  <div>
    <p className="mt-2">
      <span className="text-red-500">Warning</span>: This setting HAS TO
	  be checked if you want to play with PlugY, otherwise the game won't launch!
    </p>
  </div>
);

function SettingsModal({ opened, close, setIsDownloading }: SettingsModalType) {
  const [tempSettings, setTempSettings] = useState<LauncherSettings>({
    ...DEFAULT_LAUNCHER_SETTINGS,
    launchArgs: [],
  });
  const [gamePathStatus, setGamePathStatus] = useState("Checking...");
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
          installpath: "C:\\Program Files (x86)\\PD2-Single-Player-Plus\\",
          save_path: "C:\\Program Files (x86)\\PD2-Single-Player-Plus\\Save\\",
        },
      },
      pd2_game_settings: {
        equipment_lock: { enabled: true, hotkey: "None" },
      },
    });

  const readProjectDiabloSettings = async () => {
    const path = await gameDirectory();
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
    const settingsToSave: LauncherSettings = {
      ...tempSettings,
      gamePath: tempSettings.gamePath.trim(),
      customArgs: tempSettings.customArgs.trim(),
    };

    await writeLauncherSettings(settingsToSave);

    // Everything below belongs to the game folder, so apply the new location
    // before writing the game settings.
    setGameDirectory(settingsToSave.gamePath);
    const path = await gameDirectory();
	
	//Fix for invalid save path
	if(projectDiabloTempSettings.classic_game_settings.other.save_path.substr(projectDiabloTempSettings.classic_game_settings.other.save_path.length - 1) !== "\\") {
		projectDiabloTempSettings.classic_game_settings.other.save_path = projectDiabloTempSettings.classic_game_settings.other.save_path + "\\";
	}
	
    await writeTextFile({
      path: `${path}\\${PROJECT_DIABLO_SETTINGS_STRING}`,
      contents: JSON.stringify(projectDiabloTempSettings),
    });

    close();
    setIsDownloading(true);
    await downloadAllFiles();
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

  const changeGamePath = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: tempSettings.gamePath || (await fixedResourcePath()),
    });

    if (selected)
      setTempSettings((current) => ({
        ...current,
        gamePath: selected as string,
      }));
  };

  const useLauncherFolder = () => {
    setTempSettings((current) => ({ ...current, gamePath: "" }));
  };

  useEffect(() => {
    (async () => {
      const launcherSettings = await readLauncherSettings();
      const projectDiabloSettings = await readProjectDiabloSettings();
      setProjectDiabloTempSettings(projectDiabloSettings);
      setTempSettings(launcherSettings);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const directory = tempSettings.gamePath.trim() || (await fixedResourcePath());
      const found: string[] = [];

      if (await exists(`${directory}\\${DIABLO2_STRING}`)) found.push(DIABLO2_STRING);
      if (await exists(`${directory}\\${PLUGY_STRING}`)) found.push(PLUGY_STRING);

      setGamePathStatus(
        found.length > 0
          ? `${directory} — found ${found.join(", ")}`
          : `${directory} — no ${DIABLO2_STRING} or ${PLUGY_STRING} found`
      );
    })();
  }, [tempSettings.gamePath]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Settings"
      centered
      size="70%"
      styles={{
        content: { ...modalContent, maxHeight: "85vh", overflowY: "auto" },
        header: modalHeader,
      }}
      overlayProps={{
        backgroundOpacity: 0.65,
        blur: 5,
      }}
    >
	<Checkbox
        checked={tempSettings.isPlugy}
        onChange={(e) =>
          setTempSettings((current) => ({
            ...current,
            isPlugy: e.currentTarget.checked,
          }))
        }
        label="Play with PlugY"
		styles={{ label: whiteLabel }}
        description={checkboxDescription}
      />
      <TextInput
        mt="md"
        label="Game directory"
        description="Folder that contains Diablo II.exe (and PlugY.exe when playing with PlugY). Leave empty to use the folder the launcher is installed in."
        placeholder="Launcher folder"
        value={tempSettings.gamePath}
        onChange={(event) =>
          setTempSettings((current) => ({
            ...current,
            gamePath: event.currentTarget.value,
          }))
        }
        styles={{ label: whiteLabel, description: greyDescription, input: darkInput }}
      />
      <Group mt="8px">
        <Button onClick={changeGamePath}>Change Game Directory</Button>
        <Button variant="default" onClick={useLauncherFolder}>
          Use Launcher Folder
        </Button>
      </Group>
      <p className="mt-2 mb-0 text-xs" style={{ color: "#9ca3af" }}>
        {gamePathStatus}
      </p>
      <Checkbox.Group
        mt="lg"
        label="Launch options"
        description="Extra arguments passed to the game on launch. -plugy is used with PlugY, -3dfx without it."
        value={tempSettings.launchArgs}
        onChange={(launchArgs) =>
          setTempSettings((current) => ({ ...current, launchArgs }))
        }
        styles={{ label: whiteLabel, description: greyDescription }}
      >
        <Stack mt="xs" gap="xs">
          {COMMON_LAUNCH_ARGS.map((argument) => (
            <Checkbox
              key={argument.value}
              value={argument.value}
              label={argument.label}
              description={argument.description}
              styles={{ label: whiteLabel, description: greyDescription }}
            />
          ))}
        </Stack>
      </Checkbox.Group>
      <TextInput
        mt="md"
        label="Custom arguments"
        description={customArgsDescription}
        placeholder="-direct -txt -w"
        value={tempSettings.customArgs}
        onChange={(event) =>
          setTempSettings((current) => ({
            ...current,
            customArgs: event.currentTarget.value,
          }))
        }
        styles={{ label: whiteLabel, description: greyDescription, input: darkInput }}
      />
      <TextInput
        mt="md"
        label="Save Path"
        description="The directory that your characters and stash saves are located"
        value={projectDiabloTempSettings?.classic_game_settings.other.save_path}
        styles={{ label: whiteLabel, description: greyDescription }}
        disabled
      />
	  <Button mt="8px" onClick={changeSavePath}>
	       Change Save Path
      </Button>
	  <Group justify="right">
        <Button onClick={onClose}>
          <p>Cancel</p>
        </Button>
        <Button onClick={onSave}>
          <p className="opacity-80">Save</p>
        </Button>
		</Group>
    </Modal>
  );
}

export default SettingsModal;
