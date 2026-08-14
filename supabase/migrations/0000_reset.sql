-- À exécuter une seule fois si 0001_init.sql a échoué en cours de route
-- (types déjà créés, etc.) — nettoie tout avant de relancer 0001_init.sql.

drop table if exists integration_connections cascade;
drop table if exists calendar_events_cache cascade;
drop table if exists expenses cascade;
drop table if exists tasks cascade;
drop table if exists activities cascade;
drop table if exists opportunities cascade;
drop table if exists contract_payments cascade;
drop table if exists contracts cascade;
drop table if exists clients cascade;

drop function if exists set_updated_at cascade;

drop type if exists integration_provider;
drop type if exists expense_frequency;
drop type if exists expense_type;
drop type if exists task_priority;
drop type if exists task_status;
drop type if exists activity_type;
drop type if exists opportunity_stage;
drop type if exists payment_status;
drop type if exists contract_recurrence;
drop type if exists contract_status;
drop type if exists record_source;
drop type if exists client_type;
