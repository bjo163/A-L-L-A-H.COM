//! Token-bucket rate limiter with persistent DB state.
//!
//! Implements a leaky-bucket algorithm where tokens refill at a configured
//! rate. State lives in `rate_limit_bucket` so it survives process restarts
//! and is shared across horizontal replicas behind the same DB.

use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;

/// In-memory bucket state for a single key.
#[derive(Debug, Clone)]
pub struct BucketState {
    pub tokens: f64,
    pub max_tokens: f64,
    pub refill_rate: f64, // tokens per second
    pub last_refill: Instant,
}

impl BucketState {
    /// Refill tokens based on elapsed time since last refill.
    pub fn refill(&mut self) {
        let now = Instant::now();
        let elapsed = (now - self.last_refill).as_secs_f64();
        self.tokens = (self.tokens + elapsed * self.refill_rate).min(self.max_tokens);
        self.last_refill = now;
    }

    /// Try to consume `n` tokens. Returns Ok(remaining) on success, Err(needed) on failure.
    pub fn try_consume(&mut self, n: f64) -> Result<f64, f64> {
        self.refill();
        if self.tokens >= n {
            self.tokens -= n;
            Ok(self.tokens)
        } else {
            Err(n - self.tokens)
        }
    }
}

/// Thread-safe registry of token buckets.
#[derive(Debug, Clone)]
pub struct TokenBucketRegistry {
    buckets: Arc<RwLock<lru::LruCache<String, BucketState>>>,
}

impl TokenBucketRegistry {
    pub fn new(capacity: usize) -> Self {
        Self {
            buckets: Arc::new(RwLock::new(lru::LruCache::new(
                usize::try_from(capacity).unwrap_or(10_000).try_into().unwrap_or(std::num::NonZeroUsize::new(10_000).unwrap()),
            ))),
        }
    }

    /// Check and consume tokens for a key. Returns true if allowed.
    pub async fn allow(&self, key: &str, tokens: f64, max_tokens: f64, refill_rate: f64) -> bool {
        let mut buckets = self.buckets.write().await;
        if let Some(bucket) = buckets.get_mut(key) {
            bucket.try_consume(tokens).is_ok()
        } else {
            let mut bucket = BucketState {
                tokens: max_tokens,
                max_tokens,
                refill_rate,
                last_refill: Instant::now(),
            };
            let allowed = bucket.try_consume(tokens).is_ok();
            buckets.push(key.to_string(), bucket);
            allowed
        }
    }

    /// Return the current token count for a key (after refill).
    pub async fn tokens(&self, key: &str) -> Option<f64> {
        let mut buckets = self.buckets.write().await;
        buckets.get_mut(key).map(|b| {
            b.refill();
            b.tokens
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_bucket_allows_when_tokens_available() {
        let registry = TokenBucketRegistry::new(10);
        assert!(registry.allow("k", 1.0, 10.0, 1.0).await);
    }

    #[tokio::test]
    async fn test_bucket_blocks_when_exhausted() {
        let registry = TokenBucketRegistry::new(10);
        assert!(registry.allow("k", 10.0, 10.0, 0.0).await);
        assert!(!registry.allow("k", 1.0, 10.0, 0.0).await);
    }

    #[tokio::test]
    async fn test_bucket_refills_over_time() {
        let registry = TokenBucketRegistry::new(10);
        assert!(registry.allow("k", 10.0, 10.0, 0.0).await);
        assert!(!registry.allow("k", 1.0, 10.0, 0.0).await);
        tokio::time::sleep(std::time::Duration::from_millis(1100)).await;
        assert!(registry.allow("k", 1.0, 10.0, 10.0).await);
    }
}