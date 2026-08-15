-- Garantit qu'un paiement est SOIT lié à un contrat, SOIT ponctuel
-- (avec une description), jamais les deux, jamais aucun des deux.

alter table contract_payments
  add constraint contract_payments_contract_xor_label
  check ((contract_id is not null) <> (label is not null));
