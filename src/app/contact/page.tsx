'use client';

import Script from 'next/script';
import SubPageLayout from '@/components/SubPageLayout';
import NaverMap from '@/components/NaverMap';

export default function ContactPage() {
  return (
    <SubPageLayout
      title="오시는길"
      subtitle="경희실용음악학원 위치 안내"
    >
      {/* Naver Maps API Script (geocoder 서브모듈 포함) */}
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}
        strategy="afterInteractive"
      />

      {/* Naver Map Section */}
      <section style={{ padding: '0' }}>
        <NaverMap
          address="경기도 부천시 원미구 부천로 43"
          zoom={17}
          height="450px"
          markerTitle="경희실용음악학원"
        />
      </section>

      {/* Contact Info */}
      <section style={{ padding: '80px 0', backgroundColor: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
            {/* Address */}
            <div>
              <p style={{ color: '#999', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                ADDRESS
              </p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', marginBottom: '16px' }}>
                주소
              </h3>
              <p style={{ fontSize: '17px', color: '#555', lineHeight: 1.8 }}>
                경기도 부천시 부천로43 3층<br />
                (부천역 도보5분)
              </p>
            </div>

            {/* Phone */}
            <div>
              <p style={{ color: '#999', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                PHONE
              </p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', marginBottom: '16px' }}>
                전화번호
              </h3>
              <p style={{ fontSize: '17px', color: '#555', lineHeight: 1.8 }}>
                대표전화: 032-611-9191/2<br />
                팩스: 032-611-9193
              </p>
            </div>

            {/* Hours */}
            <div>
              <p style={{ color: '#999', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                HOURS
              </p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#000', marginBottom: '16px' }}>
                상담시간
              </h3>
              <p style={{ fontSize: '17px', color: '#555', lineHeight: 1.8 }}>
                평일: 11:00 - 22:00<br />
                토요일: 11:00 - 19:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Directions */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8f8f8' }}>
        <div className="container">
          <p style={{ color: '#999', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            DIRECTIONS
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#000', marginBottom: '40px' }}>
            찾아오시는 방법
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Subway */}
            <div style={{ padding: '32px', backgroundColor: '#fff', borderRadius: '16px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>1</span>
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>
                지하철
              </h4>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.8 }}>
                1호선 부천역 4번출구 500m<br />
                (도보5분)
              </p>
            </div>

            {/* Bus */}
            <div style={{ padding: '32px', backgroundColor: '#fff', borderRadius: '16px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#22c55e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>BUS</span>
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>
                버스
              </h4>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.8 }}>
                노마즈하우스, 삼성생명앞 하차<br />
                (구,중앙극장)<br />
                <span style={{ fontSize: '13px' }}>
                  일반: 5-5, 12, 5-4, 5-3, 8, 70-2, 71, 75, 11, 50, 5-6<br />
                  간선: 661, 606
                </span>
              </p>
            </div>

            {/* Car */}
            <div style={{ padding: '32px', backgroundColor: '#fff', borderRadius: '16px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>P</span>
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>
                자가용
              </h4>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.8 }}>
                심곡흥천공원 지하공영주차장<br />
                1시간 무료주차<br />
                <span style={{ fontSize: '13px' }}>
                  경기도 부천시 부천로54번길 23<br />
                  (소요시간 5분, 283M)
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

    </SubPageLayout>
  );
}
