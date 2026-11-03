#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;
mod m20261103_000001_base_odoo;
mod m20261103_000002_mw_storage;
mod m20261103_000003_mw_llm_router;
mod m20261103_000004_mw_evolution_engine;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20261103_000001_base_odoo::Migration),
            Box::new(m20261103_000002_mw_storage::Migration),
            Box::new(m20261103_000003_mw_llm_router::Migration),
            Box::new(m20261103_000004_mw_evolution_engine::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}
