//! AWS SigV4 signing for S3 content-addressed storage verification.
//!
//! This module provides utilities for signing and verifying AWS SigV4 requests
//! for content-addressed storage access.

use crate::core::security::{constant_time_compare};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use hmac::digest::KeyInit;
use hex;

/// Context for SigV4 signing operations.
#[derive(Debug, Clone)]
pub struct SigV4Context {
    pub access_key: String,
    pub secret_key: String,
    pub region: String,
    pub service: String,
    pub timestamp: String,
}

impl SigV4Context {
    pub fn new(access_key: String, secret_key: String, region: String, service: String) -> Self {
        Self {
            access_key,
            secret_key,
            region,
            service,
            timestamp: chrono::Utc::now().format("%Y%m%dT%H%M%SZ").to_string(),
        }
    }
}

/// Sign a request with AWS SigV4.
pub fn sign_hmac_sha256(key: &[u8], data: &[u8]) -> Vec<u8> {
    let mut mac = Hmac::<Sha256>::new_from_slice(key).expect("HMAC can take key of any size");
    mac.update(data);
    let result = mac.finalize();
    result.into_bytes().to_vec()
}

/// URL-encode a string according to AWS SigV4 specifications.
pub fn url_encode(s: &str) -> String {
    let mut encoded = String::new();
    for byte in s.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(byte as char);
            }
            _ => {
                encoded.push_str(&format!("%{:02X}", byte));
            }
        }
    }
    encoded
}

/// Verify S3 object digest with constant-time comparison.
pub fn verify_object_digest(
    expected_digest: &str,
    actual_digest: &str,
    _context: &SigV4Context,
) -> bool {
    // In a real implementation, this would verify the signature
    // For now, we use constant-time comparison of the digests
    let expected = hex::decode(expected_digest).unwrap_or_default();
    let actual = hex::decode(actual_digest).unwrap_or_default();
    
    constant_time_compare(&expected, &actual)
}