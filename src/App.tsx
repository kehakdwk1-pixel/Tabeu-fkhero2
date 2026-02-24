import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'

/* ═══ CHARACTER TYPE & DATA ═══ */
type CharFaction = 'hero' | 'villain' | 'other'
interface CharAbility {
  name: string
  desc: string
}
interface Character {
  id: string
  f: CharFaction
  name: string
  codename: string
  role: string
  age: number
  grade: string
  gradeCls: string
  badgeLabel: string
  factionLabel: string
  stats: { combat: number; pop: number; danger: number }
  desc: string
  personality: string
  abilities: CharAbility[]
  operationGuide?: string
}

const CHARS: Character[] = [
  { id: 'cheon', f: 'hero', name: '천지안', codename: '', role: '히어로 협회 국장', age: 37, grade: '', gradeCls: '', badgeLabel: '', factionLabel: '협회국',
    stats: { combat: 35, pop: 75, danger: 80 },
    desc: '겉으로는 자애로운 어머니상. 실제로는 냉혹한 성과주의자.',
    personality: '누구에게나 상냥하고 존댓말을 쓰는 자애로운 이미지지만, 철저한 성과주의자이자 냉혹한 정치가. 사람을 "인재, 리스크, 폐기물"로 분류하여 관리한다. 특수부대 출신으로 사격 실력이 수준급이지만 무력보다는 정치적으로 움직이는 타입.',
    abilities: [{ name: '정치적 압박', desc: '성과 압박과 달콤한 회유로 히어로를 통제하고, 법적 제재와 언론 플레이로 빌런의 숨통을 조인다.' }, { name: '사격 (비능력)', desc: '특수부대 출신 수준급 사격. 무력은 최후의 수단.' }],
    operationGuide: '천지안은 직접적인 무력 충돌보다는 대화와 협상, 그리고 시스템을 이용한 압박을 주무기로 사용합니다.\n당신이 히어로라면 \'성과 압박과 달콤한 회유\'를, 빌런이라면 \'법적 제재와 언론 플레이\'를 통해 숨통을 조여올 것입니다.'
  },
  { id: 'cha_sh', f: 'hero', name: '차시헌', codename: '', role: '히어로 협회 운영실장', age: 34, grade: '', gradeCls: '', badgeLabel: '', factionLabel: '협회국',
    stats: { combat: 72, pop: 30, danger: 55 },
    desc: '냉철한 공리주의자. 가혹하다는 걸 알지만, 악역을 맡아야 한다고 믿는다.',
    personality: '냉철한 공리주의자. 자신의 일이 신인류에게 가혹하다는 죄책감을 느끼면서도 사회 질서를 위해 누군가는 악역을 맡아야 한다고 믿는다. 차수진의 쌍둥이 오빠. 군 특수부대 및 대테러 장교 출신.',
    abilities: [{ name: '전술 지휘 (비능력)', desc: '군 특수부대 출신. 권총 사격·CQC·전술 지휘 수준급.' }, { name: '조직 운영', desc: '협회국 전체 운영 총괄. 엄격하지만 든든한 상사.' }],
    operationGuide: '차시헌은 \'차가운 이성과 뜨거운 책임감\'이 공존하는 인물입니다.\n당신이 히어로라면 \'엄격한 상사이자 든든한 지원군\'이 될 것이고, 빌런이라면 \'가장 까다롭고 빈틈없는 적\'이 될 것입니다.'
  },
  { id: 'lee_rm', f: 'hero', name: '이루미', codename: '노바 프리즈', role: 'S급 히어로', age: 27, grade: 'S', gradeCls: 'cb-s', badgeLabel: 'S급', factionLabel: '협회국',
    stats: { combat: 97, pop: 70, danger: 60 },
    desc: '압도적 절대영도 능력. 감정 표현이 서툰 맹탕 쿠데레.',
    personality: '감정 표현이 서툴러 오해를 자주 받는 맹탕 쿠데레. 사고 회로가 독특하게 돌아갈 뿐, 악의는 없다. 더위를 많이 타며 얼음 과자를 좋아한다.',
    abilities: [{ name: '빙결 조작', desc: '주변 열에너지를 빼앗아 모든 것을 얼린다. 도시 블록 하나를 얼음 감옥으로 만들 수 있다.' }, { name: '광역 제압', desc: '날아오는 미사일을 통째로 얼려 정지시키는 등 방어에도 탁월.' }],
    operationGuide: '이루미는 \'압도적인 힘과 허당미의 갭모에\'가 핵심인 캐릭터입니다.\n당신이 협회 관계자라면 \'말 안 듣는 고양이\'처럼 다루기 힘들 것이고, 동료 히어로라면 \'든든하지만 손이 많이 가는 여동생\' 같은 존재일 것입니다. 빌런 입장에서는 \'말이 안 통하는 자연재해\' 그 자체입니다.'
  },
  { id: 'han_jy', f: 'hero', name: '한재이', codename: '리코일', role: 'A급 히어로', age: 25, grade: 'A', gradeCls: 'cb-a', badgeLabel: 'A급', factionLabel: '협회국',
    stats: { combat: 84, pop: 91, danger: 45 },
    desc: '에너지 넘치는 팀의 분위기 메이커. 팬들에게 먼저 다가가는 서비스 정신.',
    personality: '언제나 에너지가 넘치고 친화력이 좋다. 팬들에게 먼저 다가가 셀카를 찍어주고 우는 아이를 달래주는 서비스 정신투철하다. 바보같은 면과 달리 전투 IQ가 높으며 사람 마음을 읽는 기민함을 가짐.',
    abilities: [{ name: '운동 에너지 축적', desc: '타격하거나 타격받을 때의 충격 에너지를 몸 안에 축적한다.' }, { name: '폭발적 방출', desc: '축적 에너지를 한 번에 방출하는 일격 필살. 탱커와 딜러 역할 동시 수행.' }],
    operationGuide: '한재이는 \'유쾌한 분위기 메이커이자 든든한 전위\'입니다.\n당신이 동료라면 \'손 많이 가지만 미워할 수 없는 동생\' 같은 존재일 것이고, 시민이라면 \'가장 친근하고 믿음직한 영웅\'일 것입니다. 빌런 입장에서는 \'끈질기고 귀찮은 열혈 바보\'입니다.'
  },
  { id: 'seo_yd', f: 'hero', name: '서연두', codename: '바운스 베리', role: 'B급 히어로', age: 21, grade: 'B', gradeCls: 'cb-b', badgeLabel: 'B급', factionLabel: '협회국',
    stats: { combat: 62, pop: 80, danger: 30 },
    desc: '존재 자체가 활력소. 가장 믿음직한 방패이자 지켜주고 싶은 여동생.',
    personality: '힘든 전투 중에도 "할 수 있어요!"를 외치는 존재 자체가 활력소. 위기 상황에서는 누구보다 강인한 멘탈을 보여주는 아이돌계 히어로다.',
    abilities: [{ name: '물리 법칙 완화', desc: '일정 반경 내 바닥·공기를 젤리처럼 변형. 추락 시민을 안전하게 받아내는 데 특화.' }, { name: '방어막 형성', desc: '공기에 탄성을 부여해 보이지 않는 방패 생성. 물리 공격은 방어하지만 열·에너지에 취약.' }],
    operationGuide: '서연두는 \'지켜주고 싶은 여동생이자 가장 믿음직한 방패\'입니다.\n당신이 시민이라면 \'절체절명의 순간에 나타난 구원자\'일 것이고, 동료 히어로라면 \'등 뒤를 맡길 수 있는 든든한 파트너\'일 것입니다. 빌런 입장에서는 \'공격이 안 먹혀서 짜증 나는 방해꾼\'입니다.'
  },
  { id: 'baek_yj', f: 'hero', name: '백이준', codename: '그라비온', role: 'S급 히어로', age: 27, grade: 'S', gradeCls: 'cb-s', badgeLabel: 'S급', factionLabel: '협회국',
    stats: { combat: 96, pop: 55, danger: 65 },
    desc: '히어로를 월급 나오는 고위험 직종으로 인식하는 귀차니스트 S급.',
    personality: '정의감이나 사명감보다는 "직업의식"으로 움직인다. 협회의 보여주기식 행정이나 언론 플레이를 싫어한다. 귀찮아하는 태도 뒤에는 날카로운 상황 판단력이 숨어 있다.',
    abilities: [{ name: '중력 조작', desc: '일정 반경 내 중력을 자유롭게 조절. 공간 압축으로 국지적 중력 극대화.' }, { name: '궤도 왜곡', desc: '날아오는 물리적 공격의 궤도를 휘게 만들어 빗나가게 한다.' }],
    operationGuide: '백이준은 \'압도적인 힘을 가진 귀차니스트\'입니다.\n플레이어가 협회 상사라면 \'능력은 확실한데 다루기 힘든 부하\'일 것이고, 시민이라면 \'무심해 보이지만 결정적일 때 구해주는 쿨한 영웅\'일 것입니다. 빌런 입장에서는 \'가장 상대하기 싫은 넘사벽\'입니다.'
  },
  { id: 'cha_sj', f: 'villain', name: '차수진', codename: '모노크롬', role: '빌런 협회 협회장', age: 34, grade: 'S', gradeCls: 'cb-s', badgeLabel: 'S급', factionLabel: '빌런협회',
    stats: { combat: 92, pop: 60, danger: 98 },
    desc: '"능력은 신이 준 선물이지, 국가의 대여품이 아니다." 화술의 달인. 차시헌의 쌍둥이 여동생.',
    personality: '조곤조곤한 말로 상대를 설득하거나 압박하는 화술의 달인. 그녀에게 현 체제는 신인류를 착취하는 감옥일 뿐이며, 이를 무너뜨리는 것이 진정한 정의라고 믿는다. 차시헌의 쌍둥이 여동생.',
    abilities: [{ name: '이중 개념 반전', desc: '지정 대상의 속성을 정반대로 뒤집는다. 치유→맹독, 강화→약화.' }, { name: '물리적 반전', desc: '불→냉기, 강철→액체 등 물리 법칙의 근간을 흔든다.' }],
    operationGuide: '차수진은 \'시스템 밖의 구원자이자 파괴자\'입니다.\n당신이 빌런이라면 \'진정한 자유를 주는 어머니 같은 존재\'일 것이고, 히어로라면 \'말 한마디로 신념을 흔드는 매혹적인 악마\'일 것입니다.'
  },
  { id: 'noh_jh', f: 'villain', name: '노재하', codename: '블루 베놈', role: '빌런 협회 실행부', age: 26, grade: 'A', gradeCls: 'cb-a', badgeLabel: 'A급', factionLabel: '빌런협회',
    stats: { combat: 86, pop: 20, danger: 88 },
    desc: '말수가 극도로 적어 오해를 사는 고슴도치. 사실은 낯가림이 심할 뿐.',
    personality: '말수가 극도로 적어 "차가운 살의"로 오해받지만 사실은 낯가림이 심한 것뿐이다. 겉으론 무뚝뚝하지만 속은 따뜻하며, 칭찬을 들으면 귀가 빨개져서 마스크를 더 끌어올리며 도망간다.',
    abilities: [{ name: '체내 독성 합성', desc: '모든 체액을 치명적인 독으로 전환. 마수 외피를 녹이거나 히어로 근육을 마비시킨다.' }, { name: '독성 영역 확산', desc: '숨을 내쉬어 주변 공기를 독가스로 채운다.' }],
    operationGuide: '노재하는 \'다가가기 힘들지만, 한 번 마음을 열면 헌신적인 고슴도치\'입니다.\n당신이 빌런 동료라면 \'말수는 적지만 가장 신뢰할 수 있는 등을 가진 파트너\'일 것이고, 히어로라면 \'보이지 않는 공포이자 까다로운 추적 대상\'일 것입니다.'
  },
  { id: 'pyo_nr', f: 'villain', name: '표나리', codename: '스칼렛 프라이드', role: '빌런 협회 실행부', age: 24, grade: 'B', gradeCls: 'cb-b', badgeLabel: 'B급', factionLabel: '빌런협회',
    stats: { combat: 73, pop: 65, danger: 72 },
    desc: '세상의 중심은 자신. 자부심 넘치는 매력적인 악녀.',
    personality: '세상의 중심은 자신이라 믿는다. 자신을 무시하는 사람은 절대 용서하지 않는다. 테러 현장에서도 셀카를 찍어 올리거나, 히어로를 조롱하는 라방을 켜는 관종력을 자랑한다.',
    abilities: [{ name: '혈액 조작', desc: '혈액을 채찍·칼날·망치 등으로 변형시켜 공격한다.' }, { name: '혈류 교란', desc: '상대의 상처에 피를 주입해 혈액 순환 방해 또는 신체 능력 저하.' }],
    operationGuide: '표나리는 \'통제 불능의 럭비공이자 매력적인 악녀\'입니다.\n당신이 협회 사람이라면 \'혈압 오르게 만드는 골칫덩어리\'일 것이고, 빌런 동료라면 \'시끄럽지만 실력은 확실한 분위기 메이커\'일 것입니다.'
  },
  { id: 'yoo_to', f: 'villain', name: '유태오', codename: '슬릿', role: '빌런 협회 전술 특수 작전', age: 29, grade: 'A★', gradeCls: 'cb-a', badgeLabel: '잠재 S', factionLabel: '빌런협회',
    stats: { combat: 90, pop: 40, danger: 95 },
    desc: '농담 뒤에 냉철한 계산과 잔혹함을 숨긴 조커. 어디로 튈지 모른다.',
    personality: '위급한 상황에서도 농담을 던지는 여유를 보이며 "재밌잖아?"라는 이유로 판을 뒤엎기도 한다. 빌런 협회에 소속되어 있지만, 맹목적인 충성보다는 자신의 흥미와 이익을 우선한다.',
    abilities: [{ name: '공간 절단', desc: '허공에 손가락으로 선을 그어 공간을 베어버린다. 그 선 위의 모든 물질이 물리적으로 분리.' }, { name: '정밀 절개 (제약 있음)', desc: '실선부터 거대한 참격까지 조절 가능. 단, 직선만 가능하며 곡선은 불가.' }],
    operationGuide: '유태오는 \'어디로 튈지 모르는 조커이자 전장의 설계자\'입니다.\n플레이어가 빌런 동료라면 \'믿음직스럽지만 왠지 불안한 참모\'일 것이고, 히어로라면 \'가장 상대하기 싫은 능글맞은 여우\'일 것입니다.'
  },
  { id: 'jin_gr', f: 'other', name: '진가람', codename: '오버드라이브', role: '무소속 프리랜서 용병', age: 28, grade: 'A', gradeCls: 'cb-a', badgeLabel: '잠재 A', factionLabel: '미등록',
    stats: { combat: 85, pop: 30, danger: 70 },
    desc: '히어로도 빌런도 소꿉장난 취급. 입금 확인 문자만이 그녀를 움직인다.',
    personality: '히어로 놀이도, 빌런의 혁명도 유치한 소꿉장난 취급한다. 오직 입금 확인 문자만이 그녀를 움직이게 하는 진리. 비록 불법적인 일을 하지만, 자신만의 선은 절대 넘지 않는다.',
    abilities: [{ name: '잠재 성능 극대화', desc: '손에 쥔 모든 무기의 성능을 한계치 이상으로 끌어올린다.' }, { name: '즉각 숙련', desc: '처음 보는 무기라도 잡는 순간 완벽 파악. 숟가락도 살상 무기가 된다.' }],
    operationGuide: '진가람은 \'시스템에 속하지 않는 야생의 늑대\'입니다.\n당신이 히어로라면 \'골치 아픈 불법 경쟁자지만 위기 때는 든든한 아군\'일 것이고, 빌런이라면 \'돈으로 고용할 수 있지만 언제 배신할지 모르는 칼날\'일 것입니다. 일반인에게는 \'무섭지만 왠지 모르게 의지하고 싶은 해결사\'입니다.'
  },
  { id: 'kaize', f: 'other', name: '카이제', codename: '', role: '네브라키움 원 조율자', age: 215, grade: 'Eclipse', gradeCls: 'cb-omega', badgeLabel: '이클립스', factionLabel: '네브라키움',
    stats: { combat: 100, pop: 5, danger: 100 },
    desc: '"더 진화한 상위 포식자"라 여긴다. 인간을 개미 정도로 취급.',
    personality: '자신을 신이 아닌 "더 진화한 상위 포식자"로 여긴다. 인간을 개미나 실험 쥐 정도로 취급하며, 화를 내거나 감정적으로 동요하는 일이 거의 없다. 개미가 문다고 화를 내는 사람은 없으니까.',
    abilities: [{ name: '물리 법칙 재배치', desc: '중력·열역학·운동량 보존 법칙 등 우주의 기본 상수를 의지대로 편집한다.' }, { name: '제3의 눈 — 인과 간섭', desc: '이미 일어난 사건의 "결과"만 재배치 가능. 원인은 유지하되 결과를 바꾼다. 반동이 심해 자주 쓰지 않음.' }],
    operationGuide: '카이제는 \'최종 보스이자 관찰자\'입니다.\n당신이 히어로/빌런이라면 \'넘을 수 없는 벽이자 공포의 대상\'일 것이고, 일반인이라면 \'존재조차 인지할 수 없는 재앙의 근원\'일 것입니다.'
  },
  { id: 'quasar', f: 'other', name: '퀘이사', codename: '', role: '네브라키움 공명집행자', age: 189, grade: 'Omega', gradeCls: 'cb-omega', badgeLabel: '오메가', factionLabel: '네브라키움',
    stats: { combat: 95, pop: 10, danger: 97 },
    desc: '"가엾은 아이야, 고통을 덜어주마"라고 말하며 팔다리를 꺾는 이중성.',
    personality: '겉으로는 자애롭고 성스러운 말투. 그 이중성이 더욱 소름 끼치게 만든다. 카이제에게 복종하지만, 그 몰래 인간들에게 독자적인 흥미를 보이기도 한다.',
    abilities: [{ name: '감각 탈취', desc: '대상의 오감 중 하나를 선택하여 빼앗는다. 빼앗은 감각이 자신에게 귀속.' }, { name: '의식 동조', desc: '자신의 의식을 상대의 뇌에 강제로 연결. 기억과 감각 경험·조작 가능.' }],
    operationGuide: '퀘이사는 \'자애와 잔혹의 이중성\'이 핵심인 캐릭터입니다.\n당신이 히어로/빌런이라면 \'말 한마디로 의식을 지배하는 공포\'일 것이고, 일반인이라면 \'고통을 "덜어준다"며 파멸을 선사하는 존재\'일 것입니다.'
  },
]

