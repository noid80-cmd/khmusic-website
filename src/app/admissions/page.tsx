'use client';

import { useState, useEffect } from 'react';
import SubPageLayout from '@/components/SubPageLayout';

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
}

export default function AdmissionsPage() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [admissionsByYear, setAdmissionsByYear] = useState<Record<string, YearData>>({});
  const [years, setYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const res = await fetch('/api/admissions?groupByYear=true');
        const data = await res.json();

        // 연도 목록 생성 (내림차순)
        const yearList = Object.keys(data).sort((a, b) => parseInt(b) - parseInt(a));
        setYears(yearList);

        // 연도별 데이터 가공
        const processedData: Record<string, YearData> = {};
        yearList.forEach((year) => {
          const admissions = data[year];
          const totalCount = admissions.length;

          // 요약 생성
          const firstUniversity = admissions[0]?.university || '';
          const summary = totalCount > 0
            ? `${firstUniversity} 외 ${totalCount}명`
            : '합격자 준비중';

          processedData[year] = {
            students: admissions.map((a: any) => ({
              studentName: a.studentName,
              university: a.university,
              stage: a.stage ?? null,
              department: a.department,
              major: a.major || a.department,
            })),
            summary,
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

  const currentData = admissionsByYear[selectedYear] || { students: [], summary: '합격자 준비중' };

  // 이름 마스킹 함수 (중간 글자를 * 처리)
  const maskName = (name: string) => {
    if (name.length === 2) {
      return name[0] + '*';
    } else if (name.length >= 3) {
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    }
    return name;
  };

  if (isLoading) {
    return (
      <SubPageLayout
        title="연도별 합격자"
        subtitle="경희실용음악학원 음대 합격 현황"
      >
        <section style={{ padding: '100px 0', backgroundColor: '#000', textAlign: 'center' }}>
          <p style={{ color: '#ffc50a', fontSize: '18px' }}>로딩중...</p>
        </section>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout
      title="연도별 합격자"
      subtitle="경희실용음악학원 음대 합격 현황"
    >
      {/* Year Selector */}
      <section style={{ padding: '40px 16px', backgroundColor: '#111', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <style>{`
            .year-selector {
              display: flex;
              justify-content: center;
              gap: 12px;
              flex-wrap: wrap;
            }
            .year-btn {
              padding: 14px 28px;
              border-radius: 100px;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
              white-space: nowrap;
            }
            @media (max-width: 1024px) {
              .year-selector {
                gap: 8px;
              }
              .year-btn {
                padding: 10px 18px;
                font-size: 13px;
              }
            }
            @media (max-width: 640px) {
              .year-selector {
                gap: 6px;
              }
              .year-btn {
                padding: 8px 14px;
                font-size: 12px;
              }
            }
          `}</style>
          <div className="year-selector">
            {years.map((year) => {
              const count = admissionsByYear[year].students.length;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className="year-btn"
                  style={{
                    backgroundColor: selectedYear === year ? '#ffc50a' : 'transparent',
                    border: selectedYear === year ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    color: selectedYear === year ? '#000' : '#fff',
                  }}
                >
                  {year}년 ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Admission List by Year */}
      <section style={{ padding: '80px 0', backgroundColor: '#000' }}>
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
              총 {currentData.students.length}명 합격
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
        </div>
      </section>
    </SubPageLayout>
  );
}
