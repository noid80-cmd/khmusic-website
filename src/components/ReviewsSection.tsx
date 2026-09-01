'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// 메인 페이지에서는 연도별 최대 12명까지만 표시 (3x4 그리드)
const PREVIEW_LIMIT = 12;

interface Student {
  studentName: string;
  university: string;
  stage: string | null;
  department: string;
  major: string | null;
}

interface YearData {
  students: Student[];
  summary: string;
  hasMore: boolean;
}

export default function ReviewsSection() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [admissionsByYear, setAdmissionsByYear] = useState<Record<string, YearData>>({});
  const [years, setYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const res = await fetch('/api/admissions?groupByYear=true');
        const data = await res.json();

        // 연도 목록 생성 (내림차순)
        const yearList = Object.keys(data).sort((a, b) => parseInt(b) - parseInt(a));
        setYears(yearList);

        // 연도별 데이터 가공 (8명 제한 + 요약)
        const processedData: Record<string, YearData> = {};
        yearList.forEach((year) => {
          const admissions = data[year];
          const totalCount = admissions.length;
          const previewStudents = admissions.slice(0, PREVIEW_LIMIT);

          // 요약 생성 (첫 번째 대학명 + 외 n명)
          const firstUniversity = admissions[0]?.university || '';
          const summary = totalCount > 0
            ? `${firstUniversity} 외 ${totalCount}명`
            : '합격자 준비중';

          processedData[year] = {
            students: previewStudents.map((a: any) => ({
              studentName: a.studentName,
              university: a.university,
              stage: a.stage ?? null,
              department: a.department,
              major: a.major || a.department,
            })),
            summary,
            hasMore: totalCount > PREVIEW_LIMIT,
          };
        });

        setAdmissionsByYear(processedData);

        // 가장 최신 연도를 기본 선택
        if (yearList.length > 0) {
          setSelectedYear(yearList[0]);
        }
      } catch (error) {
        console.error('Failed to fetch admissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmissions();
  }, []);

  const currentData = admissionsByYear[selectedYear] || { students: [], summary: '합격자 준비중', hasMore: false };

  // 이름 마스킹 함수 (중간 글자를 * 처리)
  const maskName = (name: string) => {
    if (name.length === 2) {
      return name[0] + '*';
    } else if (name.length >= 3) {
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    }
    return name;
  };

  return (
    <section id="reviews" style={{ backgroundColor: '#000' }}>
      {/* Header */}
      <div style={{ padding: '100px 0 60px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: '#ffc50a',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              PRIDE OF K.H
            </p>
            <h2 style={{
              fontSize: 'clamp(36px, 6vw, 56px)',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '20px'
            }}>
              합격 실적
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px' }}>
              19년간 쌓아온 신뢰와 결과로 증명합니다
            </p>
          </div>
        </div>
      </div>

      {/* Year Selector Ticker */}
      <div style={{
        padding: '0',
        backgroundColor: '#ffc50a',
        overflow: 'hidden',
      }}>
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            animation: 'scrollYears 20s linear infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {[...years, ...years, ...years].map((year, index) => (
            <button
              key={index}
              onClick={() => setSelectedYear(year)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '24px 48px',
                backgroundColor: selectedYear === year ? '#000' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}
            >
              <span style={{
                backgroundColor: selectedYear === year ? '#ffc50a' : '#000',
                color: selectedYear === year ? '#000' : '#ffc50a',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 700,
              }}>
                {year}
              </span>
              <span style={{
                color: selectedYear === year ? '#fff' : '#000',
                fontSize: '16px',
                fontWeight: 600,
              }}>
                {admissionsByYear[year].summary}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Year Tabs (Static) */}
      <div style={{
        padding: '40px 0',
        backgroundColor: '#111',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '14px 28px',
                  backgroundColor: selectedYear === year ? '#ffc50a' : 'transparent',
                  border: selectedYear === year ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '100px',
                  color: selectedYear === year ? '#000' : '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                {year}년
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admission List by Year */}
      <div style={{ padding: '80px 0' }}>
        <div className="container">
          {/* Year Title */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '12px',
            }}>
              {selectedYear}년 합격자
            </h3>
            <p style={{
              color: '#ffc50a',
              fontSize: '20px',
              fontWeight: 600,
            }}>
              {currentData.summary}
            </p>
          </div>

          {/* Student Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            {currentData.students.map((student, index) => (
              <div
                key={index}
                style={{
                  padding: '24px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#ffc50a',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <p style={{
                    color: '#fff',
                    fontSize: '17px',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}>
                    {maskName(student.studentName)}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '14px',
                  }}>
                    {student.university}{student.stage ? `(${student.stage})` : ''} · {student.major}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link
              href="/admissions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 40px',
                backgroundColor: '#ffc50a',
                borderRadius: '100px',
                color: '#000',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 700,
                transition: 'transform 0.2s',
              }}
            >
              전체 합격생 명단 보기
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollYears {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  );
}
