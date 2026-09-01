import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { makeSlug } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // DRAFT | PUBLISHED

  const posts = await prisma.blogPost.findMany({
    where: status === 'DRAFT' || status === 'PUBLISHED' ? { status } : {},
    // 초안을 먼저 보여준다. 검토가 밀리면 안 되기 때문이다.
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const data = await request.json();
  if (!data.title?.trim()) {
    return NextResponse.json({ error: '제목을 입력해 주세요.' }, { status: 400 });
  }

  // 슬러그가 겹치면 URL이 충돌하므로 비어 있는 자리를 찾아 붙인다
  let slug = (data.slug?.trim() || makeSlug(data.title)).replace(/[^a-zA-Z0-9-]/g, '');
  if (!slug) slug = makeSlug(data.title);
  for (let i = 2; await prisma.blogPost.findUnique({ where: { slug } }); i++) {
    slug = `${slug.replace(/-\d+$/, '')}-${i}`;
  }

  const publish = data.status === 'PUBLISHED';

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt || '',
      content: data.content || '',
      coverImage: data.coverImage || null,
      category: data.category || 'ADMISSION',
      keywords: data.keywords || null,
      sourceNote: data.sourceNote || null,
      naverDraft: data.naverDraft || null,
      isAutoDraft: data.isAutoDraft ?? false,
      status: publish ? 'PUBLISHED' : 'DRAFT',
      publishedAt: publish ? new Date() : null,
    },
  });

  return NextResponse.json(post);
}
