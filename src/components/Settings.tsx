type SettingsType = {
  open: () => void;
  isDownloading: boolean;
};

function Settings({ open, isDownloading }: SettingsType) {
  return (
    <button
      onClick={open}
      className="group rounded-lg border border-transparent p-2 m-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 min-w-8"
      disabled={isDownloading}
    >
      <p className={isDownloading ? "opacity-30" : "opacity-70"}>Settings</p>
    </button>
  );
}

export default Settings;
