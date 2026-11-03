use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        // 1. semantic_cache — cache layer keyed by embedding-hash of prompt.
        //     Content-addressed by SHA-256 of the canonicalised request body so
        //     identical prompts hit the same row without a lookup.
        create_table(
            m,
            "semantic_cache",
            &[
                ("id", ColType::PkAuto),
                ("cache_key", ColType::StringUniq), // SHA-256 of canonical request
                ("prompt_hash", ColType::String), // short prefix for debugging
                ("model", ColType::String),
                ("request_body", ColType::Text),
                ("response_body", ColType::Text),
                ("tokens_in", ColType::Integer),
                ("tokens_out", ColType::Integer),
                ("latency_ms", ColType::Integer),
                ("hit_count", ColType::Integer),
                ("ttl_seconds", ColType::Integer),
                ("expires_at", ColType::TimestampWithTimeZoneNull),
                ("created_at", ColType::TimestampWithTimeZone),
            ],
            &[],
        )
        .await?;

        // 2. rate_limit_bucket — token-bucket state per virtual key.
        //     Stored in DB so the bucket survives process restarts and is
        //     shared across horizontal replicas.
        create_table(
            m,
            "rate_limit_bucket",
            &[
                ("id", ColType::PkAuto),
                ("virtual_key_id", ColType::Integer),
                ("bucket_key", ColType::String), // e.g. "{key_id}:tokens"
                ("tokens", ColType::Decimal), // current token count
                ("max_tokens", ColType::Decimal), // bucket capacity
                ("refill_rate", ColType::Decimal), // tokens per second
                ("last_refill_at", ColType::TimestampWithTimeZone),
                ("updated_at", ColType::TimestampWithTimeZone),
            ],
            &[],
        )
        .await?;

        // 3. s3_backend_config — per-backend SigV4 credentials & endpoint.
        create_table(
            m,
            "s3_backend_config",
            &[
                ("id", ColType::PkAuto),
                ("storage_backend_id", ColType::Integer),
                ("region", ColType::String),
                ("endpoint", ColType::String),
                ("access_key_id", ColType::String),
                ("secret_access_key", ColType::TextNull),
                ("session_token", ColType::TextNull),
                ("use_path_style", ColType::Boolean),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 4. ir_record_rule — Odoo-style record rules (fail-closed ACL).
        create_table(
            m,
            "ir_record_rule",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("model", ColType::String), // e.g. "ir_attachment"
                ("domain", ColType::Text), // JSON domain expression
                ("read_access", ColType::Boolean),
                ("write_access", ColType::Boolean),
                ("create_access", ColType::Boolean),
                ("unlink_access", ColType::Boolean),
                ("active", ColType::Boolean),
                ("company_id", ColType::IntegerNull),
            ],
            &[],
        )
        .await?;

        // 5. ir_legal_hold — Echolog-style legal hold on attachments.
        create_table(
            m,
            "ir_legal_hold",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("res_model", ColType::StringNull),
                ("res_id", ColType::IntegerNull),
                ("attachment_id", ColType::IntegerNull),
                ("reason", ColType::TextNull),
                ("held_at", ColType::TimestampWithTimeZone),
                ("released_at", ColType::TimestampWithTimeZoneNull),
                ("released_by", ColType::IntegerNull),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "ir_legal_hold").await?;
        drop_table(m, "ir_record_rule").await?;
        drop_table(m, "s3_backend_config").await?;
        drop_table(m, "rate_limit_bucket").await?;
        drop_table(m, "semantic_cache").await?;
        Ok(())
    }
}