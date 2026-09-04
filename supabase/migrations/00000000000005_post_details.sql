-- KoreaLink: 카테고리별 구조화 상세정보 (posts와 1:1)

create table public.job_details (
  post_id uuid primary key references public.posts(id) on delete cascade,
  industry text not null check (industry in (
    'manufacturing','auto_parts','electronics','construction','logistics',
    'farming','cleaning','restaurant','delivery','service','office','other'
  )),
  industrial_complex_name text,
  wage_type text check (wage_type in ('hourly','daily','monthly')),
  wage_min integer,
  wage_max integer,
  work_hours text,
  shift_type text check (shift_type in ('day','night','2shift','3shift','fixed')),
  recruit_target text,
  recruit_count int,
  foreigner_allowed boolean not null default true,
  visa_types text[] not null default '{}',
  korean_level text check (korean_level in ('none','basic','intermediate','advanced')),
  housing_provided boolean not null default false,
  housing_cost text,
  commute_bus_provided boolean not null default false,
  commute_bus_stops text,
  meal_provided boolean not null default false,
  pay_same_day boolean not null default false,
  pay_next_day boolean not null default false,
  pay_cycle text check (pay_cycle in ('weekly','monthly')),
  pay_day text,
  overtime_available boolean not null default false,
  special_work_available boolean not null default false,
  work_period text,
  break_time text,
  preparation_items text,
  updated_at timestamptz not null default now()
);
create trigger trg_job_details_updated_at before update on public.job_details
  for each row execute function public.set_updated_at();
create index idx_job_details_industry on public.job_details(industry);
create index idx_job_details_wage on public.job_details(wage_min, wage_max);
create index idx_job_details_foreigner on public.job_details(foreigner_allowed);

create table public.business_details (
  post_id uuid primary key references public.posts(id) on delete cascade,
  industry text not null check (industry in (
    'telecom','insurance','bank_remittance','restaurant','grocery','auto',
    'mobile_phone','legal_admin','travel','beauty','hospital','education','other'
  )),
  services jsonb not null default '[]',
  discount_info text,
  map_lat numeric,
  map_lng numeric,
  updated_at timestamptz not null default now()
);
create trigger trg_business_details_updated_at before update on public.business_details
  for each row execute function public.set_updated_at();
create index idx_business_details_industry on public.business_details(industry);

create table public.used_item_details (
  post_id uuid primary key references public.posts(id) on delete cascade,
  category text not null check (category in (
    'car','auto_parts','mobile_phone','appliance','furniture','household','clothing','tools','other'
  )),
  price integer not null,
  item_condition text check (item_condition in ('new','like_new','used','for_parts')),
  sale_status text not null default 'selling' check (sale_status in ('selling','reserved','sold')),
  updated_at timestamptz not null default now()
);
create trigger trg_used_item_details_updated_at before update on public.used_item_details
  for each row execute function public.set_updated_at();
create index idx_used_item_details_category on public.used_item_details(category);
create index idx_used_item_details_status on public.used_item_details(sale_status);

create table public.housing_details (
  post_id uuid primary key references public.posts(id) on delete cascade,
  property_type text not null check (property_type in (
    'studio','two_room','apartment','dormitory','short_stay','roommate','factory_dorm','commercial','other'
  )),
  deposit integer,
  monthly_rent integer,
  maintenance_fee integer,
  move_in_date date,
  contract_period text,
  capacity int,
  gender_condition text check (gender_condition in ('any','male','female')),
  amenities text[] not null default '{}',
  transit_info text,
  updated_at timestamptz not null default now()
);
create trigger trg_housing_details_updated_at before update on public.housing_details
  for each row execute function public.set_updated_at();
create index idx_housing_details_type on public.housing_details(property_type);

create table public.group_buy_details (
  post_id uuid primary key references public.posts(id) on delete cascade,
  price integer not null,
  target_count int not null,
  current_count int not null default 0,
  deadline timestamptz,
  pickup_method text,
  pickup_region_id uuid references public.regions(id),
  updated_at timestamptz not null default now()
);
create trigger trg_group_buy_details_updated_at before update on public.group_buy_details
  for each row execute function public.set_updated_at();

create table public.event_details (
  post_id uuid primary key references public.posts(id) on delete cascade,
  event_type text not null check (event_type in (
    'culture','sports','nationality_meetup','regional_meetup','education','korean_study','religious','other'
  )),
  event_date date,
  event_time text,
  venue text,
  fee integer not null default 0,
  capacity int,
  current_participants int not null default 0,
  organizer text,
  supported_languages text[] not null default '{}',
  application_method text,
  updated_at timestamptz not null default now()
);
create trigger trg_event_details_updated_at before update on public.event_details
  for each row execute function public.set_updated_at();
create index idx_event_details_date on public.event_details(event_date);
