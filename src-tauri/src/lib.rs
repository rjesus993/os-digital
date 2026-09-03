mod commands;
mod db;
mod models;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // Inicializamos o DB num bloco assíncrono interno
            tauri::async_runtime::block_on(async move {
                match db::init_db(&app_handle).await {
                    Ok(pool) => {
                        // Injeta o Pool de Conexão no Estado do Tauri
                        app_handle.manage(pool);
                        println!("Banco de dados SQLite iniciado com sucesso.");
                    }
                    Err(e) => {
                        eprintln!("Erro crítico ao iniciar o banco: {}", e);
                    }
                }
            });
            Ok(())
        })
        // Registra os comandos de bridge
        .invoke_handler(tauri::generate_handler![
            commands::os_commands::save_os_to_sqlite,
            commands::os_commands::process_and_save_photo,
            commands::media_commands::save_signature,
            commands::os_commands::get_draft_os,
            commands::os_commands::generate_os_pdf,
            commands::sync_commands::process_sync_queue
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}