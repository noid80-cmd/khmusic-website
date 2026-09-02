import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import prisma from '@/lib/prisma';

/**
 * 칼럼 소재를 쓰기 쉽게 만드는 두 가지.
 *
 * 소재는 현장을 아는 사람만 채울 수 있는데, 정작 그 사람에게 양식을 채우게
 * 하면 안 쓰게 된다. 그래서 두 방향에서 문턱을 낮춘다.
 *
 * 1) structureInsight - 메모처럼 쓴 글을 제목·설명·학교로 정리해 준다.
 * 2) suggestInsights  - 요강을 훑어 "이건 어떻게 되나요?" 하고 먼저 묻는다.
 *
 * 둘 다 사실을 만들어 내지 않는다. 1번은 사람이 쓴 내용만 다시 배열하고,
 * 2번은 질문만 만든다. 답은 언제나 사람이 채운다. 이 경계가 무너지면
 * 소재는 "현장에서 확인된 것"이 아니라 그냥 그럴듯한 추측이 된다.
 */

const StructuredSchema = z.object({
  title: z.string().describe('한 줄 요약. 30자 안팎. 무엇이 사실인지 드러나게'),
  detail: z.string().describe('왜 중요한지, 학생이 무엇을 놓치는지. 원문 내용만 쓸 것'),
  caution: z
    .string()
    .describe(
      '제도·규정처럼 해마다 바뀔 수 있는 내용이면 확인 안내 문장. 해당 없으면 빈 문자열',
    ),
  schools: z
    .string()
    .describe('원문에 언급된 학교의 정식 명칭, 쉼표로 구분. 특정 학교 얘기가 아니면 빈 문자열'),
  note: z
    .string()
    .describe('원문이 모호해서 확인이 필요한 대목이 있으면 한 문장. 없으면 빈 문자열'),
});

export type StructuredInsight = z.infer<typeof StructuredSchema>;

const STRUCTURE_SYSTEM = `당신은 실용음악 입시 학원의 기록을 정리하는 사람입니다.

현장에서 일하는 사람이 메모처럼 흘려 쓴 내용을 받아, 정해진 칸에 나눠 담는 것이 당신의 일입니다.

절대 지킬 것:
- **원문에 없는 사실을 만들지 마세요.** 날짜, 학교명, 숫자, 제도 내용을 보충하거나 추측해서 채우면 안 됩니다. 이 내용은 학생이 읽고 실제로 원서를 넣는 데 쓰입니다.
- 원문이 짧으면 짧은 대로 두세요. 분량을 늘리려고 일반론을 덧붙이지 마세요.
- 원문이 모호하면 매끄럽게 다듬어 감추지 말고, note에 무엇이 불분명한지 적으세요.

각 칸의 성격:
- title: 무엇이 사실인지 한 줄로. "~가 된다", "~는 다르다"처럼 내용이 드러나게. "중복지원 안내" 같은 제목은 쓸모없습니다.
- detail: 원문의 내용을 문장으로 정리합니다. 학생이 무엇을 오해하는지, 그래서 무엇이 달라지는지가 드러나면 좋습니다. 원문에 그 얘기가 없으면 넣지 마세요.
- caution: 중복지원 가능 여부, 등록 포기 절차, 반영 비율처럼 **해마다 바뀔 수 있는 제도**를 다룰 때만 채웁니다. "해당 연도 모집요강에서 확인해야 한다" 류의 확인 안내입니다. 실기 준비 요령처럼 제도가 아닌 내용이면 비웁니다.
- schools: 원문에 나온 학교를 아래 목록의 정식 명칭으로 옮깁니다. 목록에 없는 학교는 원문 표기 그대로 씁니다. 모든 학교에 해당하는 일반적인 내용이면 비웁니다.`;

