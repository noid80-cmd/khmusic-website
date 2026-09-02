import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const insights = await prisma.blogInsight.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ insights });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const data = await request.json();

  // 이 둘이 없으면 소재로서 쓸모가 없다. 제목만 있고 설명이 없으면 모델이
  // 무슨 얘기인지 몰라서 엉뚱하게 부풀린다.
  if (!data.title?.trim()) {
    return NextResponse.json({ error: '제목을 입력해 주세요.' }, { status: 400 });
  }
  if (!data.detail?.trim()) {
    return NextResponse.json({ error: '설명을 입력해 주세요.' }, { status: 400 });
  }

  const insight = await prisma.blogInsight.create({
    data: {
      title: data.title.trim(),
      detail: data.detail.trim(),
      caution: data.caution?.trim() || null,
      schools: data.schools?.trim() || null,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
    },
  });
  return NextResponse.json({ insight });
}
