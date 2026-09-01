import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { CATEGORY_LABELS, CATEGORY_ORDER, formatDate } from '@/lib/blog';
import type { BlogCategory } from '@prisma/client';
import styles from './blog.module.css';

// 서버에서 HTML을 완성해 내려보낸다. 네이버 크롤러(Yeti)는 자바스크립트 실행이
// 제한적이라, 브라우저에서 데이터를 불러오는 방식이면 본문을 읽지 못한다.
export const revalidate = 600;

export const metadata: Metadata = {
  title: '입시 칼럼',
  description:
    '대학별 실용음악과 실기 요강 정리와 입시 준비 노하우. 부천경희실용음악학원이 직접 씁니다.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: '입시 칼럼 | 부천경희실용음악학원',
    description: '대학별 실용음악과 실기 요강 정리와 입시 준비 노하우',
    url: '/blog',
    type: 'website',
  },
};

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = CATEGORY_ORDER.includes(category as BlogCategory)
    ? (category as BlogCategory)
    : null;

  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', ...(active ? { category: active } : {}) },
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      publishedAt: true,
      coverImage: true,
    },
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: '부천경희실용음악학원 입시 칼럼',
    url: `${SITE_URL}/blog`,
    description: '대학별 실용음악과 실기 요강 정리와 입시 준비 노하우',
    publisher: { '@type': 'Organization', name: '부천경희실용음악학원', url: SITE_URL },
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={styles.head}>
        <p className={styles.eyebrow}>부천경희실용음악학원</p>
        <h1 className={styles.h1}>입시 칼럼</h1>
        <p className={styles.lede}>
          대학마다 실기 요강이 다릅니다. 무엇을 어떤 순서로 준비해야 하는지,
          현장에서 쌓은 입시 노하우를 공개합니다.
        </p>
      </header>

      <nav className={styles.filters} aria-label="분류">
        <Link href="/blog" className={active ? styles.chip : `${styles.chip} ${styles.chipOn}`}>
          전체
        </Link>
        {CATEGORY_ORDER.map((c) => (
          <Link
            key={c}
            href={`/blog?category=${c}`}
            className={active === c ? `${styles.chip} ${styles.chipOn}` : styles.chip}
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
      </nav>

      {posts.length === 0 ? (
        <p className={styles.empty}>아직 게시된 글이 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((p) => (
            <li key={p.slug} className={styles.item}>
              <Link href={`/blog/${p.slug}`} className={styles.card}>
                <div className={styles.cardInner}>
                  <div className={styles.cardText}>
                    <p className={styles.cat}>{CATEGORY_LABELS[p.category]}</p>
                    <h2 className={styles.title}>{p.title}</h2>
                    <p className={styles.excerpt}>{p.excerpt}</p>
                    <p className={styles.date}>
                      {p.publishedAt ? formatDate(p.publishedAt) : ''}
                    </p>
                  </div>
                  {p.coverImage && (
                    // 관리자가 올린 이미지라 크기를 미리 알 수 없다
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt="" className={styles.thumb} loading="lazy" />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
