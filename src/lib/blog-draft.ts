import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import prisma from '@/lib/prisma';
import { makeSlug } from '@/lib/blog';
import { insightsFor, departmentRank } from '@/lib/blog-knowledge';
import { checkDraft } from '@/lib/blog-factcheck';

/**
 * 입시 칼럼 초안을 자동으로 만든다.
 *
 * 설계에서 가장 중요한 제약: **DB에 실제로 있는 요강·합격 데이터만 근거로 쓴다.**
 * 입시 글은 원서 기간이나 실기 조건을 하나만 잘못 써도 그걸 믿고 준비한 학생이
 * 생긴다. 그래서 모델에게 자료를 통째로 넘기고 "여기 없는 사실은 쓰지 말라"고
 * 묶은 뒤, 결과는 반드시 DRAFT로만 저장한다. 발행은 사람이 누른다.
 */

const DraftSchema = z.object({
  title: z.string().describe('35자 이내. 대학명과 핵심 쟁점이 드러나게'),
  slug: z
    .string()
    .describe(
      'URL용 영문 슬러그. 소문자 영문·숫자·하이픈만. 대학명 로마자 + 학년도 + 주제 (예: chungang-2027-vocal-free-song). 한글 금지',
    ),
  excerpt: z.string().describe('120~180자. 목록 요약 겸 meta description'),
  contentHtml: z
    .string()
    .describe(
      '본문 HTML. h2/h3/p/ul/ol/li/strong/em/blockquote/table/thead/tbody/tr/th/td만 사용. h1과 style/script/class 속성 금지',
    ),
  keywords: z.array(z.string()).describe('검색 키워드 5~8개'),
  sourceNote: z.string().describe('어떤 자료를 근거로 썼는지와 변경 가능성 안내'),
  naverDraft: z.string().describe('네이버 블로그에 붙여넣을 평문 버전(HTML 태그 없이)'),
});

export type BlogDraft = z.infer<typeof DraftSchema>;

