'use client';

import { useRef } from 'react';
import SubPageLayout from '@/components/SubPageLayout';

// 장학금 요약 카드 데이터
const scholarships = [
  {
    id: 'entrance',
    name: '입학장학',
    amount: '15%~50%',
    benefit: '수강료 15%~50% 할인',
    description: '재수생 및 반수생, 예비 5번 이내 차등지급',
    color: '#ffc50a',
    criteria: ['재수생 및 반수생', '예비 5번 이내 합격자', '차등 지급'],
  },
  {
    id: 'merit',
    name: '성적장학',
    amount: '20%~50%',
    benefit: '수강료 20%~50% 할인',
    description: '학기말 시험 성적 우수자 장학금',
    color: '#ffc50a',
    criteria: ['학기말 시험 1등', '학기말 시험 2등', '학기말 시험 3등'],
  },
  {
    id: 'point',
    name: '상점장학',
    amount: '1~3만원',
    benefit: '1~3만원 교육상품권 지급',
    description: '출석, 수업태도, 연습 성실도에 따른 상점 부여',
    color: '#ffc50a',
    criteria: ['출석 우수자', '수업태도 우수자', '연습 성실도 우수자'],
  },
];

// 성적장학 데이터
const gradeRankings = [
  { rank: '1등', discount: '50%', color: '#ffc50a' },
  { rank: '2등', discount: '30%', color: '#c0c0c0' },
  { rank: '3등', discount: '20%', color: '#cd7f32' },
];

// 상점장학 데이터 — 수강료 할인이 아니라 교육상품권 지급이다
const pointRankings = [
  { rank: '우수', discount: '3만원', color: '#ffc50a' },
  { rank: '양호', discount: '2만원', color: '#c0c0c0' },
  { rank: '보통', discount: '1만원', color: '#cd7f32' },
];

const pointRules = [
  { title: '출석 점수', desc: '수업 출석 시 상점 부여 (지각/결석 시 감점)' },
  { title: '레슨 태도', desc: '적극적인 수업 참여 및 과제 수행' },
  { title: '연습실 이용', desc: '매일 3시간 이상 연습시 상점부여' },
  { title: '공연 참여', desc: '학원 행사 및 공연 참여 시 추가 상점' },
];

