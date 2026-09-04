-- KoreaLink: 게시글 소유자가 원문 외 언어에 "번역 대기" 빈 행을 직접 만들 수 있도록 허용
-- (내용은 비워둔 상태로만 허용 — 실제 번역문 작성은 여전히 admin/language_moderator만 가능)
drop policy if exists "post_translations_insert" on public.post_translations;
create policy "post_translations_insert" on public.post_translations
  for insert with check (
    public.is_admin()
    or public.is_language_moderator(language_code)
    or (
      public.owns_post(post_id)
      and (
        language_code = (select original_language_code from public.posts where id = post_id)
        or (translated_title is null and translated_content is null)
      )
    )
  );
