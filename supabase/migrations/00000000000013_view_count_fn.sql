-- KoreaLink: 게시글 조회수 증가 (RLS를 우회하지 않고 필요한 컬럼만 원자적으로 갱신)
create or replace function public.increment_post_view(target_post uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.posts
  set view_count = view_count + 1
  where id = target_post and status = 'published' and deleted_at is null;
$$;

grant execute on function public.increment_post_view(uuid) to anon, authenticated;
