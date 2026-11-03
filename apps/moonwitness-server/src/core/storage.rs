use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use tokio::fs;

pub struct ContentAddressedStorage {
    root_path: PathBuf,
}

impl ContentAddressedStorage {
    pub fn new<P: AsRef<Path>>(root: P) -> Self {
        Self {
            root_path: root.as_ref().to_path_buf(),
        }
    }

    pub fn compute_digest(bytes: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(bytes);
        let result = hasher.finalize();
        result
            .iter()
            .map(|b| format!("{:02x}", b))
            .collect::<String>()
    }

    pub async fn put_object(&self, bytes: &[u8]) -> Result<(String, usize), std::io::Error> {
        let digest = Self::compute_digest(bytes);
        let objects_dir = self.root_path.join("objects");
        fs::create_dir_all(&objects_dir).await?;

        let object_path = objects_dir.join(&digest);
        if !object_path.exists() {
            fs::write(&object_path, bytes).await?;
        }

        Ok((digest, bytes.len()))
    }

    pub async fn get_object(&self, digest: &str) -> Result<Vec<u8>, std::io::Error> {
        let object_path = self.root_path.join("objects").join(digest);
        fs::read(object_path).await
    }
}
