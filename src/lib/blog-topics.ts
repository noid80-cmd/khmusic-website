import { parseDates } from '@/lib/guide-audit';

/**
 * 이번 글이 무엇에 대한 글인지 정한다.
 *
 * 요강 한 건을 파고드는 글만 쓰면 두 번 막힌다. 첫째, 원서 마감이 지난 전형을
 * 두고 "지금 준비하세요"라고 쓰게 된다. 둘째, 시즌이 끝나면 쓸 요강이 아예
 * 없어진다. 실제로 2027학년도 수시 요강 65건 중 48건이 9월에 마감된다.
 *
 * 그래서 글의 종류를 셋으로 나눈다. 요강이 살아 있으면 그걸 다루고, 없거나
 * 변화가 필요하면 여러 요강을 가로지르거나 그 시기에 맞는 주제로 쓴다.
 */

export type GuideLike = {
  id: string;
  university: string;
  department: string | null;
  year: number;
  content: string;
  deadline: string | null;
  examDate: string | null;
  examContent: string | null;
  link: string | null;
};

export type Topic<T extends GuideLike = GuideLike> =
  /** 요강 한 건을 깊게. 접수가 아직 안 끝난 전형만 여기로 온다. */
  | { kind: 'guide'; guide: T }
  /** 여러 요강을 한 관점으로 가로지른다. 마감이 지나도 쓸 수 있다. */
  | { kind: 'crosscut'; theme: string; angle: string; guides: T[] }
  /** 요강과 무관하게 지금 이 시기에 필요한 이야기. */
  | { kind: 'seasonal'; theme: string; angle: string; guides: T[] };

/**
 * 원서 접수가 아직 안 끝났는지.
 *
 * 마감 당일까지는 살아 있는 것으로 본다. 날짜를 못 읽으면 살아 있다고 친다 -
 * 표기가 이상하다고 글감에서 빼 버리면 요강 점검에서 걸릴 기회도 사라진다.
 */
export function isOpen(guide: GuideLike, today: Date): boolean {
  const dates = parseDates(guide.deadline);
  const last = dates[dates.length - 1];
  if (!last) return true;
  return last.getTime() >= Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
}

/**
 * 여러 요강을 가로지르는 주제들.
 *
 * `pick`이 그 주제에 해당하는 요강을 골라낸다. 세 건 미만이면 비교가 성립하지
 * 않으므로 그 주제는 건너뛴다.
 */
const CROSSCUTS: { theme: string; angle: string; pick: (g: GuideLike) => boolean }[] = [
  {
    theme: '자유곡과 지정곡, 학교마다 다른 실기 조건',
    angle:
      '같은 실용음악과인데 어떤 학교는 자유곡 한 곡만 보고 어떤 학교는 조건을 붙입니다. 그 차이가 준비 순서를 어떻게 바꾸는지 정리해 주세요.',
    pick: (g) => /자유곡|자작곡|지정/.test(g.examContent ?? ''),
  },
  {
    theme: '1단계와 2단계로 나뉘는 학교, 무엇이 달라지나',
    angle:
      '단계 전형은 1차와 2차의 요구가 다릅니다. 1차만 준비하고 2차에서 무너지는 경우가 왜 생기는지, 어떤 학교들이 이 구조인지 정리해 주세요.',
    pick: (g) => /1단계|2단계|1차|2차/.test(g.content + (g.examContent ?? '')),
  },
  {
    theme: '실기 100%인 학교와 성적을 보는 학교',
    angle:
      '반영 비율이 학교마다 다릅니다. 성적이 실제로 얼마나 영향을 주는지, 지원 전략이 어떻게 갈리는지 비율을 근거로 정리해 주세요.',
    pick: (g) => /반영\s*비율/.test(g.content),
  },
  {
    theme: '전공별 모집 인원으로 보는 지원 구조',
    angle:
      '모집 인원은 전공마다 크게 다릅니다. 보컬은 두 자리인데 어떤 전공은 한두 명입니다. 이 차이가 지원자에게 무엇을 뜻하는지 정리해 주세요.',
    pick: (g) => /모집\s*인원/.test(g.content),
  },
];

/**
 * 달마다 학생이 실제로 마주하는 국면.
 *
 * 입시는 계절을 탄다. 9월에 원서를 쓰는 학생과 2월에 결과를 받아 든 학생은
 * 완전히 다른 것을 궁금해한다. 요강이 없어도 이 이야기는 늘 쓸 수 있다.
 */
