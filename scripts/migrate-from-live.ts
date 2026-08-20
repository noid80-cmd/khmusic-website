// 운영 중인 bckh-music-academy.vercel.app의 공개 API에서 데이터를 그대로
// 가져와 새 DB(khmusic-website Supabase 프로젝트)에 채워 넣는 1회성
// 마이그레이션 스크립트. 이미지 URL은 일단 기존 에이전시 Cloudinary
// 그대로 두고(별도 작업으로 나중에 이관), DB 레코드만 옮긴다.
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const BASE = 'https://bckh-music-academy.vercel.app'

async function fetchJson(path: string) {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`)
  return res.json()
}

async function main() {
  console.log('=== Subjects ===')
  const subjects = await fetchJson('/api/subjects')
  const subjectIdMap = new Map<string, string>()
  for (const s of subjects) {
    const created = await prisma.subject.upsert({
      where: { name: s.name },
      update: {},
      create: {
        name: s.name,
        nameKo: s.nameKo,
        description: s.description ?? null,
        features: s.features ?? null,
        order: s.order ?? 0,
        isPublished: s.isPublished ?? true,
      },
    })
    subjectIdMap.set(s.id, created.id)
  }
  console.log(`  ${subjects.length}건`)

  console.log('=== Instructors ===')
  const instructors = await fetchJson('/api/instructors')
  for (const ins of instructors) {
    const created = await prisma.instructor.create({
      data: {
        name: ins.name,
        image: ins.image ?? null,
        intro: ins.intro ?? null,
        profile: ins.profile ?? null,
        curriculum: ins.curriculum ?? null,
        musicGenres: ins.musicGenres ?? null,
        recommendedAlbums: ins.recommendedAlbums ?? null,
        messageToStudents: ins.messageToStudents ?? null,
        videoUrl1: ins.videoUrl1 || null,
        videoUrl2: ins.videoUrl2 || null,
        isActive: ins.isActive ?? true,
        order: ins.order ?? 0,
        mainPageOrder: ins.mainPageOrder ?? null,
      },
    })
    for (const link of ins.subjects || []) {
      const newSubjectId = subjectIdMap.get(link.subjectId)
      if (!newSubjectId) continue
      await prisma.instructorSubject.create({
        data: { instructorId: created.id, subjectId: newSubjectId, order: link.order ?? 0 },
      })
    }
  }
  console.log(`  ${instructors.length}건`)

  console.log('=== Notices ===')
  const noticesList = await fetchJson('/api/notices')
  for (const n of noticesList.notices) {
    const full = await fetchJson(`/api/notices/${n.id}`)
    await prisma.notice.create({
      data: {
        title: full.title,
        content: full.content,
        category: full.category,
        isPinned: full.isPinned ?? false,
        viewCount: full.viewCount ?? 0,
        isPublished: true,
      },
    })
  }
  console.log(`  ${noticesList.notices.length}건`)

  console.log('=== Admissions ===')
  const admissions = await fetchJson('/api/admissions')
  for (const a of admissions) {
    await prisma.admission.create({
      data: {
        studentName: a.studentName,
        university: a.university,
        department: a.department,
        year: a.year,
        major: a.major ?? null,
        isEarlyAdmission: a.isEarlyAdmission ?? false,
        photoUrl: a.photoUrl || null,
        testimonial: a.testimonial || null,
        order: a.order ?? 0,
        isPublished: true,
      },
    })
  }
  console.log(`  ${admissions.length}건`)

  console.log('=== Musicians ===')
  const musicians = await fetchJson('/api/musicians')
  for (const m of musicians) {
    await prisma.musician.create({
      data: {
        name: m.name,
        role: m.role,
        achievement: m.achievement ?? null,
        image: m.image ?? null,
        snsUrl: m.snsUrl || null,
        isPublished: true,
        order: m.order ?? 0,
      },
    })
  }
  console.log(`  ${musicians.length}건`)

  console.log('=== Gallery ===')
  const gallery = await fetchJson('/api/gallery')
  for (const g of gallery) {
    await prisma.galleryImage.create({
      data: {
        title: g.title || null,
        description: g.description || null,
        imageUrl: g.imageUrl,
        category: g.category,
        order: g.order ?? 0,
        isPublished: true,
      },
    })
  }
  console.log(`  ${gallery.length}건`)

  console.log('=== Videos (all categories) ===')
  const videos = await fetchJson('/api/videos')
  let vi = 0
  for (const v of videos) {
    await prisma.video.create({
      data: {
        title: v.title,
        description: v.description || null,
        youtubeUrl: v.youtubeUrl,
        thumbnailUrl: v.thumbnailUrl || null,
        category: v.category,
        isPublished: true,
        order: vi++,
      },
    })
  }
  console.log(`  ${videos.length}건`)

  console.log('=== Hero slides ===')
  const heroSlides = await fetchJson('/api/hero-slides')
  let hi = 0
  for (const h of heroSlides) {
    await prisma.heroSlide.create({
      data: {
        title: h.title,
        subtitle: h.subtitle || null,
        imageUrl: h.imageUrl,
        buttonText: h.buttonText || null,
        buttonLink: h.buttonLink || null,
        textPosition: h.textPosition || 'left',
        textAlign: h.textAlign || 'left',
        order: hi++,
        isPublished: true,
      },
    })
  }
  console.log(`  ${heroSlides.length}건`)

  console.log('=== Programs ===')
  const programs = await fetchJson('/api/programs')
  let pi = 0
  for (const p of programs) {
    await prisma.program.create({
      data: {
        slug: p.slug,
        name: p.name,
        subtitle: p.subtitle || null,
        description: p.description || null,
        icon: p.icon || null,
        image: p.image || null,
        content: null, // 공개 API에 상세 content(JSON)는 없어서 관리자 페이지에서 나중에 채워야 함
        order: pi++,
        isPublished: true,
      },
    })
  }
  console.log(`  ${programs.length}건 (상세 content는 비어있음 — 관리자 페이지에서 확인 필요)`)

  console.log('=== Admission guides ===')
  const guides = await fetchJson('/api/admission-guides')
  let gi = 0
  for (const g of guides) {
    await prisma.admissionGuide.create({
      data: {
        university: g.university,
        department: g.department || null,
        category: g.category,
        year: g.year,
        content: g.content,
        deadline: g.deadline || null,
        examDate: g.examDate || null,
        requirements: g.requirements || null,
        documents: g.documents || null,
        examContent: g.examContent || null,
        link: g.link || null,
        isPublished: true,
        order: g.order ?? gi++,
      },
    })
  }
  console.log(`  ${guides.length}건`)

  console.log('=== Curriculum classes + majors ===')
  const classes = await fetchJson('/api/curriculum/classes')
  let totalMajors = 0
  for (const c of classes) {
    const full = await fetchJson(`/api/curriculum/${c.slug}`)
    const createdClass = await prisma.curriculumClass.create({
      data: {
        slug: full.slug,
        title: full.title,
        subtitle: full.subtitle || null,
        intro: full.intro || null,
        bgImage: full.bgImage || null,
        benefits: full.benefits ? JSON.stringify(full.benefits) : null,
        universities: full.universities ? JSON.stringify(full.universities) : null,
        agencies: full.agencies ? JSON.stringify(full.agencies) : null,
        order: full.order ?? 0,
        isPublished: true,
      },
    })
    for (const m of full.majors || []) {
      await prisma.curriculumMajor.create({
        data: {
          classId: createdClass.id,
          name: m.name,
          icon: m.icon || null,
          description: m.description || null,
          curriculum: m.curriculum ? JSON.stringify(m.curriculum) : null,
          order: m.order ?? 0,
          isPublished: true,
        },
      })
      totalMajors++
    }
  }
  console.log(`  클래스 ${classes.length}건, 전공 ${totalMajors}건`)

  console.log('=== Page backgrounds ===')
  const bg = await fetchJson('/api/page-backgrounds')
  let bgCount = 0
  for (const [path, url] of Object.entries(bg)) {
    const key = 'page_bg_' + path.replace(/\//g, '_')
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: url as string },
      create: { key, value: url as string },
    })
    bgCount++
  }
  console.log(`  ${bgCount}건`)

  console.log('=== Admin account ===')
  const adminPassword = process.env.MIGRATE_ADMIN_PASSWORD || 'khmusic-temp-2026!'
  const hashed = await bcrypt.hash(adminPassword, 12)
  await prisma.admin.upsert({
    where: { email: 'admin@khmusic.co.kr' },
    update: {},
    create: { email: 'admin@khmusic.co.kr', password: hashed, name: '관리자' },
  })
  console.log(`  admin@khmusic.co.kr / ${adminPassword}`)

  console.log('\n🎉 마이그레이션 완료')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
