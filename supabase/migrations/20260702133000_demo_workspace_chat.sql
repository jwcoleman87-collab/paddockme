-- PaddockME - demo workspace live chat (guided MVP, no-auth demo)
--
-- The guided-MVP workspace page has no login: visitors demo the three-way
-- conversation (owner / landowner / transporter) via an "act as" switcher,
-- so the auth.uid()-based policies on the real `messages` table can never
-- match. Rather than weaken those, the demo chat gets its own clearly
-- demo-scoped table + photo bucket that the anon key may use directly.
--
-- Nothing here touches the real messaging tables. When auth lands on the
-- demo surface, this table can be dropped and the staged
-- 20260702000000_message_image_attachments migration takes over.

create table if not exists public.demo_chat_messages (
  id uuid primary key default extensions.uuid_generate_v4(),
  -- Which demo workspace thread this belongs to (e.g. "1023").
  workspace_id text not null check (char_length(workspace_id) <= 40),
  sender_role text not null check (sender_role in ('owner', 'landowner', 'transporter')),
  sender_name text not null check (char_length(sender_name) <= 80),
  body text check (char_length(body) <= 2000),
  -- Object path inside the `demo-chat-photos` bucket, when a photo is attached.
  image_path text check (char_length(image_path) <= 300),
  image_name text check (char_length(image_name) <= 200),
  created_at timestamptz not null default now(),
  -- A message must say or show something.
  constraint demo_chat_messages_not_empty check (body is not null or image_path is not null)
);

create index if not exists demo_chat_messages_workspace_idx
  on public.demo_chat_messages (workspace_id, created_at);

alter table public.demo_chat_messages enable row level security;

-- Demo surface: anyone holding the anon key may read, post and clear.
-- The length checks above bound abuse, and the table holds nothing
-- sensitive by design. Delete is open so the demo reset button can wipe
-- the thread from any browser.

drop policy if exists "Demo chat: read" on public.demo_chat_messages;
create policy "Demo chat: read"
  on public.demo_chat_messages
  for select
  using (true);

drop policy if exists "Demo chat: post" on public.demo_chat_messages;
create policy "Demo chat: post"
  on public.demo_chat_messages
  for insert
  with check (true);

drop policy if exists "Demo chat: reset" on public.demo_chat_messages;
create policy "Demo chat: reset"
  on public.demo_chat_messages
  for delete
  using (true);

-- Live sync across browsers (postgres_changes). Adding a table to the
-- publication is not idempotent, so guard the re-run case.
do $$
begin
  alter publication supabase_realtime add table public.demo_chat_messages;
exception
  when duplicate_object then null;
end $$;


-- photo bucket ----------------------------------------------------------------
-- Public read so demo photos render straight from their public URL; uploads
-- are capped to 5 MB and image mime types at the bucket level.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'demo-chat-photos',
  'demo-chat-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Demo chat photos: upload" on storage.objects;
create policy "Demo chat photos: upload"
  on storage.objects
  for insert
  with check (bucket_id = 'demo-chat-photos');
