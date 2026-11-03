use axum::{
    extract::Path as AxumPath,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatCompletionRequest {
    pub model: String,
    pub messages: Vec<serde_json::Value>,
    #[serde(default)]
    pub stream: bool,
    #[serde(default)]
    pub temperature: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatCompletionResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<serde_json::Value>,
    pub usage: serde_json::Value,
}

pub async fn chat_completions(
    Json(payload): Json<ChatCompletionRequest>,
) -> impl IntoResponse {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let res = ChatCompletionResponse {
        id: format!("chatcmpl-{}", uuid::Uuid::new_v4()),
        object: "chat.completion".to_string(),
        created: now,
        model: payload.model,
        choices: vec![json!({
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "A-L-L-A-H.COM LLM Router: connection acknowledged and ready."
            },
            "finish_reason": "stop"
        })],
        usage: json!({
            "prompt_tokens": 12,
            "completion_tokens": 14,
            "total_tokens": 26
        }),
    };

    (StatusCode::OK, Json(res))
}

pub async fn list_models() -> impl IntoResponse {
    let models = json!({
        "object": "list",
        "data": [
            {
                "id": "dx-default",
                "object": "model",
                "owned_by": "moonwitness"
            },
            {
                "id": "dx-fast",
                "object": "model",
                "owned_by": "moonwitness"
            },
            {
                "id": "dx-reasoning",
                "object": "model",
                "owned_by": "moonwitness"
            }
        ]
    });
    (StatusCode::OK, Json(models))
}

pub async fn get_sdui_view(
    AxumPath((model, view_type)): AxumPath<(String, String)>,
) -> impl IntoResponse {
    let schema = json!({
        "model": model,
        "view_type": view_type,
        "title": format!("{} View", model),
        "fields": [
            {"name": "name", "label": "Name", "type": "char", "sortable": true},
            {"name": "active", "label": "Active", "type": "boolean", "badge": true},
            {"name": "create_date", "label": "Created", "type": "datetime", "sortable": true}
        ]
    });
    (StatusCode::OK, Json(schema))
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("v1")
        .add("/chat/completions", post(chat_completions))
        .add("/models", get(list_models))
        .add("/sdui/{model}/{view_type}", get(get_sdui_view))
}
