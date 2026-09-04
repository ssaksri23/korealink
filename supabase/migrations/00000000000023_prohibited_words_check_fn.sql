-- KoreaLink: 게시글 제출 시 금칙어 검사용 SECURITY DEFINER 함수
--
-- prohibited_words 테이블의 SELECT 정책은 관리자/해당 언어 운영자로 한정되어 있다
-- (제5조 목적: 금칙어 목록 자체의 노출을 최소화). 하지만 게시글을 "제출"하는 건
-- 일반 회원이므로, 원문 select 정책을 완화하는 대신 다른 SECURITY DEFINER 헬퍼
-- 함수(is_admin, owns_post 등)와 동일한 패턴으로 "이 텍스트에 걸리는 단어가
-- 있는가"만 authenticated에게 노출하는 함수를 만든다. 목록 자체(select *)는
-- 여전히 관리자/운영자만 볼 수 있다.

create or replace function public.check_prohibited_content(content text)
returns table(word text, severity text)
language sql
stable
security definer set search_path = public
as $$
  select word, severity from public.prohibited_words
  where content ilike '%' || replace(replace(word, '%', '\%'), '_', '\_') || '%';
$$;

revoke execute on function public.check_prohibited_content(text) from public;
grant execute on function public.check_prohibited_content(text) to authenticated;
