use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        // 1. res_currency
        create_table(
            m,
            "res_currency",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::StringUniq),
                ("symbol", ColType::String),
                ("rate", ColType::Decimal),
                ("decimal_places", ColType::Integer),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 2. res_country
        create_table(
            m,
            "res_country",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("code", ColType::StringUniq),
                ("phone_code", ColType::IntegerNull),
                ("currency_id", ColType::IntegerNull),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 3. res_company (Hierarchical Workspaces)
        create_table(
            m,
            "res_company",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("currency_id", ColType::IntegerNull),
                ("country_id", ColType::IntegerNull),
                ("parent_id", ColType::IntegerNull),
                ("active", ColType::Boolean),
                ("metadata", ColType::JsonNull),
            ],
            &[],
        )
        .await?;

        // 4. res_partner (Developers, Teams, Clients)
        create_table(
            m,
            "res_partner",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("is_company", ColType::Boolean),
                ("parent_id", ColType::IntegerNull),
                ("company_id", ColType::IntegerNull),
                ("email", ColType::StringNull),
                ("phone", ColType::StringNull),
                ("credit_balance", ColType::Decimal),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        // 5. ir_ui_view (SDUI View Schemas)
        create_table(
            m,
            "ir_ui_view",
            &[
                ("id", ColType::PkAuto),
                ("name", ColType::String),
                ("model", ColType::String),
                ("view_type", ColType::String),
                ("arch_json", ColType::Text),
                ("active", ColType::Boolean),
            ],
            &[],
        )
        .await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "ir_ui_view").await?;
        drop_table(m, "res_partner").await?;
        drop_table(m, "res_company").await?;
        drop_table(m, "res_country").await?;
        drop_table(m, "res_currency").await?;
        Ok(())
    }
}

