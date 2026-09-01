import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  const current = await prisma.blogPost.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }

  // 처음 게시하는 순간에만 게시일을 찍는다. 이후 수정으로 날짜가 바뀌면
  // 검색엔진에는 새 글처럼 보였다가 순서가 뒤엉킨다.
  const becomingPublished = data.status === 'PUBLISHED' && current.status !== 'PUBLISHED';

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.coverImage !== undefined ? { coverImage: data.coverImage || null } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.keywords !== undefined ? { keywords: data.keywords || null } : {}),
      ...(data.sourceNote !== undefined ? { sourceNote: data.sourceNote || null } : {}),
      ...(data.naverDraft !== undefined ? { naverDraft: data.naverDraft || null } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(becomingPublished ? { publishedAt: new Date() } : {}),
    },
  });

  // 목록·상세는 캐시로 서빙되므로 바로 반영되도록 무효화한다
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/sitemap.xml');

  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.blogPost.delete({ where: { id } });

  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/sitemap.xml');

  return NextResponse.json({ success: true });
}
