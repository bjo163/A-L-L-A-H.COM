use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        // 1. mw_storage_backend
        create_table(
            m,
            "mw_storage_backend",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("backend_type", ColType::String), // "fs", "s3", "r2", "gcs", "memory"
                ("base_path", ColType::StringNull),
                ("bucket", ColType::StringNull),
                ("endpoint", ColType::StringNull),
                ("is_default", ColType::Boolean),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 2. ir_attachment (Echolog content-addressed storage)
        create_table(
            m,
            "ir_attachment",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("digest", ColType::StringUniq), // SHA-256 digest
                ("file_size", ColType::BigInteger),
                ("mimetype", ColType::String),
                ("res_model", ColType::StringNull),
                ("res_id", ColType::IntegerNull),
                ("company_id", ColType::IntegerNull),
                ("storage_backend_id", ColType::IntegerNull),
                ("retention_until", ColType::TimestampWithTimeZoneNull),
                ("legal_hold", ColType::Boolean),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "ir_attachment").await?;
        drop_table(m, "mw_storage_backend").await?;
        Ok(())
    }
}

