-- KoreaLink: 금칙어 초기 시드(마약류/성매매/도박/불법대출 등 명백한 위반어 위주)
-- 오탐(정상 게시글 차단) 위험이 낮은 명확한 단어 위주의 시작 세트이며,
-- 관리자가 /admin/prohibited-words 화면에서 계속 추가/삭제할 수 있다.

insert into public.prohibited_words (language_code, word, severity) values
  ('ko', '필로폰', 'block'),
  ('ko', '대마초', 'block'),
  ('ko', '엑스터시', 'block'),
  ('ko', '아이스', 'block'),
  ('ko', '물뽕', 'block'),
  ('ko', '출장마사지', 'block'),
  ('ko', '조건만남', 'block'),
  ('ko', '스포츠토토', 'block'),
  ('ko', '사설토토', 'block'),
  ('ko', '카지노총판', 'block'),
  ('ko', '신불자대출', 'block'),
  ('en', 'methamphetamine', 'block'),
  ('en', 'cocaine', 'block'),
  ('en', 'heroin', 'block'),
  ('en', 'fentanyl', 'block'),
  ('en', 'escort service', 'block'),
  ('en', 'online casino', 'block'),
  ('zh-CN', '冰毒', 'block'),
  ('zh-CN', '摇头丸', 'block'),
  ('zh-CN', '上门服务', 'block'),
  ('zh-CN', '网络赌场', 'block'),
  ('ru', 'героин', 'block'),
  ('ru', 'кокаин', 'block'),
  ('ru', 'метамфетамин', 'block'),
  ('ru', 'эскорт услуги', 'block'),
  ('vi', 'ma túy đá', 'block'),
  ('vi', 'heroin', 'block'),
  ('vi', 'mại dâm', 'block')
on conflict (language_code, word) do nothing;
