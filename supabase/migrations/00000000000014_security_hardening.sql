-- KoreaLink: Supabase 보안 어드바이저 경고 조치
-- 1) search_path 미고정 함수에 명시적 search_path 설정 (search_path 하이재킹 방지)
alter function public.set_updated_at() set search_path = public;
alter function public.generate_share_code() set search_path = public;

-- 2) 트리거 전용 함수는 REST RPC로 직접 호출될 필요가 없으므로 실행 권한을 회수한다.
--    Postgres는 함수 생성 시 기본적으로 PUBLIC(모든 역할)에 EXECUTE를 부여하므로,
--    anon/authenticated 개별 REVOKE만으로는 PUBLIC 권한이 남아 무력화된다 — 반드시 FROM PUBLIC으로 회수해야 한다.
--    (트리거 실행 자체는 이 권한과 무관하게 정상 동작한다.)
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_original_translation_update() from public;
revoke execute on function public.handle_report_threshold() from public;
revoke execute on function public.record_post_status_change() from public;
