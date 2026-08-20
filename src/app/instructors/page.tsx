'use client';

import { useState, useEffect } from 'react';
import SubPageLayout from '@/components/SubPageLayout';
import Link from 'next/link';

interface Subject {
  id: string;
  name: string;
  nameKo: string;
  order: number;
  _count?: { instructors: number };
}

// 전공별 아이콘 SVG
const SubjectIcons: Record<string, JSX.Element> = {
  Vocal: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Composing: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  'MIDI/EMP': (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M6 11h.01M10 11h.01M14 11h.01M18 11h.01M6 15h.01M10 15h.01M14 15h.01M18 15h.01M7 3v4M12 3v4M17 3v4" />
    </svg>
  ),
  SingerSongwriter: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Guitar: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <path d="M11.9 2L7.2 6.7c-.8.8-.8 2.1 0 2.9l7.2 7.2c.8.8 2.1.8 2.9 0l4.7-4.7c.8-.8.8-2.1 0-2.9l-7.2-7.2c-.8-.8-2.1-.8-2.9 0z" />
      <path d="M10.5 10.5L6 15M13.5 13.5L9 18M7 22l-2-2M16 11l5-5" />
    </svg>
  ),
  Bass: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <rect x="8" y="4" width="8" height="16" rx="1" />
      <line x1="11" y1="4" x2="11" y2="20" />
      <line x1="13" y1="4" x2="13" y2="20" />
      <circle cx="10" cy="8" r="1" fill="#ffc50a" />
      <circle cx="14" cy="8" r="1" fill="#ffc50a" />
    </svg>
  ),
  Drums: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16M4 12h16" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  JazzPiano: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <rect x="2" y="8" width="20" height="12" rx="1" />
      <line x1="6" y1="8" x2="6" y2="20" />
      <line x1="10" y1="8" x2="10" y2="20" />
      <line x1="14" y1="8" x2="14" y2="20" />
      <line x1="18" y1="8" x2="18" y2="20" />
      <rect x="5" y="8" width="2" height="6" fill="#ffc50a" />
      <rect x="13" y="8" width="2" height="6" fill="#ffc50a" />
    </svg>
  ),
  Dance: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <circle cx="12" cy="5" r="2" />
      <path d="M8 8l2 8-2 4M16 8l-2 8 2 4M12 13v8" />
      <path d="M8 8h8M10 16l-3 3M14 16l3 3" />
    </svg>
  ),
  Rap: (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="1.5">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
      <path d="M4 4l2 2M20 4l-2 2" strokeLinecap="round" />
    </svg>
  ),
};

// Subject name을 URL slug로 변환
const subjectToSlug: Record<string, string> = {
  Vocal: 'vocal',
  Composing: 'composing',
  'MIDI/EMP': 'midi',
  SingerSongwriter: 'singer-songwriter',
  Guitar: 'guitar',
  Bass: 'bass',
  Drums: 'drums',
  JazzPiano: 'jazz-piano',
  Dance: 'dance',
  Rap: 'rap',
};

// 전공별 설명
const subjectDescriptions: Record<string, string> = {
  Vocal: '대중음악 보컬 전문 교육',
  Composing: '작곡 및 화성학 이론 교육',
  'MIDI/EMP': 'MIDI 및 전자음악 프로덕션',
  SingerSongwriter: '보컬과 작곡을 겸비한 아티스트 양성',
  Guitar: '일렉기타, 어쿠스틱기타 전문 교육',
  Bass: '일렉베이스 전문 교육',
  Drums: '드럼 전문 교육',
  JazzPiano: '재즈피아노 및 건반 전문 교육',
  Dance: '무대 퍼포먼스 및 댄스 교육',
  Rap: '랩/힙합 보컬 전문 교육',
};

export default function InstructorsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructorCounts, setInstructorCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 전공 목록 가져오기
        const subjectsRes = await fetch('/api/subjects');
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);

        // 강사 목록 가져와서 전공별 카운트
        const instructorsRes = await fetch('/api/instructors');
        const instructorsData = await instructorsRes.json();

        const counts: Record<string, number> = {};
        instructorsData.forEach((instructor: { subjects?: { subject: { name: string } }[] }) => {
          if (instructor.subjects && instructor.subjects.length > 0) {
            instructor.subjects.forEach((s) => {
              const subjectName = s.subject.name;
              counts[subjectName] = (counts[subjectName] || 0) + 1;
            });
          }
        });
        setInstructorCounts(counts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <SubPageLayout
      title="강사진"
      subtitle="최고의 강사진이 여러분의 꿈을 함께합니다"
    >
      {/* Intro */}
      <section style={{ padding: '60px 0', backgroundColor: '#000' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.8 }}>
            경희실용음악학원은 현직 뮤지션, 음대 교수진, 프로듀서 등
            최고의 강사진이 체계적인 교육을 제공합니다.
          </p>
        </div>
      </section>

      {/* Subject Grid */}
      <section style={{ padding: '80px 0', backgroundColor: '#fff' }}>
        <div className="container">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              로딩중...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {subjects.map((subject) => {
                const slug = subjectToSlug[subject.name];
                const count = instructorCounts[subject.name] || 0;

                if (!slug) return null;

                return (
                  <Link
                    key={subject.id}
                    href={`/instructors/${slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      backgroundColor: '#111',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                    }}>
                      <div style={{
                        position: 'relative',
                        aspectRatio: '16/10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1a1a1a',
                      }}>
                        {SubjectIcons[subject.name]}
                        <div style={{
                          position: 'absolute',
                          bottom: '20px',
                          left: '20px',
                          right: '20px',
                        }}>
                          <p style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#fff',
                            marginBottom: '4px',
                          }}>
                            {subject.nameKo}
                          </p>
                          <p style={{
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.8)',
                          }}>
                            {count}명의 전문 강사
                          </p>
                        </div>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '16px' }}>
                          {subjectDescriptions[subject.name] || subject.nameKo}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#3b82f6',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}>
                          강사진 보기
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SubPageLayout>
  );
}
