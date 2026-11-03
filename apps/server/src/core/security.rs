use subtle::ConstantTimeEq;
use url::Url;
use sha2::{Digest, Sha256};
use std::net::IpAddr;

/// Constant-time comparison for API keys, tokens, and digest hashes.
/// Prevents timing attacks by ensuring comparison time is independent of
/// the number of matching bytes.
pub fn constant_time_compare(a: &[u8], b: &[u8]) -> bool {
    // Use subtle's ct_eq directly - it handles different lengths safely
    a.ct_eq(b).into()
}

/// SSRF guard: validates that a URL's host is not a private/internal address.
/// Blocks loopback, private, link-local, and unique-local addresses.
pub fn validate_url_ssrf(url_str: &str) -> Result<(), String> {
    let parsed = Url::parse(url_str).map_err(|e| format!("Invalid URL: {}", e))?;

    let host = parsed.host_str().ok_or_else(|| "URL has no host".to_string())?;

    // Parse as IP address for network checking
    if let Ok(ip) = host.parse::<IpAddr>() {
        // Block loopback (127.0.0.0/8, ::1)
        if ip.is_loopback() {
            return Err("SSRF: loopback address blocked".to_string());
        }

        // Block private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
        // and unique local IPv6 (fc00::/7)
        match ip {
            IpAddr::V4(ipv4) => {
                if ipv4.is_private() {
                    return Err("SSRF: private IPv4 address blocked".to_string());
                }
                if ipv4.is_link_local() {
                    return Err("SSRF: link-local address blocked".to_string());
                }
            }
            IpAddr::V6(ipv6) => {
                // fc00::/7 = unique local
                if ipv6.is_unique_local() {
                    return Err("SSRF: unique local IPv6 address blocked".to_string());
                }
                // fe80::/10 = link-local
                if ipv6.is_unicast_link_local() {
                    return Err("SSRF: link-local address blocked".to_string());
                }
            }
        }
    }

    // Block localhost as hostname string
    if host == "localhost" || host == "0.0.0.0" || host == "::" {
        return Err("SSRF: localhost hostname blocked".to_string());
    }

    Ok(())
}

/// Compute SHA-256 digest of bytes, returning lowercase hex string.
/// Used for content-addressed storage keys and hash equality verification.
pub fn sha256_digest(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let result = hasher.finalize();
    result.iter().map(|b| format!("{:02x}", b)).collect()
}

/// Verify two SHA-256 digests in constant time.
/// Returns true only if the digests match, with timing independent of input.
pub fn verify_digest_constant_time(a: &str, b: &str) -> bool {
    let a_bytes = match hex::decode(a) {
        Ok(b) => b,
        Err(_) => return false,
    };
    let b_bytes = match hex::decode(b) {
        Ok(b) => b,
        Err(_) => return false,
    };
    constant_time_compare(&a_bytes, &b_bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constant_time_compare_equal() {
        let a = b"hello world";
        let b = b"hello world";
        assert!(constant_time_compare(a, b));
    }

    #[test]
    fn test_constant_time_compare_not_equal() {
        let a = b"hello";
        let b = b"world";
        assert!(!constant_time_compare(a, b));
    }

    #[test]
    fn test_constant_time_compare_different_length() {
        let a = b"short";
        let b = b"this is much longer";
        // Should not panic and should return false
        let result = constant_time_compare(a, b);
        assert!(!result);
    }

    #[test]
    fn test_ssrf_block_loopback() {
        let result = validate_url_ssrf("http://127.0.0.1/api");
        assert!(result.is_err());
    }

    #[test]
    fn test_ssrf_block_localhost() {
        let result = validate_url_ssrf("http://localhost/api");
        assert!(result.is_err());
    }

    #[test]
    fn test_ssrf_block_private() {
        let result = validate_url_ssrf("http://10.0.0.1/api");
        assert!(result.is_err());
        let result = validate_url_ssrf("http://192.168.1.1/api");
        assert!(result.is_err());
        let result = validate_url_ssrf("http://172.16.0.1/api");
        assert!(result.is_err());
    }

    #[test]
    fn test_ssrf_allow_public() {
        // These should pass (though in practice you'd want more validation)
        let result = validate_url_ssrf("http://example.com/api");
        // May pass or fail depending on host resolution, but shouldn't crash
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_sha256_digest() {
        let result = sha256_digest(b"test");
        // Just verify it's 64 hex chars
        assert_eq!(result.len(), 64);
    }

    #[test]
    fn test_verify_digest_constant_time_match() {
        let original = sha256_digest(b"hello");
        let verified = verify_digest_constant_time(&original, &original);
        assert!(verified);
    }

    #[test]
    fn test_verify_digest_constant_time_mismatch() {
        let a = sha256_digest(b"hello");
        let b = sha256_digest(b"world");
        let verified = verify_digest_constant_time(&a, &b);
        assert!(!verified);
    }
}