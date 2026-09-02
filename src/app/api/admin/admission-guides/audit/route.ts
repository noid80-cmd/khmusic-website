import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { auditGuides } from '@/lib/guide-audit';

export const dynamic = 'force-dynamic';

/**
 * 진행 중인 학년도의 요강을 점검한다.
 *
 * 칼럼의 사실관계는 결국 이 DB에서 나온다. 여기가 틀리면 대조도 소용없다.
 * 틀린 값을 기준으로 맞춰 보니 그대로 통과하기 때문이다.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // 지난 학년도는 이미 끝난 입시라 고칠 이유가 없다. 글에도 안 쓰인다.
  const now = new Date();
  const currentYear = now.getMonth() + 1 >= 3 ? now.getFullYear() + 1 : now.getFullYear();

  const guides = await prisma.admissionGuide.findMany({
    where: { year: { gte: currentYear } },
    select: {
      id: true,
      university: true,
      department: true,
      year: true,
      content: true,
      deadline: true,
      examDate: true,
      examContent: true,
      link: true,
      isPublished: true,
    },
    orderBy: [{ year: 'desc' }, { university: 'asc' }],
  });

  const issues = auditGuides(guides);

  return NextResponse.json({
    checked: guides.length,
    errors: issues.filter((i) => i.severity === 'error').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
    issues,
  });
}
