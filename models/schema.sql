-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles Table (Users)
create table profiles (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text, -- Added for custom auth
  name text,
  avatar text,
  bio text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posts Table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  image text,
  tags text[],
  author_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments Table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  parent_comment_id uuid references comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Post Likes
create table post_likes (
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- Post Saves (Bookmarks)
create table post_saves (
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- Follows
create table follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- Row Level Security (RLS) Policies
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table post_likes enable row level security;
alter table post_saves enable row level security;
alter table follows enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Posts Policies
create policy "Posts are viewable by everyone" on posts for select using (true);
create policy "Authenticated users can create posts" on posts for insert with check (auth.role() = 'authenticated');
create policy "Users can update own posts" on posts for update using (auth.uid() = author_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = author_id);
create policy "Admins can delete any post" on posts for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Comments Policies
create policy "Comments are viewable by everyone" on comments for select using (true);
create policy "Authenticated users can create comments" on comments for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own comments" on comments for delete using (auth.uid() = author_id);
create policy "Admins can delete any comment" on comments for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Likes Policies
create policy "Likes are viewable by everyone" on post_likes for select using (true);
create policy "Authenticated users can like posts" on post_likes for insert with check (auth.role() = 'authenticated');
create policy "Users can unlike posts" on post_likes for delete using (auth.uid() = user_id);

-- Saves Policies
create policy "Users can view own saved posts" on post_saves for select using (auth.uid() = user_id);
create policy "Authenticated users can save posts" on post_saves for insert with check (auth.role() = 'authenticated');
create policy "Users can unsave posts" on post_saves for delete using (auth.uid() = user_id);

-- Follows Policies
create policy "Follows are viewable by everyone" on follows for select using (true);
create policy "Authenticated users can follow" on follows for insert with check (auth.role() = 'authenticated');
create policy "Users can unfollow" on follows for delete using (auth.uid() = follower_id);