const SYSTEM = `당신은 실용음악 입시 정보를 정리해 주는 사람입니다.
독자는 실용음악과 진학을 준비하는 고등학생과 학부모, 그리고 예술고등학교 진학을 준비하는 중학생과 학부모입니다. 이번에 다룰 요강이 어느 쪽인지 보고 그 독자에게 맞춰 씁니다.

이 글의 목적은 하나입니다: 요강을 읽어도 알기 어려운 부분을 풀어 주고, 그래서 무엇을 어떻게 준비하면 되는지 알려주는 것.

반드시 지킬 것:
- 제공된 자료(JSON)에 실제로 적힌 사실만 씁니다. 날짜·전형명·실기 조건·모집 인원을 추측하거나 보완하지 마세요.
- 자료에 없는 정보가 필요하면 그 대목을 아예 쓰지 말고, 다른 각도로 씁니다.
- 시간 표현은 반드시 아래에 주어진 "오늘 날짜"를 기준으로 씁니다. 이미 지난 달을 두고 "OO월 안에 정하세요"처럼 쓰면 글이 통째로 틀립니다. 남은 기간을 셀 때도 오늘부터 셉니다.
- 요강은 바뀔 수 있으므로 sourceNote에 출처와 "지원 전 대학 공식 발표 확인" 안내를 넣습니다.
- 불확실한 것은 불확실하다고 씁니다. 단정하지 마세요.

쓰지 말 것:
- 학원 이름, 학원 홍보, 상담이나 수강 유도 문구. 한 문장도 넣지 마세요.
- 합격 실적, 배출 인원, 합격자 사례, "우리는/저희는" 같은 표현.
- 글쓴이가 학원이나 강사인 것처럼 읽히는 표현. "상담을 하다 보면", "학생들을 지도하다 보면", "현장에서 보면" 같은 문구가 여기에 해당합니다. 같은 내용은 "이 대목에서 많이 헷갈립니다"처럼 주체 없이 쓰세요.
- "합격하려면 반드시", "이것만 하면" 같은 보장성 표현과 불안을 자극하는 표현.
- 다른 학원이나 특정 강사에 대한 언급.

알아두어야 할 배경 (이 분야의 상식입니다. 요강에서 인용한 사실인 것처럼 쓰지 말고, 무엇이 중요한지 판단하는 데만 쓰세요):
- 실용음악과 입시는 실기 비중이 압도적으로 높습니다. 다만 실기가 전부는 아니고, 전공 실기 외에 면접·즉흥연주·앙상블·악보리딩·청음 등을 함께 보는 학교가 많습니다.
- 학교마다 뽑는 기준과 선호하는 스타일이 다릅니다. 그래서 "일반적인 준비법"보다 그 학교 요강이 무엇을 요구하는지가 늘 먼저입니다.
- 정해진 정답을 따라하는 것보다 지원자의 개성과 강점이 드러나는 쪽이 유리합니다.
- 준비를 일찍 시작할수록 학업과 병행할 여유가 생기고, 늦을수록 선택과 집중이 필요해집니다.
- 졸업 후 진로는 가수·밴드·싱어송라이터·작곡·편곡·프로듀서·세션·영화음악·방송음악·뮤지컬·게임음악·사운드엔지니어·교육 등으로 넓습니다. 연주자만 되는 학과가 아닙니다.

예술고등학교(예고) 요강을 다룰 때 추가로 지킬 것:
- 독자가 다릅니다. 중학생과 그 학부모가 읽습니다. 대학 입시 용어를 설명 없이 쓰지 마세요.
- 예고는 진학이 끝이 아니라 시작입니다. 합격 자체보다 입학 후 3년을 어떻게 쓰게 되는지가 학생·학부모의 실제 관심사입니다.
- 실기 준비 기간이 대학 입시보다 짧고 시작 시점이 이릅니다. 언제부터 무엇을 준비해야 하는지가 특히 중요합니다.
- 예고에 가지 않으면 실용음악과에 못 간다는 식의 인상을 주지 마세요. 사실이 아닙니다. 선택지 중 하나로 다룹니다.
- 학비·통학·기숙 여부처럼 중학생 가정이 실제로 따지는 조건은 자료에 있을 때만 씁니다. 없으면 "학교 공식 발표에서 확인하라"고만 씁니다.

글의 구조 (기존 글의 결을 따르세요):
1. 도입 - 어떤 요강이 나왔는지, 어디서 학생들이 걸리는지 두세 문장
2. 일정 - 원서·실기 날짜를 그대로 인용하고, 그 간격이 준비에 무엇을 의미하는지
3. 조건 정리 - 전공별 실기 내용처럼 비교할 게 있으면 표(table)로
4. 핵심 쟁점 하나 - 학생이 가장 많이 놓치는 조건 하나를 골라 왜 문제가 되는지 깊게. 이 글의 중심입니다
5. 확인할 것 - 곡 선택 기준이나 준비 순서를 목록(ul)으로
6. 정리 - 이 글에서 기억할 한 줄

문체:
- 요강을 그대로 옮기지 않습니다. 학생이 놓치기 쉬운 조건을 짚고, 그것 때문에 준비 순서가 어떻게 달라지는지를 설명합니다.
- 읽고 나서 바로 할 수 있는 것이 남아야 합니다.
- 1200~1800자. 담백한 존댓말. 감탄사와 과장된 수식어를 쓰지 않습니다.
- 마지막을 상담 권유나 마무리 인사로 끝내지 마세요. 페이지 하단에 상담 예약 버튼이 따로 붙습니다. 본문은 정보로 끝냅니다.

naverDraft (네이버 블로그용):
- HTML 태그 없는 평문. 문단을 짧게 끊고 줄바꿈을 자주 씁니다.
- 목록은 · 또는 ▪ 로, 구분선은 ━━━━━━━━━━ 로 표시합니다.
- 본문과 같은 사실을 다루되, 더 대화하듯 풀어 씁니다.`;

/**
 * 서버가 UTC로 돌기 때문에 그냥 new Date()를 넘기면 한국 기준으로 하루가 밀린다.
 * 입시 글은 "며칠 남았다"가 핵심이라 이 하루가 그대로 오류가 된다.
 */
function todayKST(): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'full',
  }).format(new Date());
}

