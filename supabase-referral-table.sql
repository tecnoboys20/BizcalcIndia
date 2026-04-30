-- Run this in Supabase SQL Editor → New Query

create table if not exists referral_invites (
  id uuid default gen_random_uuid() primary key,
  referrer_code text not null,
  invitee_email text not null unique,
  status text default 'pending', -- 'pending' | 'accepted'
  created_at timestamp with time zone default now()
);

-- Allow the service role to read/write (backend only)
alter table referral_invites enable row level security;
create policy "Service role full access" on referral_invites
  using (true) with check (true);
