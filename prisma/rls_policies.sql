-- Supabase RLS policies for purchases
alter table public.purchases enable row level security;

create policy "purchases_select_own"
on public.purchases
for select
using (user_id = auth.uid());

create policy "purchases_insert_own"
on public.purchases
for insert
with check (user_id = auth.uid());

create policy "purchases_update_own"
on public.purchases
for update
using (user_id = auth.uid());

create policy "purchases_delete_own"
on public.purchases
for delete
using (user_id = auth.uid());
