-- KoreaLink: orders 테이블에도 payments와 동일한 소유자 UPDATE 정책 누락이 있었다.
-- POST /api/orders/[id]/cancel 이 일반 사용자 세션으로 orders.status를
-- 'cancelled'로 바꾸려 하는데, 기존에는 orders_update_admin(관리자 전용)
-- 정책만 있어 RLS가 조용히 0행을 갱신하고 있었다. 소유자 UPDATE 정책을 추가한다.

create policy "orders_update_own" on public.orders
  for update using (profile_id = auth.uid() or public.is_admin());
