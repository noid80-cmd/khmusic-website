/**
 * 사이트의 대표 주소.
 *
 * 예전에는 NEXT_PUBLIC_SITE_URL 을 그대로 썼는데, Vercel 환경변수가
 * `https://khmusic-website.vercel.app` 로 설정돼 있어서 og:url 과 사이트맵이
 * 진짜 도메인이 아닌 vercel 주소를 가리켰다. 검색엔진에는 같은 사이트가
 * 두 개로 보이고 평가가 분산된다.
 *
 * 도메인이 바뀔 일이 없으므로 코드에 고정한다. 로컬 개발에서만 env 로 덮는다.
 */
const FALLBACK = 'https://khmusic.co.kr';

function resolve(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env && /^https?:\/\/(localhost|127\.0\.0\.1)/.test(env)) return env.replace(/\/$/, '');
  return FALLBACK;
}

export const SITE_URL = resolve();
