'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  { name: '대시보드', href: '/admin' },
  { name: '히어로 슬라이드', href: '/admin/hero-slides' },
  { name: '페이지 배경', href: '/admin/page-backgrounds' },
  { name: '강사 관리', href: '/admin/instructors' },
  { name: '전공 관리', href: '/admin/subjects' },
  { name: '커리큘럼 관리', href: '/admin/curriculum' },
  { name: '특별 프로그램', href: '/admin/programs' },
  { name: '공지사항', href: '/admin/notices' },
  { name: '블로그', href: '/admin/blog' },
  { name: '합격자 명단', href: '/admin/admissions' },
  { name: '배출 뮤지션', href: '/admin/musicians' },
  { name: '갤러리', href: '/admin/gallery' },
  { name: '영상 관리', href: '/admin/videos' },
  { name: '입시요강', href: '/admin/admission-guides' },
  { name: '설정', href: '/admin/settings' },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('관리자');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.admin?.name) {
          setAdminName(data.admin.name);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: isSidebarOpen ? '240px' : '0',
          backgroundColor: '#111827',
          transition: 'width 0.3s',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2937' }}>
          <h1 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, letterSpacing: '-0.3px' }}>
            경희실용음악학원
          </h1>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
            관리자 시스템
          </p>
        </div>

        <nav style={{ padding: '12px 0' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '10px 24px',
                  color: isActive ? '#fff' : '#9ca3af',
                  backgroundColor: isActive ? '#1f2937' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 500 : 400,
                  borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '240px',
          padding: '16px 24px',
          borderTop: '1px solid #1f2937',
        }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'block',
              color: '#6b7280',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            사이트 보기 →
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: '#fff',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {adminName}님
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