const SUGGEST_SYSTEM = `당신은 실용음악 입시 요강을 읽고 질문을 만드는 사람입니다.

요강에는 조건만 적혀 있고 그것이 실제로 무엇을 뜻하는지는 안 적혀 있습니다. 학원에서 오래 일한 사람은 그 답을 알지만, 무엇을 물어야 하는지 떠올리기는 어렵습니다. 그래서 당신이 먼저 묻습니다.

절대 지킬 것:
- **답을 쓰지 마세요.** 당신은 답을 모릅니다. 추측한 답을 질문에 섞으면 사람이 그것을 사실로 착각합니다.
- 요강에 이미 답이 적힌 것은 묻지 마세요. "원서 마감이 언제인가요"는 요강을 보면 나옵니다.
- 검색하면 나오는 일반론도 묻지 마세요. "실기 준비는 언제부터 하나요" 같은 것.

좋은 질문의 조건:
- 요강의 구체적인 조건에서 출발합니다. 어느 학교의 어떤 대목인지 분명해야 합니다.
- 답을 아는 사람이 한두 문장으로 답할 수 있어야 합니다.
- 그 답이 학생의 준비나 지원 판단을 실제로 바꿀 수 있어야 합니다.

예시: "A대학은 1차와 2차 모두 자유곡인데 2차에서 곡 수가 늘어납니다. 같은 곡을 다시 써도 되나요, 아니면 다른 곡이어야 하나요?"`;

const SuggestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().describe('답을 아는 사람에게 던지는 질문. 답을 쓰지 말 것'),
        why: z.string().describe('이 답이 학생의 준비를 어떻게 바꾸는지 한 문장'),
        schools: z.string().describe('관련 학교 정식 명칭, 쉼표로 구분. 없으면 빈 문자열'),
      }),
    )
    .describe('질문 4~6개'),
});

export type Suggestion = z.infer<typeof SuggestionsSchema>['questions'][number];

/** DB에 실제로 있는 학교 이름. 모델이 약칭을 쓰지 않도록 어휘를 고정한다. */
async function knownUniversities(): Promise<string[]> {
  const rows = await prisma.admissionGuide.findMany({
    where: { isPublished: true },
    select: { university: true },
    distinct: ['university'],
  });
  return [
    ...new Set(rows.map((r) => r.university.replace(/\s*(수시|정시).*$/, '').trim())),
  ].sort();
}

/** 메모처럼 쓴 글을 칸에 나눠 담는다. 저장하지 않고 돌려주기만 한다. */
export async function structureInsight(text: string): Promise<StructuredInsight> {
  const universities = await knownUniversities();

  const client = new Anthropic();
  const response = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 3000,
    system: STRUCTURE_SYSTEM,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low', format: zodOutputFormat(StructuredSchema) },
    messages: [
      {
        role: 'user',
        content: `## 정리할 메모
${text}

## 학교 정식 명칭 목록
${universities.join(', ')}`,
      },
    ],
  });

  const out = response.parsed_output;
  if (!out) throw new Error('정리 결과를 해석하지 못했습니다.');
  return out;
}

/** 요강을 훑어 물어볼 것을 만든다. 이미 소재로 있는 얘기는 빼고. */
export async function suggestInsights(): Promise<Suggestion[]> {
  const now = new Date();
  const year = now.getMonth() + 1 >= 3 ? now.getFullYear() + 1 : now.getFullYear();

  const [guides, existing] = await Promise.all([
    prisma.admissionGuide.findMany({
      where: { isPublished: true, year: { gte: year } },
      select: { university: true, department: true, content: true, examContent: true },
      take: 30,
    }),
    prisma.blogInsight.findMany({ select: { title: true, schools: true } }),
  ]);

  if (guides.length === 0) return [];

  const client = new Anthropic();
  const response = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 4000,
    system: SUGGEST_SYSTEM,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: zodOutputFormat(SuggestionsSchema) },
    messages: [
      {
        role: 'user',
        content: `## 요강 자료
${JSON.stringify(guides, null, 2)}

## 이미 정리돼 있는 소재 (같은 것을 또 묻지 마세요)
${JSON.stringify(existing, null, 2)}`,
      },
    ],
  });

  return response.parsed_output?.questions ?? [];
}