/** 오늘 날짜를 `월-일`로. 대조에서 오늘 날짜만은 예외로 둬야 해서 따로 뽑는다. */
function todayMonthDayKST(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}-${kst.getUTCDate()}`;
}

/**
 * 지금 진행 중인 입시의 학년도.
 *
 * 2026년 9월에 접수하는 건 2027학년도 수시다. 달력 연도로 거르면 이미 끝난
 * 작년 요강이 후보로 남아서, 원서 마감이 지난 전형을 두고 "준비하세요"라는
 * 글이 나간다. 3월을 기준으로 다음 학년도로 넘긴다(1~2월은 정시가 아직 진행 중).
 */
function currentAdmissionYear(at = new Date()): number {
  const kst = new Date(at.getTime() + 9 * 60 * 60 * 1000);
  const year = kst.getUTCFullYear();
  return kst.getUTCMonth() + 1 >= 3 ? year + 1 : year;
}

/** 모델에 넘길 근거 자료를 DB에서 모은다. */
async function gatherContext() {
  const thisYear = currentAdmissionYear();

  const [guides, recentPosts] = await Promise.all([
    // take로 자르면 안 된다. order 값이 전부 0이라 잘린 12개가 사실상 입력 순서로
    // 정해지고, 그 12개 대학만 평생 반복해서 다루게 된다. 어떤 요강을 쓸지는
    // pickGuide가 판단하게 두고 여기서는 후보를 다 넘긴다.
    prisma.admissionGuide.findMany({
      where: { isPublished: true, year: { gte: thisYear } },
      orderBy: [{ year: 'desc' }, { order: 'asc' }],
    }),
    // 최근에 쓴 글과 주제가 겹치면 안 되므로 제목을 같이 넘긴다.
    prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { title: true, createdAt: true },
    }),
  ]);

  return { guides, recentPosts };
}

/**
 * 지망생이 실제로 많이 찾는 순서. 원장 상담 경험에서 나온 순위다.
 *
 * 요강은 178개가 있는데 대부분의 학생은 이 중 십여 개만 궁금해한다. 순위 없이
 * 돌리면 아무도 안 찾는 학교 글이 절반을 차지한다. 앞줄일수록 먼저 다룬다.
 */
const POPULAR_UNIVERSITIES = [
  ['서울예술대학교', '동아방송예술대학교', '호원대학교'],
  ['서경대학교', '홍익대학교', '한양대학교', '경희대학교'],
  ['백석예술대학교', '국제예술대학교', '여주대학교', '명지전문대학교'],
  ['정화예술대학교'], // 최근 지원 문의가 늘고 있는 학교
];

/** 예고는 이 둘이 두드러지고 나머지는 비슷한 수준이라 한 줄로만 나눈다. */
const POPULAR_ARTS_HIGH_SCHOOLS = ['서울공연예술고등학교', '한림연예예술고등학교'];

/** 예고 요강인지. 대학 글과 독자도 시점도 달라서 갈라서 다뤄야 한다. */
function isArtsHighSchool(name: string): boolean {
  return name.includes('고등학교');
}

/** 인기 순위. 목록에 없으면 맨 뒤(=목록 길이)로 보낸다. */
function popularityRank(name: string): number {
  if (isArtsHighSchool(name)) {
    return POPULAR_ARTS_HIGH_SCHOOLS.some((s) => name.includes(s)) ? 0 : 1;
  }
  const tier = POPULAR_UNIVERSITIES.findIndex((names) =>
    names.some((n) => name.includes(n)),
  );
  return tier === -1 ? POPULAR_UNIVERSITIES.length : tier;
}

/**
 * 제목에 쓰일 법한 대학 이름들. DB는 "중앙대학교 수시"로 저장하지만 글 제목은
 * "중앙대"라고 쓴다. 정식 명칭만 비교하면 방금 쓴 글을 못 알아보고 같은 대학을
 * 또 고른다.
 */
function universityAliases(university: string): string[] {
  const base = university.replace(/\s*(수시|정시).*$/, '').trim();
  return [
    base,
    base.replace(/여자대학교$/, '여대'),
    base.replace(/예술대학교$/, '예대'),
    base.replace(/전문대학교$/, '전문대'),
    base.replace(/대학교$/, '대'),
  ];
}

/**
 * 어떤 요강을 다룰지 고른다.
 *
 * 기준은 두 개다. 먼저 최근 글에 이미 나온 대학을 뒤로 미뤄 주제가 돌아가게 하고,
 * 그 다음 지망생이 많이 찾는 학교를 앞세운다. 순서가 중요하다 - 인기순을 먼저
 * 보면 서울예대 글만 계속 나온다.
 */
function pickGuide<T extends { university: string; department?: string | null }>(
  guides: T[],
  recentTitles: string[],
): T | null {
  if (guides.length === 0) return null;

  const best = (pool: T[]): T | null => {
    if (pool.length === 0) return null;
    const scored = pool.map((g) => {
      const aliases = universityAliases(g.university);
      return {
        guide: g,
        used: recentTitles.filter((t) => aliases.some((a) => t.includes(a))).length,
        rank: popularityRank(g.university),
        dept: departmentRank(g.department),
      };
    });
    scored.sort((a, b) => a.used - b.used || a.rank - b.rank || a.dept - b.dept);
    return scored[0].guide;
  };

  const highSchools = guides.filter((g) => isArtsHighSchool(g.university));
  const universities = guides.filter((g) => !isArtsHighSchool(g.university));

  // 예고 요강은 대학보다 수가 훨씬 적다. 인기순으로만 줄을 세우면 대학에 밀려
  // 사실상 안 나온다. 최근 네 편에 예고 글이 없으면 예고 차례로 넘긴다.
  const coveredRecently = recentTitles.slice(0, 4).some((t) => /예고|예술고|음악고|고등학교/.test(t));
  if (!coveredRecently) {
    const pick = best(highSchools);
    if (pick) return pick;
  }

  return best(universities) ?? best(highSchools);
}

export type DraftResult =
  | { ok: true; postId: string; title: string; university: string; warnings: string[] }
  | { ok: false; reason: string };

export async function generateBlogDraft(): Promise<DraftResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, reason: 'ANTHROPIC_API_KEY가 설정돼 있지 않습니다.' };
  }

  const { guides, recentPosts } = await gatherContext();
  const recentTitles = recentPosts.map((p) => p.title);
  const guide = pickGuide(guides, recentTitles);

  if (!guide) {
    // 요강이 없으면 근거가 없다는 뜻이다. 지어내게 두느니 아무것도 안 만든다.
    return { ok: false, reason: '올해 이후 공개된 입시요강이 없어 근거 자료가 부족합니다.' };
  }

  // 요강에 없는 현장 지식. 이게 붙어야 요강 재탕이 아닌 글이 된다.
  const insights = insightsFor(guide.university);
  const insightBlock = [
    '아래는 요강 문서에 안 적혀 있는데 실제로 준비에 영향을 주는 것들입니다.',
    '요강만 읽어서는 알 수 없는 내용이라, 이 글이 다른 곳과 달라지는 지점입니다.',
    '이번 요강과 맞물리는 항목이 있으면 그것을 이 글의 핵심 쟁점으로 삼으세요. 억지로 다 넣지는 마세요.',
    '',
    ...insights.map((i) => {
      const lines = [`- ${i.title}`, `  ${i.detail}`];
      if (i.caution) lines.push(`  [반드시 함께 안내할 것] ${i.caution}`);
      return lines.join('\n');
    }),
  ].join('\n');

  const client = new Anthropic();

  const response = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 8000,
    system: SYSTEM,
    thinking: { type: 'adaptive' },
    // Vercel 함수 실행 시간 상한(취미 플랜 60초) 안에 끝내야 해서 effort를 낮춰 잡았다.
    // 플랜을 올리거나 배치로 돌리게 되면 high로 올리는 게 글 품질에 낫다.
    output_config: {
      effort: 'medium',
      format: zodOutputFormat(DraftSchema),
    },
    messages: [
      {
        role: 'user',
        content: `아래 자료만 근거로 입시 칼럼 한 편을 써 주세요.

