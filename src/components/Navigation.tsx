'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavChild {
  name: string;
  href: string;
}

interface NavLink {
  name: string;
  href: string;
  children?: NavChild[];
}

const navLinks: NavLink[] = [
  {
    name: '학원소개',
    href: '/about',
    children: [
      { name: '교육이념', href: '/about' },
      { name: '출신뮤지션', href: '/musicians' },
      { name: '장학제도', href: '/scholarship' },
      { name: '특별프로그램', href: '/programs' },
      { name: '공지사항', href: '/notice' },
    ],
  },
  {
    name: '합격자명단',
    href: '/admissions',
    children: [
      { name: '연도별 합격자', href: '/admissions' },
      { name: '합격자 동영상', href: '/success-videos' },
    ],
  },
  {
    name: '강사진',
    href: '/instructors',
    children: [
      { name: '보컬', href: '/instructors/vocal' },
      { name: '작곡/화성학', href: '/instructors/composing' },
      { name: '미디/전자음악', href: '/instructors/midi' },
      { name: '싱어송라이터', href: '/instructors/singer-songwriter' },
      { name: '기타', href: '/instructors/guitar' },
      { name: '베이스', href: '/instructors/bass' },
      { name: '드럼', href: '/instructors/drums' },
      { name: '재즈피아노', href: '/instructors/jazz-piano' },
      { name: '댄스', href: '/instructors/dance' },
      { name: '랩', href: '/instructors/rap' },
    ],
  },
  {
    name: '커리큘럼',
    href: '/curriculum',
    children: [
      { name: '입시반', href: '/curriculum/admission' },
      { name: '오디션반', href: '/curriculum/audition' },
      { name: '전문반', href: '/curriculum/professional' },
      { name: '취미반', href: '/curriculum/hobby' },
    ],
  },
  {
    name: '입시요강',
    href: '/admission-guide',
    children: [
      { name: '4년제대학', href: '/admission-guide?category=UNIVERSITY_4YR' },
      { name: '2,3년제대학', href: '/admission-guide?category=UNIVERSITY_2YR' },
      { name: '예고/예중', href: '/admission-guide?category=ART_HIGHSCHOOL' },
      { name: '대학원/편입', href: '/admission-guide?category=GRADUATE' },
      { name: '입시 칼럼', href: '/blog' },
    ],
  },
  {
    name: '컨텐츠',
    href: '/gallery',
    children: [
      { name: '공연사진', href: '/gallery/performances' },
      { name: '시설사진', href: '/gallery/facilities' },
      { name: '수강생 영상', href: '/trainee-videos' },
      { name: '뮤지션 특강', href: '/musician-lectures' },
      { name: '공연 영상', href: '/performance-videos' },
    ],
  },
  {
    name: '오시는길',
    href: '/contact',
  },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileExpandedMenu(null);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: isScrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          boxShadow: isScrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            height: '64px',
            gap: '20px',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.location.reload();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#111',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              marginRight: '32px',
            }}
          >
            <img
              src="/logo.png"
              alt="경희실용음악학원"
              style={{
                width: '36px',
                height: '36px',
                objectFit: 'contain',
              }}
            />
            경희실용음악학원
          </Link>

          {/* Desktop Menu - Hidden on mobile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
              justifyContent: 'center',
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <div
                key={link.name}
                style={{ position: 'relative' }}
                onMouseEnter={() => link.children && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 20px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#333',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    transition: 'background 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {link.name}
                  {link.children && (
                    <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                      <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown */}
                {link.children && activeDropdown === link.name && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      paddingTop: '8px',
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        padding: '8px',
                        minWidth: '160px',
                      }}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{
                            display: 'block',
                            padding: '10px 14px',
                            fontSize: '14px',
                            color: '#444',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            transition: 'background 0.2s',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* SNS + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            {/* SNS Icons - Desktop Only */}
            <div className="desktop-sns" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <a
                href="https://www.youtube.com/channel/UC064T0e2BoevLYHkXkp8Yog"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '6px', color: '#666', transition: 'color 0.2s' }}
                aria-label="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://blog.naver.com/kyunghee_music"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '6px', color: '#666', transition: 'color 0.2s' }}
                aria-label="Blog"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/kyunghee_music"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '6px', color: '#666', transition: 'color 0.2s' }}
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="https://pf.kakao.com/_xixgxgxmj"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '6px', color: '#666', transition: 'color 0.2s' }}
                aria-label="KakaoTalk"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.792 1.86 5.247 4.644 6.619-.178.633-.645 2.298-.738 2.655-.117.446.163.44.343.32.142-.094 2.257-1.533 3.175-2.156.842.123 1.71.188 2.576.188 5.523 0 10-3.582 10-8s-4.477-8-10-8z"/>
                </svg>
              </a>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'none',
                padding: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#333',
              }}
              className="mobile-hamburger"
              aria-label="메뉴"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>

          {/* Info Text - Desktop Only (가장 오른쪽, 별도 영역) */}
          <div className="desktop-info" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#fff8e1',
              borderRadius: '4px',
              color: '#333',
            }}>
              <span style={{ color: '#e6a000', fontWeight: 700 }}>상담</span> 평일11~22 토11~19
            </span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              color: '#c62828',
              fontWeight: 600,
            }}>
              연습실 연중무휴
            </span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              color: '#555',
            }}>
              사전예약제
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            top: '64px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
          className="mobile-only"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        style={{
          position: 'fixed',
          top: '64px',
          right: isMobileMenuOpen ? 0 : '-100%',
          width: '280px',
          height: 'calc(100vh - 64px)',
          backgroundColor: '#fff',
          zIndex: 999,
          transition: 'right 0.3s ease',
          overflowY: 'auto',
          display: 'none',
        }}
        className="mobile-menu-panel"
      >
        <div style={{ padding: '16px' }}>
          {navLinks.map((link) => (
            <div key={link.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {link.children ? (
                <>
                  <button
                    onClick={() => setMobileExpandedMenu(mobileExpandedMenu === link.name ? null : link.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '14px 0',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#333',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {link.name}
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      style={{
                        transform: mobileExpandedMenu === link.name ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <div
                    style={{
                      maxHeight: mobileExpandedMenu === link.name ? '400px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease',
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontSize: '14px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                      }}
                    >
                      전체보기
                    </Link>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '10px 16px',
                          fontSize: '14px',
                          color: '#555',
                          textDecoration: 'none',
                        }}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '14px 0',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#333',
                    textDecoration: 'none',
                  }}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile SNS Icons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
            <a href="https://www.youtube.com/channel/UC064T0e2BoevLYHkXkp8Yog" target="_blank" rel="noopener noreferrer" style={{ padding: '8px', color: '#666' }} aria-label="YouTube">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://blog.naver.com/kyunghee_music" target="_blank" rel="noopener noreferrer" style={{ padding: '8px', color: '#666' }} aria-label="Blog">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/kyunghee_music" target="_blank" rel="noopener noreferrer" style={{ padding: '8px', color: '#666' }} aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://pf.kakao.com/_xixgxgxmj" target="_blank" rel="noopener noreferrer" style={{ padding: '8px', color: '#666' }} aria-label="KakaoTalk">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.792 1.86 5.247 4.644 6.619-.178.633-.645 2.298-.738 2.655-.117.446.163.44.343.32.142-.094 2.257-1.533 3.175-2.156.842.123 1.71.188 2.576.188 5.523 0 10-3.582 10-8s-4.477-8-10-8z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx global>{`
        .desktop-nav {
          display: none !important;
        }
        .desktop-info {
          display: none !important;
        }
        .desktop-sns {
          display: none !important;
        }
        .mobile-hamburger {
          display: block !important;
        }
        .mobile-menu-panel {
          display: block !important;
        }
        .mobile-only {
          display: block !important;
        }

        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-sns {
            display: flex !important;
          }
          .mobile-hamburger {
            display: none !important;
          }
          .mobile-menu-panel {
            display: none !important;
          }
          .mobile-only {
            display: none !important;
          }
        }

        @media (min-width: 1200px) {
          .desktop-info {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
