-- Permet d'enregistrer un paiement ponctuel non lié à un contrat existant.

alter table contract_payments alter column contract_id drop not null;
alter table contract_payments add column label text;
