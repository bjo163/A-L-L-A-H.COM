//! Semantic vector cache for LLM responses.
//!
//! Caches responses keyed by a canonicalised hash of the request body.
//! Uses SHA-256 of the normalised prompt so identical prompts hit the
//! same row without an embedding-model dependency.

use crate::core::security::sha256_digest;
use serde_json::Value;
use std::sync::Arc;
use std::time::{Duration, SystemTime};

/// A cached response entry.
#[derive(Debug, Clone)]
pub struct CachedResponse {
    pub cache_key: String,
    pub model: String,
    pub request_body: Value,
    pub response_body: Value,
    pub tokens_in: i32,
    pub tokens_out: i32,
    pub latency_ms: i32,
    pub created_at: SystemTime,
    pub expires_at: Option<SystemTime>,
    pub hit_count: i32,
}

impl CachedResponse {
    /// Build a cache key from a canonicalised request body.
    pub fn compute_key(model: &str, messages: &[Value]) -> String {
        let canonical = serde_json::json!({
            "model": model,
            "messages": messages,
        });
        let bytes = serde_json::to_vec(&canonical).unwrap_or_default();
        sha256_digest(&bytes)
    }

    /// Check if this entry is still valid (not expired).
    pub fn is_expired(&self) -> bool {
        match self.expires_at {
            Some(exp) => SystemTime::now() > exp,
            None => false,
        }
    }

    /// TTL in seconds for a fresh entry.
    pub fn default_ttl() -> Duration {
        Duration::from_secs(3600) // 1 hour
    }
}

/// In-process LRU cache for semantic responses.
#[derive(Debug, Clone)]
pub struct SemanticCache {
    cache: std::sync::Arc<tokio::sync::RwLock<lru::LruMap<String, CachedResponse>>>,
    ttl: Duration,
}

impl SemanticCache {
    pub fn new(capacity: usize, ttl: Duration) -> Self {
        Self {
            cache: Arc::new(RwLock::new(lru::LruMap::new(
                usize::try_from(capacity).unwrap_or(1_000),
            ))),
            ttl,
        }
    }

    /// Look up a cached response by key. Returns None if missing or expired.
    pub async fn get(&self, key: &str) -> Option<CachedResponse> {
        let mut cache = self.cache.write().await;
        let entry = cache.get(key).cloned()?;
        if entry.is_expired() {
            cache.pop(key);
            return None;
        }
        Some(entry)
    }

    /// Store a response in the cache.
    pub async fn put(&self, key: String, response: CachedResponse) {
        let mut cache = self.cache.write().await;
        cache.push(key, response);
    }

    /// Compute a cache key from model + messages.
    pub fn key_for(model: &str, messages: &[Value]) -> String {
        CachedResponse::compute_key(model, messages)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cache_miss_then_hit() {
        let cache = SemanticCache::new(10, Duration::from_secs(3600));
        let key = SemanticCache::key_for("gpt-4", &[serde_json::json!({"role": "user", "content": "hi"})]);
        assert!(cache.get(&key).await.is_none());

        let response = CachedResponse {
            cache_key: key.clone(),
            model: "gpt-4".to_string(),
            request_body: serde_json::json!({"role": "user", "content": "hi"}),
            response_body: serde_json::json!({"content": "hello"}),
            tokens_in: 5,
            tokens_out: 3,
            latency_ms: 100,
            created_at: SystemTime::now(),
            expires_at: Some(SystemTime::now() + Duration::from_secs(3600)),
            hit_count: 0,
        };
        cache.put(key.clone(), response).await;
        let hit = cache.get(&key).await.unwrap();
        assert_eq!(hit.model, "gpt-4");
    }

    #[tokio::test]
    async fn test_cache_expires() {
        let cache = SemanticCache::new(10, Duration::from_millis(10));
        let key = "test-key".to_string();
        let response = CachedResponse {
            cache_key: key.clone(),
            model: "test".to_string(),
            request_body: serde_json::json!({}),
            response_body: serde_json::json!({}),
            tokens_in: 0,
            tokens_out: 0,
            latency_ms: 0,
            created_at: SystemTime::now(),
            expires_at: Some(SystemTime::now() - Duration::from_secs(1)),
            hit_count: 0,
        };
        cache.put(key.clone(), response).await;
        assert!(cache.get(&key).await.is_none());
    }
}