const SEASONAL: Record<number, { theme: string; angle: string }[]> = {
  1: [
    { theme: '정시 실기를 앞두고 남은 몇 주를 쓰는 법', angle: '수시와 준비 방식이 어떻게 다른지 중심으로.' },
    { theme: '결과를 기다리는 동안 해 둘 것', angle: '합격과 불합격 어느 쪽이든 다음 수가 있다는 관점으로.' },
  ],
  2: [
    { theme: '재수를 결정하기 전에 따져볼 것', angle: '감정이 아니라 조건으로 판단하도록. 불안을 자극하지 말 것.' },
    { theme: '합격 후 입학 전까지 준비할 것', angle: '입학이 끝이 아니라는 관점으로.' },
  ],
  3: [{ theme: '고3이 되는 3월, 실용음악 입시 1년 일정 훑기', angle: '언제 무엇이 있는지 달력을 먼저 그려 주는 글.' }],
  4: [{ theme: '전공을 아직 못 정한 학생을 위한 판단 기준', angle: '적성 타령이 아니라 실제 판단 재료를 주는 글.' }],
  5: [{ theme: '실기곡을 고르는 기준', angle: '좋아하는 곡과 유리한 곡이 다른 이유를 중심으로.' }],
  6: [{ theme: '여름방학 전에 정리해야 할 것', angle: '방학이 마지막 큰 덩어리 시간이라는 관점으로.' }],
  7: [{ theme: '여름방학을 쓰는 순서', angle: '무엇을 먼저 하고 무엇을 나중에 할지.' }],
  8: [{ theme: '요강 발표를 앞두고 준비할 것', angle: '요강이 나오기 전에 정해 둘 수 있는 것과 없는 것.' }],
  9: [
    { theme: '원서 접수 시즌, 지원 조합을 짜는 법', angle: '상향·적정·안정을 실기 중심 입시에 맞게 다시 정의하는 글.' },
    { theme: '원서를 넣고 나서 실기까지 남은 시간', angle: '이 기간에 곡을 바꿔도 되는지 같은 실제 질문 중심으로.' },
  ],
  10: [
    { theme: '실기 당일에 벌어지는 일', angle: '대기·순서·컨디션처럼 요강에 없는 실제 상황 중심으로.' },
    { theme: '실기가 몰린 시기에 일정을 관리하는 법', angle: '여러 학교 실기가 겹칠 때의 판단 기준.' },
  ],
  11: [
    { theme: '수시 결과를 기다리며 정시를 준비하는 법', angle: '두 가지를 동시에 안고 가는 방법 중심으로.' },
    { theme: '추가합격과 등록 일정 읽는 법', angle: '날짜를 놓쳐서 기회를 잃는 일이 없도록.' },
  ],
  12: [
    { theme: '정시 지원 전략, 수시와 무엇이 다른가', angle: '수능 반영과 실기 비중의 관계 중심으로.' },
    { theme: '한 해를 정리하며 다음 지원자가 알아야 할 것', angle: '올해 입시에서 드러난 흐름 중심으로.' },
  ],
};

/** 최근 글 제목에 이 주제가 이미 나왔는지. 같은 기획을 연달아 쓰지 않게. */
function usedRecently(theme: string, recentTitles: string[]): boolean {
  const words = theme.split(/[\s,]+/).filter((w) => w.length >= 3);
  return recentTitles.some((t) => words.filter((w) => t.includes(w)).length >= 2);
}

/**
 * 이번 글의 주제를 고른다.
 *
 * @param pickGuide 살아 있는 요강 중 하나를 고르는 기존 규칙(인기순·로테이션)
 */
export function pickTopic<T extends GuideLike>(
  guides: T[],
  recentTitles: string[],
  pickGuide: (candidates: T[], recentTitles: string[]) => T | null,
  today = new Date(),
): Topic<T> | null {
  const open = guides.filter((g) => isOpen(g, today));

  // 접수가 살아 있는 요강이 있으면 그게 우선이다. 지금 지원하는 학생에게 제일
  // 쓸모 있는 글이기 때문이다. 다만 네 편에 한 번은 기획 글로 숨을 돌린다.
  //
  // 최근 글이 세 편이 안 되면 연속 판정을 하지 않는다. 빈 배열에 every를 쓰면
  // 참이 나와서, 글이 하나도 없는 상태에서 첫 글부터 기획 글로 새 버린다.
  const recent = recentTitles.slice(0, 3);
  const guideRun = recent.length >= 3 && recent.every((t) => /수시|정시|요강/.test(t));
  if (open.length > 0 && !guideRun) {
    const guide = pickGuide(open, recentTitles);
    if (guide) return { kind: 'guide', guide };
  }

  // 여러 요강을 가로지르는 글. 마감이 지난 요강도 비교 자료로는 유효하다.
  for (const c of CROSSCUTS) {
    if (usedRecently(c.theme, recentTitles)) continue;
    const matched = guides.filter(c.pick);
    if (matched.length >= 3) {
      return { kind: 'crosscut', theme: c.theme, angle: c.angle, guides: matched.slice(0, 12) };
    }
  }

  const month = new Date(today.getTime() + 9 * 60 * 60 * 1000).getUTCMonth() + 1;
  for (const s of SEASONAL[month] ?? []) {
    if (usedRecently(s.theme, recentTitles)) continue;
    return { kind: 'seasonal', theme: s.theme, angle: s.angle, guides: guides.slice(0, 8) };
  }

  // 기획 주제가 다 막혔으면 살아 있는 요강으로 돌아간다.
  if (open.length > 0) {
    const guide = pickGuide(open, recentTitles);
    if (guide) return { kind: 'guide', guide };
  }
  return null;
}
