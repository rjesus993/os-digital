use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OsDigital {
    pub id: String,
    pub glpi_ticket_id: String,
    pub tecnico: String,
    pub cliente: String,
    pub endereco: String,
    pub data_visita: String,
    pub tipo_servico: String,
    pub observacoes: String,
    pub status: String,
    pub current_step: u8,
    pub created_at: i64,
    pub updated_at: i64,
    
    pub checklist: Vec<ChecklistItem>,
    pub materials: Vec<MaterialItem>,
    // Fotos e Assinaturas (Lote 5 e 6) omitidas nesta primeira migração
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChecklistItem {
    pub id: String,
    pub category: String,
    pub description: String,
    pub checked: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MaterialItem {
    pub id: String,
    pub material_id: Option<String>,
    pub name: String,
    pub category: String,
    pub quantity: i32,
    pub unit: String,
    pub observation: Option<String>,
    pub is_custom: bool,
}