/**
 * 합격자 데이터 정리
 *
 * university 한 칸에 학교명 + 수시/정시 + 합격단계가 섞여 들어가 있어
 * "백석예술대학교"(31건)와 "백석예술대학"(25건)이 다른 학교로 집계되고 있었다.
 * 통계 글을 자동 생성하면 틀린 순위가 그대로 나가므로 먼저 정리한다.
 *
 *   university    → 학교명만
 *   stage         → 1차합격 / 예비3 / 수석 등 (최종합격이면 null)
 *   admissionType → 수시 / 정시 (원본에 표기가 있던 건만)
 *
 * 화면은 university + stage를 다시 합쳐 표기하므로 보이는 내용은 달라지지 않는다.
 *
 *   미리보기:  npx tsx scripts/normalize-admissions.ts
 *   실제 반영:  npx tsx scripts/normalize-admissions.ts --apply
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

/** 같은 학교의 구명칭·오탈자 통일 */
const RENAME: Record<string, string> = {
  '백석예술대학': '백석예술대학교',
  '백제예술대학': '백제예술대학교',
  '동아방송예술대학': '동아방송예술대학교',
  '국제예술대학': '국제예술대학교',
  '정화예술대학': '정화예술대학교',
  '추계예술대학': '추계예술대학교',
  '서울예술대학': '서울예술대학교',
  '서울신학대학': '서울신학대학교',
  '수원여자대학': '수원여자대학교',
  '백석문화대학': '백석문화대학교',
  '한양여자대학': '한양여자대학교',
  '명지전문대학교': '명지전문대학',          // 공식 명칭은 '대학'
  '재능대학교': '인천재능대학교',            // 2012년 개명
  '서경대학교컨서바토리': '서경대학교 콘서바토리',
  '숭실대학교컨서바토리': '숭실대학교 콘서바토리',
  '연세디지털컨서바토리': '연세디지털콘서바토리',
  '아현산업정보고등학교': '아현산업정보학교',
  // 같은 학교의 표기 세 가지 (2026-09-01 원장님 확인)
  '서울예술종합대학': '서울종합예술학교',
  '서울예술종합학교': '서울종합예술학교',
};

export type Parsed = { name: string; stage: string | null; type: string | null };

export function parseUniversity(raw: string): Parsed {
  let s = raw.trim().replace(/\s+/g, ' ');
  let stage: string | null = null;
  let type: string | null = null;

  // 끝의 괄호 분리 — (예비3), (수시/1차) 등
  const m = s.match(/\(([^)]*)\)\s*$/);
  if (m) {
    stage = m[1].trim();
    s = s.slice(0, m.index).trim();
  }

  // 괄호 없이 붙은 꼬리표 — "재능대학교 차석합격"
  const tail = s.match(/\s*(차석합격|수석합격|차석|수석)$/);
  if (tail) {
    stage = stage ? `${stage}/${tail[1]}` : tail[1];
    s = s.slice(0, tail.index).trim();
  }

  // 괄호 안에 섞여 있던 수시/정시를 별도 컬럼으로
  if (stage) {
    if (/수시/.test(stage)) type = '수시';
    else if (/정시/.test(stage)) type = '정시';
    stage = stage.replace(/^(수시|정시)\s*\/?\s*/, '').trim() || null;
    if (stage === '수시' || stage === '정시') stage = null;
  }

  return { name: RENAME[s] ?? s, stage, type };
}

async function main() {
  const rows = await prisma.admission.findMany({ orderBy: { createdAt: 'asc' } });

  // 되돌릴 수 있게 원본을 파일로 남긴다
  const backup = path.join(process.cwd(), `admissions-backup-${Date.now()}.json`);
  fs.writeFileSync(backup, JSON.stringify(rows, null, 2));
  console.log(`원본 백업: ${path.basename(backup)} (${rows.length}건)\n`);

  const before = new Set(rows.map((r) => r.university));
  const after = new Set<string>();
  const changes: { id: string; from: string; to: string; stage: string | null; type: string | null }[] = [];

  for (const r of rows) {
    const p = parseUniversity(r.university);
    after.add(p.name);
    if (p.name !== r.university || p.stage || p.type) {
      changes.push({ id: r.id, from: r.university, to: p.name, stage: p.stage, type: p.type });
    }
  }

  console.log(`고유 학교명 ${before.size}개 → ${after.size}개`);
  console.log(`수정 대상 ${changes.length}건 / 전체 ${rows.length}건\n`);

  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    const n = parseUniversity(r.university).name;
    counts[n] = (counts[n] || 0) + 1;
  });
  console.log('정리 후 상위 10개 학교');
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`));

  const finals = rows.filter((r) => !parseUniversity(r.university).stage).length;
  console.log(`\n최종합격 ${finals}건 / 예비·1차 등 ${rows.length - finals}건`);

  if (!APPLY) {
    console.log('\n미리보기만 실행했다. 실제로 반영하려면 --apply 를 붙일 것.');
    await prisma.$disconnect();
    return;
  }

  console.log('\nDB 반영 중...');
  let n = 0;
  for (const c of changes) {
    await prisma.admission.update({
      where: { id: c.id },
      data: {
        university: c.to,
        stage: c.stage,
        admissionType: c.type,
        ...(c.type ? { isEarlyAdmission: c.type === '수시' } : {}),
      },
    });
    n++;
    if (n % 50 === 0) console.log(`  ${n}/${changes.length}`);
  }
  console.log(`완료 — ${n}건 수정`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