export default function ScholarshipPage() {
  const entranceRef = useRef<HTMLDivElement>(null);
  const meritRef = useRef<HTMLDivElement>(null);
  const pointRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      entrance: entranceRef,
      merit: meritRef,
      point: pointRef,
    };
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <SubPageLayout
      title="장학제도"
      subtitle="꿈을 향한 여정을 응원합니다"
    >
      {/* Intro */}
      <section style={{ padding: '80px 0', backgroundColor: '#fff' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: '#333', lineHeight: 1.9 }}>
              경희실용음악학원은 열정 있는 학생들의 꿈을 응원합니다.<br />
              <strong>입학장학, 성적장학, 상점장학</strong>을 통해<br />
              경제적 부담 없이 음악에 집중할 수 있도록 지원합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Scholarship Overview Cards */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8f8f8' }}>
        <div className="container">
          <div style={{ marginBottom: '40px' }}>
            <p style={{ color: '#ffc50a', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              SCHOLARSHIP
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: '#000' }}>
              장학금 안내
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {scholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                onClick={() => scrollToSection(scholarship.id)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                className="scholarship-card"
              >
                <div style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: scholarship.color,
                  color: '#000',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}>
                  {scholarship.benefit}
                </div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#000',
                  marginBottom: '12px',
                }}>
                  {scholarship.name}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '24px',
                }}>
                  {scholarship.description}
                </p>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                  <p style={{ fontSize: '13px', color: '#999', marginBottom: '12px' }}>지급 대상</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {scholarship.criteria.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          color: '#444',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ color: scholarship.color }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: scholarship.color,
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: '24px',
                }}>
                  자세히 보기
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .scholarship-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          }
        `}</style>
      </section>

      {/* ========== 입학장학 섹션 ========== */}
      <div ref={entranceRef} style={{ scrollMarginTop: '80px' }}>
        <section style={{ padding: '100px 0 60px', backgroundColor: '#000' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{
                display: 'inline-block',
                padding: '8px 20px',
                backgroundColor: '#ffc50a',
                color: '#000',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '20px',
              }}>
                01
              </span>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                입학장학
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                재수생 및 반수생, 예비 5번 이내 합격자를 위한 특별 장학 혜택
              </p>
              <div style={{
                fontSize: '64px',
                fontWeight: 700,
                color: '#ffc50a',
                marginTop: '24px',
              }}>
                15%~50%
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                수강료 할인혜택
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 0', backgroundColor: '#fff' }}>
          <div className="container">
            <h3 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
              지급 대상
            </h3>
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              backgroundColor: '#f8f8f8',
              borderRadius: '16px',
              overflow: 'hidden',
            }}>
              {/* 대상 목록 */}
              <div style={{
                padding: '32px',
                borderBottom: '1px solid #eee',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#ffc50a',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '4px' }}>
                      반수생
                    </h4>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      대학에 합격했으나 재도전하는 학생
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '32px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#ffc50a',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '4px' }}>
                      전년도 또는 당해년도 예비 5순위 이내인 자
                    </h4>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      학교별 차등 지급
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 할인율 안내 */}
            <div style={{
              maxWidth: '600px',
              margin: '48px auto 0',
              textAlign: 'center',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                flexWrap: 'wrap',
              }}>
                <div style={{
                  padding: '24px 40px',
                  backgroundColor: '#000',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>최소</p>
                  <p style={{ fontSize: '40px', fontWeight: 700, color: '#ffc50a' }}>15%</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#999', fontSize: '24px' }}>~</div>
                <div style={{
                  padding: '24px 40px',
                  backgroundColor: '#000',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>최대</p>
                  <p style={{ fontSize: '40px', fontWeight: 700, color: '#ffc50a' }}>50%</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ========== 성적장학 섹션 ========== */}
      <div ref={meritRef} style={{ scrollMarginTop: '80px' }}>
        <section style={{ padding: '100px 0 60px', backgroundColor: '#111' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{
                display: 'inline-block',
                padding: '8px 20px',
                backgroundColor: '#ffc50a',
                color: '#000',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '20px',
              }}>
                02
              </span>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                성적장학
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                학기말 시험 성적 우수자에게 지급
              </p>
              <div style={{
                fontSize: '64px',
                fontWeight: 700,
                color: '#ffc50a',
                marginTop: '24px',
              }}>
                20%~50%
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                수강료 할인
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 0', backgroundColor: '#fff' }}>
          <div className="container">
            <h3 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
              등수별 할인율
            </h3>

            {/* 순위별 감면율 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              marginBottom: '60px',
            }}>
              {gradeRankings.map((item) => (
                <div
                  key={item.rank}
                  style={{
                    width: '180px',
                    padding: '32px 24px',
                    backgroundColor: '#f8f8f8',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: `2px solid ${item.color}`,
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    margin: '0 auto 16px',
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#000" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '18px', color: item.color === '#ffc50a' ? '#000' : '#666', fontWeight: 700, marginBottom: '8px' }}>
                    {item.rank}
                  </p>
                  <p style={{ fontSize: '40px', fontWeight: 700, color: '#000' }}>
                    {item.discount}
                  </p>
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                    수강료 할인
                  </p>
                </div>
              ))}
            </div>

            {/* 안내사항 */}
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              backgroundColor: '#fffbeb',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #ffc50a',
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                안내사항
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', fontSize: '14px', color: '#444', lineHeight: 1.7 }}>
                  <span style={{ color: '#ffc50a', fontWeight: 700 }}>•</span>
                  학기말 시험 성적을 기준으로 1, 2, 3등에게 장학금이 지급됩니다.
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#444', lineHeight: 1.7 }}>
                  <span style={{ color: '#ffc50a', fontWeight: 700 }}>•</span>
                  장학금은 다음 학기 수강료에서 자동 차감됩니다.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* ========== 상점장학 섹션 ========== */}
      <div ref={pointRef} style={{ scrollMarginTop: '80px' }}>
        <section style={{ padding: '100px 0 60px', backgroundColor: '#000' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{
                display: 'inline-block',
                padding: '8px 20px',
                backgroundColor: '#ffc50a',
                color: '#000',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '20px',
              }}>
                03
              </span>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                상점장학
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                출석, 수업태도, 연습 성실도에 따른 상점 부여
              </p>
              <div style={{
                fontSize: '64px',
                fontWeight: 700,
                color: '#ffc50a',
                marginTop: '24px',
              }}>
                1~3만원
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                교육상품권 지급
              </p>
            </div>

            {/* 등급별 감면율 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              marginBottom: '60px',
            }}>
              {pointRankings.map((item) => (
                <div
                  key={item.rank}
                  style={{
                    width: '180px',
                    padding: '32px 24px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: `2px solid ${item.color}`,
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    margin: '0 auto 16px',
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#000" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '18px', color: item.color, fontWeight: 700, marginBottom: '8px' }}>
                    {item.rank}
                  </p>
                  <p style={{ fontSize: '40px', fontWeight: 700, color: '#fff' }}>
                    {item.discount}
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                    교육상품권
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 0', backgroundColor: '#fff' }}>
          <div className="container">
            <h3 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '40px' }}>
              상점 부여 기준
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              maxWidth: '1000px',
              margin: '0 auto',
            }}>
              {pointRules.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '28px',
                    backgroundColor: '#f8f8f8',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 16px',
                    backgroundColor: '#ffc50a',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#000',
                  }}>
                    {i + 1}
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#000', marginBottom: '10px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* 상점장학 안내사항 */}
            <div style={{
              maxWidth: '800px',
              margin: '48px auto 0',
              backgroundColor: '#f8f8f8',
              borderRadius: '16px',
              padding: '32px',
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '20px' }}>
                안내사항
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', fontSize: '14px', color: '#444', lineHeight: 1.7 }}>
                  <span style={{ color: '#ffc50a', fontWeight: 700 }}>•</span>
                  상점은 매월 1일에 초기화되며, 월말에 순위를 집계합니다.
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#444', lineHeight: 1.7 }}>
                  <span style={{ color: '#ffc50a', fontWeight: 700 }}>•</span>
                  교육상품권은 다음 달 초에 지급됩니다.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* 문의 안내 */}
      <section style={{ padding: '60px 0', backgroundColor: '#f8f8f8' }}>
        <div className="container">
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffc50a" strokeWidth="2" style={{ marginBottom: '20px' }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <p style={{ fontSize: '18px', color: '#333', fontWeight: 500, marginBottom: '8px' }}>
              자세한 사항은 전화로 문의 바랍니다.
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              학원 상담을 통해 본인에게 해당되는 장학금을 확인해보세요.
            </p>
          </div>
        </div>
      </section>
    </SubPageLayout>
  );
}
