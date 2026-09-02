/**
 * 입시요강 DB를 스스로 점검한다.
 *
 * 칼럼이 틀리는 경로는 두 개다. 하나는 모델이 없는 사실을 지어내는 것이고
 * (그건 blog-factcheck가 잡는다), 다른 하나는 **요강 입력 자체가 틀린 것**이다.
 * 후자는 대조로 못 잡는다. 틀린 값을 기준으로 대조하니 그대로 통과한다.
 *
 * 그래서 값 자체의 앞뒤가 맞는지를 본다. 원서 마감이 실기일보다 뒤라거나,
 * 반영 비율 합이 100이 아니라거나 하는 것들은 원본을 안 봐도 확실히 틀렸다고
 * 말할 수 있다. 여기서 걸리지 않았다고 맞는 요강이라는 뜻은 아니다 -
 * 확실히 틀린 것만 걸러낸다.
 */

export type AuditIssue = {
  guideId: string;
  university: string;
  department: string | null;
  year: number;
  /** 확실히 틀린 것과 사람이 봐야 하는 것을 구분한다. */
  severity: 'error' | 'warning';
  message: string;
};

type GuideRow = {
  id: string;
  university: string;
  department: string | null;
  year: number;
  content: string;
  deadline: string | null;
  examDate: string | null;
  examContent: string | null;
  link: string | null;
  isPublished: boolean;
};

/**
 * "2026.9.7 ~ 9.30" 같은 문자열에서 실제 날짜를 뽑는다.
 *
 * 뒤쪽 날짜는 연도와 월이 생략되는 일이 잦아서 앞에서 본 값을 물려받는다.
 * "2026.11.11 ~ 11.25"의 11.25가 2026년 11월 25일이 되도록.
 */
export function parseDates(text: string | null): Date[] {
  if (!text) return [];
  const out: Date[] = [];
  let year: number | null = null;
  let month: number | null = null;

  const pattern = /(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})|(\d{1,2})\s*[.\-/]\s*(\d{1,2})/g;
  for (const m of text.matchAll(pattern)) {
    if (m[1]) {
      year = Number(m[1]);
      month = Number(m[2]);
      out.push(new Date(Date.UTC(year, month - 1, Number(m[3]))));
    } else if (year !== null) {
      const a = Number(m[4]);
      const b = Number(m[5]);
      if (a >= 1 && a <= 12 && b >= 1 && b <= 31) {
        month = a;
        out.push(new Date(Date.UTC(year, a - 1, b)));
      }
    }
  }
  return out;
}

/**
 * "반영 비율 : 실기 80 + 학생부 20" 줄에서 항목별 비율을 뽑는다.
 *
 * 표기가 제각각이다. %가 있기도 없기도 하고("실기 80" / "실기100%"), 소수점이
 * 들어가고("실기71.4%+학생부28.6%"), 앞에 단계 표시가 붙는다("보컬 1단계 - 실기 100").
 * 그래서 숫자를 다 줍지 않고 반드시 항목 이름 뒤에 붙은 숫자만 센다.
 * 이렇게 안 하면 "1단계"의 1이 비율로 잡혀 합이 101이 된다.
 */
const RATIO_SUBJECTS =
  /(실기(?:고사|시험)?|학생부|교과|출결|내신|면접|필기|서류|수능|실적|비교과)\s*[:\-]?\s*(\d{1,3}(?:\.\d+)?)/g;

function parseRatio(content: string): number[] | null {
  const line = content.split(/\r?\n/).find((l) => l.includes('반영') && l.includes('비율'));
  if (!line) return null;
  const nums = [...line.matchAll(RATIO_SUBJECTS)]
    .map((m) => Number(m[2]))
    .filter((n) => n > 0 && n <= 100);
  return nums.length > 0 ? nums : null;
}

const fmt = (d: Date) =>
  `${d.getUTCFullYear()}.${d.getUTCMonth() + 1}.${d.getUTCDate()}`;

export function auditGuides(guides: GuideRow[], today = new Date()): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const seen = new Map<string, GuideRow>();

  for (const g of guides) {
    const at = (severity: AuditIssue['severity'], message: string) =>
      issues.push({
        guideId: g.id,
        university: g.university,
        department: g.department,
        year: g.year,
        severity,
        message,
      });

    // 같은 학교·학과·연도가 두 번 들어가면 글이 어느 쪽을 근거로 썼는지 알 수 없다.
    const key = `${g.university}|${g.department ?? ''}|${g.year}`;
    if (seen.has(key)) at('error', '같은 학교·학과·연도 요강이 중복 등록돼 있습니다.');
    else seen.set(key, g);

    const deadlines = parseDates(g.deadline);
    const exams = parseDates(g.examDate);
    const ratio = parseRatio(g.content);

    // 교과·출결만으로 뽑는 전형이면 실기 일정이 없는 게 정상이다. 반영 비율에
    // 실기가 있는데 일정이 없을 때만 오류로 본다.
    const hasPracticalExam = /실기/.test(g.content);

    if (!g.deadline) at('error', '원서 접수 일정이 비어 있습니다.');
    else if (deadlines.length === 0) at('error', `원서 접수 일정에서 날짜를 읽지 못했습니다: "${g.deadline}"`);

    if (!g.examDate) {
      at(
        hasPracticalExam ? 'error' : 'warning',
        hasPracticalExam
          ? '실기를 반영하는데 실기 일정이 비어 있습니다.'
          : '실기 일정이 없습니다. 실기를 안 보는 전형인지 확인해 주세요.',
      );
    } else if (exams.length === 0) {
      at('error', `실기 일정에서 날짜를 읽지 못했습니다: "${g.examDate}"`);
    }

    // 원서를 다 받기 전에 실기를 볼 수는 없다. 이건 원본을 안 봐도 틀린 값이다.
    const lastDeadline = deadlines[deadlines.length - 1];
    const firstExam = exams[0];
    if (lastDeadline && firstExam && firstExam < lastDeadline) {
      at('error', `실기(${fmt(firstExam)})가 원서 마감(${fmt(lastDeadline)})보다 앞섭니다.`);
    }

    // 합격 발표가 실기보다 앞설 수도 없다.
    const announce = parseDates(
      g.content.split(/\r?\n/).find((l) => l.includes('발표')) ?? null,
    );
    const lastExam = exams[exams.length - 1];
    if (announce[0] && lastExam && announce[0] < lastExam) {
      at('error', `합격 발표(${fmt(announce[0])})가 실기(${fmt(lastExam)})보다 앞섭니다.`);
    }

    if (ratio) {
      // 소수점 표기(71.4 + 28.6)가 있어서 부동소수 오차만큼은 봐준다.
      const sum = ratio.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.05) {
        at('warning', `반영 비율 합이 ${Math.round(sum * 10) / 10}입니다 (${ratio.join(' + ')}).`);
      }
    } else {
      at('warning', '반영 비율을 읽지 못했습니다.');
    }

    if (!g.examContent && hasPracticalExam) at('warning', '실기 내용이 비어 있습니다.');

    // 링크가 있어야 초안 옆에 "대학 공식 요강에서 확인하기"가 붙는다.
    if (!g.link) at('warning', '대학 요강 링크가 없어 원본 대조를 걸 수 없습니다.');

    // 이미 마감된 전형은 칼럼 소재로 쓰면 안 된다.
    if (g.isPublished && lastDeadline && lastDeadline < today) {
      at('warning', `원서 마감(${fmt(lastDeadline)})이 이미 지났습니다.`);
    }
  }

  // 확실히 틀린 것을 먼저 보여준다.
  return issues.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1));
}
