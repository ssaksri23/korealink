-- KoreaLink: 무통장입금 계좌정보(코드에 하드코딩하지 않고 관리자가 변경 가능하도록 설정값으로 관리)
-- 실제 계좌가 등록되기 전까지 오인 입금을 막기 위해 값을 비워둔 채로 시드하며,
-- system_settings.value를 관리자가 실제 계좌로 채우기 전에는 화면에 "계좌 등록 전" 안내를 표시한다.
insert into public.system_settings (key, value, description) values
  ('bank_account_info', '{"bank":"","accountNumber":"","accountHolder":""}', '광고상품 무통장입금 계좌 정보(관리자가 실제 계좌로 입력 필요, 비어있으면 미설정으로 표시됨)')
on conflict (key) do nothing;
