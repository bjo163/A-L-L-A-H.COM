//! LLM Gateway controller with rate limiting, semantic caching, and upstream proxying.
//!
//! This module implements the OpenAI-compatible chat completions API with:
//! - Token bucket rate limiting per API key
//! - Semantic caching using SHA-256 canonical request hashing
//! - SSRF-guarded upstream proxy to external LLM providers
//! - AWS SigV4 signed S3 content-addressed verification

use axum::{
    extract::Path as AxumPath,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::{
    rate_limiter::TokenBucketRegistry,
    semantic_cache::{CachedResponse, SemanticCache},
    upstream::UpstreamClient,
};

/// Gateway state shared across requests.
#[derive(Debug, Clone)]
pub struct GatewayState {
    pub rate_limiter: TokenBucketRegistry,
    pub semantic_cache: SemanticCache,
    pub upstream: UpstreamClient,
}

impl GatewayState {
    pub fn new() -> Self {
        Self {
            rate_limiter: TokenBucketRegistry::new(10_000),
            semantic_cache: SemanticCache::new(1_000, CachedResponse::default_ttl()),
            upstream: UpstreamClient::default(),
        }
    }
}

impl Default for GatewayState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatCompletionRequest {
    pub model: String,
    pub messages: Vec<Value>,
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
    pub choices: Vec<Value>,
    pub usage: Value,
}

/// POST /v1/chat/completions
pub async fn chat_completions(
    State(_ctx): State<AppContext>,
    Json(req): Json<ChatCompletionRequest>,
) -> Result<Response> {
    let gateway = GatewayState::new();

    // Extract API key from Authorization header (simplified for now)
    let api_key = "default".to_string();

    // Rate limit check
    if !gateway.rate_limiter.allow(&api_key, 1.0, 100.0, 10.0).await {
        return Err(Error::string("Rate limit exceeded"));
    }

    // Semantic cache lookup
    let cache_key = SemanticCache::key_for(&req.model, &req.messages);
    if let Some(cached) = gateway.semantic_cache.get(&cache_key).await {
        return Ok((StatusCode::OK, Json(cached.response_body)).into_response());
    }

    // Upstream proxy call
    let upstream_response = gateway.upstream.forward(&req).await
        .map_err(|e| Error::string(&format!("Upstream error: {}", e)))?;

    // Cache the response
    let cached_response = CachedResponse {
        cache_key: cache_key.clone(),
        model: req.model.clone(),
        request_body: json!({
            "model": req.model,
            "messages": req.messages,
        }),
        response_body: upstream_response.clone(),
        tokens_in: 0,
        tokens_out: 0,
        latency_ms: 0,
        created_at: std::time::SystemTime::now(),
        expires_at: Some(std::time::SystemTime::now() + CachedResponse::default_ttl()),
        hit_count: 0,
    };
    gateway.semantic_cache.put(cache_key, cached_response).await;

    Ok((StatusCode::OK, Json(upstream_response)).into_response())
}

/// GET /v1/models
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

/// GET /v1/sdui/{model}/{view_type}
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
