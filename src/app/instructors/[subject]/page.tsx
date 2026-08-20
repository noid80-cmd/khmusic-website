'use client';

import { useState, useEffect } from 'react';
import SubPageLayout from '@/components/SubPageLayout';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import InstructorModal from '@/components/InstructorModal';
import { imagePresets, getPlaceholderUrl } from '@/lib/image';

interface Subject {
  id: string;
  name: string;
  nameKo: string;
  order: number;
}

interface InstructorSubject {
  id: string;
  subjectId: string;
  subject: Subject;
}

interface Instructor {
  id: string;
  name: string;
  subjects: InstructorSubject[];
  image: string | null;
  intro: string | null;
  profile: string | null;
  curriculum: string | null;
  musicGenres: string | null;
  recommendedAlbums: string | null;
  messageToStudents: string | null;
  videoUrl1: string | null;
  videoUrl2: string | null;
  isActive: boolean;
  order: number;
}

// Subject slug 매핑
const subjectSlugMap: Record<string, string> = {
  'vocal': 'Vocal',
  'composing': 'Composing',
  'midi': 'MIDI/EMP',
  'singer-songwriter': 'SingerSongwriter',
  'guitar': 'Guitar',
  'bass': 'Bass',
  'drums': 'Drums',
  'jazz-piano': 'JazzPiano',
  'dance': 'Dance',
  'rap': 'Rap',
};

const subjectTitles: Record<string, { title: string; subtitle: string }> = {
  'vocal': { title: '보컬', subtitle: '대중음악 보컬 전문 교육' },
  'composing': { title: '작곡/화성학', subtitle: '작곡 및 화성학 이론 전문 교육' },
  'midi': { title: '미디/전자음악', subtitle: 'MIDI 및 전자음악 프로덕션 교육' },
  'singer-songwriter': { title: '싱어송라이터', subtitle: '보컬과 작곡을 겸비한 아티스트 양성' },
  'guitar': { title: '기타', subtitle: '일렉기타, 어쿠스틱기타 전문 교육' },
  'bass': { title: '베이스', subtitle: '일렉베이스 전문 교육' },
  'drums': { title: '드럼', subtitle: '드럼 전문 교육' },
  'jazz-piano': { title: '재즈피아노', subtitle: '재즈피아노 및 건반 전문 교육' },
  'dance': { title: '댄스', subtitle: '무대 퍼포먼스 및 댄스 교육' },
  'rap': { title: '랩', subtitle: '랩/힙합 보컬 전문 교육' },
};

const subjectOrder = ['vocal', 'composing', 'midi', 'singer-songwriter', 'guitar', 'bass', 'drums', 'jazz-piano', 'dance', 'rap'];

export default function InstructorSubjectPage() {
  const params = useParams();
  const subject = params.subject as string;
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  const subjectInfo = subjectTitles[subject];
  const subjectName = subjectSlugMap[subject];

  useEffect(() => {
    if (!subjectName) return;

    const fetchInstructors = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/instructors?subject=${subjectName}`);
        const data = await res.json();
        setInstructors(data);
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
      }
      setIsLoading(false);
    };

    fetchInstructors();
  }, [subjectName]);

  if (!subjectInfo) {
    return null;
  }

  const currentIndex = subjectOrder.indexOf(subject);
  const prevSubject = currentIndex > 0 ? subjectOrder[currentIndex - 1] : null;
  const nextSubject = currentIndex < subjectOrder.length - 1 ? subjectOrder[currentIndex + 1] : null;

  return (
    <SubPageLayout
      title={subjectInfo.title}
      subtitle={subjectInfo.subtitle}
    >
      {/* Breadcrumb */}
      <section style={{ padding: '24px 0', backgroundColor: '#f8f8f8', borderBottom: '1px solid #eee' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
            <Link href="/instructors" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              강사진
            </Link>
            <span>/</span>
            <span style={{ color: '#000', fontWeight: 500 }}>{subjectInfo.title}</span>
          </div>
        </div>
      </section>

      {/* Instructors Grid */}
      <section style={{ padding: '80px 0', backgroundColor: '#fff' }}>
        <div className="container">
          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '32px',
            }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#f8f8f8',
                  }}
                >
                  <div style={{
                    aspectRatio: '1/1',
                    backgroundColor: '#e5e5e5',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{
                      height: '24px',
                      backgroundColor: '#e5e5e5',
                      borderRadius: '4px',
                      width: '50%',
                      margin: '0 auto 8px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                    <div style={{
                      height: '16px',
                      backgroundColor: '#e5e5e5',
                      borderRadius: '4px',
                      width: '30%',
                      margin: '0 auto',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                  </div>
                </div>
              ))}
              <style jsx global>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.5; }
                }
              `}</style>
            </div>
          ) : instructors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              등록된 강사가 없습니다.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '32px',
            }}>
              {instructors.map((instructor, index) => (
                <div
                  key={instructor.id}
                  onClick={() => setSelectedInstructor(instructor)}
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#f8f8f8',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ position: 'relative', aspectRatio: '1/1', backgroundColor: '#eee' }}>
                    {instructor.image ? (
                      <Image
                        src={imagePresets.instructorDetail(instructor.image)}
                        alt={instructor.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                        style={{ objectFit: 'cover' }}
                        loading={index < 4 ? 'eager' : 'lazy'}
                        priority={index < 2}
                        placeholder="blur"
                        blurDataURL={getPlaceholderUrl(instructor.image)}
                      />
                    ) : (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '80px',
                        color: '#ccc',
                      }}>
                        👤
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#ffc50a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#000',
                      marginBottom: '8px',
                    }}>
                      {instructor.name}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#3b82f6',
                      fontWeight: 500,
                    }}>
                      {instructor.subjects.map(s => s.subject.nameKo).join(', ')}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#999',
                      marginTop: '8px',
                    }}>
                      클릭하여 상세정보 보기
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Navigation */}
      <section style={{ padding: '40px 0', backgroundColor: '#f8f8f8' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {prevSubject ? (
              <Link
                href={`/instructors/${prevSubject}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 500,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {subjectTitles[prevSubject]?.title}
              </Link>
            ) : (
              <div />
            )}

            <Link
              href="/instructors"
              style={{
                padding: '12px 24px',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              전체 강사진 보기
            </Link>

            {nextSubject ? (
              <Link
                href={`/instructors/${nextSubject}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 500,
                }}
              >
                {subjectTitles[nextSubject]?.title}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      <InstructorModal
        instructor={selectedInstructor}
        onClose={() => setSelectedInstructor(null)}
      />
    </SubPageLayout>
  );
}
