-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (insert), only admins can read
create policy "Public can subscribe" on public.newsletter_subscribers
  for insert with check (true);

create policy "Admins can view subscribers" on public.newsletter_subscribers
  for select using (
    public.has_role(auth.uid(), 'admin')
  );

-- Product reviews
create table if not exists public.product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  unique(product_id, user_id)
);

alter table public.product_reviews enable row level security;

create policy "Anyone can read reviews" on public.product_reviews
  for select using (true);

create policy "Authenticated users can insert reviews" on public.product_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews" on public.product_reviews
  for update using (auth.uid() = user_id);
