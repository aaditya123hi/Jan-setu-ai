create table if not exists public.applications (
    id uuid primary key default gen_random_uuid(),
    ref_id text unique not null,
    scheme_id text not null,
    applicant_name text,
    masked_aadhaar text,
    eligibility_result text,
    consent boolean not null,
    status text default 'PROTOTYPE_RECEIVED',
    created_at timestamptz default now()
);

alter table public.applications enable row level security;

-- No public policies are created. Server-side access uses the service role key.
