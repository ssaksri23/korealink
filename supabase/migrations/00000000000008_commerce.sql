-- KoreaLink: 광고상품 / 주문 / 결제(계좌입금 방식, PG 연동 대비 구조 분리)

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in (
    'urgent_badge','top_pin','multi_lang_3','all_lang','telegram_distribution',
    'business_subscription','business_featured','chatroom_featured'
  )),
  name_ko text not null,
  description text,
  price integer not null,
  duration_days int,
  unit text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id),
  company_id uuid references public.companies(id),
  chat_room_id uuid references public.chat_rooms(id),
  product_id uuid not null references public.products(id),
  profile_id uuid not null references public.profiles(id),
  quantity int not null default 1,
  total_price integer not null,
  status text not null default 'payment_pending' check (status in (
    'payment_pending','deposit_confirmed','active','ended','cancelled','refunded'
  )),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create index idx_orders_profile on public.orders(profile_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_post on public.orders(post_id);

-- 추후 실제 PG 연동 시 provider/external_transaction_id 만 채우면 되도록 인터페이스 분리
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'manual' check (provider in ('manual','pg')),
  method text not null default 'bank_transfer',
  depositor_name text,
  amount integer not null,
  status text not null default 'waiting' check (status in ('waiting','confirmed','rejected','refunded')),
  external_transaction_id text,
  confirmed_by uuid references public.profiles(id),
  confirmed_at timestamptz,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();
create index idx_payments_order on public.payments(order_id);
create index idx_payments_status on public.payments(status);
