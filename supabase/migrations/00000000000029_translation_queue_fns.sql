-- 게시글 제출 시 번역 대상 언어의 "번역 대기" 빈 행을 만들고, 무료 기계번역
-- 결과를 저장하기 위한 SECURITY DEFINER 함수.
--
-- post_translations_insert/update RLS 정책은 소유자에게 원문 언어 행만 허용한다
-- (다른 언어 번역문은 관리자/언어담당자만 직접 쓸 수 있도록 설계됨). 그런데
-- 게시글 제출 시 시스템이 자동으로 번역 대상 언어의 placeholder 행을 만들고
-- 기계번역 결과를 채워야 하므로, 이 좁은 범위의 함수를 통해서만 그 작업을
-- 수행하게 한다. save_machine_translation은 translation_status를 항상
-- 'translated'로 고정하므로 소유자가 스스로 'reviewed'(관리자 검수 완료)를
-- 자칭할 수는 없다.

create or replace function public.queue_post_translations(target_post uuid, target_langs text[])
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not (public.owns_post(target_post) or public.is_admin()) then
    raise exception 'not authorized';
  end if;

  insert into public.post_translations (post_id, language_code, translation_status)
  select target_post, code, 'pending'
  from unnest(target_langs) as code
  on conflict (post_id, language_code) do nothing;
end;
$$;

grant execute on function public.queue_post_translations(uuid, text[]) to authenticated;

create or replace function public.save_machine_translation(
  target_post uuid, target_lang text, title text, content text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not (public.owns_post(target_post) or public.is_admin()) then
    raise exception 'not authorized';
  end if;

  update public.post_translations
  set translated_title = title,
      translated_content = content,
      translation_status = 'translated',
      translation_source = 'machine'
  where post_id = target_post and language_code = target_lang;
end;
$$;

grant execute on function public.save_machine_translation(uuid, text, text, text) to authenticated;
