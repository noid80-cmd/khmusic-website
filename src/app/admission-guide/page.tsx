'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SubPageLayout from '@/components/SubPageLayout';
import Link from 'next/link';

interface AdmissionGuide {
  id: string;
  university: string;
  department: string | null;
  category: 'UNIVERSITY_4YR' | 'UNIVERSITY_2YR' | 'ART_HIGHSCHOOL' | 'GRADUATE';
  year: number;
  content: string;
  deadline: string | null;
  examDate: string | null;
  requirements: string | null;
  documents: string | null;
  examContent: string | null;
  link: string | null;
  createdAt: string;
}

const categories = [
  { key: '', label: '전체' },
  { key: 'UNIVERSITY_4YR', label: '4년제대학' },
  { key: 'UNIVERSITY_2YR', label: '2,3년제대학' },
  { key: 'GRADUATE', label: '대학원/편입' },
  { key: 'ART_HIGHSCHOOL', label: '예고/예중' },
];

const categoryLabels: Record<string, string> = {
  UNIVERSITY_4YR: '4년제',
  UNIVERSITY_2YR: '전문대',
  GRADUATE: '대학원',
  ART_HIGHSCHOOL: '예고',
};

function AdmissionGuideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  const [guides, setGuides] = useState<AdmissionGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<AdmissionGuide | null>(null);

  useEffect(() => {
    const fetchGuides = async () => {
      setIsLoading(true);
      try {
        const url = currentCategory
          ? `/api/admission-guides?category=${currentCategory}`
          : '/api/admission-guides';
        const res = await fetch(url);
        const data = await res.json();
        setGuides(data);
      } catch {
        setGuides([]);
      }
      setIsLoading(false);
    };

    fetchGuides();
  }, [currentCategory]);

  const handleCategoryChange = (category: string) => {
    if (category) {
      router.push(`/admission-guide?category=${category}`);
    } else {
      router.push('/admission-guide');
    }
    setSelectedGuide(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <SubPageLayout
      title="입시요강"
      subtitle="대학별 입시 정보 안내"
    >
      {/* Category Tabs */}
      <section style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            gap: '0',
            overflowX: 'auto',
          }}>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                style={{
                  padding: '20px 32px',
                  backgroundColor: 'transparent',
                  color: currentCategory === cat.key ? '#000' : '#666',
                  border: 'none',
                  borderBottom: currentCategory === cat.key ? '3px solid #000' : '3px solid transparent',
                  fontSize: '16px',
                  fontWeight: currentCategory === cat.key ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Board List */}
      <section style={{ padding: '40px 0 80px', backgroundColor: '#fff' }}>
        <div className="container">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              로딩중...
            </div>
          ) : guides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>등록된 입시요강이 없습니다.</p>
              <p style={{ fontSize: '14px' }}>곧 업데이트 예정입니다.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div style={{ display: 'block' }} className="desktop-table">
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  borderTop: '2px solid #000',
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f8f8' }}>
                      <th style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 600,
                        borderBottom: '1px solid #ddd',
                        width: '60px',
                      }}>
                        번호
                      </th>
                      <th style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 600,
                        borderBottom: '1px solid #ddd',
                        width: '80px',
                      }}>
                        구분
                      </th>
                      <th style={{
                        padding: '16px 12px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        borderBottom: '1px solid #ddd',
                      }}>
                        대학명
                      </th>
                      <th style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 600,
                        borderBottom: '1px solid #ddd',
                        width: '80px',
                      }}>
                        연도
                      </th>
                      <th style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 600,
                        borderBottom: '1px solid #ddd',
                        width: '120px',
                      }}>
                        등록일
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {guides.map((guide, index) => (
                      <tr
                        key={guide.id}
                        onClick={() => setSelectedGuide(guide)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: selectedGuide?.id === guide.id ? '#f5f5f5' : 'transparent',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedGuide?.id !== guide.id) {
                            e.currentTarget.style.backgroundColor = '#fafafa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedGuide?.id !== guide.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <td style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          fontSize: '14px',
                          color: '#999',
                          borderBottom: '1px solid #eee',
                        }}>
                          {guides.length - index}
                        </td>
                        <td style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          borderBottom: '1px solid #eee',
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#666',
                          }}>
                            {categoryLabels[guide.category]}
                          </span>
                        </td>
                        <td style={{
                          padding: '16px 12px',
                          fontSize: '15px',
                          fontWeight: 500,
                          borderBottom: '1px solid #eee',
                        }}>
                          {guide.university}
                          {guide.department && (
                            <span style={{ color: '#666', fontWeight: 400 }}> - {guide.department}</span>
                          )}
                        </td>
                        <td style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          fontSize: '14px',
                          borderBottom: '1px solid #eee',
                        }}>
                          {guide.year}
                        </td>
                        <td style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#999',
                          borderBottom: '1px solid #eee',
                        }}>
                          {formatDate(guide.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div style={{ display: 'none' }} className="mobile-list">
                {guides.map((guide, index) => (
                  <div
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      backgroundColor: selectedGuide?.id === guide.id ? '#f5f5f5' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#666',
                      }}>
                        {categoryLabels[guide.category]}
                      </span>
                      <span style={{ fontSize: '12px', color: '#999' }}>{guide.year}</span>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>
                      {guide.university}
                      {guide.department && (
                        <span style={{ color: '#666', fontWeight: 400 }}> - {guide.department}</span>
                      )}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999' }}>{formatDate(guide.createdAt)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedGuide(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    backgroundColor: '#000',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    {categoryLabels[selectedGuide.category]}
                  </span>
                  <span style={{ fontSize: '14px', color: '#666' }}>{selectedGuide.year}학년도</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
                  {selectedGuide.university}
                  {selectedGuide.department && (
                    <span style={{ fontWeight: 400, color: '#666' }}> {selectedGuide.department}</span>
                  )}
                </h2>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#999',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Key Info */}
              {(selectedGuide.deadline || selectedGuide.examDate) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '12px',
                }}>
                  {selectedGuide.deadline && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>원서 마감</p>
                      <p style={{ fontSize: '15px', fontWeight: 600 }}>{selectedGuide.deadline}</p>
                    </div>
                  )}
                  {selectedGuide.examDate && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>실기 일정</p>
                      <p style={{ fontSize: '15px', fontWeight: 600 }}>{selectedGuide.examDate}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>요강 내용</h3>
                <div style={{
                  fontSize: '15px',
                  lineHeight: 1.8,
                  color: '#333',
                  whiteSpace: 'pre-wrap',
                }}>
                  {selectedGuide.content}
                </div>
              </div>

              {/* Requirements */}
              {selectedGuide.requirements && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>지원 자격</h3>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: '#555',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {selectedGuide.requirements}
                  </div>
                </div>
              )}

              {/* Exam Content */}
              {selectedGuide.examContent && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>실기 내용</h3>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: '#555',
                    whiteSpace: 'pre-wrap',
                    padding: '16px',
                    backgroundColor: '#fffbe6',
                    borderRadius: '8px',
                    border: '1px solid #ffe58f',
                  }}>
                    {selectedGuide.examContent}
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedGuide.documents && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>제출 서류</h3>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: '#555',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {selectedGuide.documents}
                  </div>
                </div>
              )}

              {/* Link */}
              {selectedGuide.link && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                  <Link
                    href={selectedGuide.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 24px',
                      backgroundColor: '#000',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    대학 홈페이지에서 입시요강 확인하기 →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-table {
            display: none !important;
          }
          .mobile-list {
            display: block !important;
          }
        }
      `}</style>
    </SubPageLayout>
  );
}

export default function AdmissionGuidePage() {
  return (
    <Suspense fallback={
      <SubPageLayout
        title="입시요강"
        subtitle="대학별 입시 정보 안내"
      >
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
          로딩중...
        </div>
      </SubPageLayout>
    }>
      <AdmissionGuideContent />
    </Suspense>
  );
}
