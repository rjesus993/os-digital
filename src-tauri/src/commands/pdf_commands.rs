use tauri::{AppHandle, Manager, State};
use sqlx::SqlitePool;
use genpdf::{elements, fonts, Document, SimplePageDecorator};
use chrono::{DateTime, Utc};
use std::fs;

use crate::models::os::OsDigital; // Certifique-se de importar seus modelos

#[tauri::command]
pub async fn generate_os_pdf(
    app: AppHandle,
    os_id: String,
    db: State<'_, SqlitePool>,
) -> Result<String, String> {
    // 1. Busca os dados consolidados no SQLite (recuperando a OS)
    // Em um cenário real, você faria um JOIN ou buscaria os metadados das fotos/assinaturas
    let os_record = sqlx::query!("SELECT * FROM os WHERE id = ?", os_id)
        .fetch_one(&*db).await.map_err(|e| e.to_string())?;

    // 2. Configuração do Documento PDF
    // Necessita de uma fonte TTF na pasta do app. Assumiremos que existe uma fonte padrão
    let font_dir = app.path().resource_dir().unwrap().join("fonts");
    let font_family = fonts::from_files(font_dir, "Roboto", None)
        .map_err(|e| format!("Erro ao carregar fonte: {}", e))?;

    let mut doc = Document::new(font_family);
    doc.set_title(format!("OS Digital - {}", os_record.glpi_ticket_id));
    
    let mut decorator = SimplePageDecorator::new();
    decorator.set_margins(10);
    doc.set_page_decorator(decorator);

    // 3. Cabeçalho
    doc.push(elements::Paragraph::new(format!("Ordem de Serviço: {}", os_record.glpi_ticket_id))
        .aligned(genpdf::Alignment::Center));
    doc.push(elements::Break::new(1));

    // 4. Identificação do Cliente
    doc.push(elements::Paragraph::new(format!("Cliente: {}", os_record.cliente)));
    doc.push(elements::Paragraph::new(format!("Endereço: {}", os_record.endereco)));
    doc.push(elements::Paragraph::new(format!("Técnico Responsável: {}", os_record.tecnico)));
    doc.push(elements::Paragraph::new(format!("Data da Visita: {}", os_record.data_visita)));
    doc.push(elements::Break::new(2));

    // 5. Inserção de Textos e Laudos
    doc.push(elements::Paragraph::new("Observações Técnicas:"));
    doc.push(elements::Paragraph::new(os_record.observacoes));
    doc.push(elements::Break::new(2));

    // 6. Salvamento do PDF no File System
    let app_dir = app.path().app_data_dir().unwrap();
    let pdf_dir = app_dir.join("pdfs");
    fs::create_dir_all(&pdf_dir).map_err(|e| e.to_string())?;

    let file_path = pdf_dir.join(format!("{}.pdf", os_record.glpi_ticket_id));
    let mut file = std::fs::File::create(&file_path).map_err(|e| e.to_string())?;

    doc.render(&mut file).map_err(|e| format!("Erro ao renderizar PDF: {}", e))?;

    // Retorna o caminho físico do PDF gerado
    Ok(file_path.to_string_lossy().to_string())
}