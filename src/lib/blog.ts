import type { BlogCategory } from '@prisma/client';

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  ADMISSION: '입시 정보',
  PRACTICE: '연습과 실기',
  ACADEMY: '학원 이야기',
};

export const CATEGORY_ORDER: BlogCategory[] = ['ADMISSION', 'PRACTICE', 'ACADEMY'];

/**
 * 제목에서 URL 슬러그를 만든다.
 *
 * 한글을 그대로 URL에 넣으면 퍼센트 인코딩되어 링크가 흉해지고 공유할 때 깨진다.
 * 영문·숫자만 남기고, 남는 게 없으면(제목이 전부 한글인 흔한 경우) 날짜 기반으로 만든다.
 * 검색 노출은 URL 문자열보다 제목·본문·메타태그가 좌우하므로 이 편이 안전하다.
 */
export function makeSlug(title: string, at: Date = new Date()): string {
  const latin = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/^-|-$/g, '');

  const stamp = [
    at.getFullYear(),
    String(at.getMonth() + 1).padStart(2, '0'),
    String(at.getDate()).padStart(2, '0'),
  ].join('');

  const rand = Math.random().toString(36).slice(2, 6);
  return latin ? `${latin}-${stamp}` : `post-${stamp}-${rand}`;
}

/** HTML 본문에서 대략적인 읽기 시간(분)을 낸다. 한국어는 분당 500자 기준. */
export function readingMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.round(text.length / 500));
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(
    date.getDate()
  ).padStart(2, '0')}`;
}