## 오늘 날짜 (한국 시간)
${todayKST()}
이 글은 오늘 발행됩니다. "언제까지 무엇을 하라"는 조언은 전부 이 날짜 이후여야 합니다.

## 이번 글의 독자
${
  isArtsHighSchool(guide.university)
    ? '예술고등학교 진학을 준비하는 중학생과 학부모입니다. 예고 관련 지침을 따르세요.'
    : '실용음악과 진학을 준비하는 고등학생과 학부모입니다.'
}

## 이번에 다룰 입시요강
${JSON.stringify(guide, null, 2)}

## 요강에는 없지만 확인된 사실
${insightBlock}

## 최근에 이미 쓴 글 제목 (주제가 겹치지 않게)
${JSON.stringify(recentTitles, null, 2)}`,
      },
    ],
  });

  const draft = response.parsed_output;
  if (!draft) {
    return { ok: false, reason: '모델 응답을 스키마로 해석하지 못했습니다.' };
  }

  // 제목이 한글이라 제목으로 슬러그를 만들면 영문자가 다 걸러져 `2027-1-1` 같은 URL이
  // 남는다. 그래서 모델에게 영문 슬러그를 따로 받고, 그게 망가졌을 때만 제목으로 돌아간다.
  const base = /[a-z0-9]/i.test(draft.slug) ? draft.slug : draft.title;

  // 슬러그 충돌은 URL을 깨뜨리므로 비어 있는 자리를 찾아 붙인다.
  const stamped = makeSlug(base);
  let slug = stamped;
  for (let i = 2; await prisma.blogPost.findUnique({ where: { slug } }); i++) {
    slug = `${stamped}-${i}`;
  }

  // 지시만으로는 부족하다. 나온 글의 날짜·비율·인원을 요강 원문과 기계적으로 대조해
  // 근거를 못 찾은 값을 남긴다. 자동으로 고치지 않는다 - 사람이 볼 메모다.
  const sourceText = [
    guide.content,
    guide.deadline,
    guide.examDate,
    guide.requirements,
    guide.documents,
    guide.examContent,
  ]
    .filter(Boolean)
    .join(' ');
  const { warnings } = checkDraft(draft.contentHtml, sourceText, todayMonthDayKST());

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.contentHtml,
      category: 'ADMISSION',
      keywords: draft.keywords.join(', '),
      sourceNote: draft.sourceNote,
      naverDraft: draft.naverDraft,
      isAutoDraft: true,
      factCheck: warnings.length > 0 ? warnings.join('\n') : null,
      sourceLink: guide.link ?? null,
      status: 'DRAFT', // 발행은 사람이 검토한 뒤에만
    },
  });

  return {
    ok: true,
    postId: post.id,
    title: post.title,
    university: guide.university,
    warnings,
  };
}
