-- 관리자가 테스트/오류 주문을 정리할 수 있도록 삭제 정책 추가.
-- payments.order_id는 on delete cascade이므로 주문을 지우면 결제 기록도 함께 삭제된다.
create policy "orders_delete_admin" on public.orders
  for delete using (public.is_admin());
