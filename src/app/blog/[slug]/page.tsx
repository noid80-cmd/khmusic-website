import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { CATEGORY_LABELS, formatDate, readingMinutes } from '@/lib/blog';
import styles from '../blog.module.css';

export const revalidate = 600;

/** 게시된 글만 미리 만들어 둔다. 초안은 대상이 아니다. */
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: 'PUBLISHED' },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: '글을 찾을 수 없습니다' };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords ? post.keywords.split(',').map((k) => k.trim()) : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', category: post.category, NOT: { id: post.id } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { slug: true, title: true },
  });

  // 검색엔진이 글의 성격·날짜·작성 주체를 구조적으로 읽을 수 있게 한다.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    author: { '@type': 'Organization', name: '부천경희실용음악학원', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: '부천경희실용음악학원',
      url: SITE_URL,
    },
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
  };

  return (
    <article className={styles.article}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/blog" className={styles.back}>
        ← 입시 칼럼
      </Link>

      <header className={styles.articleHead}>
        <p className={styles.cat}>{CATEGORY_LABELS[post.category]}</p>
        <h1 className={styles.articleTitle}>{post.title}</h1>
        <div className={styles.meta}>
          <span>{post.publishedAt ? formatDate(post.publishedAt) : ''}</span>
          <span>읽는 데 약 {readingMinutes(post.content)}분</span>
          <span>부천경희실용음악학원</span>
        </div>
      </header>

      {post.coverImage && (
        // 관리자가 올린 이미지라 크기를 미리 알 수 없어 next/image 대신 img를 쓴다
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt="" className={styles.cover} />
      )}

      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.sourceNote && <p className={styles.source}>{post.sourceNote}</p>}

      {/* 본문은 정보만 담고, 학원으로 이어지는 건 이 버튼 하나뿐이다.
          홍보 문구를 본문이나 여기에 덧붙이면 글 전체가 광고처럼 읽힌다. */}
      <div className={styles.cta}>
        <Link href="/contact" className={styles.ctaBtn}>
          상담 예약하기
        </Link>
      </div>

      {related.length > 0 && (
        <section className={styles.more}>
          <h2 className={styles.moreTitle}>같은 분류의 다른 글</h2>
          <ul className={styles.moreList}>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} className={styles.moreLink}>
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
