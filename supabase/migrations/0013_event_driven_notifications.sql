-- Keep application notifications tied to real recipients and add opportunity events.
create or replace function public.on_application_status_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_status_history (application_id, status, changed_by)
    values (new.id, new.status, auth.uid());

    if new.candidate_id is not null then
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
  end if;
  return new;
end; $$;

create or replace function public.on_application_created()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  select contractor_id into owner_id
  from public.opportunities
  where id = new.opportunity_id;

  if owner_id is not null then
    insert into public.notifications (user_id, recipient_id, type, title, body, link)
    values (
      owner_id,
      owner_id,
      'APPLICATION',
      'Nova candidatura recebida',
      'Uma oportunidade publicada por você recebeu uma nova candidatura.',
      '/contratante/application-details?id=' || new.id
    );
  end if;
  return new;
end; $$;

create or replace function public.on_opportunity_status_notification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status
    and new.status in ('PAUSED', 'CLOSED') then
    insert into public.notifications (user_id, recipient_id, type, title, body, link)
    select
      a.candidate_id,
      a.candidate_id,
      'OPPORTUNITY',
      'Atualização em uma oportunidade',
      case new.status
        when 'PAUSED' then 'Uma oportunidade à qual você se candidatou foi pausada.'
        else 'Uma oportunidade à qual você se candidatou foi encerrada.'
      end,
      '/candidato/application-details?id=' || a.id
    from public.applications a
    where a.opportunity_id = new.id
      and a.candidate_id is not null;
  end if;
  return new;
end; $$;

drop trigger if exists opportunities_status_notification on public.opportunities;
create trigger opportunities_status_notification
after update of status on public.opportunities
for each row execute procedure public.on_opportunity_status_notification();

create or replace function public.on_opportunity_published_notification()
returns trigger language plpgsql security definer set search_path = public as $$
declare should_notify boolean := false;
begin
  if tg_op = 'INSERT' then
    should_notify := true;
  elsif new.status is distinct from old.status then
    should_notify := true;
  end if;

  if new.status = 'ACTIVE' and should_notify then
    insert into public.notifications (user_id, recipient_id, type, title, body, link)
    select
      p.id,
      p.id,
      'OPPORTUNITY',
      'Nova oportunidade disponível',
      'Uma nova oportunidade foi publicada e pode interessar a você.',
      '/candidato/opportunities'
    from public.profiles p
    where p.role = 'candidate'
      and p.id is not null;
  end if;
  return new;
end; $$;

drop trigger if exists opportunities_published_notification on public.opportunities;
create trigger opportunities_published_notification
after insert or update of status on public.opportunities
for each row execute procedure public.on_opportunity_published_notification();

drop policy if exists "candidates manage own favorites" on public.favorites;
create policy "candidates manage own favorites"
on public.favorites for all
using (candidate_id = auth.uid())
with check (candidate_id = auth.uid());

drop policy if exists "users update own notification read state" on public.notifications;
create policy "users update own notification read state"
on public.notifications for update
using (user_id = auth.uid() or recipient_id = auth.uid())
with check (user_id = auth.uid() or recipient_id = auth.uid());
