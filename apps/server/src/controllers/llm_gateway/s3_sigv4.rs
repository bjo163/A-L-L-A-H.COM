//! S3 SigV4 content-addressed verifier.
//!
//! Verifies that an object stored in S3 matches its declared SHA-256 digest
//! using AWS Signature V4. Uses constant-time comparison for the final
//! digest check to prevent timing attacks.

use crate::core::security::{constant_time_compare, sha256_digest, verify_digest_constant_time};
use hmac::{Hmac, Mac};
use sha2::{Sha256, Sha256 as Sha256Hasher};
use std::collections::BTreeMap;

type HmacSha256 = Hmac<Sha256>;

/// AWS SigV4 signing context.
#[derive(Debug, Clone)]
pub struct SigV4Context {
    pub access_key_id: String,
    pub secret_access_key: String,
    pub region: String,
    pub service: String,
    pub endpoint: String,
    pub use_path_style: bool,
}

impl SigV4Context {
    /// Build the canonical request for a HEAD/GET operation.
    pub fn canonical_request(
        &self,
        method: &str,
        path: &str,
        query: &BTreeMap<String, String>,
        headers: &BTreeMap<String, String>,
        payload_hash: &str,
    ) -> String {
        let canonical_uri = format!("/{}", path.trim_start_matches('/'));

        let canonical_querystring = query
            .iter()
            .map(|(k, v)| format!("{}={}", url_encode(k), url_encode(v)))
            .collect::<Vec<_>>()
            .join("&");

        let canonical_headers = headers
            .iter()
            .map(|(k, v)| format!("{}:{}\n", k.to_lowercase(), v.trim()))
            .collect::<Vec<_>>()
            .join("");

        let signed_headers = headers
            .keys()
            .map(|k| k.to_lowercase())
            .collect::<Vec<_>>()
            .join(";");

        format!(
            "{}\n{}\n{}\n{}\n{}\n{}",
            method,
            canonical_uri,
            canonical_querystring,
            canonical_headers,
            signed_headers,
            payload_hash
        )
    }

    /// Compute the string-to-sign for the given timestamp.
    pub fn string_to_sign(&self, canonical_request: &str, timestamp: &str) -> String {
        let algorithm = "AWS4-HMAC-SHA256";
        let credential_scope = format!(
            "{}/{}/{}/aws4_request",
            timestamp, self.region, self.service
        );
        let hashed_request = {
            let mut hasher = Sha256Hasher::new();
            hasher.update(canonical_request.as_bytes());
            hex::encode(hasher.finalize())
        };

        format!(
            "{}\n{}\n{}\n{}",
            algorithm, timestamp, credential_scope, hashed_request
        )
    }

    /// Derive the signing key from the secret access key.
    pub fn derive_signing_key(&self, timestamp: &str) -> Vec<u8> {
        let date = &timestamp[..8];
        let k_date = sign_hmac_sha256(
            format!("AWS4{}", self.secret_access_key).as_bytes(),
            date.as_bytes(),
        );
        let k_service = sign_hmac_sha256(&k_date, self.service.as_bytes());
        let k_region = sign_hmac_sha256(&k_service, self.region.as_bytes());
        sign_hmac_sha256(&k_region, b"aws4_request")
    }

    /// Sign the string-to-sign and return the Authorization header value.
    pub fn sign(&self, timestamp: &str, canonical_request: &str) -> String {
        let string_to_sign = self.string_to_sign(canonical_request, timestamp);
        let signing_key = self.derive_signing_key(timestamp);
        let signature = hex::encode(sign_hmac_sha256(&signing_key, string_to_sign.as_bytes()));

        let credential_scope = format!(
            "{}/{}/{}/aws4_request",
            timestamp, self.region, self.service
        );

        format!(
            "AWS4-HMAC-SHA256 Credential={}/{}, SignedHeaders=host;x-content-sha256;x-date, Signature={}",
            self.access_key_id, credential_scope, signature
        )
    }
}

fn sign_hmac_sha256(key: &[u8], message: &[u8]) -> Vec<u8> {
    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC key length is arbitrary");
    mac.update(message);
    mac.finalize().into_bytes().to_vec()
}

fn url_encode(s: &str) -> String {
    percent_encoding::percent_encode_str(s, percent_encoding::NON_ALPHANUMERIC_MINUS).to_string()
}

/// Verify that an object's digest matches the expected value using constant-time comparison.
pub fn verify_object_digest(actual: &str, expected: &str) -> bool {
    verify_digest_constant_time(actual, expected)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_object_digest_match() {
        let digest = sha256_digest(b"hello");
        assert!(verify_object_digest(&digest, &digest));
    }

    #[test]
    fn test_verify_object_digest_mismatch() {
        let a = sha256_digest(b"hello");
        let b = sha256_digest(b"world");
        assert!(!verify_object_digest(&a, &b));
    }

    #[test]
    fn test_signing_key_derivation_is_deterministic() {
        let ctx = SigV4Context {
            access_key_id: "AKIAIOSFODNN7EXAMPLE".to_string(),
            secret_access_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY".to_string(),
            region: "us-east-1".to_string(),
            service: "s3".to_string(),
            endpoint: "https://s3.amazonaws.com".to_string(),
            use_path_style: false,
        };
        let key1 = ctx.derive_signing_key("20240101T000000Z");
        let key2 = ctx.derive_signing_key("20240101T000000Z");
        assert_eq!(key1, key2);
    }
}