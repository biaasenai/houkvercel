insert into public.categories (name, slug, active)
values
  ('Administração', 'administracao', true),
  ('Tecnologia', 'tecnologia', true),
  ('Atendimento', 'atendimento', true),
  ('Comércio', 'comercio', true),
  ('Construção', 'construcao', true),
  ('Saúde', 'saude', true),
  ('Educação', 'educacao', true),
  ('Marketing', 'marketing', true),
  ('Design', 'design', true),
  ('Logística', 'logistica', true),
  ('Serviços Gerais', 'servicos-gerais', true),
  ('Engenharia', 'engenharia', true)
on conflict (name) do update
set slug = excluded.slug,
    active = true;

update public.opportunities as opportunity
set category_id = standardized_category.id
from public.categories as existing_category
join public.categories as standardized_category
  on standardized_category.name = case existing_category.name
    when 'Administrativo' then 'Administração'
    when 'Vendas' then 'Comércio'
  end
where opportunity.category_id = existing_category.id
  and existing_category.name in ('Administrativo', 'Vendas');

update public.categories
set active = false
where name not in (
  'Administração',
  'Tecnologia',
  'Atendimento',
  'Comércio',
  'Construção',
  'Saúde',
  'Educação',
  'Marketing',
  'Design',
  'Logística',
  'Serviços Gerais',
  'Engenharia'
);
