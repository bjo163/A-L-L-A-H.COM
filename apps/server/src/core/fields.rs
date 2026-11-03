use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FieldType {
    Char,
    Text,
    Integer,
    Float,
    Boolean,
    Datetime,
    Selection,
    Many2one,
    One2many,
    Many2many,
    Json,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldDefinition {
    pub r#type: FieldType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub help: Option<String>,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    pub readonly: bool,
    #[serde(default)]
    pub private: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub selection: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relation: Option<String>,
}

