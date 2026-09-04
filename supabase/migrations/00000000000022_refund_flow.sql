-- KoreaLink: 환불 신청 플로우 + payments 소유자 UPDATE 정책 누락 수정
--
-- (1) payments 테이블에 소유자(owner) UPDATE 정책이 없었다. 입금자명 등록 API
--     (POST /api/orders/[id]/confirm-deposit)가 일반 사용자 세션으로 payments를
--     업데이트하는데, 기존에는 admin만 UPDATE 가능한 정책(payments_update_admin)
--     밖에 없어 RLS가 조용히 0행을 갱신하고 있었다(Supabase는 .select() 없는
--     UPDATE가 RLS로 0행이 되어도 에러를 던지지 않는다). 소유자 UPDATE 정책을
--     추가한다.
-- (2) payments.status에 'refund_requested'를 추가하고 환불 사유/신청시각 컬럼을
--     추가해, 결제 확인 후에도 이용자가 환불을 신청할 수 있게 한다.

create policy "payments_update_own" on public.payments
  for update using (
    exists (select 1 from public.orders o where o.id = order_id and o.profile_id = auth.uid())
  );

alter table public.payments drop constraint payments_status_check;
alter table public.payments add constraint payments_status_check
  check (status in ('waiting', 'confirmed', 'refund_requested', 'rejected', 'refunded'));

alter table public.payments add column if not exists refund_reason text;
alter table public.payments add column if not exists refund_requested_at timestamptz;
