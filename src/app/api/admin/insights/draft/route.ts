import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { structureInsight, suggestInsights } from '@/lib/insight-draft';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** 요강을 훑어 물어볼 것을 만든다. 답은 사람이 채운다. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY가 설정돼 있지 않습니다.' }, { status: 500 });
  }

  try {
    return NextResponse.json({ questions: await suggestInsights() });
  } catch (error) {
    console.error('[insight-suggest] 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 },
    );
  }
}

/** 메모처럼 쓴 글을 칸에 나눠 담아 돌려준다. 저장은 사람이 확인한 뒤에. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY가 설정돼 있지 않습니다.' }, { status: 500 });
  }

  const { text } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: '정리할 내용을 입력해 주세요.' }, { status: 400 });
  }

  try {
    return NextResponse.json({ structured: await structureInsight(text.trim()) });
  } catch (error) {
    console.error('[insight-draft] 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 },
    );
  }
}
