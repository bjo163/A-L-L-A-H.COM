//! Upstream LLM provider proxy client.
//!
//! This module handles forwarding requests to external LLM providers
//! with SSRF validation and timeout handling.

use crate::core::security::validate_url_ssrf;
use reqwest::Client;
use serde_json::Value;
use std::time::Duration;
use tracing::error;

/// Configuration for an upstream LLM provider.
#[derive(Debug, Clone)]
pub struct UpstreamConfig {
    pub base_url: String,
    pub api_key: String,
    pub timeout: Duration,
    pub max_retries: usize,
}

impl Default for UpstreamConfig {
    fn default() -> Self {
        Self {
            base_url: "https://api.openai.com/v1".to_string(),
            api_key: "".to_string(),
            timeout: Duration::from_secs(30),
            max_retries: 3,
        }
    }
}

/// Client for proxying requests to upstream LLM providers.
#[derive(Debug, Clone)]
pub struct UpstreamClient {
    client: Client,
    config: UpstreamConfig,
}

impl UpstreamClient {
    pub fn new(config: UpstreamConfig) -> Self {
        Self {
            client: Client::builder()
                .timeout(config.timeout)
                .build()
                .expect("Failed to build reqwest client"),
            config,
        }
    }

    pub fn default() -> Self {
        Self::new(UpstreamConfig::default())
    }

    /// Forward a chat completion request to the upstream provider.
    pub async fn forward(&self, req: &super::controller::ChatCompletionRequest) -> Result<Value, String> {
        let url = format!("{}/chat/completions", self.config.base_url);

        // SSRF validation
        if let Err(e) = validate_url_ssrf(&url) {
            return Err(format!("SSRF validation failed: {}", e));
        }

        // Build request
        let request = self.client.post(&url)
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .json(req);

        // Apply retries
        for attempt in 0..=self.config.max_retries {
            match request.try_clone() {
                Some(req) => {
                    match req.send().await {
                        Ok(response) => {
                            if response.status().is_success() {
                                match response.json::<Value>().await {
                                    Ok(body) => return Ok(body),
                                    Err(e) => return Err(format!("Failed to parse JSON response: {}", e)),
                                }
                            } else {
                                let status = response.status();
                                let text = response.text().await.unwrap_or_default();
                                if attempt == self.config.max_retries {
                                    return Err(format!("Upstream returned {}: {}", status, text));
                                }
                                // Continue to retry
                            }
                        }
                        Err(e) => {
                            if attempt == self.config.max_retries {
                                return Err(format!("Upstream request failed: {}", e));
                            }
                            // Continue to retry
                        }
                    }
                }
                None => {
                    return Err("Failed to clone request for retry".to_string());
                }
            }
            
            // Brief delay between retries
            if attempt < self.config.max_retries {
                tokio::time::sleep(Duration::from_millis(500)).await;
            }
        }

        Err("Max retries exceeded".to_string())
    }

    /// Verify API key with upstream provider.
    pub async fn verify_api_key(&self) -> bool {
        let url = format!("{}/models", self.config.base_url);

        if let Err(e) = validate_url_ssrf(&url) {
            error!("SSRF validation failed for API key verification: {}", e);
            return false;
        }

        match self.client.get(&url)
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .send()
            .await
        {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    }
}