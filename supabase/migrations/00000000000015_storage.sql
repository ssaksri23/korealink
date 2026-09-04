-- KoreaLink: 게시글 이미지 업로드용 Storage 버킷
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- 업로드 경로 규칙: {auth.uid()}/{파일명} — 본인 폴더에만 업로드/삭제 가능
create policy "post_images_storage_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "post_images_storage_delete_own_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- public 버킷이므로 익명 다운로드는 Storage API가 자체적으로 허용한다(별도 select 정책 불필요).
