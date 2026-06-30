use serde::Serialize;
use std::fs;
use std::path::Path;
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
pub struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<FileEntry>>,
}

fn read_dir_recursive(path: &Path) -> Vec<FileEntry> {
    let mut entries = vec![];
    let Ok(dir) = fs::read_dir(path) else { return entries; };

    let mut items: Vec<_> = dir.filter_map(|e| e.ok()).collect();
    items.sort_by_key(|e| {
        let is_file = e.file_type().map(|t| t.is_file()).unwrap_or(false);
        (is_file as u8, e.file_name())
    });

    for entry in items {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        let path_str = entry_path.to_string_lossy().to_string();
        let is_dir = entry_path.is_dir();

        let children = if is_dir {
            Some(read_dir_recursive(&entry_path))
        } else {
            None
        };

        entries.push(FileEntry { name, path: path_str, is_dir, children });
    }
    entries
}

#[tauri::command]
async fn open_folder(app: tauri::AppHandle) -> Option<String> {
    app.dialog()
        .file()
        .blocking_pick_folder()
        .map(|p| p.to_string())
}

#[tauri::command]
fn read_dir(path: String) -> Vec<FileEntry> {
    read_dir_recursive(Path::new(&path))
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_dir(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_pty::init())
        .invoke_handler(tauri::generate_handler![open_folder, read_dir, read_file, write_file, create_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}