-- Notifications Table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null, -- Recipient
  actor_id uuid references profiles(id) on delete cascade not null, -- Trigger user
  type text not null check (type in ('like', 'comment', 'follow')),
  post_id uuid references posts(id) on delete cascade, -- Optional, for likes/comments
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications RLS
alter table notifications enable row level security;

create policy "Users can view their own notifications" on notifications 
  for select using (auth.uid() = user_id);

create policy "System can insert notifications" on notifications 
  for insert with check (true); -- Ideally restrictive, but for server-side logic 'true' or strict check

create policy "Users can update their own notifications" on notifications 
  for update using (auth.uid() = user_id);
