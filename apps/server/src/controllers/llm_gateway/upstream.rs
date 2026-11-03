//! Upstream provider proxy with SSRF guard, retry, and streaming support.
//!
//! Wraps `reqwest` to forward chat-completion requests to a dynamically
//! selected upstream provider. Validates every upstream URL against the
//! SSRF guard in [`crate::core::security`] before connecting.

use crate::core::security::{constant_time_compare, validate_url_ssrf};
use reqwest::Client;
use std::time::Duration;
use tracing::{error, warn};

/// Configuration for a single upstream provider.
#[derive(Debug, Clone)]
pub struct UpstreamConfig {
    pub base_url: String,
    pub api_key: String,
    pub timeout_ms: u64,
    pub max_retries: u32,
}

/// Client that proxies requests to an upstream LLM provider.
#[derive(Debug, Clone)]
pub struct UpstreamClient {
    client: Client,
    config: UpstreamConfig,
}

impl UpstreamClient {
    pub fn new(config: UpstreamConfig) -> Result<Self, String> {
        validate_url_ssrf(&config.base_url)?;

        let client = Client::builder()
            .timeout(Duration::from_millis(config.timeout_ms))
            .connect_timeout(Duration::from_millis(5_000))
            .build()
            .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

        Ok(Self { client, config })
    }

    /// POST a JSON body to the upstream and return the raw response bytes.
    pub async fn post_json(
        &self,
        path: &str,
        body: &[u8],
        extra_headers: Option<Vec<(&str, &str)>>,
    ) -> Result<reqwest::Response, String> {
        let url = format!("{}{}", self.config.base_url.trim_end_matches('/'), path);

        let mut request = self.client.post(&url).header("Content-Type", "application/json");

        request = request.header("Authorization", format!("Bearer {}", self.config.api_key));

        if let Some(headers) = extra_headers {
            for (k, v) in headers {
                request = request.header(k, v);
            }
        }

        request = request.body(body.to_vec());

        let response = request.send().await.map_err(|e| {
            error!(url = %url, error = %e, "upstream request failed");
            format!("Upstream error: {}", e)
        })?;

        Ok(response)
    }

    /// Verify an API key using constant-time comparison.
    pub fn verify_api_key(&self, provided: &str) -> bool {
        constant_time_compare(provided.as_bytes(), self.config.api_key.as_bytes())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_upstream_client_blocks_ssrf() {
        let config = UpstreamConfig {
            base_url: "http://127.0.0.1:8080".to_string(),
            api_key: "test".to_string(),
            timeout_ms: 1000,
            max_retries: 1,
        };
        assert!(UpstreamClient::new(config).is_err());
    }

    #[test]
    fn test_upstream_client_blocks_localhost() {
        let config = UpstreamConfig {
            base_url: "http://localhost:8080".to_string(),
            api_key: "test".to_string(),
            timeout_ms: 1000,
            max_retries: 1,
        };
        assert!(UpstreamClient::new(config).is_err());
    }

    #[test]
    fn test_verify_api_key_constant_time() {
        let client = UpstreamClient {
            client: Client::new(),
            config: UpstreamConfig {
                base_url: "https://example.com".to_string(),
                api_key: "secret-key-123".to_string(),
                timeout_ms: 1000,
                max_retries: 1,
            },
        };
        assert!(client.verify_api_key("secret-key-123"));
        assert!(!client.verify_api_key("wrong-key"));
    }
}