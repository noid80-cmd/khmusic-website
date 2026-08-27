import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

// Vercel 서버리스 함수의 요청 본문 한도가 4.5MB라 그보다 큰 요청은 여기까지 오지도 않는다.
// 클라이언트에서 미리 줄여 보내고, 여기서는 같은 기준으로 한 번 더 막는다.
export const maxDuration = 60; // 업로드 타임아웃 60초
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (4MB - Vercel 본문 한도 4.5MB 안쪽)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 4MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // Cloudinary 업로드
    const result = await uploadImage(file, `bckh-music-academy/${folder}`);

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `이미지 업로드에 실패했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
