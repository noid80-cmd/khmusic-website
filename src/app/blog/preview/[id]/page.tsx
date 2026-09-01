import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CATEGORY_LABELS, formatDate, readingMinutes } from '@/lib/blog';
import styles from '../../blog.module.css';

// 관리자만 볼 수 있는 초안 미리보기.
// 게시된 글(/blog/[slug])은 캐시로 서빙되므로 여기에 섞지 않고 따로 둔다.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '초안 미리보기',
  // 검색엔진에 초안이 잡히면 안 된다
  robots: { index: false, follow: false },
};

export default async function BlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) notFound();

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <article className={styles.article}>
      <div
        style={{
          padding: '14px 18px',
          background: '#fff8e1',
          border: '1px solid #ffe082',
          borderRadius: '8px',
          marginBottom: '34px',
          fontSize: '14px',
          color: '#7a5d00',
          lineHeight: 1.7,
        }}
      >
        <b>초안 미리보기입니다.</b> 실제 게시되면 보이는 모습 그대로입니다. 아직 공개되지 않았고
        검색에도 잡히지 않습니다.
        <br />
        <Link href="/admin/blog" style={{ color: '#7a5d00', fontWeight: 700 }}>
          관리자 화면으로 돌아가기 →
        </Link>
      </div>

      <header className={styles.articleHead}>
        <p className={styles.cat}>{CATEGORY_LABELS[post.category]}</p>
        <h1 className={styles.articleTitle}>{post.title}</h1>
        <div className={styles.meta}>
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span>읽는 데 약 {readingMinutes(post.content)}분</span>
          <span>부천경희실용음악학원</span>
        </div>
      </header>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt="" className={styles.cover} />
      )}

      <div className={styles.body} dangerouslySetInnerHTML={{ __html: post.content }} />

      {post.sourceNote && <p className={styles.source}>{post.sourceNote}</p>}

      <div className={styles.cta}>
        <p>
          궁금한 점이 있으시면 상담을 통해 문의해 주세요. 학생의 전공과 목표 대학에 맞춰 준비
          방향을 함께 잡아드립니다.
        </p>
        <span className={styles.ctaBtn}>상담 문의하기</span>
      </div>

      {post.naverDraft && (
        <section className={styles.more}>
          <h2 className={styles.moreTitle}>네이버 블로그용 버전</h2>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'keep-all',
              fontFamily: 'inherit',
              fontSize: '15.5px',
              lineHeight: 1.85,
              color: '#444',
              background: '#f8f8f8',
              padding: '22px',
              borderRadius: '8px',
            }}
          >
            {post.naverDraft}
          </pre>
        </section>
      )}
    </article>
  );
}
