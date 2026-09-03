use sqlx::SqlitePool;
use tauri::State;
use crate::models::os::{OsDigital, ChecklistItem, MaterialItem, PhotoItem, SignatureItem};

// Comando exposto ao React para o Auto-save
#[tauri::command]
pub async fn save_os_to_sqlite(
    os: OsDigital,
    db: State<'_, SqlitePool>,
) -> Result<(), String> {
    
    // Inicia a transação (tudo ou nada)
    let mut tx = db.begin().await.map_err(|e| e.to_string())?;

    // 1. Upsert da OS principal
    sqlx::query(
        r#"
        INSERT INTO os (id, glpi_ticket_id, tecnico, cliente, endereco, data_visita, tipo_servico, observacoes, status, current_step, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            glpi_ticket_id = excluded.glpi_ticket_id,
            tecnico = excluded.tecnico,
            cliente = excluded.cliente,
            endereco = excluded.endereco,
            data_visita = excluded.data_visita,
            tipo_servico = excluded.tipo_servico,
            observacoes = excluded.observacoes,
            status = excluded.status,
            current_step = excluded.current_step,
            updated_at = excluded.updated_at
        "#
    )
    .bind(&os.id)
    .bind(&os.glpi_ticket_id)
    .bind(&os.tecnico)
    .bind(&os.cliente)
    .bind(&os.endereco)
    .bind(&os.data_visita)
    .bind(&os.tipo_servico)
    .bind(&os.observacoes)
    .bind(&os.status)
    .bind(os.current_step as i64)
    .bind(os.created_at)
    .bind(os.updated_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    // 2. Para checklist e materiais (sendo um auto-save contínuo),
    // a estratégia mais segura offline é deletar os filhos e recriar.
    sqlx::query("DELETE FROM os_checklist WHERE os_id = ?")
        .bind(&os.id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
        
    for item in os.checklist {
        sqlx::query(
            "INSERT INTO os_checklist (id, os_id, category, description, checked) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(&item.id)
        .bind(&os.id)
        .bind(&item.category)
        .bind(&item.description)
        .bind(item.checked)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // Mesma lógica para os materiais...
    sqlx::query("DELETE FROM os_materials WHERE os_id = ?")
        .bind(&os.id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    for mat in os.materials {
        sqlx::query(
            "INSERT INTO os_materials (id, os_id, material_id, name, category, quantity, unit, observation, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&mat.id)
        .bind(&os.id)
        .bind(&mat.material_id)
        .bind(&mat.name)
        .bind(&mat.category)
        .bind(mat.quantity)
        .bind(&mat.unit)
        .bind(&mat.observation)
        .bind(mat.is_custom)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // Fotos
    sqlx::query("DELETE FROM os_photos WHERE os_id = ?")
        .bind(&os.id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    for photo in os.photos {
        sqlx::query(
            "INSERT INTO os_photos (id, os_id, filename, storage_path, caption, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&photo.id)
        .bind(&os.id)
        .bind(&photo.filename)
        .bind(&photo.storage_path)
        .bind(&photo.caption)
        .bind(&photo.category)
        .bind(photo.created_at)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // Assinaturas
    sqlx::query("DELETE FROM os_signatures WHERE os_id = ?")
        .bind(&os.id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    for sig in os.signatures {
        sqlx::query(
            "INSERT INTO os_signatures (id, os_id, sig_type, file_path, created_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(&sig.id)
        .bind(&os.id)
        .bind(&sig.sig_type)
        .bind(&sig.file_path)
        .bind(sig.created_at)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // Consolida no SQLite
    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_draft_os(db: State<'_, SqlitePool>) -> Result<Option<OsDigital>, String> {
    // Busca a última OS que não foi finalizada/sincronizada
    let os_record = sqlx::query(
        "SELECT * FROM os WHERE status IN ('DRAFT', 'IN_PROGRESS') ORDER BY updated_at DESC LIMIT 1"
    )
    .fetch_optional(&*db)
    .await
    .map_err(|e| e.to_string())?;

    if let Some(record) = os_record {
        // Busca os filhos (Checklist, Materiais, Fotos e Assinaturas)
        let checklist_records = sqlx::query("SELECT * FROM os_checklist WHERE os_id = ?")
            .bind(&record.get::<String, _>("id"))
            .fetch_all(&*db)
            .await
            .map_err(|e| e.to_string())?;
            
        let materials_records = sqlx::query("SELECT * FROM os_materials WHERE os_id = ?")
            .bind(&record.get::<String, _>("id"))
            .fetch_all(&*db)
            .await
            .map_err(|e| e.to_string())?;

        let photos_records = sqlx::query("SELECT * FROM os_photos WHERE os_id = ?")
            .bind(&record.get::<String, _>("id"))
            .fetch_all(&*db)
            .await
            .map_err(|e| e.to_string())?;

        let signatures_records = sqlx::query("SELECT * FROM os_signatures WHERE os_id = ?")
            .bind(&record.get::<String, _>("id"))
            .fetch_all(&*db)
            .await
            .map_err(|e| e.to_string())?;

        let checklist = checklist_records.into_iter().map(|c| ChecklistItem {
            id: c.get("id"),
            category: c.get("category"),
            description: c.get("description"),
            checked: c.get("checked"),
        }).collect();

        let materials = materials_records.into_iter().map(|m| MaterialItem {
            id: m.get("id"),
            material_id: m.get("material_id"),
            name: m.get("name"),
            category: m.get("category"),
            quantity: m.get::<i64, _>("quantity") as i32,
            unit: m.get("unit"),
            observation: m.get("observation"),
            is_custom: m.get("is_custom"),
        }).collect();

        let photos = photos_records.into_iter().map(|p| PhotoItem {
            id: p.get("id"),
            os_id: p.get("os_id"),
            filename: p.get("filename"),
            storage_path: p.get("storage_path"),
            caption: p.get("caption"),
            category: p.get("category"),
            created_at: p.get("created_at"),
        }).collect();

        let signatures = signatures_records.into_iter().map(|s| SignatureItem {
            id: s.get("id"),
            os_id: s.get("os_id"),
            sig_type: s.get("sig_type"),
            file_path: s.get("file_path"),
            created_at: s.get("created_at"),
        }).collect();

        Ok(Some(OsDigital {
            id: record.get("id"),
            glpi_ticket_id: record.get("glpi_ticket_id"),
            tecnico: record.get("tecnico"),
            cliente: record.get("cliente"),
            endereco: record.get("endereco"),
            data_visita: record.get("data_visita"),
            tipo_servico: record.get("tipo_servico"),
            observacoes: record.get("observacoes"),
            status: record.get("status"),
            current_step: record.get::<i64, _>("current_step") as u8,
            created_at: record.get("created_at"),
            updated_at: record.get("updated_at"),
            checklist,
            materials,
            photos,
            signatures,
        }))
    } else {
        Ok(None)
    }
}