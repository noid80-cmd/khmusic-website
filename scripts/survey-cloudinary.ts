/**
 * 에이전시 Cloudinary(dr1cznsyf) URL이 DB 어디에 얼마나 남아있는지 전수 조사.
 * 읽기 전용 — DB를 변경하지 않는다.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OLD_CLOUD = process.env.OLD_CLOUDINARY_CLOUD || 'dr1cznsyf';
const URL_RE = /https?:\/\/res\.cloudinary\.com\/[a-z0-9]+\/[^"'\s\)]+/gi;

const MODELS = [
  'admin', 'subject', 'instructor', 'instructorSubject', 'notice',
  'admission', 'musician', 'consultation', 'galleryImage', 'video',
  'admissionGuide', 'heroSlide', 'siteSetting', 'program',
  'curriculumClass', 'curriculumMajor',
] as const;

async function main() {
  const byCloud = new Map<string, number>();
  const allUrls = new Set<string>();
  const perField: Record<string, number> = {};

  for (const model of MODELS) {
    const rows: any[] = await (prisma as any)[model].findMany();
    for (const row of rows) {
      for (const [field, value] of Object.entries(row)) {
        if (typeof value !== 'string') continue;
        const found = value.match(URL_RE);
        if (!found) continue;
        for (const url of found) {
          allUrls.add(url);
          const cloud = url.split('/')[3];
          byCloud.set(cloud, (byCloud.get(cloud) || 0) + 1);
          const key = `${model}.${field}`;
          perField[key] = (perField[key] || 0) + 1;
        }
      }
    }
    process.stdout.write(`  ${model}: ${rows.length} rows\n`);
  }

  console.log('\n=== 계정별 URL 등장 횟수 ===');
  for (const [cloud, n] of [...byCloud].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cloud}${cloud === OLD_CLOUD ? '  <-- 에이전시' : ''}: ${n}`);
  }

  console.log('\n=== 필드별 등장 횟수 ===');
  for (const [k, n] of Object.entries(perField).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${n}`);
  }

  const oldUrls = [...allUrls].filter((u) => u.split('/')[3] === OLD_CLOUD);
  console.log(`\n고유 URL 총 ${allUrls.size}개 / 그중 에이전시 계정 ${oldUrls.length}개`);
  console.log('\n=== 에이전시 URL 샘플 5개 ===');
  oldUrls.slice(0, 5).forEach((u) => console.log('  ' + u));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
