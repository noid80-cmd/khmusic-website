'use client';

import Link from 'next/link';

const scholarships = [
  {
    id: 'entrance',
    title: '입학장학',
    discount: '15~50%',
    description: '재수생 및 반수생, 예비 5번 이내 차등지급',
    color: '#ffc50a',
  },
  {
    id: 'grade',
    title: '성적장학',
    discount: '20~50%',
    description: '학기말 시험 1, 2, 3등',
    color: '#fff',
  },
  {
    id: 'merit',
    title: '상점장학',
    discount: '1~3만원',
    description: '출석, 수업태도, 연습 성실도에 따른 상점 부여',
    color: '#fff',
  },
];

export default function ScholarshipSection() {
  return (
    <section style={{ padding: '100px 0', backgroundColor: '#000' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'center',
          gap: '60px',
        }}>
          {/* Left - Text */}
          <div>
            <p style={{
              color: '#ffc50a',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              SCHOLARSHIP
            </p>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '24px',
              lineHeight: 1.2,
            }}>
              장학제도
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '17px',
              lineHeight: 1.8,
              marginBottom: '32px',
            }}>
              꿈을 향한 여정을 응원합니다.<br />
              성실하게 노력하는 학생들에게 다양한 장학 혜택을 제공합니다.
            </p>
            <Link
              href="/scholarship"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                backgroundColor: '#ffc50a',
                color: '#000',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              자세히 보기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Right - Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {scholarships.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px 28px',
                  backgroundColor: item.color === '#ffc50a' ? 'rgba(255,197,10,0.1)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  border: item.color === '#ffc50a' ? '1px solid rgba(255,197,10,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: item.color === '#ffc50a' ? '#ffc50a' : '#fff',
                    marginBottom: '6px',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    {item.description}
                  </p>
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: item.color === '#ffc50a' ? '#ffc50a' : 'rgba(255,255,255,0.8)',
                  whiteSpace: 'nowrap',
                  marginLeft: '20px',
                }}>
                  {item.discount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
