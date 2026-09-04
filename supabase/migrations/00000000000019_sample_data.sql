-- KoreaLink: 데모/샘플 게시글 데이터
-- super_admin 계정이 실제로 가입된 이후에만 의미가 있으므로, super_admin이 없는 환경(예: 아직
-- 아무도 가입하지 않은 프로젝트)에서는 아무 작업도 하지 않고 조용히 종료한다.
-- 이미 super_admin 명의의 게시글이 하나라도 있으면(재실행 등) 중복 삽입을 피하기 위해 건너뛴다.

do $$
declare
  admin_id uuid;
  cat_jobs uuid;
  cat_business uuid;
  cat_used uuid;
  cat_housing uuid;
  cat_groupbuy uuid;
  cat_events uuid;
  reg_ansan uuid;
  reg_guro uuid;
  reg_geumcheon uuid;
  reg_hwaseong uuid;
  reg_gimhae uuid;
  reg_cheonan uuid;
  reg_namdong uuid;
  reg_gwangsan uuid;
  post_id uuid;
begin
  select p.id into admin_id
    from public.profiles p
    join public.user_roles ur on ur.profile_id = p.id
   where ur.role_code = 'super_admin'
   limit 1;

  if admin_id is null then
    raise notice 'sample_data: no super_admin found, skipping';
    return;
  end if;

  if exists (select 1 from public.posts where created_by = admin_id) then
    raise notice 'sample_data: sample posts already exist, skipping';
    return;
  end if;

  select id into cat_jobs from public.categories where slug = 'jobs';
  select id into cat_business from public.categories where slug = 'business';
  select id into cat_used from public.categories where slug = 'used';
  select id into cat_housing from public.categories where slug = 'housing';
  select id into cat_groupbuy from public.categories where slug = 'groupbuy';
  select id into cat_events from public.categories where slug = 'events';

  select id into reg_ansan from public.regions where sido = '경기도' and sigungu = '안산시';
  select id into reg_guro from public.regions where sido = '서울특별시' and sigungu = '구로구';
  select id into reg_geumcheon from public.regions where sido = '서울특별시' and sigungu = '금천구';
  select id into reg_hwaseong from public.regions where sido = '경기도' and sigungu = '화성시';
  select id into reg_gimhae from public.regions where sido = '경상남도' and sigungu = '김해시';
  select id into reg_cheonan from public.regions where sido = '충청남도' and sigungu = '천안시';
  select id into reg_namdong from public.regions where sido = '인천광역시' and sigungu = '남동구';
  select id into reg_gwangsan from public.regions where sido = '광주광역시' and sigungu = '광산구';

  -- ══════════════════════════════════════════════════════════════════
  -- 1) 긴급 구인공고 — 9개 언어 전체 번역 데모
  -- ══════════════════════════════════════════════════════════════════
  insert into public.posts
    (category_id, created_by, status, original_language_code, region_id, is_urgent, contact_name, contact_phone, published_at)
  values
    (cat_jobs, admin_id, 'published', 'ko', reg_ansan, true, '관리팀', '010-1234-5678', now())
  returning id into post_id;

  insert into public.job_details
    (post_id, industry, industrial_complex_name, wage_type, wage_min, wage_max, work_hours, shift_type,
     recruit_target, recruit_count, foreigner_allowed, visa_types, korean_level, housing_provided, housing_cost,
     commute_bus_provided, commute_bus_stops, meal_provided, pay_cycle, pay_day, overtime_available,
     work_period, break_time, preparation_items)
  values
    (post_id, 'auto_parts', '반월공단', 'hourly', 10500, 12000, '08:00~17:00 (2교대 가능)', '2shift',
     '만 18~50세', 5, true, array['E-9','F-4','H-2'], 'basic', true, '월 10만원',
     true, '안산역, 초지역', true, 'monthly', '매월 10일', true,
     '장기(6개월 이상)', '점심 1시간', '외국인등록증, 통장사본');

  insert into public.post_translations
    (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by)
  values
    (post_id, 'ko', '안산 자동차부품 공장 생산직 긴급 구인 (초보 가능)',
      '경기도 안산 반월공단 내 자동차부품 제조업체에서 생산직 근로자를 긴급 채용합니다.
- 시급 10,500원~12,000원 (경력에 따라 협의)
- 근무시간: 08:00~17:00 (주간 2교대 가능)
- 모집대상: 만 18~50세, 외국인 지원 가능 (E-9, F-4, H-2)
- 한국어: 기본 의사소통 가능하면 지원 가능
- 기숙사 제공(월 10만원), 통근버스 운행(안산역, 초지역), 중식 제공
- 급여: 매월 10일 지급, 연장근무 가능
- 준비서류: 외국인등록증, 통장사본
- 문의: 관리팀 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Urgent Hiring: Production Worker at Auto Parts Factory in Ansan',
      'An auto parts manufacturer in the Banwol Industrial Complex, Ansan, Gyeonggi-do is urgently hiring production workers.
- Hourly wage: 10,500-12,000 KRW (negotiable based on experience)
- Working hours: 08:00-17:00 (2-shift day work available)
- Eligible: ages 18-50, foreign workers welcome (E-9, F-4, H-2 visas)
- Korean level: basic conversation is enough
- Dormitory provided (100,000 KRW/month), commuter bus available (Ansan Station, Choji Station), lunch provided
- Pay date: 10th of each month, overtime available
- Documents needed: Alien Registration Card, bank account copy
- Contact: HR Team 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'ru', 'Срочно требуются рабочие на завод автозапчастей в Ансане',
      'Завод по производству автозапчастей в промышленном комплексе Банволь (Ансан, провинция Кёнгидо) срочно набирает рабочих на производство.
- Почасовая оплата: 10 500-12 000 вон (по договорённости, в зависимости от опыта)
- Рабочее время: 08:00-17:00 (возможна дневная 2-сменная работа)
- Требования: возраст 18-50 лет, иностранные работники приветствуются (визы E-9, F-4, H-2)
- Уровень корейского: достаточно базового общения
- Предоставляется общежитие (100 000 вон/мес), корпоративный автобус (ст. Ансан, ст. Чоджи), обед
- Зарплата выплачивается 10 числа каждого месяца, возможны сверхурочные
- Необходимые документы: карта иностранца, копия банковского счёта
- Контакт: отдел кадров 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'vi', 'Tuyển gấp công nhân sản xuất tại nhà máy phụ tùng ô tô ở Ansan',
      'Công ty sản xuất phụ tùng ô tô tại khu công nghiệp Banwol, Ansan, tỉnh Gyeonggi đang tuyển gấp công nhân sản xuất.
- Lương theo giờ: 10.500-12.000 won (thỏa thuận theo kinh nghiệm)
- Giờ làm việc: 08:00-17:00 (có thể làm ca ngày, 2 ca)
- Đối tượng: 18-50 tuổi, nhận lao động nước ngoài (visa E-9, F-4, H-2)
- Tiếng Hàn: giao tiếp cơ bản là đủ
- Có ký túc xá (10 vạn won/tháng), xe đưa đón (ga Ansan, ga Choji), hỗ trợ bữa trưa
- Lương trả ngày 10 hàng tháng, có thể làm thêm giờ
- Giấy tờ cần thiết: thẻ đăng ký người nước ngoài, bản sao tài khoản ngân hàng
- Liên hệ: Phòng nhân sự 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'th', 'รับสมัครด่วน! พนักงานฝ่ายผลิตโรงงานชิ้นส่วนรถยนต์ที่อันซัน',
      'โรงงานผลิตชิ้นส่วนรถยนต์ในนิคมอุตสาหกรรมบันวอล เมืองอันซัน จังหวัดคย็องกี กำลังรับสมัครพนักงานฝ่ายผลิตด่วน
- ค่าจ้างรายชั่วโมง: 10,500-12,000 วอน (ต่อรองได้ตามประสบการณ์)
- เวลาทำงาน: 08:00-17:00 น. (มีกะกลางวัน 2 กะ)
- คุณสมบัติ: อายุ 18-50 ปี รับแรงงานต่างชาติ (วีซ่า E-9, F-4, H-2)
- ภาษาเกาหลี: สื่อสารพื้นฐานได้ก็สมัครได้
- มีหอพักให้ (ค่าหอ 100,000 วอน/เดือน) รถรับส่ง (สถานีอันซัน, สถานีโชจิ) และอาหารกลางวัน
- จ่ายเงินเดือนทุกวันที่ 10 มีโอทีให้ทำ
- เอกสารที่ต้องเตรียม: บัตรประจำตัวคนต่างด้าว, สำเนาบัญชีธนาคาร
- ติดต่อ: ฝ่ายบุคคล 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'km', 'ជ្រើសរើសបុគ្គលិកផលិតកម្មបន្ទាន់នៅរោងចក្រគ្រឿងបន្លាស់រថយន្ត ទីក្រុងអានសាន',
      'ក្រុមហ៊ុនផលិតគ្រឿងបន្លាស់រថយន្តនៅតំបន់ឧស្សាហកម្មបានវល ទីក្រុងអានសាន ខេត្តគាំងហ្គី កំពុងជ្រើសរើសបុគ្គលិកផលិតកម្មបន្ទាន់។
- ប្រាក់ខែតាមម៉ោង: 10,500-12,000 វ៉ុន (អាចចរចាតាមបទពិសោធន៍)
- ម៉ោងធ្វើការ: 08:00-17:00 (អាចធ្វើវេនថ្ងៃ 2 វេន)
- លក្ខខណ្ឌ: អាយុ 18-50 ឆ្នាំ ទទួលពលករបរទេស (វីសា E-9, F-4, H-2)
- ភាសាកូរ៉េ: គ្រាន់តែអាចទំនាក់ទំនងបឋម
- មានផ្ទះសំណាក់ (100,000 វ៉ុន/ខែ) ឡានក្រុងទៅធ្វើការ (ស្ថានីយ៍អានសាន, ស្ថានីយ៍ចូជី) និងអាហារថ្ងៃត្រង់
- បើកប្រាក់ខែរាល់ថ្ងៃទី 10 អាចធ្វើម៉ោងបន្ថែម
- ឯកសារត្រូវការ: អត្តសញ្ញាណប័ណ្ណជនបរទេស, ច្បាប់ចម្លងគណនីធនាគារ
- ទំនាក់ទំនង: ផ្នែកបុគ្គលិក 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'uz', 'Ansanda avtomobil ehtiyot qismlari zavodiga shoshilinch ishchilar kerak',
      'Gyeonggi-do Ansan shahridagi Banwol sanoat majmuasida joylashgan avtomobil ehtiyot qismlari zavodi ishlab chiqarish ishchilarini shoshilinch ravishda ishga taklif qiladi.
- Soatlik maosh: 10 500-12 000 von (tajribaga qarab kelishiladi)
- Ish vaqti: 08:00-17:00 (kunduzgi 2 smenali ish mumkin)
- Talablar: 18-50 yosh, chet ellik ishchilar qabul qilinadi (E-9, F-4, H-2 vizalari)
- Koreys tili: oddiy muloqot darajasi yetarli
- Yotoqxona beriladi (oyiga 100 000 von), xizmat avtobusi (Ansan bekati, Choji bekati), tushlik beriladi
- Maosh har oyning 10-sanasida to''lanadi, qo''shimcha ish (overtime) mavjud
- Kerakli hujjatlar: chet ellik ro''yxatga olish kartasi, bank hisobvarag''i nusxasi
- Aloqa: Kadrlar bo''limi 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'mn', 'Ансан хотын автомашины сэлбэгийн үйлдвэрт үйлдвэрлэлийн ажилтан яаралтай авна',
      'Гёнги мужийн Ансан хотын Банволь аж үйлдвэрийн цогцолборт байрлах автомашины сэлбэг үйлдвэрлэгч компани үйлдвэрлэлийн ажилтныг яаралтай авна.
- Цагийн хөлс: 10,500-12,000 вон (туршлагаас хамааран тохирно)
- Ажлын цаг: 08:00-17:00 (өдрийн 2 ээлжээр ажиллах боломжтой)
- Шаардлага: 18-50 нас, гадаад ажилчдыг хүлээн авна (E-9, F-4, H-2 визтэй)
- Солонгос хэл: энгийн харилцаа хангалттай
- Дотуур байр олгоно (сард 100,000 вон), ажилд явах автобустай (Ансан өртөө, Чожи өртөө), өдрийн хоол өгнө
- Цалин сар бүрийн 10-нд олгоно, илүү цагаар ажиллах боломжтой
- Бүрдүүлэх бичиг баримт: гадаадын иргэний бүртгэлийн карт, банкны дэвтрийн хуулбар
- Холбоо барих: Хүний нөөцийн алба 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'zh-CN', '安山汽车零部件工厂紧急招聘生产工人',
      '位于京畿道安山半月工业园区的汽车零部件制造企业紧急招聘生产岗位员工。
- 时薪：10,500-12,000韩元(可根据经验协商)
- 工作时间：08:00-17:00(可安排白班两班倒)
- 招聘对象：18-50岁,欢迎外国劳动者(E-9、F-4、H-2签证)
- 韩语要求：具备基本沟通能力即可
- 提供宿舍(每月10万韩元)、通勤班车(安山站、草芝站)、提供午餐
- 工资每月10日发放,可加班
- 所需材料：外国人登录证、银行账户复印件
- 联系方式：人事组 010-1234-5678', 'reviewed', 'human', admin_id, now(), admin_id);

  -- ══════════════════════════════════════════════════════════════════
  -- 2) 업체 홍보 x 3 (한국어+영어)
  -- ══════════════════════════════════════════════════════════════════
  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_business, admin_id, 'published', 'ko', reg_guro, '사이공 반미', '02-1234-5601', now()) returning id into post_id;
  insert into public.business_details (post_id, industry, services, discount_info)
    values (post_id, 'restaurant', '["반미","쌀국수","베트남커피"]', '오픈 기념 전메뉴 10% 할인 (이달 말까지)');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '구로 베트남 음식점 "사이공 반미" 신규 오픈', '정통 베트남 반미와 쌀국수를 맛볼 수 있는 신규 매장이 구로에 오픈했습니다. 오픈 기념으로 전 메뉴 10% 할인 이벤트를 진행합니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'New Vietnamese Restaurant "Saigon Banh Mi" Opens in Guro', 'A new restaurant serving authentic Vietnamese banh mi and pho has opened in Guro. 10% off the entire menu to celebrate our grand opening.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_business, admin_id, 'published', 'ko', reg_ansan, '고려통신 안산점', '031-1234-5602', now()) returning id into post_id;
  insert into public.business_details (post_id, industry, services, discount_info)
    values (post_id, 'telecom', '["휴대폰 개통","유심 판매","요금제 상담"]', '외국인등록증만 있으면 당일 개통 가능');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '외국인 전용 휴대폰 개통 대리점 (안산)', '외국인등록증만 있으면 당일 휴대폰 개통이 가능합니다. 유심 판매 및 요금제 상담도 다국어로 도와드립니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Mobile Phone Shop for Foreigners (Ansan)', 'Same-day phone activation with just your Alien Registration Card. Multilingual help available for SIM cards and plan consultations.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_business, admin_id, 'published', 'ko', reg_guro, '아시아마트 구로점', '02-1234-5603', now()) returning id into post_id;
  insert into public.business_details (post_id, industry, services, discount_info)
    values (post_id, 'grocery', '["동남아 식자재","할랄 식품","해외 택배"]', '3만원 이상 구매 시 배송비 무료');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '동남아 식료품 마트 "아시아마트" (구로)', '동남아시아 각국 식자재와 할랄 식품을 판매합니다. 해외 택배 서비스도 이용 가능하며, 3만원 이상 구매 시 배송비가 무료입니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Southeast Asian Grocery "Asia Mart" (Guro)', 'We sell groceries from various Southeast Asian countries as well as halal food. International parcel service available; free delivery on orders over 30,000 KRW.', 'reviewed', 'human', admin_id, now(), admin_id);

  -- ══════════════════════════════════════════════════════════════════
  -- 3) 중고거래 x 3
  -- ══════════════════════════════════════════════════════════════════
  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_used, admin_id, 'published', 'ko', reg_ansan, '판매자', '010-2234-5601', now()) returning id into post_id;
  insert into public.used_item_details (post_id, category, price, item_condition, sale_status)
    values (post_id, 'mobile_phone', 450000, 'like_new', 'selling');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '갤럭시 S23 판매합니다 (거의 새것)', '사용감 거의 없는 갤럭시 S23 판매합니다. 액정 필름, 케이스 함께 드립니다. 직거래 선호(안산).', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Selling Galaxy S23 (Like New)', 'Selling a Galaxy S23 in like-new condition. Screen protector and case included. Prefer in-person pickup in Ansan.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_used, admin_id, 'published', 'ko', reg_hwaseong, '판매자', '010-2234-5602', now()) returning id into post_id;
  insert into public.used_item_details (post_id, category, price, item_condition, sale_status)
    values (post_id, 'furniture', 80000, 'used', 'selling');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '침대 프레임 + 매트리스 판매', '이사로 인해 침대 프레임과 매트리스(슈퍼싱글)를 함께 판매합니다. 상태 양호하며 화성 지역 직거래만 가능합니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Bed Frame + Mattress for Sale', 'Moving out - selling a bed frame with a super single mattress together. Good condition. In-person pickup only in Hwaseong.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_used, admin_id, 'published', 'ko', reg_cheonan, '판매자', '010-2234-5603', now()) returning id into post_id;
  insert into public.used_item_details (post_id, category, price, item_condition, sale_status)
    values (post_id, 'appliance', 60000, 'used', 'selling');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '미니 냉장고 판매 (소형, 1인가구용)', '1인 가구용 소형 냉장고 판매합니다. 정상 작동하며 천안 지역 직거래 가능합니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Mini Fridge for Sale (Small, 1-Person Size)', 'Small mini fridge for sale, great for a single-person household. Works perfectly. In-person pickup available in Cheonan.', 'reviewed', 'human', admin_id, now(), admin_id);

  -- ══════════════════════════════════════════════════════════════════
  -- 4) 부동산·숙소 x 3
  -- ══════════════════════════════════════════════════════════════════
  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_housing, admin_id, 'published', 'ko', reg_ansan, '기숙사 관리인', '010-3234-5601', now()) returning id into post_id;
  insert into public.housing_details (post_id, property_type, deposit, monthly_rent, capacity, gender_condition, amenities, transit_info)
    values (post_id, 'dormitory', 0, 250000, 2, 'male', array['세탁기','에어컨','인터넷'], '공단 도보 10분');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '공단 인근 남성 기숙사 (2인실)', '보증금 없이 월 25만원에 입주 가능한 2인실 기숙사입니다. 세탁기, 에어컨, 인터넷 완비. 공단까지 도보 10분.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Male Dormitory Near Industrial Complex (2-Person Room)', 'No deposit needed, 250,000 KRW/month for a 2-person dormitory room. Washer, AC, and internet included. 10-minute walk to the industrial complex.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_housing, admin_id, 'published', 'ko', reg_guro, '부동산 담당자', '010-3234-5602', now()) returning id into post_id;
  insert into public.housing_details (post_id, property_type, deposit, monthly_rent, maintenance_fee, capacity, gender_condition, amenities, transit_info)
    values (post_id, 'studio', 3000000, 400000, 50000, 1, 'any', array['에어컨','냉장고','세탁기'], '구로디지털단지역 도보 5분');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '구로디지털단지역 도보 5분 원룸', '보증금 300만원 / 월세 40만원(관리비 5만원 별도)의 풀옵션 원룸입니다. 지하철역까지 도보 5분.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Studio 5 Minutes Walk from Guro Digital Complex Station', 'Fully furnished studio: 3,000,000 KRW deposit / 400,000 KRW monthly rent (+50,000 KRW maintenance). 5-minute walk to the subway station.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_housing, admin_id, 'published', 'ko', reg_namdong, '숙소 관리자', '010-3234-5603', now()) returning id into post_id;
  insert into public.housing_details (post_id, property_type, deposit, monthly_rent, capacity, gender_condition, amenities, transit_info)
    values (post_id, 'short_stay', 0, 500000, 1, 'any', array['침구 제공','인터넷','냉난방'], '인천 남동공단 인근');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '남동공단 인근 단기 숙소 (1인실)', '보증금 없이 월 50만원(관리비 포함)으로 이용 가능한 단기 숙소입니다. 침구, 인터넷, 냉난방 완비.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Short-Stay Room Near Namdong Industrial Complex', 'No deposit, 500,000 KRW/month (utilities included) for a short-stay single room. Bedding, internet, and heating/cooling included.', 'reviewed', 'human', admin_id, now(), admin_id);

  -- ══════════════════════════════════════════════════════════════════
  -- 5) 공동구매 x 3
  -- ══════════════════════════════════════════════════════════════════
  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_groupbuy, admin_id, 'published', 'ko', reg_ansan, '공구 진행자', '010-4234-5601', now()) returning id into post_id;
  insert into public.group_buy_details (post_id, price, target_count, current_count, deadline, pickup_method, pickup_region_id)
    values (post_id, 38000, 20, 8, now() + interval '10 days', '안산역 직접 픽업', reg_ansan);
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '쌀 20kg 공동구매 (안산역 픽업)', '한 포대에 38,000원, 20명 모이면 진행합니다. 현재 8명 참여. 안산역에서 직접 픽업합니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Group Buy: 20kg Rice Bag (Pickup at Ansan Station)', '38,000 KRW per bag, proceeds once 20 people join. Currently 8 joined. Pickup in person at Ansan Station.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_groupbuy, admin_id, 'published', 'ko', reg_guro, '공구 진행자', '010-4234-5602', now()) returning id into post_id;
  insert into public.group_buy_details (post_id, price, target_count, current_count, deadline, pickup_method, pickup_region_id)
    values (post_id, 25000, 30, 12, now() + interval '14 days', '구로디지털단지역 픽업', reg_guro);
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '겨울 방한자켓 공동구매', '1인당 25,000원, 30명 모이면 진행합니다. 현재 12명 참여. 구로디지털단지역에서 픽업합니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Group Buy: Winter Padded Jacket', '25,000 KRW each, proceeds once 30 people join. Currently 12 joined. Pickup at Guro Digital Complex Station.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_groupbuy, admin_id, 'published', 'ko', reg_gwangsan, '공구 진행자', '010-4234-5603', now()) returning id into post_id;
  insert into public.group_buy_details (post_id, price, target_count, current_count, deadline, pickup_method, pickup_region_id)
    values (post_id, 15000, 15, 5, now() + interval '7 days', '광산구 우체국 앞', reg_gwangsan);
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '휴대폰 케이스 + 유심 세트 공동구매', '1인당 15,000원, 15명 모이면 진행합니다. 현재 5명 참여. 광산구 우체국 앞에서 픽업합니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Group Buy: Phone Case + SIM Card Set', '15,000 KRW each, proceeds once 15 people join. Currently 5 joined. Pickup in front of Gwangsan-gu Post Office.', 'reviewed', 'human', admin_id, now(), admin_id);

  -- ══════════════════════════════════════════════════════════════════
  -- 6) 행사·모임 x 3
  -- ══════════════════════════════════════════════════════════════════
  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_events, admin_id, 'published', 'ko', reg_ansan, '모임 운영자', '010-5234-5601', now()) returning id into post_id;
  insert into public.event_details (post_id, event_type, event_date, event_time, venue, fee, capacity, current_participants, organizer, supported_languages, application_method)
    values (post_id, 'nationality_meetup', current_date + interval '20 days', '14:00', '안산 다문화센터', 0, 50, 18, '안산 베트남인 모임', array['vi','ko'], '채팅방 참여 후 신청');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '안산 베트남인 커뮤니티 정기모임', '매달 진행하는 안산 지역 베트남인 정기모임입니다. 참가비 무료, 안산 다문화센터에서 진행합니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Ansan Vietnamese Community Monthly Meetup', 'A monthly meetup for the Vietnamese community in Ansan. Free to attend, held at the Ansan Multicultural Center.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_events, admin_id, 'published', 'ko', reg_guro, '모임 운영자', '010-5234-5602', now()) returning id into post_id;
  insert into public.event_details (post_id, event_type, event_date, event_time, venue, fee, capacity, current_participants, organizer, supported_languages, application_method)
    values (post_id, 'korean_study', current_date + interval '10 days', '19:00', '구로구민센터', 0, 20, 9, '구로 한국어교실', array['ko','en','vi','zh-CN'], '전화 신청');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '무료 한국어 교실 (초급)', '외국인 근로자를 위한 무료 한국어 초급반입니다. 구로구민센터에서 매주 진행하며 다국어 통역 지원됩니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Free Korean Language Class (Beginner)', 'A free beginner-level Korean class for foreign workers, held weekly at Guro Community Center with multilingual interpretation support.', 'reviewed', 'human', admin_id, now(), admin_id);

  insert into public.posts (category_id, created_by, status, original_language_code, region_id, contact_name, contact_phone, published_at)
    values (cat_events, admin_id, 'published', 'ko', reg_gimhae, '모임 운영자', '010-5234-5603', now()) returning id into post_id;
  insert into public.event_details (post_id, event_type, event_date, event_time, venue, fee, capacity, current_participants, organizer, supported_languages, application_method)
    values (post_id, 'culture', current_date + interval '30 days', '11:00', '김해 다문화광장', 5000, 200, 60, '김해시 다문화가족지원센터', array['ko','vi','th','uz'], '현장 접수');
  insert into public.post_translations (post_id, language_code, translated_title, translated_content, translation_status, translation_source, reviewed_by, reviewed_at, created_by) values
    (post_id, 'ko', '김해 다문화 축제', '다양한 나라의 음식과 공연을 즐길 수 있는 다문화 축제입니다. 참가비 5,000원, 현장 접수 가능합니다.', 'reviewed', 'human', admin_id, now(), admin_id),
    (post_id, 'en', 'Gimhae Multicultural Festival', 'A multicultural festival featuring food and performances from many countries. 5,000 KRW entry fee, on-site registration available.', 'reviewed', 'human', admin_id, now(), admin_id);

  raise notice 'sample_data: seeded 16 sample posts for super_admin %', admin_id;
end $$;