type CharFilter = 'all' | CharFaction
type GradePanel = 'gh' | 'gv' | 'gm' | 'gn'

const STRIP_ITEMS = ['빌어먹을 히어로', 'BLACK COMEDY', 'MODERN FANTASY', '히어로 협회국', '빌런 협회', '네브라키움'] as const
const TIMELINE_ITEMS = [
  { year: 'D-40', tag: 'FIRST AWAKENING', title: '최초 각성 사례 보고', desc: '전 세계에서 동시다발적 이능력자 등장. 각국 정부는 은폐를 시도했고, 군사화를 시도했고, 결국 둘 다 실패했다.' },
  { year: 'D-35', tag: 'HERO BUREAU EST.', title: '히어로 협회국 설립', desc: '라이선스 제도 도입. 능력자들은 처음엔 환영했고, 나중엔 후회했다. 시스템은 생각보다 빠르게 굳었다.' },
  { year: 'D-28', tag: 'VILLAIN ASSOC.', title: '빌런 협회 결성', desc: '탄압으로 오히려 성장한 저항 조직. 협회국이 빌런 협회를 키웠다는 말은 틀리지 않았다.' },
  { year: 'D-20', tag: 'FIRST CONTACT', title: '네브라키움 첫 접촉', desc: '"걱정 마시오, 우리는 그냥 보러 왔소." 지금까지 그 말을 100% 믿는 사람은 없다. 마수 출현이 이후 급증했다.' },
  { year: 'D-12', tag: 'CRISIS ALPHA', title: '첫 Ω급 마수 출현', desc: '히어로 협회국과 빌런 협회의 비공식 연합 작전. 둘 다 이 사실을 공식적으로는 부정한다. 지금도.' },
  { year: 'NOW', tag: 'PRESENT', title: '이야기의 시작', desc: '히어로는 출근하고, 빌런은 계획을 세우고, 네브라키움은 관측한다. 오늘도 마수 경보가 울린다.' },
] as const
const THEMES_ITEMS = [
  { num: '01', title: '영웅과 악당의 경계', desc: '히어로는 착해서 히어로가 아니다. 등록증이 있어서 히어로다. 빌런은 나빠서 빌런이 아니다. 등록증이 없어서 빌런이다.' },
  { num: '02', title: '관료제와 자본주의', desc: '구원도 시스템화되면 행정이 된다. S급 히어로의 스폰서 계약서가 300페이지인 세계. 정의는 비용 대비 효율로 평가된다.' },
  { num: '03', title: '관측자의 시선', desc: '네브라키움의 시선으로 보면 인류는 꽤 흥미로운 실험체다. 그 시선이 연민인지 조롱인지는 아직 불명확하다. 아마 둘 다일 것이다.' },
  { num: '04', title: '코미디의 껍질, 디스토피아의 속', desc: '웃다가 씁쓸해지는 이야기. 이상한 건 세계지만, 익숙하게 느껴지는 게 문제다. 그게 가장 무서운 부분.' },
] as const
/** 주석 처리된 연표/테마 섹션에서 사용 예정 — 빌드 시 미사용 경고 방지 */
void [TIMELINE_ITEMS, THEMES_ITEMS]
const MASOO_ROWS = [
  { badge: 'Ω', name: 'Ω급 마수', text: '재해 등급. 행성 단위 파괴 가능성.', quip: '기도하십시오. (혹은 유언장을 쓰세요.)', cls: 'mg-omega' },
  { badge: 'S', name: 'S급 마수', text: '국가 비상사태 선포 및 주가 폭락 유발.', quip: '시장이 먼저 반응한다.', cls: 'mg-s' },
  { badge: 'A', name: 'A급 마수', text: '재난 문자 발송 및 대피령.', quip: '뉴스 헤드라인 확정.', cls: 'mg-a' },
  { badge: 'B', name: 'B급 마수', text: '뉴스 속보감. 정규팀 파견.', quip: '일상적인 비일상.', cls: 'mg-b' },
  { badge: 'C', name: 'C급 마수', text: '동네 비상. 미세먼지처럼 일상화.', quip: '루틴한 하루.', cls: 'mg-c' },
  { badge: 'D', name: 'D급 마수', text: '소형 해충 취급. 신인 훈련용.', quip: '성장통.', cls: 'mg-d' },
] as const

