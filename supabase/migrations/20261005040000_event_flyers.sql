-- Event flyers: anyone can see them (they're on the public Events page); only
-- event staff can add, replace or remove them.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('event-flyers', 'event-flyers', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do nothing;

    execute $p$create policy event_flyers_staff_insert on storage.objects for insert to authenticated
      with check (bucket_id = 'event-flyers' and (select public.can_manage_events()))$p$;
    execute $p$create policy event_flyers_staff_update on storage.objects for update to authenticated
      using (bucket_id = 'event-flyers' and (select public.can_manage_events()))$p$;
    execute $p$create policy event_flyers_staff_remove on storage.objects for delete to authenticated
      using (bucket_id = 'event-flyers' and (select public.can_manage_events()))$p$;
  end if;
end $$;
