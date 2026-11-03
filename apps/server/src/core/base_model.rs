use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelAudit {
    pub id: String,
    pub name: String,
    pub active: bool,
    pub create_date: String,
    pub write_date: String,
    pub create_uid: Option<String>,
    pub write_uid: Option<String>,
    pub owner_id: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

pub trait QlModel {
    fn model_name() -> &'static str;
    fn table_name() -> &'static str;
    fn display_name(&self) -> &str;
}