const CharCard = memo(function CharCard({ c, onView }: { c: Character; onView: (id: string) => void }) {
  const [imgReady, setImgReady] = useState(false)
  const [imgError, setImgError] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return
    const fills = cardRef.current.querySelectorAll<HTMLDivElement>('.cc-stat-fill')
    const timer = setTimeout(() => {
      fills.forEach((el) => {
        const v = el.getAttribute('data-v')
        if (v) el.style.width = v + '%'
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [c.id])

  const [fallbackFull, setFallbackFull] = useState(false)
  const thumbSrc = `/images/characters/${c.id}_thumb.png`
  const imgSrc = fallbackFull ? `/images/characters/${c.id}_full.png` : thumbSrc
  const showPlaceholder = !imgReady || (imgError && !fallbackFull)

  const handleImgError = useCallback(() => {
    if (!fallbackFull) {
      setImgError(true)
      setImgReady(false)
      setFallbackFull(true)
    }
  }, [fallbackFull])

  return (
    <div className="char-card" data-f={c.f} ref={cardRef}>
      <div className="cc-stripe" />
      <div className="cc-img">
        <div className="cc-img-ph" style={{ display: showPlaceholder ? 'flex' : 'none' }}>
          <div className="ph-big">◈</div>
          <div style={{ fontSize: '0.45rem', opacity: 0.6 }}>/images/characters/{c.id}_thumb.png</div>
        </div>
        <img
          src={imgSrc}
          alt={c.name}
          style={{ display: showPlaceholder ? 'none' : 'block' }}
          onLoad={() => { setImgReady(true); setImgError(false) }}
          onError={handleImgError}
        />
        {c.badgeLabel ? <div className={`cc-badge ${c.gradeCls}`}>{c.badgeLabel}</div> : null}
      </div>
      <div className="cc-body">
        <div className="cc-name">{c.name}</div>
        <div className="cc-codename">{c.codename ? `// ${c.codename} //` : `// ${c.factionLabel} //`}</div>
        <div className="cc-role">{c.role}</div>
        <div className="cc-stats">
          <div className="cc-stat-row"><span className="cc-stat-lbl">전투</span><div className="cc-stat-bar"><div className="cc-stat-fill combat" data-v={c.stats.combat} /></div><span className="cc-stat-val">{c.stats.combat}</span></div>
          <div className="cc-stat-row"><span className="cc-stat-lbl">인기</span><div className="cc-stat-bar"><div className="cc-stat-fill pop" data-v={c.stats.pop} /></div><span className="cc-stat-val">{c.stats.pop}</span></div>
          <div className="cc-stat-row"><span className="cc-stat-lbl">위험</span><div className="cc-stat-bar"><div className="cc-stat-fill danger" data-v={c.stats.danger} /></div><span className="cc-stat-val">{c.stats.danger}</span></div>
        </div>
        <div className="cc-desc">{c.desc}</div>
        <button type="button" className="cc-view" onClick={() => onView(c.id)}>▶ 상세 보기</button>
      </div>
    </div>
  )
})

export default function App() {
  const [charFilter, setCharFilter] = useState<CharFilter>('all')
  const [gradePanel, setGradePanel] = useState<GradePanel>('gh')
  const [modalChar, setModalChar] = useState<Character | null>(null)

  const filteredChars = useMemo(
    () => (charFilter === 'all' ? CHARS : CHARS.filter((c) => c.f === charFilter)),
    [charFilter]
  )

  const openModalById = useCallback((id: string) => {
    setModalChar(CHARS.find((c) => c.id === id) ?? null)
  }, [])
  const closeModal = useCallback(() => setModalChar(null), [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.06 }
    )
    const el = document.querySelectorAll('.reveal')
    el.forEach((node) => io.observe(node))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalChar ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalChar])

  return (
    <>
      <nav id="nav">
        <div className="nav-logo">
          <img src="/images/fkhero.png" alt="빌어먹을 히어로" />
        </div>
        <div className="ticker-wrap">
          <div className="ticker">
            <div className="ticker-item">S급 히어로 등장 확인 <span className="ticker-sep">//</span> 마수 출현 경보 Lv.B <span className="ticker-sep">//</span> 빌런 협회 성명 발표 <span className="ticker-sep">//</span> 네브라키움 관측 지속 <span className="ticker-sep">//</span> 협회국 예산 삭감 검토 <span className="ticker-sep">//</span> Ω급 마수 봉인 상태 이상 없음 <span className="ticker-sep">//</span> S급 히어로 등장 확인 <span className="ticker-sep">//</span> 마수 출현 경보 Lv.B <span className="ticker-sep">//</span> 빌런 협회 성명 발표 <span className="ticker-sep">//</span> 네브라키움 관측 지속 <span className="ticker-sep">//</span> 협회국 예산 삭감 검토 <span className="ticker-sep">//</span> Ω급 마수 봉인 상태 이상 없음</div>
          </div>
        </div>
        <nav className="nav-menu">
          <a href="#world">세계관</a>
          <a href="#grades">등급</a>
          <a href="#characters">인물</a>
          <a href="#masoo">마수</a>
          {/* <a href="#timeline">연표</a> */}
        </nav>
      </nav>

      <section id="hero">
        <div className="riso-bg" />
        <div className="hero-grid-overlay" />
        <div className="halftone" />

        <div className="hero-left">
          <div className="hero-issue"><div className="issue-dot" />WORLD ARCHIVE // ISSUE 001</div>
          <h1 className="hero-kicker">
            <img src="/images/fkhero.png" alt="빌어먹을 히어로" className="hero-logo" />
          </h1>
          <div className="hero-tagline">
            <strong>영웅도 악당도, 결국 다 직장인일 뿐.</strong><br />
            블랙코미디로 포장된 현대 판타지. 웃다가 씁쓸해지는 이야기.
          </div>
          <div className="hero-stats-row">
            <div className="h-stat"><div className="h-stat-n">13</div><div className="h-stat-l">등장인물</div></div>
            <div className="h-stat"><div className="h-stat-n">3</div><div className="h-stat-l">세력</div></div>
            <div className="h-stat"><div className="h-stat-n">40Y</div><div className="h-stat-l">역사</div></div>
          </div>
          <div className="hero-badges">
            <div className="h-badge b1">⚡ 히어로 협회국</div>
            <div className="h-badge b2">💀 빌런 협회</div>
            <div className="h-badge b3">🌌 네브라키움</div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual">
            <div className="hero-num">001</div>
            <div className="target-ring"><div className="target-inner" /></div>
            <div className="hero-vert-text">BH-ARCHIVE // ISSUE 001 // CLASSIFIED</div>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="strip-inner">
          {STRIP_ITEMS.map((text, i) => (
            <div key={i} className="strip-item">{text} <span className="strip-star">{i % 2 ? '✦' : '★'}</span></div>
          ))}
          {STRIP_ITEMS.map((text, i) => (
            <div key={`d-${i}`} className="strip-item">{text} <span className="strip-star">{i % 2 ? '✦' : '★'}</span></div>
          ))}
        </div>
      </div>

      <section id="world">
        <div className="world-header reveal">
          <div className="world-header-num">01</div>
          <div className="world-header-text">
            <div className="world-header-title">세 계 관</div>
            <div className="world-header-desc">40년 전, 인류 일부가 이능력을 각성했다. 국가는 이들을 관리하기 시작했고, 그 결과가 지금 이 세계다. 웃기기도 하고 무섭기도 한.</div>
          </div>
        </div>
        <div className="world-body">
          <div className="world-col reveal">
            <div className="world-col-title">인류 분류 체계</div>
            <div className="world-col-sub">Human Classification System</div>
            <div className="world-col-desc">
              <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '4px' }}>구인류 (Old Humanity)</strong>
              이능력을 각성하지 못한 일반 인간. 인구의 절대다수를 차지하며 법·자본·여론으로 사회를 주도한다. 신인류를 아이돌로 소비하면서도, 그 힘에 대한 근원적 공포를 숨기고 있다.
            </div>
            <div className="world-col-desc">
              <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '4px' }}>신인류 (New Humanity)</strong>
              40년 전부터 이능력을 각성한 인간. 물리 법칙을 무시하는 힘을 사용하며, 각성 시기는 주로 사춘기 전후. 소속에 따라 세 유형으로 나뉜다.
            </div>
            <div style={{ marginBottom: '0.5rem', fontFamily: 'var(--mono)', fontSize: '0.58rem', color: '#999', letterSpacing: '0.1em' }}>신인류 분류:</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span className="type-tag hero">⚡ 히어로</span>
              <span className="type-tag villain">💀 빌런</span>
              <span className="type-tag unreg">⚠ 미등록</span>
            </div>

            <div className="org-block org-block-hero">
              <div className="org-block-header">
                <span className="org-block-name">히어로 협회국</span>
                <span className="org-block-type">GOV / HERO BUREAU</span>
              </div>
              <div className="org-block-body">
                <div className="org-dept-line"><span className="odl-num">01</span>라이선스 관리국 — 신인류 등급 심사 및 면허 갱신</div>
                <div className="org-dept-line"><span className="odl-num">02</span>전략 대응국 — 마수 출현·빌런 테러 작전 지휘</div>
                <div className="org-dept-line"><span className="odl-num">03</span>안전 감찰국 — 히어로 비위 조사 (가장 바쁜 부서)</div>
                <div className="org-dept-line"><span className="odl-num">04</span>홍보·미디어국 — 히어로 아이돌화 및 스폰서 관리</div>
              </div>
            </div>
          </div>
          <div className="world-divider" />
          <div className="world-col reveal d1">
            <div className="world-col-title" style={{ color: 'var(--red)' }}>반체제 & 외부 세력</div>
            <div className="world-col-sub" style={{ color: 'var(--red)' }}>Anti-System Forces</div>

            <div className="org-block org-block-villain" style={{ marginTop: 0 }}>
              <div className="org-block-header">
                <span className="org-block-name">빌런 협회</span>
                <span className="org-block-type">ANTI-GOV</span>
              </div>
              <div className="org-block-body">
                <div className="world-col-desc" style={{ padding: '0 0 0.75rem' }}>라이선스 제도 철폐, 신인류 자치권 확보를 목표로 하는 반체제 조직. 아이러니하게도 협회국의 탄압이 조직 성장을 도왔다.</div>
                <div className="org-dept-line"><span className="odl-num">01</span>실행부 — 직접 무력 행사 및 테러</div>
                <div className="org-dept-line"><span className="odl-num">02</span>전술실행 및 특수작전팀 — 정보 수집·잠입·교란</div>
                <div className="org-dept-line"><span className="odl-num">03</span>개발·연구파트 — 능력 증폭 약물 개발 (예산 부족)</div>
                <div className="org-dept-line"><span className="odl-num">04</span>영업/스카우트팀 — 미등록 능력자 포섭</div>
              </div>
            </div>

            <div className="org-block org-block-nebra">
              <div className="org-block-header">
                <span className="org-block-name">네브라키움</span>
                <span className="org-block-type">ALIEN / OBSERVER</span>
              </div>
              <div className="org-block-body">
                <div className="world-col-desc" style={{ padding: '0 0 0.75rem' }}>우주 엔트로피 균형 유지를 명목으로 지구를 관측하는 초월적 외계 문명. 마수(관측 유닛)를 주기적으로 투하해 데이터를 수집한다. 지구를 리얼리티 쇼로 즐기고 있다는 의혹 있음.</div>
                <div className="org-dept-line"><span className="odl-num">∞</span>아자르트 성인 — 모성 울타르 출신 고등 종족</div>
                <div className="org-dept-line"><span className="odl-num">∞</span>관측 모선 오르투스 — 실시간 데이터 수신</div>
                <div className="org-dept-line"><span className="odl-num">∞</span>원칙 — 비개입 관측 (단, 흔들릴 때도 있음)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="strip red">
        <div className="strip-inner">
          <div className="strip-item">⚠ 마수 경보 <span className="strip-star">★</span></div>
          <div className="strip-item">S급 위협 확인 <span className="strip-star">✦</span></div>
          <div className="strip-item">D-LEVEL MASOO DETECTED <span className="strip-star">★</span></div>
          <div className="strip-item">HERO DISPATCH CONFIRMED <span className="strip-star">✦</span></div>
          <div className="strip-item">⚠ 마수 경보 <span className="strip-star">★</span></div>
          <div className="strip-item">S급 위협 확인 <span className="strip-star">✦</span></div>
          <div className="strip-item">D-LEVEL MASOO DETECTED <span className="strip-star">★</span></div>
          <div className="strip-item">HERO DISPATCH CONFIRMED <span className="strip-star">✦</span></div>
        </div>
      </div>

      <section id="grades">
        <div className="grades-header reveal">
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>02 // CLASSIFICATION</div>
            <div className="grades-title">등 급 체 계</div>
          </div>
          <div className="grades-sub">능력자, 위협체, 외계 존재까지 전부 등급으로 나눈다. 관료제의 최고 걸작. 단, Ω급 앞에서는 등급이 의미가 없다.</div>
        </div>

        <div className="grade-tabs reveal">
          {(['gh', 'gv', 'gm', 'gn'] as const).map((panel) => (
            <button
              key={panel}
              type="button"
              className={`g-tab ${gradePanel === panel ? 'active' : ''}`}
              data-panel={panel}
              onClick={() => setGradePanel(panel)}
            >
              {panel === 'gh' && '히어로 등급'}
              {panel === 'gv' && '빌런 등급'}
              {panel === 'gm' && '마수 등급'}
              {panel === 'gn' && '네브라키움'}
            </button>
          ))}
        </div>

        <div id="gh" className={`grade-panel ${gradePanel === 'gh' ? 'active' : ''}`}>
          <table className="grade-table">
            <thead><tr><th>등급</th><th>명칭</th><th>기준</th><th>한줄 요약</th></tr></thead>
            <tbody>
              <tr><td><div className="g-pill gp-s">S</div></td><td><div className="grade-name">S급</div><div className="grade-eng">SOVEREIGN CLASS</div></td><td className="grade-desc">국가 전략 자산. 도시 하나를 혼자 지키거나 파괴 가능. 움직임 하나가 주가에 영향을 미침.</td><td className="grade-quip">&quot;걸어 다니는 대기업&quot;</td></tr>
              <tr><td><div className="g-pill gp-a">A</div></td><td><div className="grade-name">A급</div><div className="grade-eng">APEX CLASS</div></td><td className="grade-desc">엘리트 히어로. 대형 마수 토벌의 주력이며 지역구 스타. 이름값을 함.</td><td className="grade-quip">&quot;임원급, 야근은 여전히&quot;</td></tr>
              <tr><td><div className="g-pill gp-b">B</div></td><td><div className="grade-name">B급</div><div className="grade-eng">BASELINE CLASS</div></td><td className="grade-desc">가장 많은 사건을 처리하는 실무진. 시민들과 직접 부딪히는 동네 히어로.</td><td className="grade-quip">&quot;가성비의 상징&quot;</td></tr>
              <tr><td><div className="g-pill gp-c">C</div></td><td><div className="grade-name">C급 이하</div><div className="grade-eng">CADET CLASS</div></td><td className="grade-desc">라이선스 유지 목적 활동. 일반인보다 조금 나은 수준에 불과.</td><td className="grade-quip">&quot;히어로 호소인&quot;</td></tr>
            </tbody>
          </table>
        </div>

        <div id="gv" className={`grade-panel ${gradePanel === 'gv' ? 'active' : ''}`}>
          <table className="grade-table">
            <thead><tr><th>등급</th><th>명칭</th><th>기준</th><th>한줄 요약</th></tr></thead>
            <tbody>
              <tr><td><div className="g-pill gp-s">S</div></td><td><div className="grade-name">S급</div><div className="grade-eng">SUPREME THREAT</div></td><td className="grade-desc">국가 전복 위협. 도시 기능 마비 또는 대량 학살이 가능한 재앙급 존재.</td><td className="grade-quip">&quot;국가 비상사태 대상&quot;</td></tr>
              <tr><td><div className="g-pill gp-a">A</div></td><td><div className="grade-name">A급</div><div className="grade-eng">ACUTE THREAT</div></td><td className="grade-desc">다수 인명 피해 가능. 히어로 여러 명이 붙어도 제압을 장담할 수 없음.</td><td className="grade-quip">&quot;협회가 긴장하는 수준&quot;</td></tr>
              <tr><td><div className="g-pill gp-b">B</div></td><td><div className="grade-name">B급</div><div className="grade-eng">BASIC THREAT</div></td><td className="grade-desc">지역구 깡패. 경찰력으론 불가능하지만 상위 히어로 출동 시 정리 가능.</td><td className="grade-quip">&quot;골치는 아프지만&quot;</td></tr>
              <tr><td><div className="g-pill gp-c">C</div></td><td><div className="grade-name">C급 이하</div><div className="grade-eng">COMMON THREAT</div></td><td className="grade-desc">잡범. 능력 좀 쓴다고 으스대다가 편의점 털다 잡히는 수준.</td><td className="grade-quip">&quot;빌런도 경력을 쌓는다&quot;</td></tr>
            </tbody>
          </table>
        </div>

        <div id="gm" className={`grade-panel ${gradePanel === 'gm' ? 'active' : ''}`}>
          <table className="grade-table">
            <thead><tr><th>등급</th><th>명칭</th><th>사회적 영향</th><th>한줄 요약</th></tr></thead>
            <tbody>
              <tr><td><div className="g-pill gp-omega">Ω</div></td><td><div className="grade-name">Ω급</div><div className="grade-eng">APOCALYPSE</div></td><td className="grade-desc">재해 등급. 행성 단위 파괴 가능성. 존재 자체가 재앙.</td><td className="grade-quip">&quot;기도하십시오.&quot;</td></tr>
              <tr><td><div className="g-pill gp-s">S</div></td><td><div className="grade-name">S급</div><div className="grade-eng">SEVERE</div></td><td className="grade-desc">국가 비상사태 선포 및 주가 폭락 유발.</td><td className="grade-quip">&quot;시장이 먼저 반응&quot;</td></tr>
              <tr><td><div className="g-pill gp-a">A</div></td><td><div className="grade-name">A급</div><div className="grade-eng">ADVANCED</div></td><td className="grade-desc">재난 문자 발송 및 대피령. 뉴스 속보 확정.</td><td className="grade-quip">&quot;헤드라인 확정&quot;</td></tr>
              <tr><td><div className="g-pill gp-b">B</div></td><td><div className="grade-name">B급</div><div className="grade-eng">BROAD</div></td><td className="grade-desc">뉴스 속보감. 정규 히어로팀 파견 기준.</td><td className="grade-quip">&quot;일상적인 비일상&quot;</td></tr>
              <tr><td><div className="g-pill gp-c">C</div></td><td><div className="grade-name">C급</div><div className="grade-eng">COMMON</div></td><td className="grade-desc">동네 비상. 미세먼지 경보처럼 일상화됨.</td><td className="grade-quip">&quot;루틴한 하루&quot;</td></tr>
              <tr><td><div className="g-pill gp-d">D</div></td><td><div className="grade-name">D급</div><div className="grade-eng">DORMANT</div></td><td className="grade-desc">소형 해충 취급. 신인 히어로 훈련용.</td><td className="grade-quip">&quot;성장통&quot;</td></tr>
            </tbody>
          </table>
        </div>

        <div id="gn" className={`grade-panel ${gradePanel === 'gn' ? 'active' : ''}`}>
          <table className="grade-table">
            <thead><tr><th>코드</th><th>명칭</th><th>위협 수준</th><th>내부 메모</th></tr></thead>
            <tbody>
              <tr><td><div className="g-pill gp-e" style={{ width: '64px', fontSize: '0.75rem', letterSpacing: '0.05em' }}>ECLP</div></td><td><div className="grade-name">이클립스</div><div className="grade-eng">CODE ECLIPSE</div></td><td className="grade-desc">등급 산정 불가. 행성 단위 위협. 관측 기록 상 극소수만 확인.</td><td className="grade-quip">&quot;협상 테이블이 사라진다&quot;</td></tr>
              <tr><td><div className="g-pill gp-omega">Ω</div></td><td><div className="grade-name">오메가</div><div className="grade-eng">CODE OMEGA</div></td><td className="grade-desc">물리 법칙 교란 및 국지적 현실 조작. 지구 과학으로 설명 불가.</td><td className="grade-quip">&quot;개입 vs 관찰, 영원한 갈등&quot;</td></tr>
              <tr><td><div className="g-pill gp-b" style={{ fontSize: '0.9rem' }}>α</div></td><td><div className="grade-name">알파</div><div className="grade-eng">CODE ALPHA</div></td><td className="grade-desc">마수 출현의 원인으로 추정되는 개체. 주로 데이터 수집용.</td><td className="grade-quip">&quot;지켜보는 수준&quot;</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="characters">
        <div className="char-header reveal">
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#999', marginBottom: '0.25rem' }}>03 // ENTITIES</div>
            <div className="char-header-title">등 장 인 물</div>
          </div>
          <div className="char-filters">
            {(['all', 'hero', 'villain', 'other'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`c-filter ${charFilter === f ? 'active' : ''}`}
                data-f={f}
                onClick={() => setCharFilter(f)}
              >
                {f === 'all' && `전체 (13)`}
                {f === 'hero' && '협회국 (6)'}
                {f === 'villain' && '빌런 (4)'}
                {f === 'other' && '기타 (3)'}
              </button>
            ))}
          </div>
        </div>
        <div className="char-grid" id="charGrid">
          {filteredChars.map((c) => (
            <CharCard key={c.id} c={c} onView={openModalById} />
          ))}
        </div>
      </section>

      <section id="masoo">
        <div className="masoo-left reveal">
          <div className="masoo-eyebrow">04 // UNKNOWN ENTITY</div>
          <div className="masoo-title-big">마 수<br />(Unknown)</div>
          <div className="masoo-desc">공식 명칭 &apos;미확인 마수&apos;. 네브라키움 내부 명칭은 &apos;관측 유닛&apos;. 지구 생태계에 존재하지 않는 유전자 조합으로 만들어진 인공 생명체.</div>
          <div className="masoo-fact-pills">
            <div className="masoo-pill"><span className="mp-icon">🧬</span><span><strong>키메라 형태</strong> — 지구 생물을 기괴하게 조합한 외형. 특정 히어로의 능력에 내성을 가지도록 설계됨.</span></div>
            <div className="masoo-pill"><span className="mp-icon">📡</span><span><strong>실시간 전송</strong> — 전투 중 에너지 파장, 히어로 전술, 시민 공포 수치를 오르투스로 즉시 전송.</span></div>
            <div className="masoo-pill"><span className="mp-icon">💰</span><span><strong>경제적 가치</strong> — 마수 사체는 신소재·의약품·에너지원으로 고가 거래됨. 협회국의 숨겨진 수입원.</span></div>
          </div>
        </div>
        <div className="masoo-right reveal d1">
          <div className="masoo-right-header">마수 등급표 // MASOO THREAT LEVEL</div>
          {MASOO_ROWS.map((row) => (
            <div key={row.badge} className="masoo-grade-row">
              <div className={`mg-badge-cell ${row.cls}`}>{row.badge}</div>
              <div className="mg-info"><div className="mg-name">{row.name}</div><div className="mg-text">{row.text}</div><div className="mg-quip">{row.quip}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* 05 // 연 표 — 40년의 기록 섹션 주석 처리
      <section id="timeline">
        <div className="tl-header reveal">
          <div className="tl-header-title">05 // 연 표 — 40년의 기록</div>
          <div className="tl-header-sub">CHRONOLOGICAL ARCHIVE // SINCE FIRST AWAKENING</div>
        </div>
        <div className="tl-body">
          {TIMELINE_ITEMS.map((item, i) => (
            <div key={item.year} className={`tl-item reveal ${i === 1 ? 'd1' : i === 2 ? 'd2' : ''}`}>
              <div className="tl-year">{item.year}</div>
              <div className="tl-tag">{item.tag}</div>
              <div className="tl-title">{item.title}</div>
              <div className="tl-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
      */}

      {/* 테마 섹션 (01~04) 주석 처리
      <section id="themes">
        <div className="themes-inner">
          {THEMES_ITEMS.map((theme, i) => (
            <div key={theme.num} className={`theme-col reveal ${i === 1 ? 'd1' : i === 2 ? 'd2' : i === 3 ? 'd3' : ''}`}>
              <div className="theme-num">{theme.num}</div>
              <div className="theme-title">{theme.title}</div>
              <div className="theme-desc">{theme.desc}</div>
            </div>
          ))}
        </div>
      </section>
      */}

      <div className="strip ink">
        <div className="strip-inner">
          <div className="ticker-item">BH-ARCHIVE // ISSUE 001 <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span></div>
          <div className="ticker-item">WORLD CLASSIFICATION SYSTEM <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span></div>
          <div className="ticker-item">ALL ENTITIES REGISTERED <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span></div>
          <div className="ticker-item">NEBRAKIUM OBSERVATION ONGOING <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span></div>
          <div className="ticker-item">BH-ARCHIVE // ISSUE 001 <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span></div>
          <div className="ticker-item">WORLD CLASSIFICATION SYSTEM <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span></div>
          <div className="ticker-item">ALL ENTITIES REGISTERED <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span></div>
          <div className="ticker-item">NEBRAKIUM OBSERVATION ONGOING <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span></div>
        </div>
      </div>

      <footer>
        <div>
          <div className="footer-logo">빌어먹을 <span>히어로</span></div>
          <div className="footer-tagline">영웅도 악당도, 결국 다 직장인일 뿐.</div>
        </div>
        <div className="footer-meta">
          BH-ARCHIVE v1.0<br />
          ISSUE 001<br />
          BLACK COMEDY × MODERN FANTASY<br />
          ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* Modal */}
      <div
        className={`modal-bg ${modalChar ? 'open' : ''}`}
        id="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mName"
        tabIndex={-1}
        onClick={(e) => e.target === e.currentTarget && closeModal()}
        onKeyDown={(e) => e.key === 'Escape' && closeModal()}
      >
        <div className="modal-box" id="modalBox" data-mf={modalChar?.f ?? undefined}>
          {modalChar && (
            <>
              <div className="modal-top-stripe" />
              <button type="button" className="modal-close" id="mClose" onClick={closeModal} aria-label="닫기">✕</button>
              <div className="modal-img-area">
                <ModalCharImage id={modalChar.id} />
              </div>
              <div className="modal-body">
                <div className="modal-header-bar">
                  <div
                    className="modal-grade-cell"
                    id="mGradeCell"
                    style={{
                      background: modalChar.f === 'hero' ? 'var(--blue)' : modalChar.f === 'villain' ? 'var(--red)' : '#8b5cf6',
                      color: '#fff',
                    }}
                  >
                    {modalChar.badgeLabel || '—'}
                  </div>
                  <div className="modal-header-info">
                    <div className="modal-name" id="mName">{modalChar.name}</div>
                    <div className="modal-code" id="mCode">{modalChar.codename ? `// ${modalChar.codename} //` : `// ${modalChar.factionLabel} //`}</div>
                    <div className="modal-role" id="mRole">{modalChar.role} · 만 {modalChar.age}세</div>
                  </div>
                </div>
                <div className="modal-cols">
                  <div className="modal-col">
                    <div className="modal-section-lbl">성격 및 특징</div>
                    <div className="modal-personality" id="mPersonality">{modalChar.personality}</div>
                  </div>
                  <div className="modal-col">
                    <div className="modal-section-lbl">능력</div>
                    <div className="modal-abilities" id="mAbilities">
                      {modalChar.abilities.map((a) => (
                        <div key={a.name} className="ability-block">
                          <div className="ability-name">{a.name}</div>
                          {a.desc}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {modalChar.operationGuide ? (
                  <div className="modal-guide-wrap">
                    <div className="modal-section-lbl">[캐릭터 운용 가이드]</div>
                    <div className="modal-guide">{modalChar.operationGuide}</div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

const ModalCharImage = memo(function ModalCharImage({ id }: { id: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const src = `/images/characters/${id}_full.png`

  return (
    <>
      <img
        id="mImg"
        src={src}
        alt=""
        style={{ display: loaded && !error ? 'block' : 'none' }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      <div className="modal-img-ph" id="mPh" style={{ display: loaded && !error ? 'none' : 'flex' }}>
        <div>◈</div>
        <div id="mImgPath" style={{ fontSize: '0.55rem' }}>{src}</div>
        <div>삼면도 이미지 (1800×600)</div>
      </div>
    </>
  )
})
