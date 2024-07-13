use futures_util::StreamExt;
use reqwest::{header::ACCEPT, Client, Url};
use tauri::Manager;

use std::{fs::File, io::Write, path::PathBuf, time::Instant};

use crate::{progress::Progress, utils::get_filename};

const UPDATE_SPEED: u128 = 50;

#[tauri::command]
pub async fn download_file(
    url: String,
    file_id: String,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let client = Client::new();
    let parsed_url = Url::parse(&url).map_err(|e| e.to_string())?;
    let response = client
        .get(parsed_url)
        .header(ACCEPT, "application/octet-stream")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let total_size = response.content_length().unwrap_or(0);

    let file_name = get_filename(response.headers(), &file_id).unwrap();

    let download_path = app_handle
        .path()
        .download_dir()
        .map_err(|e| e.to_string())?;
    let save_path: PathBuf = [download_path, file_name.into()].iter().collect();

    let mut file = File::create(save_path).map_err(|e| e.to_string())?;
    let mut stream = response.bytes_stream();

    let mut downloaded_bytes: u64 = 0;
    let start_time = Instant::now();
    let mut last_update = Instant::now();

    let mut progress = Progress {
        download_id: file_id,
        filesize: total_size,
        transfered: 0,
        transfer_rate: 0.0,
        percentage: 0.0,
    };

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;

        downloaded_bytes += chunk.len() as u64;

        progress.transfered = downloaded_bytes;
        if total_size > 0 {
            progress.percentage = progress.transfered as f64 * 100.0 / total_size as f64;
        }
        progress.transfer_rate = (downloaded_bytes as f64) / start_time.elapsed().as_secs_f64();

        if last_update.elapsed().as_millis() >= UPDATE_SPEED {
            progress.emit_progress(&app_handle);
            last_update = std::time::Instant::now();
        }
    }

    progress.emit_finished(&app_handle);
    Ok(())
}
