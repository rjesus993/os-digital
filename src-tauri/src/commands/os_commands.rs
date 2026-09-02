use sqlx::SqlitePool;
use tauri::State;
use crate::models::os::{OsDigital, ChecklistItem, MaterialItem};

// Comando exposto ao React para o Auto-save
#[tauri::command]
pub async fn save_os_to_sqlite(
    os: OsDigital,
    db: State<'_, SqlitePool>,
) -> Result<(), String> {
    
    // Inicia a transação (tudo ou nada)
    let mut tx = db.begin().await.map_err(|e| e.to_string())?;

    // 1. Upsert da OS principal
    sqlx::query!(
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
        "#,
        os.id, os.glpi_ticket_id, os.tecnico, os.cliente, os.endereco, os.data_visita, os.tipo_servico, os.observacoes, os.status, os.current_step, os.created_at, os.updated_at
    )
    .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    // 2. Para checklist e materiais (sendo um auto-save contínuo),
    // a estratégia mais segura offline é deletar os filhos e recriar.
    sqlx::query!("DELETE FROM os_checklist WHERE os_id = ?", os.id)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;
        
    for item in os.checklist {
        sqlx::query!(
            "INSERT INTO os_checklist (id, os_id, category, description, checked) VALUES (?, ?, ?, ?, ?)",
            item.id, os.id, item.category, item.description, item.checked
        )
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    // Mesma lógica para os materiais...
    sqlx::query!("DELETE FROM os_materials WHERE os_id = ?", os.id)
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;

    for mat in os.materials {
        sqlx::query!(
            "INSERT INTO os_materials (id, os_id, material_id, name, category, quantity, unit, observation, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            mat.id, os.id, mat.material_id, mat.name, mat.category, mat.quantity, mat.unit, mat.observation, mat.is_custom
        )
        .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    // Consolida no SQLite
    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}
pub async fn get_draft_os(db: State<'_, SqlitePool>) -> Result<Option<OsDigital>, String> {
    // Busca a última OS que não foi finalizada/sincronizada
    let os_record = sqlx::query!(
        "SELECT * FROM os WHERE status IN ('DRAFT', 'IN_PROGRESS') ORDER BY updated_at DESC LIMIT 1"
    )
    .fetch_optional(&*db).await.map_err(|e| e.to_string())?;

    if let Some(record) = os_record {
        // Busca os filhos (Checklist e Materiais)
        let checklist_records = sqlx::query!("SELECT * FROM os_checklist WHERE os_id = ?", record.id)
            .fetch_all(&*db).await.map_err(|e| e.to_string())?;
            
        let materials_records = sqlx::query!("SELECT * FROM os_materials WHERE os_id = ?", record.id)
            .fetch_all(&*db).await.map_err(|e| e.to_string())?;

        let checklist = checklist_records.into_iter().map(|c| ChecklistItem {
            id: c.id, category: c.category, description: c.description, checked: c.checked,
        }).collect();

        let materials = materials_records.into_iter().map(|m| MaterialItem {
            id: m.id, material_id: m.material_id, name: m.name, category: m.category, 
            quantity: m.quantity as i32, unit: m.unit, observation: m.observation, is_custom: m.is_custom,
        }).collect();

        Ok(Some(OsDigital {
            id: record.id, glpi_ticket_id: record.glpi_ticket_id, tecnico: record.tecnico,
            cliente: record.cliente, endereco: record.endereco, data_visita: record.data_visita,
            tipo_servico: record.tipo_servico, observacoes: record.observacoes, status: record.status,
            current_step: record.current_step as u8, created_at: record.created_at, updated_at: record.updated_at,
            checklist, materials,
        }))
    } else {
        Ok(None)
    }
}