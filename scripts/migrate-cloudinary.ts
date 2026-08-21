/**
 * 에이전시 Cloudinary(dr1cznsyf) -> 본인 Cloudinary 로 이미지 이관.
 *
 *   npx tsx scripts/migrate-cloudinary.ts upload   업로드만 (DB 무변경)
 *   npx tsx scripts/migrate-cloudinary.ts verify   업로드된 새 URL 접근 검증
 *   npx tsx scripts/migrate-cloudinary.ts apply    DB의 URL 치환 (되돌리기용 백업 생성)
 *
 * 원본은 삭제하지 않으므로 apply 전까지 사이트는 계속 정상 동작한다.
 */
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

// --- .env.local 직접 로드 (tsx는 자동 로드하지 않음) ---
for (const f of ['.env', '.env.local']) {
  const p = path.join(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const OLD_CLOUD = 'dr1cznsyf';
const NEW_CLOUD = process.env.CLOUDINARY_CLOUD_NAME!;
const MAP_FILE = path.join(process.cwd(), 'cloudinary-migration-map.json');
const BACKUP_FILE = path.join(process.cwd(), 'cloudinary-migration-backup.json');

cloudinary.config({
  cloud_name: NEW_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const URL_RE = /https?:\/\/res\.cloudinary\.com\/[a-z0-9]+\/[^"'\s\)]+/gi;
const MODELS = ['admin','subject','instructor','instructorSubject','notice','admission','musician','consultation','galleryImage','video','admissionGuide','heroSlide','siteSetting','program','curriculumClass','curriculumMajor'] as const;

type Mapping = Record<string, string>;

const loadMap = (): Mapping =>
  fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};
const saveMap = (m: Mapping) => fs.writeFileSync(MAP_FILE, JSON.stringify(m, null, 2));

/** URL에서 public_id(폴더 포함, 확장자 제외) 추출 */
function publicIdOf(url: string): string {
  const after = url.split('/image/upload/')[1];
  const seg = after.split('/');
  const vIdx = seg.findIndex((s) => /^v\d+$/.test(s));
  return seg.slice(vIdx + 1).join('/').replace(/\.[a-z0-9]+$/i, '');
}

async function collectRows() {
  const out: { model: string; row: any }[] = [];
  for (const model of MODELS)
    for (const row of await (prisma as any)[model].findMany())
      out.push({ model, row });
  return out;
}

function urlsIn(rows: { row: any }[]): string[] {
  const s = new Set<string>();
  for (const { row } of rows)
    for (const v of Object.values(row))
      if (typeof v === 'string')
        (v.match(URL_RE) || [])
          .filter((u) => u.split('/')[3] === OLD_CLOUD)
          .forEach((u) => s.add(u));
  return [...s];
}

async function cmdUpload() {
  const urls = urlsIn(await collectRows());
  const map = loadMap();
  const todo = urls.filter((u) => !map[u]);
  console.log(`에이전시 URL ${urls.length}개 / 이미 업로드됨 ${urls.length - todo.length}개 / 남은 작업 ${todo.length}개\n`);

  let done = 0, failed: string[] = [];
  const CONCURRENCY = 4;
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    await Promise.all(todo.slice(i, i + CONCURRENCY).map(async (url) => {
      const publicId = publicIdOf(url);
      try {
        // Cloudinary가 원격 URL을 직접 가져가므로 로컬 다운로드 불필요
        const res = await cloudinary.uploader.upload(url, {
          public_id: publicId,
          overwrite: true,
          unique_filename: false,
          use_filename: false,
          resource_type: 'image',
        });
        map[url] = res.secure_url;
        done++;
      } catch (e: any) {
        failed.push(`${publicId}: ${e?.message || e}`);
      }
    }));
    saveMap(map);
    process.stdout.write(`\r  진행 ${Math.min(i + CONCURRENCY, todo.length)}/${todo.length}`);
  }
  console.log(`\n\n업로드 성공 ${done}개, 실패 ${failed.length}개`);
  failed.forEach((f) => console.log('  실패: ' + f));
  console.log(`매핑 저장: ${MAP_FILE}`);
  if (failed.length) process.exitCode = 1;
}

async function cmdVerify() {
  const map = loadMap();
  const entries = Object.entries(map);
  console.log(`새 URL ${entries.length}개 접근 검증 중...`);
  let ok = 0; const bad: string[] = [];
  const CONCURRENCY = 8;
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    await Promise.all(entries.slice(i, i + CONCURRENCY).map(async ([, newUrl]) => {
      try {
        const r = await fetch(newUrl, { method: 'HEAD' });
        r.ok ? ok++ : bad.push(`HTTP ${r.status} ${newUrl}`);
      } catch (e: any) { bad.push(`${e?.message} ${newUrl}`); }
    }));
    process.stdout.write(`\r  진행 ${Math.min(i + CONCURRENCY, entries.length)}/${entries.length}`);
  }
  console.log(`\n\n정상 ${ok}개, 실패 ${bad.length}개`);
  bad.slice(0, 10).forEach((b) => console.log('  ' + b));
  if (bad.length) process.exitCode = 1;
}

async function cmdApply() {
  const map = loadMap();
  const rows = await collectRows();
  const remaining = urlsIn(rows).filter((u) => !map[u]);
  if (remaining.length) {
    console.error(`중단: 매핑되지 않은 URL이 ${remaining.length}개 남아있습니다. 먼저 upload를 완료하세요.`);
    remaining.slice(0, 5).forEach((u) => console.error('  ' + u));
    process.exitCode = 1;
    return;
  }

  const backup: any[] = [];
  let updated = 0, fields = 0;
  for (const { model, row } of rows) {
    if (!row.id) continue;
    const patch: Record<string, string> = {};
    const before: Record<string, string> = {};
    for (const [field, value] of Object.entries(row)) {
      if (typeof value !== 'string' || !value.includes(OLD_CLOUD)) continue;
      let next = value;
      for (const [oldU, newU] of Object.entries(map)) next = next.split(oldU).join(newU);
      if (next !== value) { patch[field] = next; before[field] = value; fields++; }
    }
    if (!Object.keys(patch).length) continue;
    backup.push({ model, id: row.id, before });
    await (prisma as any)[model].update({ where: { id: row.id }, data: patch });
    updated++;
  }
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));
  console.log(`레코드 ${updated}건 / 필드 ${fields}개 갱신 완료`);
  console.log(`되돌리기용 백업: ${BACKUP_FILE}`);

  const left = urlsIn(await collectRows());
  console.log(`\n갱신 후 DB에 남은 에이전시 URL: ${left.length}개 ${left.length ? '(문제!)' : '(정상)'}`);
}

const cmd = process.argv[2];
const fn = cmd === 'upload' ? cmdUpload : cmd === 'verify' ? cmdVerify : cmd === 'apply' ? cmdApply : null;
if (!fn) { console.error('사용법: upload | verify | apply'); process.exit(1); }
fn().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
