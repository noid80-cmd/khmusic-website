import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const rows = await p.blogPost.findMany({
  orderBy: { createdAt: 'desc' }, take: 6,
  select: { title: true, status: true, isAutoDraft: true, createdAt: true, excerpt: true, content: true },
})
console.log('총', rows.length, '건\n')
for (const r of rows) {
  console.log('—', r.createdAt.toISOString().slice(0,10), '|', r.status, '| auto:', r.isAutoDraft)
  console.log('  제목:', r.title)
  console.log('  본문길이:', (r.content||'').length)
}
await p.$disconnect()
