import { NextRequest, NextResponse } from 'next/server';
import { generateBlogDraft } from '@/lib/blog-draft';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
// 모델이 글 한 편을 쓰는 데 1분 안팎이 걸린다. 60초로 잡았더니 경계에 걸려
// 어떤 날은 되고 어떤 날은 504로 죽었다. 플랜 상한을 넘기면 Vercel이 알아서
// 낮춰 잡으므로 넉넉히 요청해 둔다.
export const maxDuration = 300;

/**
 * Vercel Cron이 부르는 자리. 주 2회 입시 칼럼 초안을 만들어 DRAFT로 넣는다.
 *
 * Vercel Cron은 GET으로 호출하면서 `Authorization: Bearer $CRON_SECRET`를 붙인다.
 * 이 라우트는 글을 생성하느라 실제 비용이 드는 자리라, 아무나 반복 호출하면
 * 그대로 요금이 된다. 그래서 시크릿이 없으면 즉시 거절한다.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET이 설정돼 있지 않습니다.' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  return run();
}

/** 관리자가 화면에서 "지금 초안 만들기"를 눌렀을 때. 예약 시간을 기다리지 않아도 되게. */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  return run();
}

async function run() {
  try {
    const result = await generateBlogDraft();
    if (!result.ok) {
      // 근거 자료가 없어서 안 만든 것도 "실패"로 남겨야 나중에 원인을 안다.
      console.warn('[blog-draft] 생성 안 함:', result.reason);
      return NextResponse.json({ created: false, reason: result.reason }, { status: 200 });
    }
    console.log('[blog-draft] 초안 생성:', result.university, result.title);
    return NextResponse.json({ created: true, ...result });
  } catch (error) {
    console.error('[blog-draft] 오류:', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json({ created: false, error: message }, { status: 500 });
  }
}
