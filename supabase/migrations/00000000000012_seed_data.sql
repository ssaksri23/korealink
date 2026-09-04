-- KoreaLink: 초기 시드 데이터 (언어/역할/카테고리/지역/광고상품/시스템설정)
-- 실제 게시글 샘플 데이터(9개 언어 일자리 공고 등)는 관리자 계정 생성 이후
-- 별도 스크립트로 투입한다(회원 데이터에 의존하므로 이 마이그레이션에는 포함하지 않음).

insert into public.languages (code, name_native, name_korean, flag_emoji, display_order, translation_enabled, is_active) values
  ('ru', 'Русский', '러시아어', '🇷🇺', 1, true, true),
  ('vi', 'Tiếng Việt', '베트남어', '🇻🇳', 2, true, true),
  ('th', 'ภาษาไทย', '태국어', '🇹🇭', 3, true, true),
  ('km', 'ភាសាខ្មែរ', '크메르어', '🇰🇭', 4, true, true),
  ('uz', 'Oʻzbekcha', '우즈베크어', '🇺🇿', 5, true, true),
  ('mn', 'Монгол', '몽골어', '🇲🇳', 6, true, true),
  ('zh-CN', '中文', '중국어 간체', '🇨🇳', 7, true, true),
  ('en', 'English', '영어', '🇬🇧', 8, true, true),
  ('ko', '한국어', '한국어', '🇰🇷', 9, false, true);

insert into public.roles (code, name_ko, description) values
  ('user', '일반회원', '검색, 저장, 문의, 신고, 본인 게시글 등록/수정'),
  ('advertiser', '광고주', '일자리/업체 등록, 광고상품 주문, 통계 확인'),
  ('chatroom_manager', '채팅방 운영자', '채팅방 등록 및 초대링크 관리'),
  ('language_moderator', '언어 운영자', '담당 언어 번역검수 및 신고검토'),
  ('admin', '관리자', '회원/게시글/신고/번역/상품/입금/채널배포 관리'),
  ('super_admin', '최고관리자', '관리자 계정 관리 및 시스템 설정');

insert into public.categories (slug, name_ko, icon, display_order) values
  ('jobs', '일자리', 'briefcase', 1),
  ('business', '업체 홍보', 'store', 2),
  ('used', '중고거래', 'shopping-bag', 3),
  ('housing', '부동산·숙소', 'home', 4),
  ('groupbuy', '공동구매', 'users', 5),
  ('events', '행사·모임', 'calendar', 6);

-- 광주광역시 광산구 등 자주 사용될 주요 지역 일부만 우선 시드(전체 행정구역은 관리자 화면에서 지속 추가)
insert into public.regions (sido, sigungu, eupmyeondong) values
  ('광주광역시', '광산구', null),
  ('서울특별시', '구로구', null),
  ('서울특별시', '금천구', null),
  ('경기도', '안산시', null),
  ('경기도', '화성시', null),
  ('경상남도', '김해시', null),
  ('충청남도', '천안시', null),
  ('인천광역시', '남동구', null);

-- 가격/기간은 관리자가 시스템에서 언제든 변경 가능 (코드에 하드코딩하지 않음)
-- multi_lang_3/all_lang: 번역 언어 선택은 글쓰기 마법사에서 이미 무료로 제공되어 별도
--   결제 대상이 아니므로 비활성으로 시딩한다.
-- business_subscription/business_featured/chatroom_featured: 업체 계정 생성·채팅방
--   기능이 아직 화면에 연결되어 있지 않아, 실제로 아무 효과도 주지 못하는 상태로
--   판매하지 않도록 비활성으로 시딩한다. 해당 기능이 만들어지면 관리자가
--   /admin/products에서 다시 활성화하면 된다.
insert into public.products (code, name_ko, description, price, duration_days, unit, sort_order, is_active) values
  ('urgent_badge', '긴급 표시', '게시글에 긴급 배지를 노출합니다.', 5000, 1, '건', 1, true),
  ('top_pin', '상단 고정', '카테고리 목록 상단에 게시글을 고정합니다.', 5000, 1, '일', 2, true),
  ('multi_lang_3', '다국어 게시(3개 언어)', '선택한 3개 언어로 번역하여 게시합니다.', 20000, null, '건', 3, false),
  ('all_lang', '전체 언어 게시', '지원하는 모든 언어로 번역하여 게시합니다.', 50000, null, '건', 4, false),
  ('telegram_distribution', '텔레그램 배포', '선택 언어 텔레그램 채널에 1회 배포합니다.', 10000, null, '회', 5, true),
  ('business_subscription', '업체 이용권', '업체 홍보 게시글 상시 등록 이용권입니다.', 49000, 30, '월', 6, false),
  ('business_featured', '업체 추천광고', '업체 목록 상단 추천 영역에 노출됩니다.', 50000, 30, '월', 7, false),
  ('chatroom_featured', '채팅방 추천', '채팅방 목록 상단 추천 영역에 노출됩니다.', 30000, 30, '월', 8, false);

insert into public.system_settings (key, value, description) values
  ('site_name', '"KoreaLink"', '사이트 이름'),
  ('report_hide_threshold', '5', '게시글 자동 임시숨김 처리 신고 누적 건수'),
  ('report_cooldown_hours', '24', '동일 사용자가 같은 대상에 대해 재신고 가능한 최소 시간(시간 단위, 참고용)'),
  ('all_lang_product_price', '35000', '전체 언어 게시 상품의 실제 판매가(관리자 조정용, products.price와 동기화 필요)'),
  ('telegram_bot_configured', 'false', 'Telegram Bot API 연동 여부(배포 시 자동 갱신)');
