-- 게시글 소유자가 받은 문의(테스트/스팸 포함)를 정리할 수 있도록 삭제 정책 추가.
-- select 정책과 동일한 조건(작성자 본인/게시글 소유자/관리자)으로 맞춘다.
create policy "inquiries_delete_own_or_post_owner_or_admin" on public.inquiries
  for delete using (
    profile_id = auth.uid() or public.owns_post(post_id) or public.is_admin()
  );
