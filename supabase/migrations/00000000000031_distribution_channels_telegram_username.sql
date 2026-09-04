-- 공개 텔레그램 채널 참여 링크(https://t.me/<username>)를 만들기 위해
-- channel_name 문자열을 파싱하는 대신 별도 컬럼으로 분리한다.
alter table public.distribution_channels add column if not exists telegram_username text;

update public.distribution_channels set telegram_username = 'korealink_en' where language_code = 'en';
update public.distribution_channels set telegram_username = 'korealink_km' where language_code = 'km';
update public.distribution_channels set telegram_username = 'korealink_ko' where language_code = 'ko';
update public.distribution_channels set telegram_username = 'korealink_mn' where language_code = 'mn';
update public.distribution_channels set telegram_username = 'korea_link_ru' where language_code = 'ru';
update public.distribution_channels set telegram_username = 'korealink_th' where language_code = 'th';
update public.distribution_channels set telegram_username = 'korealink_uz' where language_code = 'uz';
update public.distribution_channels set telegram_username = 'korealink_vi' where language_code = 'vi';
update public.distribution_channels set telegram_username = 'korealink_zh' where language_code = 'zh-CN';
