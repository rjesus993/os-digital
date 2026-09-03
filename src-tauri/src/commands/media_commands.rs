use tauri::{AppHandle, Manager};
use std::fs;
use std::io::Cursor;
use uuid::Uuid;
use crate::models::os::{PhotoItem, SignatureItem};

#[tauri::command]
pub async fn process_and_save_photo(
    app: AppHandle,
    os_id: String,
    photo_bytes: Vec<u8>,
) -> Result<PhotoItem, String> {
    // 1. Processamento e Compressão Nativa (Evitando OOM)
    // Carrega a imagem da memória diretamente dos bytes
    let img = image::load_from_memory(&photo_bytes).map_err(|e| format!("Erro ao ler imagem: {}", e))?;
    
    // Redimensiona mantendo a proporção (máximo 1280x1280 para boa qualidade em relatórios)
    let resized_img = img.resize(1280, 1280, image::imageops::FilterType::Triangle);

    // 2. Preparação do File System
    let app_dir = app.path().app_data_dir().ok_or("Falha ao acessar diretório de dados")?;
    let photos_dir = app_dir.join("photos").join(&os_id);
    
    fs::create_dir_all(&photos_dir).map_err(|e| format!("Erro ao criar pasta: {}", e))?;

    // 3. Salvamento no Disco
    let photo_id = Uuid::new_v4().to_string();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;

    let file_name = format!("{}_{}.jpg", photo_id, timestamp);
    let file_path = photos_dir.join(&file_name);

    // Comprime e salva diretamente no arquivo
    let mut file = std::fs::File::create(&file_path).map_err(|e| e.to_string())?;
    
    // Escreve JPEG com qualidade 80% diretamente no arquivo
    resized_img.write_to(&mut file, image::ImageFormat::Jpeg)
        .map_err(|e| format!("Erro ao salvar imagem JPEG: {}", e))?;

    // 4. Retorna os Metadados para o Frontend (O SQLite será atualizado pelo Auto-Save)
    Ok(PhotoItem {
        id: photo_id,
        os_id,
        filename: file_name,
        storage_path: file_path.to_string_lossy().to_string(),
        caption: None,
        category: "general".to_string(),
        created_at: timestamp,
    })
}

#[tauri::command]
pub async fn save_signature(
    app: AppHandle,
    os_id: String,
    sig_type: String, // 'technician' ou 'client'
    image_bytes: Vec<u8>,
) -> Result<SignatureItem, String> {
    
    // 1. Preparação do File System
    let app_dir = app.path().app_data_dir().ok_or("Falha ao acessar diretório")?;
    let sig_dir = app_dir.join("signatures").join(&os_id);
    
    fs::create_dir_all(&sig_dir).map_err(|e| format!("Erro ao criar pasta: {}", e))?;

    // 2. Geração de IDs e Metadados
    let sig_id = Uuid::new_v4().to_string();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;

    let file_name = format!("{}_{}_{}.png", sig_type, sig_id, timestamp);
    let file_path = sig_dir.join(&file_name);

    // 3. Salvamento Direto (Os bytes já vêm codificados como PNG do frontend)
    std::fs::write(&file_path, &image_bytes).map_err(|e| format!("Erro ao gravar assinatura: {}", e))?;

    // 4. Retorno para o Zustand
    Ok(SignatureItem {
        id: sig_id,
        os_id,
        sig_type,
        file_path: file_path.to_string_lossy().to_string(),
        created_at: timestamp,
    })
}