use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ViewType {
    Tree,
    Form,
    Kanban,
    Search,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeField {
    pub name: String,
    pub label: String,
    #[serde(default)]
    pub sortable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub badge: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormField {
    pub name: String,
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub widget: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub col_span: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewArchitecture {
    pub model: String,
    pub view_type: ViewType,
    pub title: String,
    pub arch: serde_json::Value,
}

