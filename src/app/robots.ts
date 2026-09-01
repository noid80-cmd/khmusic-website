import type { MetadataRoute } from 'next';
import { SITE_URL as SITE } from '@/lib/site';

/**
 * 검색엔진 수집 규칙.
 * 관리자 화면과 API는 수집 대상이 아니므로 막는다.
 * 네이버(Yeti)·구글은 sitemap.xml을 따라 들어온다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
