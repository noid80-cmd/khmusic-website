import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { SITE_URL as SITE } from '@/lib/site';

export const revalidate = 3600; // 한 시간마다 다시 만든다

/** 고정 페이지. priority는 학원 입장에서 검색 유입이 중요한 순서. */
const STATIC: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
  ['/', 1.0, 'weekly'],
  ['/admissions', 0.9, 'weekly'],
  ['/admission-guide', 0.9, 'weekly'],
  ['/instructors', 0.8, 'monthly'],
  ['/curriculum', 0.8, 'monthly'],
  ['/curriculum/admission', 0.8, 'monthly'],
  ['/curriculum/audition', 0.7, 'monthly'],
  ['/curriculum/professional', 0.7, 'monthly'],
  ['/curriculum/hobby', 0.7, 'monthly'],
  ['/blog', 0.9, 'daily'],
  ['/notice', 0.7, 'weekly'],
  ['/scholarship', 0.7, 'monthly'],
  ['/courses', 0.6, 'monthly'],
  ['/programs', 0.6, 'monthly'],
  ['/programs/album', 0.5, 'monthly'],
  ['/programs/audition', 0.5, 'monthly'],
  ['/programs/busking', 0.5, 'monthly'],
  ['/programs/cake-concert', 0.5, 'monthly'],
  ['/programs/ht', 0.5, 'monthly'],
  ['/programs/open-stage', 0.5, 'monthly'],
  ['/facilities', 0.6, 'monthly'],
  ['/gallery', 0.5, 'weekly'],
  ['/gallery/facilities', 0.5, 'monthly'],
  ['/gallery/performances', 0.5, 'weekly'],
  ['/musicians', 0.6, 'monthly'],
  ['/musician-lectures', 0.5, 'monthly'],
  ['/performances', 0.5, 'monthly'],
  ['/performance-videos', 0.5, 'weekly'],
  ['/success-videos', 0.6, 'weekly'],
  ['/trainee-videos', 0.5, 'weekly'],
  ['/videos', 0.5, 'weekly'],
  ['/about', 0.6, 'yearly'],
  ['/contact', 0.7, 'yearly'],
];

/** 강사 페이지 slug — src/app/instructors/page.tsx 의 subjectToSlug 와 같아야 한다 */
const INSTRUCTOR_SLUGS = [
  'vocal', 'composing', 'midi', 'singer-songwriter', 'guitar',
  'bass', 'drums', 'jazz-piano', 'dance', 'rap',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC.map(([path, priority, changeFrequency]) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  for (const slug of INSTRUCTOR_SLUGS) {
    entries.push({
      url: `${SITE}/instructors/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // 블로그 글. 검색 유입을 노리는 페이지라 우선순위를 높게 준다.
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
    for (const p of posts) {
      entries.push({
        url: `${SITE}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  } catch {
    // 글이 빠져도 나머지 사이트맵은 유효하다
  }

  // 공지 상세는 DB에서. 실패해도 사이트맵 전체가 죽으면 안 되므로 감싼다.
  try {
    const notices = await prisma.notice.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    for (const n of notices) {
      entries.push({
        url: `${SITE}/notice/${n.id}`,
        lastModified: n.updatedAt,
        changeFrequency: 'yearly',
        priority: 0.5,
      });
    }
  } catch {
    // 공지가 빠져도 나머지 사이트맵은 유효하다
  }

  return entries;
}
