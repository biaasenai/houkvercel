-- Keep both notification recipient columns in sync for existing installations.
create or replace function public.on_application_status_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_status_history (application_id, status, changed_by)
    values (new.id, new.status, auth.uid());
    insert into public.notifications (user_id, recipient_id, type, title, body, link)
    values (
      new.candidate_id,
      new.candidate_id,
      'APPLICATION',
      'Atualização na sua candidatura',
      case new.status
        when 'VIEWED' then 'Sua candidatura foi visualizada.'
        when 'UNDER_REVIEW' then 'Sua candidatura está em análise.'
        when 'APPROVED' then 'Sua candidatura foi aprovada.'
        when 'REJECTED' then 'Sua candidatura não foi aprovada desta vez.'
        else 'Sua candidatura foi atualizada.'
      end,
      '/candidato/application-details?id=' || new.id
    );
  end if;
  return new;
end; $$;

create or replace function public.on_application_created()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  select contractor_id into owner_id from public.opportunities where id = new.opportunity_id;
  if owner_id is not null then
    insert into public.notifications (user_id, recipient_id, type, title, body, link)
    values (owner_id, owner_id, 'APPLICATION', 'Nova candidatura recebida', 'Uma oportunidade publicada por você recebeu uma nova candidatura.', '/contratante/application-details?id=' || new.id);
  end if;
  return new;
end; $$;
