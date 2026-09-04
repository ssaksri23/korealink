-- KoreaLink: 시/군/구까지만 있는 regions 구조에 동/읍/면 단위 상세주소를 자유 입력으로 추가한다.
-- 전국 읍/면/동(3,500개+)을 정확히 시딩할 신뢰할 수 있는 방법이 없어 드롭다운 대신
-- 자유 텍스트로 받는다(오타/오기 위험은 있지만, 잘못된 행정동 데이터를 심는 것보다 안전함).

alter table public.posts add column if not exists address_detail text;
