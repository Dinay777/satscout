-- Run this in Supabase SQL Editor

create table if not exists chat_messages (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users not null,
  role       text        not null check (role in ('user', 'assistant')),
  content    text        not null,
  created_at timestamptz default now()
);

alter table chat_messages enable row level security;

create policy "users read own messages"
  on chat_messages for select
  using (auth.uid() = user_id);

create policy "users insert own messages"
  on chat_messages for insert
  with check (auth.uid() = user_id);

-- Index for fast per-user queries
create index on chat_messages (user_id, created_at desc);
