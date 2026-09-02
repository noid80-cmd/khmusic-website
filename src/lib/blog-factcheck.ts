/**
 * 초안에 적힌 날짜·비율·인원이 요강 자료에 실제로 있는 값인지 대조한다.
 *
 * 입시 글에서 제일 위험한 건 문장이 어색한 게 아니라 날짜가 하루 틀린 것이다.
 * 글은 그럴듯하게 읽히는데 그걸 믿고 준비한 학생은 원서를 못 낸다. 모델에게
 * "자료에 있는 것만 쓰라"고 지시해 두긴 했지만 지시만으로는 부족해서, 나온
 * 결과를 기계적으로 한 번 더 대조한다.
 *
 * 여기서 걸리는 건 "틀렸다"가 아니라 "자료에서 근거를 못 찾았다"는 뜻이다.
 * 사람이 보고 판단하라고 남기는 메모지, 자동으로 고치거나 버리지 않는다.
 */

/** HTML을 대조용 평문으로. 태그 안 속성값이 숫자로 잡히지 않게 통째로 걷어낸다. */
function toText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * 글에 등장하는 날짜를 `월-일`로 모은다.
 *
 * "10월 12일부터 18일까지"처럼 뒤쪽 날짜에 월이 생략되는 경우가 많아서,
 * 직전에 나온 월을 물려받게 했다. 이걸 안 하면 멀쩡한 날짜가 전부 경고로 뜬다.
 */
export function extractDates(text: string, loose = false): Set<string> {
  const found = new Set<string>();
  let lastMonth: number | null = null;

  // loose는 요강 원문에만 쓴다. 원문은 "2026.9.7 ~ 9.30"처럼 연도를 생략한
  // 축약 표기를 자주 쓰는데, 그걸 못 읽으면 멀쩡한 9월 30일이 경고로 뜬다.
  // 반대로 초안 쪽은 좁게 읽어야 한다 - 넓게 읽으면 진짜 오류를 놓친다.
  const pattern =
    /(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})|(\d{1,2})\s*월\s*(\d{1,2})\s*일|(\d{1,2})\s*[.]\s*(\d{1,2})|(\d{1,2})\s*일/g;

  for (const m of text.matchAll(pattern)) {
    if (m[2] && m[3]) {
      lastMonth = Number(m[2]);
      found.add(`${lastMonth}-${Number(m[3])}`);
    } else if (m[4] && m[5]) {
      lastMonth = Number(m[4]);
      found.add(`${lastMonth}-${Number(m[5])}`);
    } else if (m[6] && m[7]) {
      if (!loose) continue;
      const month = Number(m[6]);
      const day = Number(m[7]);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        lastMonth = month;
        found.add(`${month}-${day}`);
      }
    } else if (m[8] && lastMonth !== null) {
      // 월이 생략된 "18일". 바로 앞에 나온 월에 속한 것으로 본다.
      found.add(`${lastMonth}-${Number(m[8])}`);
    }
  }
  return found;
}

/** "실기 80%" 같은 반영 비율. */
export function extractPercents(text: string): Set<string> {
  const found = new Set<string>();
  for (const m of text.matchAll(/(\d{1,3})\s*%/g)) found.add(m[1]);
  return found;
}

/** "25명" 같은 모집 인원. */
export function extractHeadcounts(text: string): Set<string> {
  const found = new Set<string>();
  for (const m of text.matchAll(/(\d{1,4})\s*명/g)) found.add(m[1]);
  return found;
}

/**
 * 요강 원문에 등장하는 모든 숫자.
 *
 * 원문의 표기가 제각각이라 단위까지 맞춰서 비교하면 멀쩡한 값이 경고로 뜬다.
 * "반영 비율 : 실기 80% + 학생부 20%"라고 쓴 요강이 있고 "실기 80 + 학생부 20"이라고
 * 쓴 요강이 있으며, 인원도 "모집 인원 : 15명"과 "모집 인원 : 보컬 16"이 섞여 있다.
 * 그래서 비율과 인원만은 단위를 떼고 숫자가 원문 어딘가에 있는지만 본다.
 * 날짜는 이렇게 하지 않는다 - 날짜야말로 정확히 봐야 하는 값이다.
 */
export function extractNumbers(text: string): Set<string> {
  const found = new Set<string>();
  for (const m of text.matchAll(/\d{1,4}/g)) found.add(m[0]);
  return found;
}

export type FactCheck = {
  /** 자료에서 근거를 못 찾은 값들. 비어 있으면 대조를 통과한 것이다. */
  warnings: string[];
};

/**
 * @param draftHtml 모델이 쓴 본문
 * @param sourceText 요강 레코드의 모든 텍스트 필드를 이어붙인 것
 * @param todayMonthDay 오늘 날짜(`9-2`). 본문이 "오늘은 9월 2일" 식으로 쓰는 건 자료에 없는 게 정상이라 뺀다.
 */
export function checkDraft(
  draftHtml: string,
  sourceText: string,
  todayMonthDay: string,
): FactCheck {
  const draft = toText(draftHtml);
  const warnings: string[] = [];

  const sourceDates = extractDates(sourceText, true);
  const unknownDates = [...extractDates(draft)].filter(
    (d) => d !== todayMonthDay && !sourceDates.has(d),
  );
  if (unknownDates.length > 0) {
    warnings.push(
      `요강에서 못 찾은 날짜: ${unknownDates.map((d) => d.replace('-', '월 ') + '일').join(', ')}`,
    );
  }

  const sourceNumbers = extractNumbers(sourceText);

  const unknownPercents = [...extractPercents(draft)].filter((p) => !sourceNumbers.has(p));
  if (unknownPercents.length > 0) {
    warnings.push(`요강에서 못 찾은 비율: ${unknownPercents.map((p) => p + '%').join(', ')}`);
  }

  const unknownCounts = [...extractHeadcounts(draft)].filter((c) => !sourceNumbers.has(c));
  if (unknownCounts.length > 0) {
    warnings.push(`요강에서 못 찾은 인원: ${unknownCounts.map((c) => c + '명').join(', ')}`);
  }

  return { warnings };
}
