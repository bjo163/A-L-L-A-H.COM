use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        // 1. ai_provider (Upstream AI providers)
        create_table(
            m,
            "ai_provider",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("slug", ColType::StringUniq),
                ("provider_type", ColType::String), // "openai_compatible", "anthropic", "gemini", "ollama"
                ("base_url", ColType::String),
                ("encrypted_api_key", ColType::TextNull),
                ("priority", ColType::Integer),
                ("is_healthy", ColType::Boolean),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 2. ai_model (Mapping physical/virtual models & token pricing)
        create_table(
            m,
            "ai_model",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("model_id", ColType::String),
                ("provider_id", ColType::Integer),
                ("context_window", ColType::Integer),
                ("input_cost_per_m", ColType::Decimal),
                ("output_cost_per_m", ColType::Decimal),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 3. ai_route (Routing rules & fallback strategies)
        create_table(
            m,
            "ai_route",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("alias", ColType::StringUniq), // e.g. "default", "fast", "reasoning"
                ("strategy", ColType::String),  // "fallback", "lowest_cost", "lowest_latency", "weighted_rr"
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 4. ai_virtual_key (Virtual API key tied to company/partner)
        create_table(
            m,
            "ai_virtual_key",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("key_prefix", ColType::String),
                ("key_hash", ColType::StringUniq),
                ("company_id", ColType::IntegerNull),
                ("partner_id", ColType::IntegerNull),
                ("budget_limit", ColType::DecimalNull),
                ("rate_limit_rpm", ColType::Integer),
                ("rate_limit_tpm", ColType::Integer),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 5. ai_usage_log (Telemetry, token consumption & audit)
        create_table(
            m,
            "ai_usage_log",
            &[
                ("id", ColType::PkAuto),
                ("virtual_key_id", ColType::IntegerNull),
                ("provider_id", ColType::IntegerNull),
                ("model_id", ColType::StringNull),
                ("prompt_tokens", ColType::Integer),
                ("completion_tokens", ColType::Integer),
                ("total_tokens", ColType::Integer),
                ("cost_usd", ColType::Decimal),
                ("latency_ms", ColType::Integer),
                ("status_code", ColType::Integer),
                ("is_cached", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "ai_usage_log").await?;
        drop_table(m, "ai_virtual_key").await?;
        drop_table(m, "ai_route").await?;
        drop_table(m, "ai_model").await?;
        drop_table(m, "ai_provider").await?;
        Ok(())
    }
}

