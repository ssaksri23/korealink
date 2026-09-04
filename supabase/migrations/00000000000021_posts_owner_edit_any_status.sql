-- KoreaLink: 소유자가 게시된(published) 글도 수정/삭제(소프트) 할 수 있도록 허용
-- 기존 정책은 draft/pending_review/rejected 상태에서만 소유자 UPDATE를 허용해,
-- 이미 게시된 글은 관리자만 고칠 수 있었다(사용자가 오탈자 수정/판매완료 처리/삭제를 못 함).
-- blocked(정책위반으로 관리자가 조치)와 deleted(이미 삭제됨) 상태만 계속 소유자 수정에서 제외한다.
-- 글 내용을 다시 제출(POST /api/posts/[id]/submit)하면 status가 pending_review로 돌아가
-- 재검수를 거치므로, 승인 없이 게시 상태 그대로 내용만 바뀌는 일은 없다.

drop policy if exists "posts_update_owner_or_admin" on public.posts;
create policy "posts_update_owner_or_admin" on public.posts
  for update using (
    (created_by = auth.uid() and status not in ('blocked', 'deleted'))
    or public.is_admin()
  );
