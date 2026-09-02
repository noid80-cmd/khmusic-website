import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { id } = await params;
  const data = await request.json();

  if ('title' in data && !data.title?.trim()) {
    return NextResponse.json({ error: '제목을 입력해 주세요.' }, { status: 400 });
  }
  if ('detail' in data && !data.detail?.trim()) {
    return NextResponse.json({ error: '설명을 입력해 주세요.' }, { status: 400 });
  }

  const insight = await prisma.blogInsight.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.detail !== undefined && { detail: data.detail.trim() }),
      ...(data.caution !== undefined && { caution: data.caution?.trim() || null }),
      ...(data.schools !== undefined && { schools: data.schools?.trim() || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });
  return NextResponse.json({ insight });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { id } = await params;
  await prisma.blogInsight.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
