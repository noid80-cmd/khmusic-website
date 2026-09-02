import prisma from '@/lib/prisma';

/**
 * 요강에는 안 적혀 있지만 실제로 합불을 가르는 것들.
 *
 * 요강 PDF만 읽고 쓴 글은 어느 학원 블로그에나 있다. 여기 모이는 건 현장에서
 * 확인된 것들이라 검색으로는 잘 안 나오고, 학생이 모르면 실제로 손해를 본다.
 * 그래서 자동 생성 글이 이걸 소재로 쓸 수 있게 따로 관리한다.
 *
 * 처음에는 이 파일에 상수로 박아 뒀는데, 그러면 소재를 하나 추가할 때마다 배포가
 * 필요했다. 정작 아는 사람은 코드를 만지지 않는 쪽이라 DB로 옮겼다.
 * 관리자 화면(/admin/insights)에서 직접 넣고 고친다.
 */

export type Insight = {
  /** 어느 학교 얘기인지. 비우면 실용음악 입시 전반에 해당하는 지식으로 본다. */
  schools: string[];
  title: string;
  detail: string;
  /** 글에 반드시 함께 나가야 할 확인 안내. */
  caution?: string;
};

/** 쉼표로 저장된 학교 목록을 배열로. 빈 칸과 중복은 걷어낸다. */
export function parseSchools(schools: string | null): string[] {
  if (!schools) return [];
  return [...new Set(schools.split(',').map((s) => s.trim()).filter(Boolean))];
}

/**
 * 이 요강에 붙여 줄 소재를 고른다. 학교 지정이 없는 항목은 항상 포함한다.
 *
 * DB를 못 읽어도 글 생성 자체는 계속돼야 한다. 소재가 없으면 요강만으로 쓴
 * 평범한 글이 나오지만, 아예 안 나오는 것보다는 낫다.
 */
export async function insightsFor(university: string): Promise<Insight[]> {
  const rows = await prisma.blogInsight.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  return rows
    .map((r) => ({
      schools: parseSchools(r.schools),
      title: r.title,
      detail: r.detail,
      caution: r.caution ?? undefined,
    }))
    .filter((i) => i.schools.length === 0 || i.schools.some((s) => university.includes(s)));
}

/**
 * 어느 학과 요강을 다룰지 정할 때 쓰는 가중치.
 *
 * 한 학교에 학과가 여러 개면 지망생이 적은 쪽이 뽑힐 수 있다. 실제로 첫 생성에서
 * 동아방송예대 실용음악학부 대신 K-POP과가 걸렸다. 작은 숫자가 먼저다.
 */
export function departmentRank(department: string | null | undefined): number {
  if (!department) return 1;
  if (/실용음악/.test(department)) return 0;
  return 1;
}
