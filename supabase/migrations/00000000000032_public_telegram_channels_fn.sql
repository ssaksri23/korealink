-- 공개 채널 참여 페이지(/channels)는 로그인 없이도 봐야 하는데,
-- distribution_channels는 관리자 전용 RLS가 걸려 있다. 테이블 전체를 공개하는
-- 대신, 안전한 컬럼(언어/공개 사용자명)만 노출하는 좁은 함수를 만든다.
create or replace function public.list_public_telegram_channels()
returns table(language_code text, name_native text, flag_emoji text, telegram_username text)
language sql
stable
security definer set search_path = public
as $$
  select dc.language_code, l.name_native, l.flag_emoji, dc.telegram_username
  from public.distribution_channels dc
  join public.languages l on l.code = dc.language_code
  where dc.platform = 'telegram'
    and dc.is_active = true
    and dc.telegram_username is not null
  order by dc.language_code;
$$;

grant execute on function public.list_public_telegram_channels() to anon, authenticated;
