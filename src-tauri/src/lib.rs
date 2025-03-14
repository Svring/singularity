// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
use tauri::path::BaseDirectory;
use toml::Value;
use std::fs::File;
use std::io::{BufReader, Read};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn load_service_config(handle: tauri::AppHandle) -> Result<Value, String> {
    // Resolve the path to the TOML file in the resources directory
    let path = handle
        .path()
        .resolve("resources/config/serviceConfig.toml", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve config path: {}", e))?;

    // Open the file
    let file = File::open(&path)
        .map_err(|e| format!("Failed to open config file at {}: {}", path.display(), e))?;

    // Read the file content into a string
    let mut reader = BufReader::new(file);
    let mut contents = String::new();

    reader
        .read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    // Parse the TOML string into a toml::Value
    let parsed: Value = contents
        .parse::<Value>()
        .map_err(|e| format!("Failed to parse TOML file: {}", e))?;

    Ok(parsed)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, load_service_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
