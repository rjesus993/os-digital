use tauri::{AppHandle, Manager, State};
use sqlx::SqlitePool;
use reqwest::Client;
use std::fs;

#[tauri::command]
pub async fn process_sync_queue(
    app: AppHandle,
    db: State<'_, SqlitePool>,
) -> Result<usize, String> {
    // 1. Busca todas as OS com status READY_TO_SUBMIT
    let pending_oss = sqlx::query!(
        "SELECT id, glpi_ticket_id FROM os WHERE status = 'READY_TO_SUBMIT'"
    )
    .fetch_all(&*db).await.map_err(|e| e.to_string())?;

    if pending_oss.is_empty() {
        return Ok(0);
    }

    let client = Client::new();
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let mut synced_count = 0;

    for row in pending_oss {
        let os_id = row.id;

        // Atualiza status temporariamente para SYNCING
        sqlx::query!("UPDATE os SET status = 'SYNCING' WHERE id = ?", os_id)
            .execute(&*db).await.map_err(|e| e.to_string())?;

        // Simulação do payload e envio multipart (incluindo o PDF compilado)
        let pdf_path = app_dir.join("pdfs").join(format!("{}.pdf", row.glpi_ticket_id));
        
        let mut upload_success = true;
        if pdf_path.exists() {
            // Exemplo conceitual de requisição HTTP POST multipart para o servidor central
            // let file_bytes = fs::read(&pdf_path).map_err(|e| e.to_string())?;
            // let part = reqwest::multipart::Part::bytes(file_bytes).file_name(format!("{}.pdf", row.glpi_ticket_id));
            // let form = reqwest::multipart::Form::new().part("file", part);
            // let res = client.post("https://api.suaempresa.com/v1/os/sync")
            //     .multipart(form)
            //     .send()
            //     .await;
            // upload_success = res.is_ok() && res.unwrap().status().is_success();
        }

        if upload_success {
            // Marca como sincronizado com sucesso
            sqlx::query!("UPDATE os SET status = 'SYNCED', updated_at = ? WHERE id = ?", chrono::Utc::now().timestamp_millis(), os_id)
                .execute(&*db).await.map_err(|e| e.to_string())?;
            synced_count += 1;
        } else {
            // Reverte para READY_TO_SUBMIT em caso de falha de rede para tentar novamente depois
            sqlx::query!("UPDATE os SET status = 'READY_TO_SUBMIT' WHERE id = ?", os_id)
                .execute(&*db).await.map_err(|e| e.to_string())?;
        }
    }

    Ok(synced_count)
}