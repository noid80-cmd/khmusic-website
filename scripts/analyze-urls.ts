import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const URL_RE = /https?:\/\/res\.cloudinary\.com\/[a-z0-9]+\/[^"'\s\)]+/gi;
const MODELS = ['admin','subject','instructor','instructorSubject','notice','admission','musician','consultation','galleryImage','video','admissionGuide','heroSlide','siteSetting','program','curriculumClass','curriculumMajor'] as const;
async function main() {
  const urls = new Set<string>();
  for (const m of MODELS)
    for (const row of await (prisma as any)[m].findMany())
      for (const v of Object.values(row))
        if (typeof v === 'string') (v.match(URL_RE) || []).forEach(u => urls.add(u));

  const shapes: Record<string, number> = {};
  const exts: Record<string, number> = {};
  let withTransform = 0;
  for (const u of urls) {
    const after = u.split('/image/upload/')[1] ?? '(비표준)';
    const seg = after.split('/');
    // 버전(v123456) 앞에 세그먼트가 있으면 변환 파라미터가 붙은 것
    const vIdx = seg.findIndex(s => /^v\d+$/.test(s));
    if (vIdx > 0) withTransform++;
    shapes[u.includes('/image/upload/') ? 'image/upload' : 'other'] = (shapes[u.includes('/image/upload/') ? 'image/upload' : 'other'] || 0) + 1;
    const e = (u.split('.').pop() || '').toLowerCase();
    exts[e] = (exts[e] || 0) + 1;
  }
  console.log('고유 URL:', urls.size);
  console.log('경로 형태:', shapes);
  console.log('확장자:', exts);
  console.log('변환 파라미터가 붙은 URL:', withTransform);
  console.log('\n폴더 분포:');
  const folders: Record<string, number> = {};
  for (const u of urls) {
    const after = u.split('/image/upload/')[1] || '';
    const seg = after.split('/');
    const vIdx = seg.findIndex(s => /^v\d+$/.test(s));
    const path = seg.slice(vIdx + 1).join('/');
    const folder = path.split('/').slice(0, -1).join('/') || '(루트)';
    folders[folder] = (folders[folder] || 0) + 1;
  }
  Object.entries(folders).sort((a,b)=>b[1]-a[1]).forEach(([f,n]) => console.log(`  ${f}: ${n}`));
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
