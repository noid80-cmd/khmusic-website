import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.id) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: '비밀번호는 6자 이상이어야 합니다.' },
      { status: 400 }
    );
  }

  // 현재 관리자 정보 조회
  const admin = await prisma.admin.findUnique({
    where: { id: session.id },
  });

  if (!admin) {
    return NextResponse.json({ error: '관리자를 찾을 수 없습니다.' }, { status: 404 });
  }

  // 현재 비밀번호 확인
  const isValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isValid) {
    return NextResponse.json(
      { error: '현재 비밀번호가 일치하지 않습니다.' },
      { status: 400 }
    );
  }

  // 새 비밀번호 해시화 및 업데이트
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { id: session.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다.' });
}
