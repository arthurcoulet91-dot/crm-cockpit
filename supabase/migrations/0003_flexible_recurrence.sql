-- Remplace la récurrence figée (mensuel/trimestriel/annuel) par un intervalle
-- libre en mois, pour permettre "tous les 2 mois", "tous les 4 mois", etc.

alter table contracts add column recurrence_months integer;

update contracts set recurrence_months = case recurrence
  when 'monthly' then 1
  when 'quarterly' then 3
  when 'annual' then 12
  else null
end;

alter table contracts drop column recurrence;
drop type contract_recurrence;
