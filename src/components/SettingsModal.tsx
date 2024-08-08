import { Checkbox, CSSProperties, Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import { LauncherSettings } from "../types";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { LAUNCHER_SETTINGS_STRING } from "../constants";
import { fixedResourcePath } from "../util/fixedResourcePath";
import { downloadAllFiles } from "../util/downloadAll";

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

  const readLauncherSettings = async () => {
    const path = await fixedResourcePath();
    const launcherSettings: LauncherSettings = JSON.parse(
      await readTextFile(`${path}\\${LAUNCHER_SETTINGS_STRING}`)
    );

    return launcherSettings;
  };

  const onClose = async () => {
    const launcherSettings = await readLauncherSettings();
    setTempSettings(launcherSettings);
    close();
  };

  const onSave = async () => {
    const path = await fixedResourcePath();
    await writeTextFile({
      path: `${path}\\${LAUNCHER_SETTINGS_STRING}`,
      contents: JSON.stringify(tempSettings),
    });

    close();
    setIsDownloading(true);
    await downloadAllFiles(tempSettings);
    setIsDownloading(false);
  };

  useEffect(() => {
    (async () => {
      const launcherSettings = await readLauncherSettings();
      setTempSettings(launcherSettings);
    })();
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Settings"
      centered
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
      <div className="flex justify-end w-full pt-8">
        <button
          onClick={onClose}
          className="group rounded-lg border border-transparent p-2 m-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 min-w-20"
        >
          <p className="opacity-80">Cancel</p>
        </button>
        <button
          onClick={onSave}
          className="group rounded-lg border border-transparent p-2 m-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 bg-neutral-800 min-w-20"
        >
          <p className="opacity-80">Save</p>
        </button>
      </div>
    </Modal>
  );
}

export default SettingsModal;
