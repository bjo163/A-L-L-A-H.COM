use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedProvider {
    pub id: i32,
    pub name: String,
    pub slug: String,
    pub base_url: String,
    pub api_key: Option<String>,
    pub priority: i32,
    pub is_healthy: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedRoute {
    pub alias: String,
    pub strategy: String,
    pub providers: Vec<CachedProvider>,
}

pub struct RoutingTable {
    pub routes: HashMap<String, CachedRoute>,
    pub keys: HashMap<String, i32>, // key_hash -> company_id
}

impl RoutingTable {
    pub fn new() -> Self {
        Self {
            routes: HashMap::new(),
            keys: HashMap::new(),
        }
    }

    pub fn pick_provider<'a>(&'a self, alias: &str) -> Option<&'a CachedProvider> {
        let route = self.routes.get(alias)?;
        route.providers.iter().find(|p| p.is_healthy)
    }
}

pub type SharedRoutingTable = Arc<tokio::sync::RwLock<RoutingTable>>;

