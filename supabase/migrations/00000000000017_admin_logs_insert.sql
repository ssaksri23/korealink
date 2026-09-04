-- KoreaLink: 관리자가 서비스 롤 없이도 본인 작업 로그를 직접 남길 수 있도록 허용
create policy "admin_logs_insert_admin" on public.admin_logs
  for insert with check (public.is_admin());
