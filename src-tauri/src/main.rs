// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_exe_path() -> String {
    return std::env::current_exe().unwrap().parent().expect("LOL").display().to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_exe_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}