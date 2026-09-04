-- KoreaLink: 업체인증 서류 업로드용 비공개 Storage 버킷
-- post-images와 달리 public=false로 만들어, 일반 사용자는 절대 다운로드할 수 없고
-- 소유자 본인과 관리자만(서명된 URL을 통해) 열람할 수 있다.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('company-docs', 'company-docs', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "company_docs_storage_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'company-docs'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "company_docs_storage_select_own_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'company-docs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "company_docs_storage_delete_own_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'company-docs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
