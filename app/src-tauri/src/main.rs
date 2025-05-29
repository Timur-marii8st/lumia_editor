// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use anyhow::Result;

fn main() -> Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
        ])
        .run(tauri::generate_context!())
        .map_err(|e| {
            // Обработка ошибок при запуске Tauri.
            eprintln!("Ошибка выполнения Tauri приложения: {:?}", e);
            anyhow::Error::from(e)
        })
}