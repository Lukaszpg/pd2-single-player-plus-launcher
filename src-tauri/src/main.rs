// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::PathBuf;
use std::process::Command;

/// Executables the launcher is allowed to start inside the game directory.
const ALLOWED_EXECUTABLES: [&str; 2] = ["PlugY.exe", "Diablo II.exe"];

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_exe_path() -> String {
    return std::env::current_exe().unwrap().parent().expect("LOL").display().to_string()
}

/// Starts the game from the configured directory with the configured arguments.
///
/// This is done on the Rust side because the Tauri shell scope only allows the
/// executables inside the resource folder, while the game folder is chosen by
/// the user and can be anywhere.
#[tauri::command]
fn launch_game(dir: String, exe: String, args: Vec<String>) -> Result<(), String> {
    if !ALLOWED_EXECUTABLES.contains(&exe.as_str()) {
        return Err(format!("{} is not a supported game executable.", exe));
    }

    let game_dir = PathBuf::from(&dir);
    if !game_dir.is_dir() {
        return Err(format!("Game directory not found: {}", game_dir.display()));
    }

    let executable = game_dir.join(&exe);
    if !executable.is_file() {
        return Err(format!("{} not found in {}", exe, game_dir.display()));
    }

    Command::new(&executable)
        .args(&args)
        .current_dir(&game_dir)
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("Could not start {}: {}", executable.display(), error))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_exe_path, launch_game])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
