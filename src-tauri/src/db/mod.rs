use sqlx::{sqlite::{SqliteConnectOptions, SqlitePoolOptions}, SqlitePool};
use std::str::FromStr;
use tauri::{AppHandle, Manager};

pub async fn init_db(app: &AppHandle) -> Result<SqlitePool, sqlx::Error> {
    // Resolve o caminho físico do App Data (Funciona no Windows, macOS, Linux, Android e iOS)
    let app_dir = app.path().app_data_dir().expect("Falha ao obter diretório de dados");
    std::fs::create_dir_all(&app_dir).expect("Falha ao criar diretório de dados");
    
    let db_path = app_dir.join("os_digital.db");
    let db_url = format!("sqlite://{}?mode=rwc", db_path.display());

    let options = SqliteConnectOptions::from_str(&db_url)?
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5) // Evita contenção severa
        .connect_with(options)
        .await?;

    // Roda as migrações embutidas no binário
    sqlx::migrate!("./src/db/migrations").run(&pool).await?;

    Ok(pool)
}